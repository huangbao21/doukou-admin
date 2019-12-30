import React, { Component } from 'react';
import cartImg from '@/assets/cart.png';
import config from '@/config';
import { PageHeader, Table, Divider, Form, message, Row, Col, DatePicker, Button, Input, Modal, Tag, Select } from 'antd';
import { connect } from 'dva'
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment'
import OrderModal from '../../order/components/OrderModal';
import router from 'umi/router';

const FormItem = Form.Item
const confirm = Modal.confirm;
const StatusMap = {
  0: '未使用',
  1: '已使用',
  2: '已过期',
}
const StatusColorMap = {
  1: 'green',
  2: 'red'
}

@connect(({ salecoupon, loading, order }) => ({
  historyList: salecoupon.historyList,
  loadingList: loading.effects['salecoupon/fetchHistoryList'],
  orderDetail: order.orderDetail,

}))
@Form.create()
/**
 * @author bj
 */
export default class SalecouponPage extends Component {
  state = {
    formValues: {},
    currentItem: {},
    modalVisible: false,
  }
  componentDidMount() {
    this.getList(null)
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
    const { form, dispatch, location: { query } } = this.props
    form.resetFields()
    this.setState({
      formValues: {},
    })
    dispatch({
      type: 'salecoupon/fetchHistoryList',
      payload: { smsSaleCouponId: query.id },
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
  getList = (values) => {
    const { formValues } = this.state
    const { historyList: { pageNum, pageSize }, location: { query } } = this.props;
    if (!values) {
      values = {
        ...formValues,
        pageNum,
        pageSize
      }
    }
    values.smsSaleCouponId = query.id;
    this.props.dispatch({
      type: 'salecoupon/fetchHistoryList',
      payload: values
    })
  }
  handleModalVisible = (flag = false) => {
    this.setState({
      modalVisible: !!flag,
    });
  };
  handleDetail = (item = {}) => {
    // console.log(item);
    this.setState({
      currentItem: item,
    });
    this.props.dispatch({
      type: 'order/fetchDetail',
      payload: item.omsOrderItemId,
    });
    this.handleModalVisible(true);
  };
  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSearch} >
        <Row gutter={24}>
          <Col md={8} sm={24}>
            <FormItem>
              {getFieldDecorator('keyword')(<Input placeholder="输入用户昵称/用户手机/订单" />)}
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
        title: '用户昵称',
        dataIndex: 'umsMemberNickname',
        align: 'center',
        width: 120
      },
      {
        title: '用户手机',
        dataIndex: 'umsMemberPhone',
        align: 'center',
        width: 150,
      },
      {
        title: '使用时间',
        align: 'createTime',
        width: 150,
        render: item => item && moment(item).format('YYYY-MM-DD')
      },
      {
        title: '订单详情',
        align: 'center',
        width: 180,
        render: item => {
          return (
            <>
              {item.smsSaleCouponType == 1 && (item.omsOrderId ? <InlineButton onClick={() => {
                this.handleDetail(item);
              }}>查看</InlineButton> : '--')}
              {item.smsSaleCouponType == 2 && (
                item.omsOrderId ? <InlineButton onClick={() => {
                  router.push(`/pms/mallshop/order/detail?id=${item.omsOrderId}`)
                }}>查看</InlineButton> : '--'
              )}
            </>
          )
        }
      }
    ]
  }
  render() {
    const { historyList, loadingList, orderDetail } = this.props;
    const { modalVisible, currentItem, } = this.state;
    return (
      <PageHeader title="满减优惠-已使用" onBack={() => router.go(-1)}>
        <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
        {<StandardTable
          rowKey="id"
          data={historyList}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          columns={this.renderTableColumns()}
          onChange={this.handleStandardTableChange}
          scroll={{ x: 'max-content', y: 600 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
        ></StandardTable>}
        <OrderModal
          modalVisible={modalVisible}
          handleModalVisible={this.handleModalVisible}
          currentItem={currentItem}
          orderDetail={orderDetail}
          afterOk={() => {
            this.getList(null);
          }}
        />

      </PageHeader>
    )
  }
}
