import React, { Component } from 'react';
import {
  Modal,
  Input,
  Row,
  Col,
  Form,
  Divider,
  Icon,
  Tree,
  message
} from 'antd';
import { connect } from 'dva';
import options from '@/utils/cities';
import FormItem from 'antd/lib/form/FormItem';
import { createRole } from '@/services/role';


@Form.create()
class EditModal extends Component {
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
      createRole(fieldValue).then(res => {
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
    const { form, modalVisible,handleModalVisible, ...props } = this.props;
    const { getFieldDecorator } = form;
    const { confirmLoading } = this.state
    return (
      <Modal
        width={600}
        title={'创建角色'}
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
        <FormItem label="角色名称" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入' }],
          })(
            <Input placeholder="请输入"/>
          )}
        </FormItem>
      </Modal>
    );
  }
}

export default EditModal;
