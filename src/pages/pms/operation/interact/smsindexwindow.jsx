import React, { Component } from 'react';
import cartImg from '@/assets/cart.png';
import config from '@/config';
import { PageHeader, Table, Divider, Form, message, Row, Col, Popover, DatePicker, Button, Input, Modal, Tag, Radio, Select } from 'antd';
import router from 'umi/router';
import { connect } from 'dva'
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment'
import { delCoupon, stopCoupon } from '@/services/smsindexwindow'
import IndexModal from './components/IndexModal'

const FormItem = Form.Item
const confirm = Modal.confirm;
const StatusMap = {
  1: '使用中',
  0: '已失效',
  2: '已停用',
}
const StatusColorMap = {
  1: 'green',
  2: 'orange',
  0: 'red'
}

@connect(({ smsindexwindow, loading }) => ({
  smsindexwindowList: smsindexwindow.smsindexwindowList,
  loading: loading.models.smsindexwindow,
  loadingList: loading.effects['smsindexwindow/fetchList'],

}))
@Form.create()
/**
 * @author bj
 */
export default class SmsindexwindowPage extends Component {
  state = {
    formValues: {},
    couponModalVisible: false,
    currentItem: {},
    operateType: 'isAdd',
    relationType: 1,
    popoverVisible: false
  }
  handleModal = (item = {}, type) => {
    this.setState({
      currentItem: item,
      operateType: type,
      relationType: item.type || this.state.relationType
    })
    this.handleCouponModalVisible(true);
  }
  handleCouponModalVisible = (flag = false) => {
    const { dispatch } = this.props;
    this.setState({
      couponModalVisible: !!flag
    })
    if (!flag) {
      this.setState({ relationType: 1 })
    }
  }
  handleSearch = (e) => {
    e.preventDefault()
    const { form } = this.props
    form.validateFields((err, values) => {
      if (err) return
      this.setState({
        formValues: { ...values },
      })
      this.getList(values)
    })
  }
  handleFormReset = () => {
    const { form, dispatch } = this.props
    form.resetFields()
    this.setState({
      formValues: {},
    })
    dispatch({
      type: 'smsindexwindow/fetchList',
      payload: {},
    })
  }
  handleStandardTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination
    const { formValues } = this.state;
    this.getList({
      ...formValues,
      pageNum: current,
      pageSize
    })
  }
  handleDel = (item) => {
    confirm({
      title: `确认删除该优惠券么？`,
      onOk: () => {
        return delCoupon({ id: item.id }).then(d => {
          if (d) {
            message.success('操作成功');
            this.getList(null);
          }
        })
      }
    })
  }
  handleForbidden = (item) => {
    confirm({
      title: `确定停止该活动?`,
      onOk: () => {
        const status = item.status == 1 ? 0 : 1
        return stopCoupon({ id: item.id }).then(data => {
          if (data) {
            message.success('操作成功');
            this.getList(null);
          }
        })
      }
    })
  }
  getList = (values) => {
    const { formValues } = this.state
    const { smsindexwindowList: { pageNum, pageSize } } = this.props;
    if (!values) {
      values = {
        ...formValues,
        pageNum,
        pageSize
      }
    }
    this.props.dispatch({
      type: 'smsindexwindow/fetchList',
      payload: values
    })
  }
  componentDidMount() {
    this.getList(null)
  }
  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSearch} >
        <Row gutter={24}>
          <Col md={4} sm={24}>
            <FormItem>
              {getFieldDecorator('name')(<Input placeholder="请输入弹窗名称" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem>
              {getFieldDecorator('type')(
                <Select placeholder="弹窗类型">
                  <Select.Option value="">全部</Select.Option>
                  <Select.Option value={1}>课程弹窗</Select.Option>
                  <Select.Option value={2}>商品弹窗</Select.Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem>
              {getFieldDecorator('status')(
                <Select placeholder="状态">
                  <Select.Option value="">全部</Select.Option>
                  <Select.Option value={1}>使用中</Select.Option>
                  <Select.Option value={0}>已失效</Select.Option>
                  <Select.Option value={2}>已停用</Select.Option>
                </Select>)}
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem>
              <span className="submitButtons">
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  重置
                </Button>
              </span>
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
  renderTableColumns = () => {
    return [
      {
        title: '弹窗名称',
        dataIndex: 'name',
        align: 'center',
        width: 120
      },
      {
        title: '触发条件',
        dataIndex: 'eventMatchType',
        align: 'center',
        width: 150,
        render: v => {
          return v == 0 ? `app每日打开一次` : '新用户登录'
        }
      },
      {
        title: '弹窗类型',
        dataIndex: 'type',
        align: 'center',
        width: 150,
        render: v => {
          return v == 1 ? '课程弹窗' : '商品弹窗'
        }
      },
      {
        title: '生效时间',
        width: 120,
        align: 'center',
        render: v => `${moment(v.startTime).format('YYYY/MM/DD')}-${moment(v.endTime).format('YYYY/MM/DD')}`,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        align: 'center',
        render: v => <Tag color={StatusColorMap[v]}>{StatusMap[v]}</Tag>,
      },
      {
        title: '操作',
        align: 'center',
        width: 150,
        render: item => {
          return (
            <>
              {item.status == 1 ? <>
                <InlineButton onClick={() => { this.handleModal(item, 'isEdit') }}>编辑</InlineButton>
                <Divider type="vertical" />
                <InlineButton type="danger" onClick={() => this.handleForbidden(item)}>停止</InlineButton>
              </> : <>
                  <InlineButton onClick={() => { this.handleModal(item, 'isView') }}>查看</InlineButton>
                  <Divider type="vertical" />
                  <InlineButton type='danger' onClick={() => this.handleDel(item)}>删除</InlineButton>
                </>
              }
            </>
          )
        }
      }
    ]
  }
  render() {
    const { smsindexwindowList, loadingList } = this.props;
    const { couponModalVisible, currentItem, operateType, popoverVisible, relationType } = this.state;
    return (
      <PageHeader title="首页弹窗">
        <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
        <Popover
          onVisibleChange={(visible) => {
            this.setState({ popoverVisible: visible })
          }}
          content={<>
            <Radio.Group
              onChange={(e) => {
                this.setState({ relationType: e.target.value })
              }}
              value={relationType}
            >
              <Radio value={1}>课程弹窗</Radio>
              <Radio value={2}>商品弹窗</Radio>
            </Radio.Group>
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <InlineButton onClick={() => { this.setState({ popoverVisible: false }); this.handleModal({}, 'isAdd') }}>确定</InlineButton>
            </div>

          </>} title="首页弹窗" trigger="click" visible={popoverVisible}>
          <Button type="primary" style={{ marginBottom: '10px' }}>
            新增弹窗
        </Button>
        </Popover>
        {<StandardTable
          rowKey="id"
          data={smsindexwindowList}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          columns={this.renderTableColumns()}
          onChange={this.handleStandardTableChange}
          scroll={{ x: 'max-content', y: 600 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
        ></StandardTable>}
        <IndexModal
          operateType={operateType}
          modalVisible={couponModalVisible}
          currentItem={currentItem}
          relationType={relationType}
          handleModalVisible={this.handleCouponModalVisible}
          afterOk={() => {
            this.getList(null)
          }}
        >
        </IndexModal>
      </PageHeader>
    )
  }
}
