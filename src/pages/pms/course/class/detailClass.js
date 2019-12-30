import React, { Component, Fragment } from 'react';
import config from '@/config';
import {
  PageHeader, Form, DatePicker, Table, Row, Col, Input, Button, Divider, Tag, Select, Modal, message, Icon, Tabs, InputNumber
} from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import router from 'umi/router';
import { addClass } from '@/services/class';

const FormItem = Form.Item;
const { confirm } = Modal;

@Form.create()
@connect(state => ({
  detailList: state.class.detailList,
  type: state.class.type
}))
export default class DetailClass extends Component {
  state = {
    visible: false,
    showData: [],
    currentItem: {},
    keyName: '',
    currentIndex: null
  }
  componentDidMount() {
    const { type, location: { query } } = this.props;
    if (query.id) {
      this.getList(query.type);
    }
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.detailList != nextProps.detailList) {
      this.setState({ showData: nextProps.detailList.slice(1), keyName: nextProps.detailList[0].name });
    }
  }
  getList = (type) => {
    const { location: { query } } = this.props;
    this.props.dispatch({
      type: 'class/fetchDetailList',
      payload: { id: query.id, type },
    });
  }
  handleOk = () => {
    const { form, detailList } = this.props;
    const { showData, currentIndex } = this.state;
    let tempArry = showData;
    form.validateFields((err, values) => {
      if (err) return;
      console.log(currentIndex, 'index')
      console.log(values, 'values')
      if (currentIndex == 0 || currentIndex) {
        // 编辑
        tempArry[currentIndex] = values;
        if (currentIndex + 1 != values.serialNumber) {
          tempArry.splice(currentIndex, 1);
          tempArry.splice(values.serialNumber - 1, 0, values)
        }
      } else {
        // 增加行
        tempArry.splice(values.serialNumber - 1, 0, values)
      }
      // 重新整理顺序
      tempArry.map((temp, tempIndex) => {
        return temp.serialNumber = tempIndex + 1
      })
      form.resetFields();
      this.setState({ showData: tempArry, visible: false, currentItem: {}, currentIndex: null });
    })
  }
  handleCancel = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({ visible: false, currentItem: {}, currentIndex: null })
  }
  handleAddRow = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible })
  }
  handleSave = (status) => {
    const { showData, keyName } = this.state;
    const { form, location: { query }, detailList } = this.props;
    let saveData = showData.slice(0);
    if (!keyName || saveData.length == 0) {
      message.warn('过客单名称和内容不能为空')
      return
    } else {
      if (saveData[0].level != 0) {
        if (query.id && query.page == 'edit') {
          detailList[0].name = keyName;
          saveData.unshift(detailList[0]);
        } else {

          saveData.unshift({
            level: 0,
            name: keyName,
            status: 2
          });
        }
      } else {
        saveData[0].name = keyName;
      }
    }
    if (status == 0) {
      saveData[0].status = 0
    }
    addClass(saveData).then(res => {
      if (res) {
        this.setState({ keyName: '' })
        router.goBack(-1)
      }
    })
  }
  renderInputForm = () => {
    const { detailList, form: { getFieldDecorator } } = this.props;
    const { keyName } = this.state;
    return (
      <Row gutter={8}>
        <Col span={8}>
          <FormItem required label='过客单名称' labelCol={{ span: 9 }} wrapperCol={{ span: 12 }}>
            <Input placeholder='请输入过客单名称' value={keyName} onChange={(e) => {
              this.setState({ keyName: e.target.value })
            }} />
          </FormItem>
        </Col>
      </Row>
    )
  }
  columns = (tableData) => {
    let { type, location: { query } } = this.props;
    let arry = [{
      title: '序号',
      key: 'serial',
      width: 80,
      align: 'center',
      render: (v, item, index) => {
        return index + 1;
      }
    }, {
      title: '内容名称',
      dataIndex: 'name',
      width: 150,
      align: 'center'
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      render: (item, v, index, ) => {
        return (
          <>
            <InlineButton onClick={() => {
              this.setState({
                visible: true,
                currentItem: item,
                currentIndex: index
              })
            }}>编辑</InlineButton>
            <Divider type="vertical" />
            <InlineButton type="danger" onClick={() => {
              confirm({
                title: '是否确定删除',
                onOk: () => {
                  let temp = tableData.slice(0);
                  temp.splice(index, 1);
                  this.setState({ showData: temp });
                },
              });
            }}>删除行</InlineButton>
          </>
        )
      }
    }]
    if (query.page == 'view') {
      arry.pop();
    }
    return arry;
  }
  render() {
    const { type, form, detailList, location: { query } } = this.props;
    const { visible, showData, currentItem } = this.state;

    return <PageHeader onBack={() => {
      if (query.page != 'view') {
        [

          confirm({
            title: '退出后数据将不会保存',
            onOk: () => {
              return router.goBack(-1)
            }
          })
        ]
      } else {
        router.goBack(-1)
      }
    }} title={query.page == 'edit' ? '编辑过客单' : query.page == 'view' ? '过客单详情' : '创建过客单'}>
      <div style={{ marginTop: '10px' }}>{this.renderInputForm()}</div>
      {query.page != 'view' && (
        <>
          <Button type="primary" onClick={this.handleAddRow}
          >
            加一行
      </Button>
          <Button type="primary" style={{ marginLeft: '15px' }} onClick={this.handleSave}
          >
            保存
      </Button>
          <Button type="primary" style={{ marginLeft: '15px' }} onClick={() => { this.handleSave(0) }
          }>
            保存并启用
      </Button>
        </>
      )}

      <Table
        pagination={false}
        rowKey={(item, index) => index}
        dataSource={showData}
        columns={this.columns(showData)}
        style={{ marginTop: '15px' }}
      ></Table>
      <Modal title={currentItem.serialNumber ? '编辑' : '加一行'}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <FormItem label="序号" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
          {form.getFieldDecorator('serialNumber',
            {
              rules: [{ required: true, message: '请输入' }],
              initialValue: currentItem.serialNumber ? currentItem.serialNumber : showData.length + 1
            })(
              <InputNumber min={1} />
            )}
        </FormItem>
        <FormItem label="内容名称" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
          {form.getFieldDecorator('name',
            {
              rules: [{ required: true, message: '请输入' }],
              initialValue: currentItem.name
            })(
              <Input />
            )}
        </FormItem>
      </Modal>
    </PageHeader>
  }
}