import React, { Component } from 'react';
import {
  Form,
  Modal,
  Input,
} from 'antd';
import { connect } from 'dva';
import { fetchCourseAdd, fetchCourseEdit } from '@/services/group';
import options from '@/utils/cities';
import TextArea from 'antd/lib/input/TextArea';

const FormItem = Form.Item;

@connect(state => ({}))
@Form.create()
class FormModal extends Component {
  state = {
    confirmLoading: false,
  };
  okHandle = e => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, type, afterOk } = this.props;
    const isEdit = currentItem && currentItem.id;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // console.log(fieldsValue);
      if (isEdit) {
        fieldsValue.id = currentItem.id
      }
      fieldsValue.type = type
      this.setState({
        confirmLoading: true,
      });
      let fetch = isEdit ? fetchCourseEdit : fetchCourseAdd;
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
    const { modalVisible, form, handleModalVisible, currentItem, type, title, ...props } = this.props;
    const { confirmLoading } = this.state;
    const { getFieldValue } = form;
    const isEdit = currentItem && currentItem.id;
    return (
      <Modal
        width={500}
        title={isEdit ? `编辑${title}` : `新建${title}`}
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
        <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={`${title}名称`}>
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: `${title}名称不能为空` }],
            initialValue: currentItem.name,
          })(<Input placeholder={`请输入${title}名称`} />)}
        </FormItem>
        {
          type == 10 ?
            <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={`承诺内容`}>
              {form.getFieldDecorator('descrition', {
                rules: [{ required: true, message: `承诺内容不能为空` },
                { max: 120, message: '不能超过120字' },],
                initialValue: currentItem.descrition,
              })(<TextArea rows={4} placeholder={`请输入承诺内容`} />)}
            </FormItem> : null
        }
      </Modal>
    );
  }
}

export default FormModal;
