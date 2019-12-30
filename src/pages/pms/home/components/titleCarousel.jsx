import React, { Component } from 'react';
import { PageHeader, Input, Form, Upload, Icon, Radio, Select, Button, message } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { connect } from 'dva'
import Styles from '../style.less'
import { fetchOSSPolicy } from '@/services/oss';
import { saveModule } from '@/services/courseHome'

@Form.create()
@connect(({ courseHome, loading }) => ({
  allCourse: courseHome.allCourse,
  loading: loading.models.courseHome,
  allGroup: courseHome.allGroup,
}))
export default class TitleCarousel extends Component {
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
    const { moduleItem} = this.props
    let obj = {
      courseId: '',
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
    const { form, moduleItem,allCourse,allGroup } = this.props
    arry[index][name] = value
    if (name == 'urlType') {
      //value=>1:课程 3：分组
      if (value == 1 && !arry[index].courseId) {
        arry[index].courseId = allCourse[0].id
      }
      if (value == 3 && !arry[index].groupId) {
        arry[index].groupId = allGroup[0].id
      }
    }
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
        name: fieldValue.name
      }]
      let partList = detailArray.length > 0 ? detailArray : clearImg ? [] : detail;
      saveModule({ moduleList, partList }).then(res => {
        if (res) {
          message.success("保存成功");
          dispatch({
            type: 'courseHome/fetchModules',
            payload: {}
          })
          afterSave()
        }
      })
    })
  }
  render() {
    const { form: { getFieldDecorator }, moduleItem, detail, allCourse, allGroup,afterSave } = this.props
    const { detailArray, clearImg } = this.state;
    // 课程列表
    let courseOption = [];
    courseOption = allCourse.map(course => {
      return <Select.Option key={course.id}>{course.courseName}</Select.Option>
    })
    let groupOptions = []
    groupOptions = allGroup.map(group => {
      return (
        <Select.Option key={group.id}>{group.groupName}</Select.Option>
      )
    })

    let detailData = detailArray.length > 0 ? detailArray : clearImg ? [] : detail.slice(0);
    console.log(detailData, 'detailData');
    let content = detailData.map((item, index) => {
      const uploadButton = (
        <div>
          <Icon type={item.uploadLoading ? 'loading' : 'plus'} />
          <div className="ant-upload-text">图片上传</div>
        </div>
      );
      return (
        <div className={Styles.dashedBoard} key={item.id}>
          <Icon onClick={() => { this.removeImg(detailData, index) }} type="close-circle" className={Styles.close} />
          <FormItem label="轮播图" labelCol={{ span: 5 }}></FormItem>
          <FormItem required label="图片" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }} validateStatus={item.url ? 'success' : 'error'} help={item.url ? '' : '请上传图片'}>
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
          <FormItem label="链接类型" labelCol={{ span: 5 }} >
            <Radio.Group defaultValue={item.urlType} onChange={(event) => { this.handleChange(index, event.target.name, event.target.value, detailData) }} name="urlType">
              <Radio.Button value={1}>课程</Radio.Button>
              <Radio.Button value={2}>链接</Radio.Button>
              <Radio.Button value={3}>分组</Radio.Button>
            </Radio.Group>
          </FormItem>
          {item.urlType == 1 && <FormItem required label="选择课程" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }}>
            <Select style={{ width: '100%' }} name="courseId" defaultValue={String(item.courseId||allCourse[0].id)} onChange={(event) => { this.handleChange(index, 'courseId', event, detailData) }}
              showSearch
              filterOption={(input, option) => {
                return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }}>
              {courseOption}
            </Select>
          </FormItem>}
          {item.urlType == 2 && <FormItem required label="输入链接" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }} >
            <Input name="webUrl" onChange={(event) => { this.handleChange(index, event.target.name, event.target.value, detailData) }} defaultValue={item.webUrl} />
          </FormItem>}
          {item.urlType == 3 && <FormItem required label="选择课程分组" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }}>
            <Select style={{ width: '100%' }} name="groupId" defaultValue={String(item.groupId || allGroup[0].id)} onChange={(event) => { this.handleChange(index, 'groupId', event, detailData) }}
              showSearch
              filterOption={(input, option) => {
                return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }}>
              {groupOptions}
            </Select>
          </FormItem>}

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
        <FormItem label="模块名称" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('name', {
            initialValue: moduleItem.name,
            rules: [{ required: true, message: '请输入' }]
          })(
            <Input />
          )}
        </FormItem>
        {content}
        {detailData.length < 6 && (<><Button icon="plus" type="primary" onClick={() => { this.addImg(detailData) }}>添加图片</Button> <span> (最多可添加6张)</span></>)}

        <div className={Styles.saveBtn}>
          <Button className={Styles.saveBtn} onClick={() => { afterSave() }}>取消</Button>
          <Button type="primary" onClick={() => { this.saveConfig() }}>保存</Button>
        </div>
      </div>

    )
  }
}