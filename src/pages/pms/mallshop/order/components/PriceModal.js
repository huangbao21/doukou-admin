import React, { Component } from 'react';
import { Form, Modal, Input, Cascader } from 'antd';
import { connect } from 'dva';
import { fetchPriceEdit } from '@/services/product';

const FormItem = Form.Item;

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
      fieldsValue.orderId = currentItem.orderId
      this.setState({
        confirmLoading: true,
      });
      fetchPriceEdit(fieldsValue)
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

    return (
      <Modal
        width={500}
        title='修改价格'
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
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="订单价格">
          {form.getFieldDecorator('payAmount', {
            rules: [{ required: true, message: '订单价格不能为空' }],
            initialValue: currentItem.payAmount,
          })(<Input type="number" placeholder="请输入订单价格" min={0} />)}
        </FormItem>
      </Modal>
    );
  }
}

export default FormModal;
