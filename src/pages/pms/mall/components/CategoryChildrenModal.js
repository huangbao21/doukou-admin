import React, { Component, Fragment } from 'react';
import { Form, Modal, Input, Row, Checkbox, Col, InputNumber, Tag, Button, Divider } from 'antd';
import { connect } from 'dva';
import { fetchCategoryAdd } from '@/services/product';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';

const FormItem = Form.Item;
const { confirm } = Modal

@connect(state => ({
  
}))
@Form.create()
class FormModal extends Component {
  state = {
    
  };
  okHandle = e => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, afterOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.setState({
        confirmLoading: true,
      });
      console.log(currentItem)
      fieldsValue.parentId = currentItem.id
      fetchCategoryAdd(fieldsValue)
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
        title='添加二级分类'
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
        <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label='二级分类'>
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '二级分类名称不能为空' }],
            initialValue: '',
          })(<Input placeholder='请输入二级分类名称' />)}
        </FormItem>
        <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label='排序'>
          {form.getFieldDecorator('sort', {
            rules: [{ required: true, message: `排序不能为空` }],
            initialValue: 0,
          })(<Input type="number" placeholder={`请输入排序`} min={0} />)}
        </FormItem>
      </Modal>
    );
  }
}

export default FormModal;
