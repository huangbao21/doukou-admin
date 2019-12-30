import React, { Component } from 'react';
import { Form, Modal, Input } from 'antd';
import { connect } from 'dva';
import { fetchReplySave } from '@/services/comment';
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
    console.log(currentItem)
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      console.log(fieldsValue);
      fieldsValue.commentId = currentItem.id
      this.setState({
        confirmLoading: true,
      });
      fetchReplySave(fieldsValue)
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
        title='回复'
        visible={modalVisible}
        onOk={this.okHandle}
        maskClosable={false}
        confirmLoading={confirmLoading}
        onCancel={() => {
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
        <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="回复内容">
          {form.getFieldDecorator('content', {
            initialValue: currentItem.replayText && currentItem.replayId != 0 ? currentItem.replayText : '',
            rules: [
              { required: true, message: '回复内容不能为空' },
              { max: 120, message: '不能超过120字' },
            ],
          })(<TextArea rows={4} placeholder="请填写回复内容" />)}
        </FormItem>
      </Modal>
    );
  }
}

export default FormModal;
