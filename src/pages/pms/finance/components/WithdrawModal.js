import React, { Component } from 'react';
import {
  Modal,
  Input,
  Radio,
  Row,
  Card,
  Checkbox,
  Col,
  InputNumber,
  Select,
  Cascader,
  Form,
  Divider,
  Upload,
  Icon,
  message
} from 'antd';
import { connect } from 'dva';
import options from '@/utils/cities';
import FormItem from 'antd/lib/form/FormItem';
import { withdrawMoney} from '@/services/finance';

const RadioGroup = Radio.Group;
const { Option } = Select;
const { TextArea } = Input;

@Form.create()
@connect(({user})=>({
  currentUser: user.currentUser,
}))
class WithdrawModal extends Component {
  state = {
    confirmLoading: false,
  };

  okHandle = (e) => {
    e.preventDefault();
    const { form, handleModalVisible, afterOk } = this.props;
    form.validateFields((err, fieldValue) => {
      if (err) return;
      this.setState({
        confirmLoading: true
      })
      withdrawMoney(fieldValue).then(res => {
        if (res) {
          form.resetFields();
          handleModalVisible(false);
          this.setState({
            confirmLoading: false
          })
          afterOk()
        } else {
          this.setState({
            confirmLoading: false
          })
        }
      })
    })
  }
  render() {
    const { form, modalVisible, handleModalVisible, currentUser, ...props } = this.props;
    const { getFieldDecorator } = form;
    const { confirmLoading } = this.state
    let roleOptions = [];
    let campusOptions = [];
    return (
      <Modal
        width={600}
        title='提现'
        visible={modalVisible}
        maskClosable={false}
        confirmLoading={confirmLoading}
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
        <FormItem label="提现金额" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('money', {
            rules: [{ required: true, message: '请输入1-5000金额' }],
            initialValue: 1
          })(
            <InputNumber style={{width:'100%'}} min={1} max={5000} placeholder="请输入1-5000金额" />
          )}
        </FormItem>
        <FormItem label="备注" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('msg', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: ''
          })(
            <TextArea placeholder="例如：活动小礼品购买，教学耗材购买，餐费等"  rows={4} />
          )}
        </FormItem>
        <FormItem label="提现到" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {currentUser.bindWxMiniprogram?'':<img style={{width:'100%'}} src='https://image-doukou.oss-cn-hangzhou.aliyuncs.com/images/resources/doukou-wx-miniproject-qrcode.jpg' />}
        </FormItem>

      </Modal>
    );
  }
}

export default WithdrawModal;
