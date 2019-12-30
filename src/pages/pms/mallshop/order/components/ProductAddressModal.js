import React, { Component } from 'react';
import { Form, Modal, Input, Cascader } from 'antd';
import { connect } from 'dva';
import { fetchProductAddress } from '@/services/product';
import options from '@/utils/cities';

const FormItem = Form.Item;
const { TextArea } = Input;

@connect(state => ({}))
@Form.create()
class FormModal extends Component {
  state = {
    confirmLoading: false,
  };
  okHandle = e => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, afterOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      fieldsValue.id = currentItem.id
      fieldsValue.receiverProvince = fieldsValue.area[0]
      fieldsValue.receiverCity = fieldsValue.area[1]
      fieldsValue.receiverRegion = fieldsValue.area[2]
      console.log(fieldsValue)
      this.setState({
        confirmLoading: true,
      });
      fetchProductAddress(fieldsValue)
        .then(d => {
          if (d) {
            form.resetFields()
            handleModalVisible(false)
            this.setState({
              confirmLoading: false,
            });
            afterOk();
          } else {
            this.setState({
              confirmLoading: false,
            });
          }
        })
    });
  };

  render() {
    const { modalVisible, form, handleModalVisible, currentItem, ...props } = this.props;
    const { confirmLoading } = this.state;
    const { getFieldValue } = form;
    const area = [currentItem.receiverProvince, currentItem.receiverCity, currentItem.receiverRegion]


    return (
      <Modal
        width={500}
        title='修改收货信息'
        visible={modalVisible}
        onOk={this.okHandle}
        maskClosable={false}
        confirmLoading={confirmLoading}
        onCancel={() => {
          this.props.form.resetFields();
          handleModalVisible(false);
        }}
        bodyStyle={{
          top: '100px',
          maxHeight: '1200px',
          paddingLeft: '0',
          paddingRight: '0',
        }}
        {...props}
      >
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="收货人">
          {form.getFieldDecorator('receiverName', {
            rules: [{ required: true, message: '收货人姓名不能为空' }],
            initialValue: currentItem.receiverName,
          })(<Input placeholder="请输入收货人姓名" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="手机号">
          {form.getFieldDecorator('receiverPhone', {
            rules: [{ required: true, message: '手机号不能为空' }],
            initialValue: currentItem.receiverPhone,
          })(<Input type="number" placeholder="请输入手机号" min={0} />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="省市区">
          {form.getFieldDecorator('area', {
            rules: [{ required: true, message: '请选择省市区' }],
            initialValue: area
          })(
            <Cascader
              options={options}
              onChange={this.onChange}
              placeholder="请选择省市区"
              style={{ width: '100%' }}
            />,
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="详细地址">
          {form.getFieldDecorator('receiverDetailAddress', {
            initialValue: currentItem.receiverDetailAddress,
            rules: [
              { required: true, message: '详细地址不能为空' },
              { max: 120, message: '不能超过120字' },
            ],
          })(<TextArea rows={4} placeholder="请输入详细地址" />)}
        </FormItem>
      </Modal>
    );
  }
}

export default FormModal;
