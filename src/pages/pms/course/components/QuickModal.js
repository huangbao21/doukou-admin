import React, { Component } from 'react';
import {
  Form,
  Modal,
  Input,
} from 'antd';
import { connect } from 'dva';
import { fetchQuickEdit } from '@/services/course';
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
    const { form, currentItem, handleModalVisible, afterOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // console.log(fieldsValue);
      fieldsValue.id = currentItem.id
      this.setState({
        confirmLoading: true,
      });
      fetchQuickEdit(fieldsValue)
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
    const { modalVisible, form, handleModalVisible, currentItem, title, ...props } = this.props;
    const { confirmLoading } = this.state;
    const { getFieldValue } = form;
    return (
      <Modal
        width={500}
        title={`编辑${title}`}
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
        {
          title == "排序" ?
            <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={`${title}`}>
              {form.getFieldDecorator('courseSort', {
                rules: [{ required: true, message: `${title}不能为空` }],
                initialValue: currentItem.courseSort,
              })(<Input placeholder={`请输入${title}`} type="number" min={0} />)}
            </FormItem> :
            title == "课程名称" ?
              <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={`${title}`}>
                {form.getFieldDecorator('courseName', {
                  rules: [{ required: true, message: `${title}不能为空` }],
                  initialValue: currentItem.courseName,
                })(<Input placeholder={`请输入${title}`} />)}
              </FormItem> :
              title == "课程价格" ?
                <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={`${title}`}>
                  {form.getFieldDecorator('coursePrice', {
                    rules: [{ required: true, message: `${title}不能为空` }],
                    initialValue: currentItem.coursePrice,
                  })(<Input placeholder={`请输入${title}`} type="number" step={0.01} min={0} />)}
                </FormItem> : null
        }

      </Modal>
    );
  }
}

export default FormModal;
