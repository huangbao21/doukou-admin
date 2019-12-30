import React, { Component } from 'react';
import {
  Form,
  Modal,
  Input,
  Cascader,
} from 'antd';
import { connect } from 'dva';
import { fetchGroupAdd, fetchGroupEdit } from '@/services/group';
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
    const { form, currentItem, handleModalVisible, afterOk } = this.props;
    const isEdit = currentItem && currentItem.id;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // console.log(fieldsValue);
      if (isEdit) {
        fieldsValue.id = currentItem.id
      }
      this.setState({
        confirmLoading: true,
      });
      let fetch = isEdit ? fetchGroupEdit : fetchGroupAdd;
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
    const { modalVisible, form, handleModalVisible, currentItem, ...props } = this.props;
    const { confirmLoading } = this.state;
    const { getFieldValue } = form;
    const isEdit = currentItem && currentItem.id;

    return (
      <Modal
        width={500}
        title={isEdit ? '编辑分组' : '新建分组'}
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
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="分组名称">
          {form.getFieldDecorator('groupName', {
            rules: [{ required: true, message: '分组名称不能为空' }],
            initialValue: currentItem.groupName,
          })(<Input placeholder="请输入分组名称" />)}
        </FormItem>
      </Modal>
    );
  }
}

export default FormModal;
