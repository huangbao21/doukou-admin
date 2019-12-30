import React, { Component } from 'react';
import {
  Form,
  Modal,
  Input,
  Cascader,
} from 'antd';
import { connect } from 'dva';
import { fetchTimeAdd, fetchTimeEdit } from '@/services/course';
import options from '@/utils/cities';

const FormItem = Form.Item;

@connect(state => ({}))
@Form.create()
class FormModal extends Component {
  state = {
    confirmLoading: false,
  };
  okHandle = e => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, afterOk, courseId } = this.props;
    const isEdit = currentItem && currentItem.id;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      console.log(fieldsValue);
      if (isEdit) {
        fieldsValue.id = currentItem.id
      }
      fieldsValue.courseId = courseId,
      this.setState({
        confirmLoading: true,
      });
      let fetch = isEdit ? fetchTimeEdit : fetchTimeAdd;
      fetch(fieldsValue)
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
    const { modalVisible, form, handleModalVisible, currentItem, courseId, ...props } = this.props;
    const { confirmLoading } = this.state;
    const { getFieldValue } = form;
    const isEdit = currentItem && currentItem.id;

    return (
      <Modal
        width={500}
        title={isEdit ? '编辑课时' : '新建课时'}
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
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="课时名称">
          {form.getFieldDecorator('className', {
            rules: [{ required: true, message: '课时名称不能为空' }],
            initialValue: currentItem.className,
          })(<Input placeholder="请输入课时名称" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="第几节">
          {form.getFieldDecorator('classSort', {
            rules: [{ required: true, message: '课时序号不能为空' }],
            initialValue: currentItem.classSort,
          })(<Input placeholder="请输入课时顺序序号" type='number' min={0}/>)}
        </FormItem>
      </Modal>
    );
  }
}

export default FormModal;
