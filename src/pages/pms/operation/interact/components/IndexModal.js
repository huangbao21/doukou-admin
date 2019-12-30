import React, { Component, forwardRef } from 'react';
import { Modal, Input, Radio, Row, Checkbox, Col, Icon, Cascader, InputNumber, Select, Form, Button, DatePicker, Upload } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import FormItem from 'antd/lib/form/FormItem';
import RadioInput from '@/components/RadioInput'
import { createCoupon, updateCoupon } from '@/services/smsindexwindow'
import { fetchAllCoupon } from '@/services/coupon'
import { fetchOSSPolicy } from '@/services/oss';
import InlineButton from '@/components/InlineButton';
import Styles from '../style.less'

const RadioGroup = Radio.Group;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

@Form.create()
@connect((state) => ({
  allCourse: state.courseHome.allCourse,
  productList: state.mall.productList,
  groupList: state.mall.groupList,
  courseGroup: state.courseHome.allGroup
}))
export default class IndexModal extends Component {
  constructor(props) {
    super(props)
    this.inputNumber;
  }
  state = {
    ossData: {},
    host: '',
    currentItem: {},
    uploadLoading: false,
    confirmLoading: false,
    productCoupon: [],
    courseCoupon: []
  };
  componentDidMount() {
    fetchAllCoupon({ relationType: 1 }).then(res => {
      this.setState({ courseCoupon: res })
    })
    fetchAllCoupon({ relationType: 2 }).then(res => {
      this.setState({ productCoupon: res })
    })
    this.props.dispatch({
      type: 'mall/fetchProductAll',
      payload: {}
    })
    this.props.dispatch({
      type: 'mall/fetchGroup',
      payload: {}
    })
    this.props.dispatch({
      type: 'courseHome/fetchAllCourse',
      payload: {}
    })
    this.props.dispatch({
      type: 'courseHome/fetchAllGroup',
      payload: {}
    })
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.currentItem !== nextProps.currentItem && nextProps.modalVisible) {
      this.setState({
        currentItem: nextProps.currentItem
      })
    }
  }
  okHandle = e => {
    e.preventDefault();
    const { form, handleModalVisible, afterOk, operateType, relationType } = this.props;
    const { currentItem } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.setState({
        confirmLoading: true,
      });
      let fetch;
      let params = {};
      if(operateType=='isEdit'){
        fetch = updateCoupon;
        params.id = currentItem.id;
        params.imageUrl = currentItem.imageUrl;
        params.name = fieldsValue.name;
      }else{
        // 新增
        fetch = createCoupon;
        fieldsValue.type = relationType;

        fieldsValue.startTime = fieldsValue.useTime[0];
        fieldsValue.endTime = fieldsValue.useTime[1];
        fieldsValue.imageUrl = currentItem.imageUrl;
        if (fieldsValue.eventMatchType == 0) {
          fieldsValue.eventMatchDay = 1;
        }
        params = fieldsValue;
      }
      
      fetch(params).then(d => {
        if (d) {
          handleModalVisible(false);
          this.setState({
            confirmLoading: false,
          });
          form.resetFields();
          afterOk();
        } else {
          this.setState({
            confirmLoading: false,
          });
        }
      })
    })
  }
  beforeUpload = (file) => {
    return fetchOSSPolicy(file.name).then(res => {
      if (res) {
        this.setState({
          ossData: res.ossData,
          host: res.host
        })
      }
    })
  }
  handleImageChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ uploadLoading: true })
      return;
    }
    if (info.file.status === 'done') {
      let { currentItem, host, ossData } = this.state;
      currentItem = { ...currentItem, ...{ imageUrl: `${host}/${ossData.key}` } }
      this.setState({ uploadLoading: false, currentItem })
    }
  }
  render() {
    const { form, modalVisible, handleModalVisible, operateType, allCourse, groupList, courseGroup, productList, relationType, ...props } = this.props;

    const { confirmLoading, uploadLoading, host, ossData, currentItem, courseCoupon, productCoupon } = this.state;
    const { getFieldDecorator } = form;

    let groupOptions = relationType == 1 ? courseGroup : groupList;
    groupOptions = groupOptions.map(gp => {
      return <Option value={gp.id} key={gp.id}>{gp.groupName}</Option>
    })

    let couponOptions = relationType == 1 ? courseCoupon : productCoupon;
    couponOptions = couponOptions.map(co => {
      return <Option value={co.id} key={co.id}>{co.name}</Option>
    })

    let options = relationType == 1 ? allCourse : productList;
    options = options.map(op => {
      let url = relationType == 1 ? op.courseCover ? op.courseCover.split(',') : null : op.albumPics ? op.albumPics.split(',') : null;
      return <Option value={op.id} key={op.id}><img style={{ width: '80px' }} src={url ? url[0] : '/placehold.png'} />{relationType == 1 ? op.courseName : op.name}</Option>
    })

    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">图片上传</div>
      </div>
    );
    return (
      <Modal
        width={600}
        title={'优惠券'}
        visible={modalVisible}
        maskClosable={false}
        confirmLoading={confirmLoading}
        footer={operateType == 'isView' ? null : undefined}
        onOk={this.okHandle}
        onCancel={() => {
          this.props.form.resetFields();
          handleModalVisible(false);
        }}
        bodyStyle={{
          top: '100px',
          maxHeight: '1200px',
          paddingLeft: '15',
          paddingRight: '15',
        }}
        {...props}
      >
        <h3>基本信息</h3>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='弹窗名称'>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: currentItem.name
          })(
            <Input disabled={operateType == 'isView'} placeholder='请输入弹窗名称' />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='弹窗图片'>
          {getFieldDecorator('imageUrl', {
            rules: [{ required: true, message: '请上传图片' }],
            initialValue: currentItem.imageUrl,
          })(
            <Upload
              disabled={operateType == 'isView'}
              accept="image/*"
              name="file"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={this.beforeUpload}
              data={ossData}
              onChange={this.handleImageChange}
              action={host}
            >
              {currentItem.imageUrl ? <img style={{ width: '100%' }} src={currentItem.imageUrl} alt="" /> : uploadButton}
            </Upload>
          )}
        </FormItem>

        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='链接类型'>
          {getFieldDecorator('linkType', {
            rules: [{ required: true, message: '请选择' }],
            initialValue: currentItem.linkType || 0
          })(
            <Radio.Group disabled={operateType == 'isView' || operateType == 'isEdit'}>
              <Radio.Button value={0}>{relationType == 1 ? '课程' : '商品'}</Radio.Button>
              <Radio.Button value={1}>链接</Radio.Button>
              <Radio.Button value={2}>{relationType == 1 ? '课程分组' : '商品分组'}</Radio.Button>
              <Radio.Button value={3}>{relationType == 1 ? '课程优惠券' : '商品优惠券'}</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        {
          form.getFieldValue('linkType') == 0 && <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label={`选择${relationType == 1 ? '课程' : '商品'}`} >
            {getFieldDecorator('productCourseId', {
              rules: [{ required: true, message: '请选择' }],
              initialValue: currentItem.productCourseId
            })(
              <Select className={Styles.SelectImg} style={{ width: '100%' }} showSearch placeholder={`请选择${relationType == 1 ? '课程' : '商品'}`}
                filterOption={(input, option) => {
                  return option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0
                }} disabled={operateType == 'isView' || operateType == 'isEdit'}>
                {options}
              </Select>
            )}
          </FormItem>
        }
        {
          form.getFieldValue('linkType') == 1 && <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='输入链接'>
            {getFieldDecorator('linkValue', {
              rules: [{ required: true, message: '请输入' }],
              initialValue: currentItem.linkValue
            })(
              <Input disabled={operateType == 'isView' || operateType == 'isEdit'} placeholder='请输入链接' />
            )}
          </FormItem>
        }
        {
          form.getFieldValue('linkType') == 2 && <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='选择分组'>
            {getFieldDecorator('groupId', {
              rules: [{ required: true, message: '请选择' }],
              initialValue: currentItem.groupId
            })(
              <Select style={{ width: '100%' }} showSearch placeholder='请选择分组'
                filterOption={(input, option) => {
                  return option.props.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0
                }} disabled={operateType == 'isView' || operateType == 'isEdit'}>
                {groupOptions}
              </Select>
            )}
          </FormItem>
        }
        {
          form.getFieldValue('linkType') == 3 && <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='选择优惠券'>
            {getFieldDecorator('couponIds', {
              rules: [{ required: true, message: '请选择' }],
              initialValue: currentItem.couponIds
            })(
              <Select style={{ width: '100%' }} showSearch placeholder='请选择优惠券'
                filterOption={(input, option) => {
                  return option.props.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0
                }} disabled={operateType == 'isView' || operateType == 'isEdit'} mode="multiple">
                {couponOptions}
              </Select>
            )}
          </FormItem>
        }

        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='触发条件'>
          {getFieldDecorator('eventMatchType', {
            rules: [{ required: true, message: '请选择' }],
            initialValue: currentItem.eventMatchType ? currentItem.eventMatchType:form.getFieldValue('linkType') == 3?1: 0
          })(
            <RadioGroup disabled={operateType == 'isView' || operateType == 'isEdit'}>
              <Radio value={0} disabled={form.getFieldValue('linkType')==3}>1天/次</Radio>
              <Radio value={1}>新用户登录</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='生效时间'>
          {getFieldDecorator('useTime',
            {
              rules: [{ required: true, message: '请选择时间' }],
              initialValue: currentItem.startTime?[moment(currentItem.startTime),moment(currentItem.endTime)]:[]
            })(
              <RangePicker showTime={{ format: 'HH:mm:ss' }} format='YYYY-MM-DD HH:mm:ss' disabled={operateType == 'isView' || operateType == 'isEdit'}>
              </RangePicker>
            )}
        </FormItem>
      </Modal>
    );
  }
}


