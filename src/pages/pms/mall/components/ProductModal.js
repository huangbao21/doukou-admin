import React, { Component } from 'react';
import { Form, Modal, Input, Cascader } from 'antd';
import { connect } from 'dva';
import { fetchCourseAdd, fetchCourseEdit } from '@/services/group';
import { fetchCategoryAdd, fetchCategoryEdit, fetchAdressAdd, fetchAdressEdit } from '@/services/product';
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
      fieldsValue.relationType = 2
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
  okHandleCategory = e => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, type, afterOk } = this.props;
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
      let fetch = isEdit ? fetchCategoryEdit : fetchCategoryAdd;
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

  okHandleAdress = e => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, type, afterOk } = this.props;
    const isEdit = currentItem && currentItem.id;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (isEdit) {
        fieldsValue.id = currentItem.id
      }
      fieldsValue['area'] = fieldsValue['area'].join('/');
      this.setState({
        confirmLoading: true,
      });
      let fetch = isEdit ? fetchAdressEdit : fetchAdressAdd;
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

  validatePhone = (rule, value, callback) => {
    var phonePattern = { phone: /^1\d{10}$/ };
    if (!phonePattern.phone.test(value)) {
      callback('请输入正确的手机号');
    } else {
      callback();
    }
  };

  render() {
    const { modalVisible, form, handleModalVisible, currentItem, type, title, ...props } = this.props;
    const { confirmLoading } = this.state;
    const { getFieldValue } = form;
    const isEdit = currentItem && currentItem.id;
    return (
      type == 1 ?
        <Modal
          width={500}
          title={isEdit ? `编辑${title}` : `新建${title}`}
          visible={modalVisible}
          onOk={this.okHandleCategory}
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
          <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={`排序`}>
            {form.getFieldDecorator('sort', {
              rules: [{ required: true, message: `排序不能为空` }],
              initialValue: currentItem.sort,
            })(<Input type="number" placeholder={`请输入排序`} min={0} />)}
          </FormItem>
        </Modal> :
        type == 2 ?
          <Modal
            width={600}
            title={isEdit ? `编辑${title}` : `新建${title}`}
            visible={modalVisible}
            onOk={this.okHandleAdress}
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
            <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label='收货人'>
              {form.getFieldDecorator('name', {
                rules: [{ required: true, message: `收货人不能为空` }],
                initialValue: currentItem.name,
              })(<Input placeholder={`请输入收货人`} />)}
            </FormItem>
            <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label='联系电话'>
              {form.getFieldDecorator('phone', {
                rules: [{ required: true, message: `联系电话不能为空` },
                  { validator: this.validatePhone }
                ],
                initialValue: currentItem.phone,
              })(<Input type="number" placeholder={`请输入联系电话`} />)}
            </FormItem>
            <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="省市区">
              {form.getFieldDecorator('area', {
                rules: [{ required: true, message: '请选择省市区' }],
                initialValue: currentItem.area ? currentItem.area.split('/') : '',
              })(
                <Cascader
                  options={options}
                  onChange={this.onChange}
                  placeholder="请选择省市区"
                  style={{ width: '100%' }}
                />,
              )}
            </FormItem>
            <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="详细地址">
              {form.getFieldDecorator('detailAddress', {
                initialValue: currentItem.detailAddress,
                rules: [
                  { required: true, message: '详细地址不能为空' },
                  { max: 120, message: '不能超过120字' },
                ],
              })(<TextArea rows={4} placeholder="请输入详细地址" />)}
            </FormItem>
          </Modal> :
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
              type == 22 ?
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
