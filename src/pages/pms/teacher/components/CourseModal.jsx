import React, { Component } from 'react';
import { Modal, Input, Radio, DatePicker, Row, Card, Checkbox, Col, InputNumber, Select, Cascader, Form } from 'antd';
import { connect } from 'dva';
import options from '@/utils/cities';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import { createCourse, updateCourse } from '@/services/teacher';

const RadioGroup = Radio.Group;
const { Option } = Select;
const { TextArea } = Input;
const FormItem = Form.Item;

@Form.create()
@connect(({ courseHome, loading }) => ({
  allCourse: courseHome.allCourse,
  loading: loading.models.courseHome
}))
export default class CourseModal extends Component {
  state = {
    confirmLoading: false,
    courseType:1
  };
  okHandle = (e) => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, afterOk } = this.props;
    form.validateFields((err, fieldValue) => {
      if (err) return
      this.setState({
        confirmLoading: true
      })
      let fetch = currentItem.id ? updateCourse : createCourse;
      fetch(fieldValue).then(res => {
        if (res) {
          form.resetFields();
          handleModalVisible(false);
          this.setState({
            confirmLoading: false
          })
          afterOk();
        } else {
          this.setState({
            confirmLoading: false
          })
        }
      })
    })
  }
  render() {
    const { form: { getFieldDecorator }, modalVisible, handleModalVisible, currentItem, teacher, allCourse, ...props } = this.props;
    const { confirmLoading,courseType } = this.state;
    let courseOptions = [];
    courseOptions = allCourse.map(course => {
      return <Option key={course.id} type={course.patternType}>{course.courseName}</Option>
    })
    return (
      <Modal
        width={600}
        title={currentItem.id?'编辑':'添加'}
        visible={modalVisible}
        maskClosable={false}
        confirmLoading={confirmLoading}
        onOk={this.okHandle}
        onCancel={() => {
          this.setState({ courseType:1})
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
        <FormItem label="开课老师" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {teacher.teacherName}
        </FormItem>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('id', {
            initialValue: currentItem.id
          })(
            <Input />
          )}
        </FormItem>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('teacherId', {
            initialValue: teacher.teacherId
          })(
            <Input />
          )}
        </FormItem>
        <FormItem label="课程" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('courseId', {
            rules: [{ required: true, message: '请选择' }],
            initialValue: currentItem.courseId && String(currentItem.courseId)
          })(
            <Select style={{ width: '100%' }} onChange={(e,v)=>{this.setState({courseType:v.props.type})}}>
              {courseOptions}
            </Select>
          )}
        </FormItem>
        {courseType == 2 && <FormItem label="开课时间" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('courseStartTime', {
            initialValue: moment(currentItem.courseStartTime)
          })(
            <DatePicker showTime style={{ width: '100%' }}
              format="YYYY-MM-DD HH:mm" />
          )}
        </FormItem>}
        
      </Modal>
    );
  }
}

