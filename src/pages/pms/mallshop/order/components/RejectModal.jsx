import React, { Component } from 'react'
import StandardTable from '@/components/StandardTable'
import { Divider, Modal, Form, Input, Upload,Icon } from 'antd'
import { updateInfo } from '@/services/return'
import { fetchOSSPolicy } from '@/services/oss'

const { TextArea } = Input;

const FormItem = Form.Item;
@Form.create()
export default class RejectModal extends Component {
  state = {
    confirmLoading: false,
    ossData: null,
    host: ''
  }

  componentDidMount() {
  }
  normFile = e => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList
  }
  beforeUpload = (file) => {
    return fetchOSSPolicy(file.name).then(res => {
      if (res) {
        file.ossData = res.ossData;
        this.setState({
          ossData: res.ossData,
          host: res.host
        })
      }
    })
  }
  handleImageChange = (info) => {
    const {host,ossData} = this.state;
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      info.fileList.map(file=>{
        if(!file.url){
          file.url = `${host}/${file.ossData.key}`
        }
      })
    }
  }
  okHandle = e => {
    e.preventDefault();
    const { form, currentId, handleModalVisible, type, afterOk } = this.props;
    form.validateFields((err, fieldValue) => {
      if (err) return;
      this.setState({
        confirmLoading: true,
      });
      fieldValue.id = currentId
      fieldValue.status = 3
      if (fieldValue.handleProofPics){
        fieldValue.handleProofPics = fieldValue.handleProofPics.map(item=>{
          return item.url;
        })
        fieldValue.handleProofPics = fieldValue.handleProofPics.join(',');
      }
      updateInfo(fieldValue).then(d => {
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
    })
  }


  render() {
    const { modalVisible, form, handleModalVisible, currentId, ...props } = this.props;
    const { confirmLoading, ossData, host } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">图片上传</div>
      </div>
    );
    return <Modal
      width={500}
      title='请填写拒绝理由'
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
      {...props}>
      <div style={{ padding: '20px' }}>
        <FormItem>
          {form.getFieldDecorator('handleNote', {
            rules: [{ required: true, message: '请输入原因' }]
          })(
            <TextArea rows={4}></TextArea>
          )}
        </FormItem>
        <FormItem label="上传凭证" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          {form.getFieldDecorator('handleProofPics', {
            valuePropName: 'fileList',
            getValueFromEvent: this.normFile,
          })(
            <Upload
              accept="image/*"
              name="file"
              multiple={true}
              listType="picture-card"
              beforeUpload={(file) => this.beforeUpload(file)}
              data={ossData}
              onChange={this.handleImageChange}
              action={host}
            >
              {form.getFieldValue('handleProofPics')&&form.getFieldValue('handleProofPics').length >= 6 ? '' : uploadButton}
            </Upload>
          )}
        </FormItem>
      </div>
    </Modal>
  }
}