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
import { createUser, updateUser } from '@/services/admin';

const RadioGroup = Radio.Group;
const { Option } = Select;
const { TextArea } = Input;

@Form.create()
class EditModal extends Component {
  state = {
    confirmLoading: false,
  };

  okHandle = (e) => {
    e.preventDefault();
    const { form, handleModalVisible, afterOk, currentItem } = this.props;
    form.validateFields((err, fieldValue) => {
      if (err) return;
      fieldValue.id = currentItem.id
      if(!Array.isArray(fieldValue.campusIds)){
        fieldValue.campusIds = [fieldValue.campusIds]
      }
      this.setState({
        confirmLoading: true
      })
      let fetch = currentItem.id ? updateUser : createUser
      fetch(fieldValue).then(res => {
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
    const { form, modalVisible, currentItem, rolesList, campusList, rolesMap,handleModalVisible, ...props } = this.props;
    const { getFieldDecorator } = form;
    const { confirmLoading } = this.state
    let roleOptions = [];
    let campusOptions = [];
    if (rolesList.length > 0 && campusList.length > 0) {
      rolesList.forEach(role => {
        roleOptions.push(<Option key={role.id} value={role.id}>{role.name}</Option>)
      })
      campusList.forEach(campus => {
        campusOptions.push(<Option key={campus.id} value={campus.id}>{campus.name}</Option>)
      })
    }
    return (
      <Modal
        width={600}
        title={currentItem.id ? '修改' : '创建'}
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
        <FormItem label="用户名" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('personName', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: currentItem.personName
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>
        <FormItem label="手机号码" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('personMobile', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: currentItem.personMobile
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>
        <FormItem label="角色" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('roleId', {
            rules: [{ required: true, message: '请选择' }],
            initialValue: currentItem.roleId && currentItem.roleId
          })(
            <Select style={{ width: '100%' }} placeholder="请选择">
              {roleOptions}
            </Select>
          )}
        </FormItem>
        {(rolesMap[form.getFieldValue('roleId')] != 1 && rolesMap[form.getFieldValue('roleId')] != 10) && rolesMap[form.getFieldValue('roleId')] != 20&& <FormItem label="校区" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('campusIds', {
            rules: [{ required: true, message: '请选择' }],
            initialValue: currentItem.campusIds && currentItem.campusIds[0]
          })(
            <Select style={{ width: '100%' }} placeholder="请选择"
              showSearch
              filterOption={(input, option) => {
                return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }}>
              {campusOptions}
            </Select>
          )}
        </FormItem>}
        {(rolesMap[form.getFieldValue('roleId')] == 20) && <FormItem label="校区" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('campusIds', {
            rules: [{ required: true, message: '请选择' }],
            initialValue: currentItem.campusIds && currentItem.campusIds
          })(
            <Select style={{ width: '100%' }} placeholder="请选择"
              showSearch
              mode="multiple"
              filterOption={(input, option) => {
                return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }}>
              {campusOptions}
            </Select>
          )}
        </FormItem>}

      </Modal>
    );
  }
}

export default EditModal;
