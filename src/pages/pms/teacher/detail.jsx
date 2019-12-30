import React, { Component, Fragment } from 'react';
import config from '@/config';
import { PageHeader, Form, DatePicker, Row, Col, Input, Button, Divider, Upload, Icon } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import router from 'umi/router';
import ImgCrop from 'antd-img-crop';
import { fetchOSSPolicy } from '@/services/oss';
import { fetchTeacherEdit } from '@/services/teacher'
import Helper from '@/utils/helper';

const FormItem = Form.Item;
const { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
};

@Form.create()
@connect(state => ({
  teacherDetail: state.teacher.teacherDetail,
}))
export default class TeacherDetail extends Component {
  state = {
    formValues: {},
    currentItem: {},
    ossData: {},
    host: '',
    uploadLoading: false,
    imageList: [],
    qualifyImageList: []
  };

  beforeUpload = file => {
    return fetchOSSPolicy(file.name).then(res => {
      if (res) {
        this.setState({
          ossData: res.ossData,
          host: res.host,
        });
      }
    });
  };

  handleImageChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ uploadLoading: true });
      return;
    }
    if (info.file.status === 'done') {
      const { teacherDetail } = this.props;
      let { currentItem, host, ossData } = this.state;
      currentItem = { ...currentItem, ...{ icon: `${host}/${ossData.key}` } };
      this.setState({ uploadLoading: false, currentItem });
    }
  };

  beforeImageListUpload = (file, fileList,index, arry) => {
    let item = arry[index];
    return fetchOSSPolicy(file.name).then(async res => {
      if (res) {
        fileList[0].ossData = res.ossData;
        item.host = res.host;
        item.ossData = res.ossData;
        await Helper.setFileScale(file);
        this.setState({
          imageList: arry
        });
      }
    });
  };

  handleImageListChange = (info, index, arr) => {
    let imgItem = arr[index];
    imgItem.fileList = info.fileList
    this.setState({ imageList: arr })
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {

      imgItem.fileList = info.fileList.map(file => {
        if (!file.url) {
          if (!file.originFileObj.width) {
            console.log('出错了', 3)
            file.url = `${imgItem.host}/${file.ossData.key}?750*750`
          }
          file.url = `${imgItem.host}/${file.ossData.key}?${file.originFileObj.width}*${file.originFileObj.height}`;
        }
        return file;
      });
      this.setState({
        imageList: arr
      })
    }
  };

  beforeQualityListUpload = (file, fileList,index, arry) => {
    let item = arry[index];
    return fetchOSSPolicy(file.name).then(async res => {
      if (res) {
        fileList[0].ossData = res.ossData;
        item.ossData = res.ossData;
        item.host = res.host;
        await Helper.setFileScale(file);
        this.setState({
          qualifyImageList: arry
        });
      }
    });
  };

  handleQualityListChange = (info, index, arr) => {
    let imgItem = arr[index];
    imgItem.fileList = info.fileList
    this.setState({ qualifyImageList: arr })
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      imgItem.fileList = info.fileList.map(file => {
        if (!file.url) {
          if (!file.originFileObj.width) {
            console.log('出错了', 3)
            file.url = `${imgItem.host}/${file.ossData.key}?750*750`
          }
          file.url = `${imgItem.host}/${file.ossData.key}?${file.originFileObj.width}*${file.originFileObj.height}`;
        }
        return file;
      });
      this.setState({
        qualifyImageList: arr
      })
    }
  };

  handleSave = e => {
    e.preventDefault();
    const { form, location: { query, state } } = this.props;
    const { currentItem, imageList, qualifyImageList } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let alllist = []
      if (imageList && imageList.length > 0) {
        imageList.map((item, index) => {
          let imgList = []
          item.fileList.map((n, m) => {
            imgList.push(n.url)
          })
          alllist.push({
            workName: fieldsValue[`workName${index}`],
            workImg: imgList.join(','),
          })
          delete fieldsValue[`workName${index}`]
          delete fieldsValue[`workImg${index}`]
        })
      }
      let allqualitylist = []
      if (qualifyImageList && qualifyImageList.length > 0) {
        qualifyImageList.map((item, index) => {
          let imgList = []
          item.fileList.map((n, m) => {
            imgList.push(n.url)
          })
          allqualitylist.push({
            qualifyName: fieldsValue[`qualifyName${index}`],
            qualifyImg: imgList.join(','),
          })
          delete fieldsValue[`qualifyName${index}`]
          delete fieldsValue[`qualifyImg${index}`]
        })
      }
      fieldsValue.teacherWorkParamList = alllist
      fieldsValue.teacherQualifyParamList = allqualitylist
      fieldsValue.icon = currentItem.icon
      fieldsValue.id = query.id
      fetchTeacherEdit(fieldsValue).then(d => {
        if (d) {
          this.setState({
            currentItem: fieldsValue,
          });
          router.push('/pms/teacher/list');
        }
      });
    });
  };

  workItem = (item, index) => {
    const { form } = this.props;
    const { currentItem, ossData, host, uploadLoading, imageList } = this.state;
    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传</div>
      </div>
    );

    return <FormItem label={index + 1} key={index}>
      <Row gutter={24}>
        <Col span={12}>
          <FormItem>
            {form.getFieldDecorator(`workName${index}`, {
              rules: [{ required: false, message: '标题不能为空' }],
              initialValue: item.workName,
            })(<Input placeholder="请输入标题" />)}
          </FormItem>
        </Col>
        <Col span={12}>
          {index + 1 == imageList.length && (<span><InlineButton onClick={() => { this.handleAdd(1) }} style={{ marginLeft: '10px' }}>新增一条</InlineButton><Divider type="vertical" /></span>)}
          <InlineButton onClick={() => { this.handleRemove(imageList, index) }}>删除本条</InlineButton>
        </Col>
      </Row>
      <FormItem labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
        {form.getFieldDecorator(`workImg${index}`, {
          rules: [{ required: false, message: '请上传图片' }],
          initialValue: item.workImg,
        })(
          <div>
            <Upload
              accept="image/*"
              name="file"
              listType="picture-card"
              beforeUpload={(file, fileList) => this.beforeImageListUpload(file, fileList,index, imageList)}
              data={item.ossData}
              onChange={(info) => this.handleImageListChange(info, index, imageList)}
              action={item.host}
              fileList={item.fileList}
            >
              {imageList.length >= 9 ? null : uploadButton}
            </Upload>
          </div>
        )}
      </FormItem>
    </FormItem>
  }

  handleAdd = (type) => {
    const { imageList, qualifyImageList } = this.state
    if (type == 1) {
      imageList.push({
        fileList: []
      })
      this.setState({ imageList })
    } else if (type == 2) {
      qualifyImageList.push({
        fileList: []
      })
      this.setState({ qualifyImageList })
    }
  }

  handleRemove = (imageList, index) => {
    imageList.splice(index, 1);
    this.setState({ imageList })
  }

  handleRemoveQuality = (qualifyImageList, index) => {
    qualifyImageList.splice(index, 1);
    this.setState({ qualifyImageList })
  }

  qualifyItem = (item, index) => {
    const { form } = this.props;
    const { currentItem, ossData, host, uploadLoading, qualifyImageList } = this.state;
    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传</div>
      </div>
    );

    return <FormItem label={index + 1} key={index}>
      <Row gutter={24}>
        <Col span={12}>
          <FormItem>
            {form.getFieldDecorator(`qualifyName${index}`, {
              rules: [{ required: false, message: '标题不能为空' }],
              initialValue: item.qualifyName,
            })(<Input placeholder="请输入标题" />)}
          </FormItem>
        </Col>
        <Col span={12}>
          {index + 1 == qualifyImageList.length && (<span><InlineButton onClick={() => { this.handleAdd(2) }} style={{ marginLeft: '10px' }}>新增一条</InlineButton><Divider type="vertical" /></span>)}
          <InlineButton onClick={() => { this.handleRemoveQuality(qualifyImageList, index) }}>删除本条</InlineButton>
        </Col>
      </Row>
      <FormItem labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
        {form.getFieldDecorator(`qualifyImg${index}`, {
          rules: [{ required: false, message: '请上传图片' }],
          initialValue: item.qualifyImg,
        })(
          <div>
            <Upload
              accept="image/*"
              name="file"
              listType="picture-card"
              beforeUpload={(file, fileList) => this.beforeQualityListUpload(file, fileList,index, qualifyImageList)}
              data={item.ossData}
              onChange={(info) => this.handleQualityListChange(info, index, qualifyImageList)}
              action={item.host}
              fileList={item.fileList}
            >
              {qualifyImageList.length >= 9 ? null : uploadButton}
            </Upload>
          </div>
        )}
      </FormItem>
    </FormItem>
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.teacherDetail !== nextProps.teacherDetail) {
      this.setState({
        currentItem: nextProps.teacherDetail,
      });
      let defaultList = [];
      let imageList = []
      if (nextProps.teacherDetail.teacherWorkParamList) {
        defaultList = nextProps.teacherDetail.teacherWorkParamList
        imageList = defaultList.length > 0 && defaultList.map((item, index) => {
          item.fileList = item.workImg && item.workImg.split(',').map((n, m) => {
            return {
              uid: m,
              url: n,
              status: 'done'
            }
          }) || []
          return item;
        }) || [{
          fileList: [],
          workImg: '',
          workName: ''
        }]
        this.setState({ imageList })
      }
      let defaultQualifyList = [];
      let qualifyImageList = []
      if (nextProps.teacherDetail.teacherQualifyParamList) {
        defaultQualifyList = nextProps.teacherDetail.teacherQualifyParamList
        qualifyImageList = defaultQualifyList.length > 0 && defaultQualifyList.map((item, index) => {
          item.fileList = item.qualifyImg && item.qualifyImg.split(',').map((n, m) => {
            return {
              uid: m,
              url: n,
              status: 'done'
            }
          }) || []
          return item;
        }) || [{
          fileList: [],
          qualifyImg: '',
          qualifyName: ''
        }]
        this.setState({ qualifyImageList })
      }
    }
  }

  componentDidMount() {
    const { location: { query, state } } = this.props;
    if (query.id) {
      this.props.dispatch({
        type: 'teacher/fetchTeacherDetail',
        payload: String(query.id),
      });
    }
  }

  render() {
    const { form, teacherDetail } = this.props;
    const { currentItem, ossData, host, uploadLoading, imageList, qualifyImageList } = this.state;
    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    let list = imageList.map((item, index) => {
      return (this.workItem(item, index))
    })
    let qualityList = qualifyImageList.map((item, index) => {
      return (this.qualifyItem(item, index))
    })
    // console.log(imageList, 'image')
    return (
      <PageHeader
        title="教师详情"
        onBack={() => {
          router.push('/pms/teacher/list');
        }}
      >
        <Form {...formItemLayout} onSubmit={this.handleSave}>
          <FormItem label="教师姓名">
            {form.getFieldDecorator('personName', {
              rules: [{ required: true, message: '教师姓名不能为空' }],
              initialValue: teacherDetail.personName,
            })(<Input placeholder="请输入教师姓名" />)}
          </FormItem>
          <FormItem label="教师形象照">
            {form.getFieldDecorator('icon', {
              rules: [{ required: false, message: '请上传教师形象照' }],
              initialValue: teacherDetail.icon,
            })(
              <ImgCrop modalTitle="编辑形象照" scale={100} width={450} height={450} modalWidth={500}>
                <Upload
                  accept="image/*"
                  name="file"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={this.beforeUpload}
                  data={ossData}
                  onChange={this.handleImageChange}
                  action={host}
                >
                  {
                    currentItem.icon ?
                      <img style={{ width: '100%' }} src={currentItem.icon} alt="" /> : uploadButton
                  }
                </Upload>
              </ImgCrop>
            )}
          </FormItem>
          <FormItem label="任教时长">
            {form.getFieldDecorator('teachTime', {
              rules: [{ required: true, message: '任教时长不能为空' }],
              initialValue: teacherDetail.teachTime,
            })(<Input placeholder="请输入任教时长" type="number" addonAfter="年" min={0} />)}
          </FormItem>
          <FormItem label="教师格言">
            {form.getFieldDecorator('motto', {
              rules: [{ required: false, message: '教师格言不能为空' }],
              initialValue: teacherDetail.motto,
            })(<TextArea rows={2} placeholder="请输入教师格言" />)}
          </FormItem>
          <FormItem label="教师作品"></FormItem>
          {list}
          <FormItem label="教师资质"></FormItem>
          {qualityList}
          <FormItem style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="primary" htmlType="submit">保存修改</Button>
            </div>
          </FormItem>
        </Form>
      </PageHeader>
    );
  }
}
