import React, { Component, Fragment } from 'react';
import config from '@/config';
import { PageHeader, Form, Row, Col, Input, Button, Upload, Icon, Switch, Select, Divider, Modal, message, Checkbox, Collapse, Tooltip } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
import { fetchCourseAdd, fetchCourseEdit, fetchAllList, fetchEditDetail } from '@/services/course';
import { fetchCourseList, fetchGroupAll } from '@/services/group';
import { fetchCampusAll } from '@/services/campus'
import { fetchClassAll } from '@/services/class'
import { fetchOSSPolicy } from '@/services/oss';
import Styles from './style.less';
import ImgCrop from 'antd-img-crop';
import Helper from '@/utils/helper';
import InlineButton from '@/components/InlineButton';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;
const { Group } = Checkbox
const { Panel } = Collapse

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
  },
};

@Form.create()
@connect(state => ({
  loading: state.loading.models.course,
  editDetail: state.course.editDetail,
}))
export default class AddOrEdit extends Component {
  state = {
    currentItem: {},
    uploadLoading: false,
    ossdata: {},
    host: '',
    sortList: [],
    styleList: [],
    difficultList: [],
    groupList: [],
    options: [],
    type: this.props.location.query.id ? this.props.editDetail.coursePattern : '',
    previewVisible: false,
    previewImage: '',
    campusList: [],
    afterClassList: [],
    indeterminate: true,
    checkAll: false,
    checkedList: [],
    isOpen: false,
  };
  componentDidMount() {
    const { location: { query, state } } = this.props;
    if (query.id) {
      fetchEditDetail(query.id).then(res => {
        if (res) {
          if (res.details) {
            let details = res.details.split(',');
            res.details = details.length > 0 && details.map((item, index) => {
              return { url: item, status: 'done', uid: index }
            })
          }
          if (res.courseCover) {
            let courseCover = res.courseCover.split(',');
            res.courseCover = courseCover.length > 0 && courseCover.map((item, index) => {
              return { url: item, status: 'done', uid: index }
            })
          }
          this.setState({
            currentItem: res
          })
        }
      })
    }
    fetchAllList({
      relationType: 1,
      type: 1,
    }).then(data => {
      if (data) {
        const list1 = [];
        data.forEach((item, index) => {
          list1.push(<Option key={item.name}>{item.name}</Option>);
        });
        this.setState({
          sortList: list1,
        });
      }
    });
    fetchAllList({
      relationType: 1,
      type: 2,
    }).then(data => {
      if (data) {
        const list2 = [];
        data.forEach((item, index) => {
          list2.push(
            <Option key={item.id} value={item.name}>
              {item.name}
            </Option>,
          );
        });
        this.setState({
          styleList: list2,
        });
      }
    });

    fetchAllList({
      relationType: 1,
      type: 3,
    }).then(data => {
      if (data) {
        const list3 = [];
        data.forEach((item, index) => {
          list3.push(
            <Option key={item.id} value={item.name}>
              {item.name}
            </Option>,
          );
        });
        this.setState({
          difficultList: list3,
        });
      }
    });

    fetchAllList({
      relationType: 1,
      type: 10,
    }).then(data => {
      if (data) {
        const list4 = [];
        data.forEach((item, index) => {
          list4.push(
            <span style={{ marginRight: '8px' }} key={index}>
              <Checkbox value={item.id} label={item.name}>{item.name}</Checkbox>
              <Tooltip placement="top" title={item.descrition}>
                <Icon type="question-circle" theme="filled" />
              </Tooltip>
            </span>
          );
        });
        this.setState({
          options: list4,
        });
      }
    });

    fetchGroupAll().then(data => {
      if (data) {
        const list5 = [];
        data.forEach((item, index) => {
          list5.push(
            <Option key={item.id} value={item.id}>
              {item.groupName}
            </Option>,
          );
        });
        this.setState({
          groupList: list5,
        });
      }
    })
    console.log(this.state.currentItem)
    fetchCampusAll().then(data => {
      if (data) {
        const campusList = [];
        data.forEach((item, index) => {
          campusList.push({
            label: item.name,
            value: item.id
          });
        });
        if (this.state.currentItem.afterClassCampusIdList) {
          this.setState({
            campusList,
            checkAll: campusList.length == this.state.currentItem.afterClassCampusIdList.length,
            indeterminate: this.state.currentItem.afterClassCampusIdList.length && campusList.length > this.state.currentItem.afterClassCampusIdList.length,
          });
        } else {
          this.setState({
            campusList,
            checkAll: false,
            indeterminate: false
          })
        }
        // console.log(campusList.length == this.state.currentItem.afterClassCampusIdList.length)
      }
    })

    fetchClassAll().then(data => {
      if (data) {
        const afterClassList = [<Option key={0} value={0} disabled>
          未绑定
        </Option>];
        data.forEach((item, index) => {
          afterClassList.push(
            <Option key={item.id} value={item.id}>
              {item.name}
            </Option>
          );
        });
        this.setState({
          afterClassList,
        });
      }
    })
  }

