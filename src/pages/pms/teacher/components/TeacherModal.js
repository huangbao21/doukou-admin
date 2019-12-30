import React, { Component } from 'react';
import {
  Form,
  Modal,
  Input,
  Select
} from 'antd';
import { connect } from 'dva';
import { fetchEdit } from '@/services/teacher';
import options from '@/utils/cities';
import TextArea from 'antd/lib/input/TextArea';
import { fetchCampusAll } from '@/services/campus'

const FormItem = Form.Item;
const { Option } = Select;

@connect(state => ({}))
@Form.create()
class FormModal extends Component {
  state = {
    confirmLoading: false,
    campusList: []
  };
  okHandle = e => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, afterOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // console.log(fieldsValue);
      fieldsValue.id = currentItem.id
      this.setState({
        confirmLoading: true,
      });
      fetchEdit(fieldsValue)
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

  validatePhone = (rule, value, callback) => {
    var phonePattern = { phone: /^1\d{10}$/ };
    if (!phonePattern.phone.test(value)) {
      callback('请输入正确的手机号');
    } else {
      callback();
    }
  };

  componentDidMount() {
    fetchCampusAll().then(res => {
      if (res) {
        this.setState({ campusList: res })
      }
    })
  }

  render() {
    const { modalVisible, form, handleModalVisible, currentItem, title, ...props } = this.props;
    const { confirmLoading, campusList } = this.state;
    const { getFieldValue } = form;
    let campusOptions = [];
    if (campusList && campusList.length > 0) {
      campusList.forEach(campus => {
        campusOptions.push(<Option key={campus.id} value={campus.id}>{campus.name}</Option>)
      })
    }

    return (
      <Modal
        width={500}
        title='编辑教师'
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
        <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label='姓名'>
          {form.getFieldDecorator('personName', {
            rules: [{ required: true, message: `用户姓名不能为空` }],
            initialValue: currentItem.personName,
          })(<Input placeholder={`请输入用户姓名`} />)}
        </FormItem>
        <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label='手机号'>
          {form.getFieldDecorator('personMobile', {
            rules: [{ required: true, message: `手机号不能为空` },
            { validator: this.validatePhone }],
            initialValue: currentItem.personMobile,
          })(<Input placeholder={`请输入手机号`} type="number" />)}
        </FormItem>
        <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label='校区'>
          {form.getFieldDecorator('campusId', {
            rules: [{ required: true, message: '请选择' }],
            initialValue: currentItem.campusId
          })(
            <Select style={{ width: '100%' }} placeholder="请选择">
              {campusOptions}
            </Select>
          )}
        </FormItem>
      </Modal>
    );
  }
}

export default FormModal;
