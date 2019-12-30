import React, { Component } from 'react';
import { Form, Modal, Input, Radio, Row, Card, Checkbox, Col, InputNumber, Select, Upload, Icon } from 'antd';
import { connect } from 'dva';
import { fetchOrderRefund } from '@/services/order';

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
    const { form, handleModalVisible, afterOk, currentItem } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      fieldsValue.itemId = currentItem.itemId
      this.setState({
        confirmLoading: true,
      });
      fetchOrderRefund(fieldsValue)
        .then(d => {
          if (d) {
            handleModalVisible(false);
            form.resetFields();
            this.setState({
              confirmLoading: false,
            });
            afterOk();
          } else {
            form.resetFields();
            this.setState({
              confirmLoading: false,
            });
          }
        })
    });
  };

  validatePrice = (rule, value, callback) => {
    if (value > Number(this.props.currentItem.payAmount)) {
      callback('退款金额不允许超过订单金额');
    } else {
      callback();
    }
  };

  render() {
    const { modalVisible, form, handleModalVisible, currentItem, ...props } = this.props;
    const { confirmLoading } = this.state;

    return (
      <Modal
        width={500}
        title='订单退款'
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
        <Form>
          <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="退款金额">
            {form.getFieldDecorator('refundAmout', {
              rules: [
                { required: true, message: '退款金额不能为空' },
                { validator: this.validatePrice, }
              ],
              initialValue: '',
            })(<Input placeholder={`${currentItem.payAmount}`} type='number' step={0.01} addonAfter='元' />)}
          </FormItem>
          <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="退款备注">
            {form.getFieldDecorator('refundRemark', {
              initialValue: currentItem.refundRemark,
              rules: [
                { required: false, message: '退款备注不能为空' },
                { max: 120, message: '不能超过120字' },
              ],
            })(<TextArea rows={4} placeholder="请输入退款备注" />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default FormModal;
