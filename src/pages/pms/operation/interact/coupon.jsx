import React, { Component } from 'react';
import cartImg from '@/assets/cart.png';
import config from '@/config';
import { PageHeader, Table, Divider, Form, message, Row, Col, Popover, DatePicker, Button, Input, Modal, Tag, Radio, Select, Spin } from 'antd';
import router from 'umi/router';
import { connect } from 'dva'
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment'
import { delCoupon, stopCoupon, fetchCouponShareCode } from '@/services/coupon'
import CouponModal from './components/CouponModal'

const FormItem = Form.Item
const confirm = Modal.confirm;
const StatusMap = {
  1: '使用中',
  0: '已失效',
  2: '停止发放',
}
const StatusColorMap = {
  1: 'green',
  2: 'orange',
  0: 'red'
}

@connect(({ coupon, loading }) => ({
  couponList: coupon.couponList,
  loading: loading.models.coupon,
  loadingList: loading.effects['coupon/fetchList'],

}))
@Form.create()
/**
 * @author bj
 */
export default class CouponPage extends Component {
  state = {
    formValues: {},
    couponModalVisible: false,
    currentItem: {},
    operateType: 'isAdd',
    shareModalVisible: false,
    relationType: 1,
    popoverVisible: false,
    shareCode: '',
    shareLoading: false
  }
  handleModal = (item = {}, type) => {
    this.setState({
      currentItem: item,
      operateType: type,
      relationType: item.relationType || this.state.relationType
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
      type: 'coupon/fetchList',
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
        return delCoupon(item.id).then(d => {
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
      title: `停止发券后，买家之前领取的优惠券，在可用时间内还能继续使用，确定停止发券?`,
      onOk: () => {
        const status = item.status == 1 ? 0 : 1
        return stopCoupon(item.id).then(data => {
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
    const { couponList: { pageNum, pageSize } } = this.props;
    if (!values) {
      values = {
        ...formValues,
        pageNum,
        pageSize
      }
    }
    this.props.dispatch({
      type: 'coupon/fetchList',
      payload: values
    })
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'product/fetchProductCategoryTreeList',
      payload: {}
    })
    this.getList(null)
  }
  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSearch} >
        <Row gutter={24}>
          <Col md={4} sm={24}>
            <FormItem>
              {getFieldDecorator('name')(<Input placeholder="请输入优惠券" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem>
              {getFieldDecorator('relationType')(
                <Select placeholder="优惠券类型">
                  <Select.Option value="">全部</Select.Option>
                  <Select.Option value={1}>课程优惠券</Select.Option>
                  <Select.Option value={2}>商品优惠券</Select.Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem>
              {getFieldDecorator('source')(
                <Select placeholder="发放渠道">
                  <Select.Option value="">全部</Select.Option>
                  <Select.Option value={1}>课程</Select.Option>
                  <Select.Option value={2}>商品</Select.Option>
                  <Select.Option value={3}>小程序</Select.Option>
                  <Select.Option value={99}>其他</Select.Option>
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
        title: '优惠券名',
        dataIndex: 'name',
        align: 'center',
        width: 120
      },
      {
        title: '优惠内容',
        dataIndex: 'amount',
        align: 'center',
        width: 150,
        render: item => `减免${item}元`
      },
      {
        title: '使用门槛',
        dataIndex: 'minPoint',
        align: 'center',
        width: 150,
        render: item => item == 0 ? '无门槛' : `订单满${item}`
      },
      {
        title: '优惠券类型',
        dataIndex: 'relationType',
        align: 'center',
        width: 150,
        render: item => {
          return item == 1 ? '课程优惠券' : '商品优惠券'
        }
      },
      {
        title: '发放渠道',
        align: 'center',
        width: 150,
        render: item => item.source == 1 ? '课程' : item.source == 2 ? '商品' : item.source == 3 ? '小程序' : '其他'
      },
      {
        title: '已使用/已领取/剩余',
        align: 'center',
        width: 150,
        render: item => <a onClick={() => { router.push(`/pms/operation/interact/history?id=${item.id}`) }}>{item.useCount}/{item.receiveCount}/{item.count}</a>
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
              {item.status == 1 && item.source == 3 && <><InlineButton onClick={() => {
                this.setState({ shareLoading: true, shareModalVisible: true })
                fetchCouponShareCode(item.id).then(res => {
                  if (res) {
                    this.setState({ shareLoading: false, shareCode: res })
                  }
                })
              }}>分享</InlineButton>
                <Divider type="vertical" /></>}
              {item.status == 1 ? <>
                <InlineButton onClick={() => { this.handleModal(item, 'isEdit') }}>编辑</InlineButton>
                <Divider type="vertical" />
                <InlineButton type="danger" onClick={() => this.handleForbidden(item)}>停止</InlineButton>
              </> : item.status == 0 ? <>
                <Divider type="vertical" />
                <InlineButton onClick={() => { this.handleModal(item, 'isView') }}>查看</InlineButton>
                <Divider type="vertical" />
                <InlineButton type='danger' onClick={() => this.handleDel(item)}>删除</InlineButton>
              </> : <InlineButton onClick={() => { this.handleModal(item, 'isView') }}>查看</InlineButton>
              }
            </>
          )
        }
      }
    ]
  }
  render() {
    const { couponList, loadingList } = this.props;
    const { couponModalVisible, currentItem, operateType, shareModalVisible, shareCode, popoverVisible, relationType } = this.state;
    return (
      <PageHeader title="优惠券">
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
              <Radio value={1}>课程优惠券</Radio>
              <Radio value={2}>商品优惠券</Radio>
            </Radio.Group>
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <InlineButton onClick={() => { this.setState({ popoverVisible: false }); this.handleModal({}, 'isAdd') }}>确定</InlineButton>
            </div>
          </>} title="优惠券类型" trigger="click" visible={popoverVisible}>
          <Button type="primary" style={{ marginBottom: '10px' }}>
            新增优惠券
        </Button>
        </Popover>
        {<StandardTable
          rowKey="id"
          data={couponList}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          columns={this.renderTableColumns()}
          onChange={this.handleStandardTableChange}
          scroll={{ x: 'max-content', y: 600 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
        ></StandardTable>}
        <CouponModal
          operateType={operateType}
          modalVisible={couponModalVisible}
          currentItem={currentItem}
          relationType={relationType}
          handleModalVisible={this.handleCouponModalVisible}
          afterOk={() => {
            this.getList(null)
          }}
        >
        </CouponModal>

        <Modal
          visible={shareModalVisible}
          width={800}
          title={'小程序分享二维码'}
          footer={null}
          maskClosable={false}
          bodyStyle={{
            textAlign: "center"
          }}
          onCancel={() => {
            this.setState({ shareCode: '', shareModalVisible: false })
          }}>
          <Spin spinning={this.state.shareLoading}>
            <img src={shareCode} />
          </Spin>
        </Modal>


      </PageHeader>
    )
  }
}
