import React, { Component } from 'react';
import {
  Modal, Input, Tag, Radio, Row, Card, Checkbox, Col, InputNumber, Form, Select, Tabs, DatePicker, Divider, Cascader
} from 'antd';
import { connect } from 'dva';
import options from '@/utils/cities';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import FormItem from 'antd/lib/form/FormItem';
import { addStudent}from '@/services/student'

const { Option } = Select;
@Form.create()
export default class addStudentModal extends Component {

  okHandle = e=>{
    e.preventDefault();
    const { form, handleModalVisible, afterOk } = this.props;
    form.validateFields((err,values)=>{
      if (err) return;
      values.birthday = values.birthday &&moment(values.birthday).format('YYYY-MM-DD');
      values.city = values.city&&values.city.join('/');
      return addStudent(values).then(res=>{
        if(res){
          form.resetFields();
          handleModalVisible(false);
          afterOk();
        }
      })
    })
  }
  render() {
    const { form, modalVisible, handleModalVisible, ...props } = this.props;
    return (
      <Modal
        width={500}
        title={'新增学员'}
        visible={modalVisible}
        maskClosable={false}
        onOk={this.okHandle}
        onCancel={() => {
          form.resetFields();
          handleModalVisible(false);
        }}
        bodyStyle={{
          top: '800px',
          maxHeight: '1200px',
          paddingLeft: '15',
          paddingRight: '15',
        }}
        {...props}
      >
        <FormItem label='学员姓名' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          {form.getFieldDecorator('realname', { rules: [{ required: true, message: '请输入' }] })(
            <Input placeholder="请输入学员姓名" />
          )}
        </FormItem>
        <FormItem label='学员电话' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          {form.getFieldDecorator('phone', { rules: [{ required: true, message: '请输入' }] })(
            <InputNumber style={{width:'100%'}} maxLength={11} placeholder="请输入学员电话" />
          )}
        </FormItem>
        <FormItem label='性别' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          {form.getFieldDecorator('gender',{initialValue:1})(
            <Radio.Group>
              <Radio value={1}>男</Radio>
              <Radio value={2}>女</Radio>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem label='学员生日' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          {form.getFieldDecorator('birthday' )(
            <DatePicker style={{ width: '100%' }}/>
          )}
        </FormItem>
        <FormItem label='城市' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          {form.getFieldDecorator('city')(
            <Cascader
              options={options}
              placeholder="请选择城市"
              style={{ width: '100%' }}
            ></Cascader>
          )}
        </FormItem>
      </Modal>
    )
  }
}