  beforeUpload = (file, fileList) => {
    return fetchOSSPolicy(file.name).then(res => {
      if (res) {
        file.ossData = res.ossData;
        Helper.setFileScale(file);
        this.setState({
          ossdata: res.ossData,
          host: res.host
        })
      }
    })
  };

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    });
  };

  handlePreviewCancel = () => this.setState({ previewVisible: false });

  handleImageChange = info => {
    const { ossdata, host } = this.state;
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      info.fileList.map(file => {
        if (file.lastModified) {
          if (!file.originFileObj.width) {
            console.log('出错了', 3)
            file.url = `${host}/${file.ossData.key}?750*750`
          }
          file.url = `${host}/${file.ossData.key}?${file.originFileObj.width}*${file.originFileObj.height}`
        }
      })
    }
  };

  normFile = e => {
    // console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  handleNext = (courseState = 0) => {
    const { form, handleModalVisible, afterOk, editDetail } = this.props;
    const { currentItem } = this.state;
    const isEdit = currentItem && currentItem.id
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (fieldsValue.allowStaging) {
        let paramList = [{
          installmentRatio: fieldsValue.installmentRatio
        }];
        fieldsValue.paramList = paramList;
      }
      if (isEdit) {
        fieldsValue.id = currentItem.id;
      }
      fieldsValue.courseState = courseState
      let imgList = []
      fieldsValue.courseCover && fieldsValue.courseCover.map((item, index) => {
        imgList.push(item.url)
      })
      fieldsValue.courseCover = imgList.join(',');
      let list = []
      fieldsValue.details && fieldsValue.details.map((item, index) => {
        list.push(item.url)
      })
      fieldsValue.details = list.join(',')
      fieldsValue.allowStaging = Number(fieldsValue.allowStaging);
      this.setState({
        confirmLoading: true,
      });
      let fetch = isEdit ? fetchCourseEdit : fetchCourseAdd;
      fetch(fieldsValue).then(d => {
        if (d) {
          this.setState({
            confirmLoading: false,
          });
          this.handleCancel()
        } else {
        }
      });
    });
  };

  handleCancel = () => {
    router.goBack(-1);
  };

  selectType = (a) => {
    this.setState({
      type: a
    })
  }

  validatePrice = (rule, value, callback) => {
    if (Number(value) < Number(this.props.form.getFieldValue('coursePrice'))) {
      callback('划线价不能低于课程价格')
    }
    callback();
  }

  validateCoursePrice = (rule, value, callback) => {
    if (Number(value) > Number(this.props.form.getFieldValue('courseLinePrice'))) {
      callback('课程价格不能高于划线价')
    }
    callback();
  }

  onChange = checkedList => {
    console.log(checkedList, 'checklist')
    const { campusList } = this.state
    this.props.form.setFieldsValue({
      afterClassCampusIdList: checkedList,
    });
    this.setState({
      indeterminate: !!checkedList.length && checkedList.length < campusList.length,
      checkAll: checkedList.length === campusList.length,
    });
  };

  onCheckAllChange = e => {
    const { campusList } = this.state
    console.log(campusList)
    console.log(e.target.checked)
    const list = []
    campusList && campusList.map((item, index) => {
      list.push(item.value)
    })
    this.props.form.setFieldsValue({
      afterClassCampusIdList: e.target.checked ? list : [],
    });
    this.setState({
      indeterminate: false,
      checkAll: e.target.checked,
    });
  };

  handleSet = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  render() {
    const { form, location: { query, state }, editDetail } = this.props;
    const { ossdata, host, currentItem, uploadLoading, sortList, styleList, difficultList, groupList, options, type, previewVisible, previewImage, campusList, afterClassList, isOpen } = this.state;
    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">{`上传课程轮播(${form.getFieldValue('courseCover') ? form.getFieldValue('courseCover').length : currentItem.courseCover && currentItem.courseCover.length > 0 ? currentItem.courseCover.length : 0}/9)`}</div>
      </div>
    );
    const uploadDetailButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传课程详情</div>
      </div>
    );
    return (
      <PageHeader
        title={currentItem.id ? '编辑课程' : '创建课程'}
        onBack={() => {
          router.goBack(-1);
        }}
      >
        <div style={{ marginTop: '20px', padding: '0 60px' }}>
          <Form style={{ marginTop: '20px' }} {...formItemLayout}>
            <h4 style={{ padding: '10px 40px' }}>1.基本信息</h4>
            <FormItem label="课程名称">
              {form.getFieldDecorator('courseName', {
                rules: [{ required: true, message: '课程名称不能为空' }],
                initialValue: currentItem.courseName,
              })(<Input placeholder="请输入课程名称" />)}
            </FormItem>
            <FormItem label="课程分类">
              {form.getFieldDecorator('courseType', {
                rules: [{ required: true, message: '请选择课程分类' }],
                initialValue: currentItem.courseType,
              })(<Select placeholder="请选择课程分类">{sortList}</Select>)}
            </FormItem>
            <FormItem label="开课学校">
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '30px', color: '#1890FF' }}>
                <Checkbox
                  indeterminate={this.state.indeterminate}
                  onChange={this.onCheckAllChange}
                  checked={this.state.checkAll}
                >全选</Checkbox>
                {
                  campusList && campusList.length > 6 && isOpen ?
                    <span>
                      <InlineButton onClick={() => this.handleSet()}>收起</InlineButton>
                      <Icon type="caret-down" />
                    </span> : <span>
                      <InlineButton onClick={() => this.handleSet()}>展开</InlineButton>
                      <Icon type="caret-right" />
                    </span>
                }
              </div>
              {form.getFieldDecorator('afterClassCampusIdList', {
                rules: [{ required: true, message: '请选择开课学校' }],
                initialValue: currentItem.afterClassCampusIdList || []
              })(<Group options={campusList} onChange={this.onChange} style={{ display: isOpen ? '' : 'none' }}></Group>)}
            </FormItem>
            <FormItem label="绑定过课单">
              {form.getFieldDecorator('afterClassId', {
                rules: [{ required: true, message: '请选择过课单' }],
                initialValue: currentItem.afterClassId,
              })(<Select placeholder="请选择课程分类">{afterClassList}</Select>)}
            </FormItem>
            <FormItem label="课程分组">
              {form.getFieldDecorator('groupIds', {
                rules: [{ required: false, message: '请选择课程分组' }],
                initialValue: currentItem.groupIds || []
              })(<Select mode="multiple" placeholder="请选择课程分组">{groupList}</Select>)}
            </FormItem>
            <FormItem label="排序" extra="影响列表排序。若非特殊商品，建议设默认值0。">
              {form.getFieldDecorator('courseSort', {
                rules: [{ required: false, message: '排序不能为空' }],
                initialValue: currentItem.courseSort,
              })(<Input placeholder="请输入排序" type="number" min={0} />)}
            </FormItem>
            <FormItem label="课程属性">
              <Row gutter={24} type="flex" style={{ backgroundColor: '#f2f2f2', alignItems: 'center', borderRadius: '5px', paddingTop: '10px', marginLeft: '3px' }}>
                <Col span={12}>
                  <FormItem label="授课方式" labelCol={{ span: 9 }} wrapperCol={{ span: 15 }}>
                    {form.getFieldDecorator('courseStyle', {
                      rules: [{ required: false, message: '请选择' }],
                      initialValue: currentItem.courseStyle,
                    })(<Select placeholder="请选择">{styleList}</Select>)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="教学难度" labelCol={{ span: 9 }} wrapperCol={{ span: 15 }}>
                    {form.getFieldDecorator('courseDifficulty', {
                      rules: [{ required: false, message: '请选择' }],
                      initialValue: currentItem.courseDifficulty,
                    })(<Select placeholder="请选择">{difficultList}</Select>)}
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            <FormItem
              label="课程轮播"
              labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}
              help="建议尺寸750*750"
            >
              {form.getFieldDecorator('courseCover', {
                valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
                initialValue: currentItem.courseCover
              })(
                <Upload
                  name="file"
                  action={host}
                  data={ossdata}
                  onPreview={this.handlePreview}
                  listType="picture-card"
                  multiple
                  beforeUpload={(file, fileList) => this.beforeUpload(file, fileList)}
                  onChange={this.handleImageChange}
                >
                  {form.getFieldValue('courseCover') && form.getFieldValue('courseCover').length >= 9 ? '' : uploadButton}
                </Upload>
              )}
            </FormItem>
            <FormItem labelCol={{ span: 1 }} wrapperCol={{ span: 23 }}>
              <Collapse bordered={false} style={{ alignSelf: 'center', borderBottom: '0px' }}>
                <Panel header="添加图文详情" key="1">
                  <FormItem label="课程描述" extra="（用于分享描述）" labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}>
                    {form.getFieldDecorator('courseDescribe', {
                      rules: [{ required: false, message: '课程描述不能为空' }],
                      initialValue: currentItem.courseDescribe,
                    })(<TextArea rows={4} placeholder="请输入课程描述" />)}
                  </FormItem>
                  <FormItem
                    label="课程详情"
                    labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}
                  >
                    {form.getFieldDecorator('details', {
                      valuePropName: 'fileList',
                      getValueFromEvent: this.normFile,
                      initialValue: currentItem.details
                    })(
                      <Upload
                        name="file"
                        action={host}
                        data={ossdata}
                        onPreview={this.handlePreview}
                        listType="picture-card"
                        multiple
                        beforeUpload={(file, fileList) => this.beforeUpload(file, fileList)}
                        onChange={this.handleImageChange}
                      >
                        {uploadDetailButton}
                      </Upload>
                    )}
                  </FormItem>
                </Panel>
              </Collapse>
            </FormItem>
            <Divider />
            <h4 style={{ padding: '10px 40px' }}>2.课程支付与分期</h4>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem label="课程价格" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
                  {form.getFieldDecorator('coursePrice', {
                    rules: [{ required: true, message: '课程价格不能为空' }, {
                      validator: this.validateCoursePrice
                    }],
                    initialValue: currentItem.coursePrice,
                  })(<Input placeholder="请输入课程价格" type="number" step={0.01} addonAfter="元" min={0} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="划线价">
                  {form.getFieldDecorator('courseLinePrice', {
                    rules: [
                      { required: true, message: '划线价不能为空' }, {
                        validator: this.validatePrice
                      }],
                    initialValue: currentItem.courseLinePrice,
                  })(<Input placeholder="请输入划线价" type="number" step={0.01} addonAfter="元" min={0} />)}
                </FormItem>
              </Col>
            </Row>
            <FormItem label="分销提成" labelCol={{ span: 5 }} wrapperCol={{ span: 6 }}>
              {form.getFieldDecorator('disCommission', {
                rules: [{ required: true, message: '分销提成不能为空' }],
                initialValue: currentItem.disCommission,
              })(<Input placeholder="请输入分销提成" type="number" addonAfter="%" min={0} />)}
            </FormItem>
            <FormItem label="允许定金">
              {form.getFieldDecorator('allowStaging', {
                rules: [{ required: false }],
                initialValue: !!currentItem.allowStaging,
                valuePropName: 'checked',
              })(<Switch checkedChildren="开" unCheckedChildren="关" />)}
            </FormItem>
            {form.getFieldValue('allowStaging') ? (
              <FormItem label="定金支付" labelCol={{ span: 5 }} wrapperCol={{ span: 6 }}>
                {form.getFieldDecorator('installmentRatio', {
                  rules: [{ required: true, message: '支付时间不能为空' }],
                  initialValue:
                    currentItem.paramList && currentItem.paramList[0]
                      ? currentItem.paramList[0].installmentRatio
                      : 0,
                })(
                  <Input min={0} type="number" addonBefore="售价*" addonAfter="%" />
                )}
              </FormItem>
            ) : null}
            <Divider />
            <h4 style={{ padding: '10px 40px' }}>3.服务及承诺</h4>
            <FormItem label="服务承诺">
              {form.getFieldDecorator('commitmentIds', {
                rules: [{ required: true, message: '服务承诺不能为空' }],
                initialValue: currentItem.commitmentIds || []
              })(<Group>
                {options}
              </Group>)}
            </FormItem>
            <FormItem style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <div className="submitButtons" style={{ display: 'flex', justifyContent: 'center' }}>
                <Button onClick={this.handleCancel}>取消</Button>
                <Button type="primary" style={{ marginLeft: 20 }} onClick={() => { currentItem && currentItem.courseState == 1 ? this.handleNext(1) : this.handleNext() }}>
                  保存
                  </Button>
                {
                  currentItem.courseState == 1 ? null : <Button type="primary" style={{ marginLeft: 20 }} onClick={() => { this.handleNext(1) }}>
                    保存并上架
                    </Button>
                }
              </div>
            </FormItem>
          </Form>
          <Modal visible={previewVisible} footer={null} onCancel={this.handlePreviewCancel}>
            <img alt="example" style={{ width: '100%', marginTop: '13px' }} src={previewImage} />
          </Modal>
        </div>
      </PageHeader>
    );
  }
}
