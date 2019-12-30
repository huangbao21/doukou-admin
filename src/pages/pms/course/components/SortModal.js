import React, { Component } from 'react';
import {
  Form,
  Modal,
  Input,
} from 'antd';
import { connect } from 'dva';
import { fetchSortEdit } from '@/services/course';
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
      fetchSortEdit(fieldsValue)
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
        title='编辑排序'
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
        <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={`排序`}>
          {form.getFieldDecorator('sort', {
            rules: [{ required: true, message: `排序不能为空` }],
            initialValue: currentItem.sort,
          })(<Input placeholder={`请输入排序`} type="number" min={0} />)}
        </FormItem>
      </Modal>
    );
  }
}

export default FormModal;
