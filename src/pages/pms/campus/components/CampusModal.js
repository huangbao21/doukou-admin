import React, { Component } from 'react';
import {
  Form,
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
} from 'antd';
import { connect } from 'dva';
import { fetchCampusAdd, fetchCampusEdit } from '@/services/campus';
import options from '@/utils/cities';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { Option } = Select;
const { TextArea } = Input;

@connect(state => ({}))
@Form.create()
class FormModal extends Component {
  state = {
    confirmLoading: false,
    cascader: [], // Cascader级联 当前省市区
  };
  okHandle = e => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, afterOk } = this.props;
    const isEdit = currentItem && currentItem.id;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // console.log(fieldsValue);
      if (isEdit) {
        fieldsValue.id = currentItem.id
      }
      fieldsValue['area'] = fieldsValue['area'].join('/');
      fieldsValue['lonLat'] = fieldsValue['lonLat1'] + ',' + fieldsValue['lonLat2']
      this.setState({
        confirmLoading: true,
      });
      let fetch = isEdit ? fetchCampusEdit : fetchCampusAdd;
      fetch(fieldsValue)
        .then(d => {
          if (d) {
            handleModalVisible(false);
            form.resetFields()
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

  onChange = (value, i) => {
    this.setState(
      {
        cascader: value,
      },
      () => {
        console.log(value);
        console.log(i);
      },
    );
  };

  render() {
    const { modalVisible, form, handleModalVisible, currentItem, ...props } = this.props;
    const { confirmLoading, cascader } = this.state;
    const { getFieldValue } = form;
    const isEdit = currentItem && currentItem.id;

    return (
      <Modal
        width={800}
        title={isEdit ? '编辑校区' : '新建校区'}
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
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="校区名称">
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '校区名称不能为空' }],
            initialValue: currentItem.name,
          })(<Input placeholder="请输入校区名称" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="省市区">
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
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="详细地址">
          {form.getFieldDecorator('address', {
            initialValue: currentItem.address,
            rules: [
              { required: true, message: '详细地址不能为空' },
              { max: 120, message: '不能超过120字' },
            ],
          })(<TextArea rows={4} placeholder="请输入详细地址" />)}
        </FormItem>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 12 }} label="地址经纬度">
              {form.getFieldDecorator('lonLat1', {
                initialValue: currentItem.lonLat ? currentItem.lonLat.split(',')[0] : '',
                rules: [
                  { required: false },
                ],
              })(<Input placeholder="请输入经度" type="number"/>)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem wrapperCol={{ span: 16 }}>
              {form.getFieldDecorator('lonLat2', {
                initialValue: currentItem.lonLat ? currentItem.lonLat.split(',')[1] : '',
                rules: [
                  { required: false }
                ],
              })(<Input placeholder="请输入纬度" type="number"/>)}
            </FormItem>
          </Col>
        </Row>
        <p style={{paddingLeft: '150px'}}>可通过<a href="http://www.gpsspg.com/maps.htm"  target="_blank">http://www.gpsspg.com/maps.htm</a>查询</p>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="负责人">
          {form.getFieldDecorator('personName', {
            initialValue: currentItem.personName,
          })(<Input placeholder="请输入负责人姓名" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="负责人电话">
          {form.getFieldDecorator('personMobile', {
            rules: [
              { required: false, message: '请输入负责人电话' },
              { pattern: /^1[3456789]\d{9}$/, message: '输入的手机号码格式不正确哦' },
            ],
            initialValue: currentItem.personMobile,
          })(<Input placeholder="请输入负责人电话" />)}
        </FormItem>
      </Modal>
    );
  }
}

export default FormModal;
