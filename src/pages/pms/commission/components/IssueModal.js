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
import { fetchOSSPolicy } from '@/services/oss';
import { fetchEdit } from '@/services/commission';

const RadioGroup = Radio.Group;
const { Option } = Select;
const { TextArea } = Input;

@Form.create()
class IssueModal extends Component {
  state = {
    ossData: {},
    host: '',
    currentItem: {},
    uploadLoading: false,
    confirmLoading: false,
  };

  beforeUpload = (file) => {
    return fetchOSSPolicy(file.name).then(res => {
      if (res) {
        this.setState({
          ossData: res.ossData,
          host: res.host
        })
      }
    })
  }
  handleImageChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ uploadLoading: true })
      return;
    }
    if (info.file.status === 'done') {
      let { currentItem, host, ossData } = this.state;
      currentItem = { ...currentItem, ...{ payImg: `${host}/${ossData.key}` } }
      console.log('payImg ', `${host}/${ossData.key}`)
      this.setState({ uploadLoading: false, currentItem })
    }
  }
  okHandle = (e) => {
    e.preventDefault();
    const { form, handleModalVisible, afterOk } = this.props;
    const { currentItem } = this.state
    form.validateFields((err, fieldValue) => {
      if (err) return;
      fieldValue.payImg = currentItem.payImg
      fieldValue.id = currentItem.id
      this.setState({
        confirmLoading: true
      })
      fetchEdit(fieldValue).then(res => {
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
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.currentItem !== nextProps.currentItem && nextProps.modalVisible) {
      this.setState({
        currentItem: nextProps.currentItem
      })
    }
  }
  render() {
    const { form, modalVisible, handleModalVisible, ...props } = this.props;
    const { getFieldDecorator } = form;
    const { currentItem, confirmLoading, uploadLoading, host, ossData } = this.state
    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">图片上传</div>
      </div>
    );
    return (
      <Modal
        width={800}
        title='佣金核发'
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
        <Row gutter={8}>
          <Col span={8}>
            <FormItem label="收款用户" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
              {currentItem.nickname}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="收款人电话" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
              {currentItem.phone}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="收款人账号" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              {`${currentItem.bankCardNo}(${currentItem.bankName})`}
            </FormItem>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span={8}>
            <FormItem label="应付" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
              {currentItem.issuanceAmount}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="支付截图" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('payImg', {
                rules: [{ required: true, message: '请上传图片' }],
                initialValue: currentItem.payImg
              })(
                <Upload
                  accept="image/*"
                  name="file"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={this.beforeUpload}
                  data={ossData}
                  onChange={this.handleImageChange}
                  action={host}
                >
                  {currentItem.payImg ? <img style={{ width: '100%' }} src={currentItem.payImg} alt="" /> : uploadButton}
                </Upload>
              )}

            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="核发状态" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('approveStatus', {
                rules: [{ required: true, message: '请选择' }],
                initialValue: String(currentItem.approveStatus)
              })(
                <Select style={{ width: '100%' }} placeholder="请选择交易状态">
                  <Option key="0">已完成</Option>
                  <Option key="1">交易失败</Option>
                  <Option key="2">未完成</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={13}>
            <FormItem label="备注" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
              {getFieldDecorator('remark', {
              })(
                <TextArea rows={4}></TextArea>
              )}
            </FormItem>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default IssueModal;
