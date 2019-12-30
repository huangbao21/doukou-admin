import React, { Component } from 'react';
import { PageHeader, Input, Form, Upload, Icon, Radio, Select, Button, message } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { connect } from 'dva'
import Styles from '../style.less'
import { fetchOSSPolicy } from '@/services/oss';
import { saveModule } from '@/services/mall'
@Form.create()
@connect(({ mall, loading }) => ({
  groupList: mall.groupList,
  loading: loading.models.mall
}))
export default class Variant extends Component {
  state = {
    detailArray: [],
    clearImg: false
  }
  beforeUpload = (file, index, arry) => {
    const { detailArray } = this.state;
    let tempArry = detailArray.length > 0 ? detailArray : arry;
    let item = tempArry[index];
    return fetchOSSPolicy(file.name).then(res => {
      if (res) {
        item.ossData = res.ossData;
        item.host = res.host;
        this.setState({
          detailArray: tempArry
        })
      }
    })
  }
  handleImageChange = (info, index, arry) => {
    const { detailArray } = this.state;
    let tempArry = detailArray.length > 0 ? detailArray : arry;
    let item = tempArry[index];
    if (info.file.status === 'uploading') {
      item.uploadLoading = true
      this.setState({
        detailArray: tempArry
      })
      return;
    }
    if (info.file.status === 'done') {
      item.uploadLoading = false
      item.url = `${item.host}/${item.ossData.key}`
      this.setState({
        detailArray: tempArry
      })
    }

  }
  removeImg = (arry, index) => {
    arry.splice(index, 1);
    if (arry.length == 0) {
      this.setState({ clearImg: true })
    } else {
      this.setState({ clearImg: false })
    }
    this.setState({
      detailArray: arry
    })
  }
  addImg = (arry) => {
    const { moduleItem,groupList } = this.props
    let obj = {
      groupId: groupList[0].id,
      id: arry.length,
      url: '',
      urlType: 3,
      webUrl: '',
      moduleCode: moduleItem.code
    }
    arry.push(obj);
    this.setState({
      detailArray: arry
    })
  }
  /**
* index:下标
* name:ui组件name
* value ui组件值
* arry: 数据源
*/
  handleChange = (index, name, value, arry) => {
    const { form, moduleItem, groupList } = this.props
    arry[index][name] = value
    this.setState({
      detailArray: arry
    })
  }
  saveConfig = () => {
    const { form, detail, dispatch, afterSave } = this.props
    const { detailArray, clearImg } = this.state;
    form.validateFields((err, fieldValue) => {
      if (err) return;

      let moduleList = [{
        code: fieldValue.code,
        id: fieldValue.id,
      }]
      let partList = detailArray.length > 0 ? detailArray : clearImg ? [] : detail;
      saveModule({ moduleList, partList }).then(res => {
        if (res) {
          message.success("保存成功");
          dispatch({
            type: 'mall/fetchModules',
            payload: {}
          })
          afterSave()
        }
      })
    })
  }
  render() {
    const { form: { getFieldDecorator }, moduleItem, detail, groupList, afterSave } = this.props
    const { detailArray, clearImg } = this.state;
    // 商品分组
    let groupOptions = [];
    groupOptions = groupList.map(group => {
      return (
        <Select.Option key={group.id}>{group.groupName}</Select.Option>
      )
    })

    let detailData = detailArray.length > 0 ? detailArray : clearImg ? [] : detail.slice(0);
    console.log(detailData, 'detailData');
    let content = detailData.map((item, index, oarray) => {
      const uploadButton = (
        <div>
          <Icon type={item.uploadLoading ? 'loading' : 'plus'} />
          <div className="ant-upload-text">图片上传</div>
        </div>
      );
      return (
        <div className={Styles.dashedBoard} key={item.id}>
          {oarray.length > 2 && <Icon onClick={() => { this.removeImg(detailData, index) }} type="close-circle" className={Styles.close} />}

          <FormItem required label="分组图片" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }} validateStatus={item.url ? 'success' : 'error'} help={item.url ? '' : '请上传图片'}>
            <Upload
              accept="image/*"
              name="file"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => this.beforeUpload(file, index, detailData)}
              data={item.ossData}
              onChange={(info) => this.handleImageChange(info, index, detailData)}
              action={item.host}
            >
              {item.url ? <img style={{ width: '100%' }} src={item.url} /> : uploadButton}
            </Upload>
          </FormItem>
          <FormItem required label="选择分组" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }} >
            <Select style={{ width: '100%' }} name="groupId" defaultValue={String(item.groupId || groupList[0].id)} onChange={(event) => { this.handleChange(index, 'groupId', event, detailData) }}
              showSearch
              filterOption={(input, option) => {
                return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }}>
              {groupOptions}
            </Select>
          </FormItem>

        </div>
      )
    })

    return (
      <div className={Styles.editContent}>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('id', {
            initialValue: moduleItem.id
          })(
            <Input />
          )}
        </FormItem>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('code', {
            initialValue: moduleItem.code
          })(
            <Input />
          )}
        </FormItem>
        <FormItem label="组件类型" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }}>
          {moduleItem.typeName}
        </FormItem>
        {content}
        {detailData.length < 8 && (<><Button icon="plus" type="primary" onClick={() => { this.addImg(detailData) }}>添加图片</Button> <span> (最多可添加8张)</span></>)}

        <div className={Styles.saveBtn}>
          <Button className={Styles.saveBtn} onClick={() => { afterSave() }}>取消</Button>
          <Button type="primary" onClick={() => { this.saveConfig() }}>保存</Button>
        </div>
      </div>

    )
  }
}