import React, { Component, Fragment } from 'react';
import config from '@/config';
import { PageHeader, Form, DatePicker, Row, Col, Input, Button, Divider, Tag, Select, Modal, message, Icon, Steps, Card, Pagination } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import ProductAddressModal from './components/ProductAddressModal'
import SendProductModal from './components/SendProductModal'
import router from 'umi/router';
import styles from './style.less'
import { fetchLogisticsDetail } from '@/services/product';

const FormItem = Form.Item;
const { Option } = Select
const { confirm } = Modal
const { Step } = Steps;

const StatusMap = {
  10: '待付款',
  11: '待发货',
  12: '待收货',
  13: '已完成',
  14: '已关闭',
}
const StatusColorMap = {
  10: 'orange',
  11: 'orange',
  12: 'green',
  13: 'green',
  14: 'blue',
}

@Form.create()
@connect(state => ({
  orderDetail: state.product.orderDetail,
  loadingDetail: state.loading.effects['product/fetchOrderDetail'],
  logisticsDetail: state.product.logisticsDetail,
  loading: state.loading.models.product,
}))
export default class CourseList extends Component {
  state = {
    formValues: {},
    currentItem: {},
    addressModalVisible: false,
    orderStatus: 9,
    showDetail: false,
    logistics: [],
    sendModalVisible: false
  };

  columns = () => [
    {
      title: '商品',
      width: 150,
      align: 'center',
      dataIndex: 'productName',
      render: (v, key) => {
        return <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={key.productPic} style={{ width: '50px', height: '100%' }} />
          <p>{v}</p>
        </div>
      }
    },
    {
      title: '单价',
      dataIndex: 'productPrice',
      width: 80,
      align: 'center',
    },
    {
      title: '数量',
      dataIndex: 'productQuantity',
      width: 80,
      align: 'center',
    },
    {
      title: '小计',
      width: 80,
      align: 'center',
      render: v => (v.productPrice) * (v.productQuantity)
    },
    {
      title: '状态',
      width: 100,
      align: 'center',
      render: v => <Tag color={StatusColorMap[this.props.orderDetail.omsOrder.status]}>{StatusMap[this.props.orderDetail.omsOrder.status]}</Tag>
    }
  ]

  goDetail = (item) => {
    this.setState({
      showDetail: true
    })
    if (item) {
      fetchLogisticsDetail(item).then(res => {
        if (res) {
          if (res.logisticsVOList && res.logisticsVOList.length == 0) {
            this.setState({
              logistics: [{ status: '暂无物流信息', }]
            })
          } else {
            this.setState({
              logistics: res.logisticsVOList
            })
          }

        }
      })
    } else {
      this.setState({
        logistics: [{ status: '暂无物流信息' }]
      })
    }
  }

  goCollapse = () => {
    this.setState({
      showDetail: false
    })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.orderDetail != this.props.orderDetail && nextProps.orderDetail.omsOrder && nextProps.orderDetail.omsOrder.deliverySn) {
      fetchLogisticsDetail(nextProps.orderDetail.omsOrder.deliverySn).then(res => {
        if (res) {
          if (res.logisticsVOList && res.logisticsVOList.length == 0) {
            this.setState({
              logistics: [{ status: '暂无物流信息' }]
            })
          } else {
            this.setState({
              logistics: res.logisticsVOList
            })
          }

        }
      })
    }
  }

  numberFormat = (num) => {
    if (Number(num) == 0) {
      return num + '.00'
    } else {
      return Number(num).toFixed(2)
    }
  }

  handleSendModalVisible = (flag = false) => {
    this.setState({
      sendModalVisible: !!flag,
    });
  };

  handleProductSend = (item = {}) => {
    console.log(item)
    this.setState({
      currentItem: item,
    });
    this.handleSendModalVisible(true);
  };

  handleAddressModalVisible = (flag = false) => {
    this.setState({
      addressModalVisible: !!flag,
    });
  };

  handleProductAddress = (item = {}) => {
    console.log(item)
    this.setState({
      currentItem: item,
    });
    this.handleAddressModalVisible(true);
  };

  componentWillMount() {
    const { location: { query, state } } = this.props;
    // console.log(query.id)
    if (query.id) {
      this.props.dispatch({
        type: 'product/fetchOrderDetail',
        payload: query.id,
      });
    }
  }

  render() {
    const { orderDetail, loadingDetail, logisticsDetail, location: { query, state } } = this.props;
    const { currentItem, formValues, showDetail, logistics, addressModalVisible, sendModalVisible } = this.state;
    const dataSource = {
      list: orderDetail && orderDetail.itemList || [],
      pagination: {}
    }
    return (
      <PageHeader
        title="订单详情"
        onBack={() => {
          router.goBack(-1);
          this.setState({
            logistics: []
          })
        }}>
        <div style={{ width: '90%', margin: '10px auto 20px' }}>
          {orderDetail.omsOrder ?
            <div>
              {
                orderDetail.omsOrder.status == 14 ?
                  <Card>
                    <h2>交易关闭</h2>
                    <p>下单时间：{orderDetail.omsOrder.createTime ? moment(orderDetail.omsOrder.createTime).format('YYYY/MM/DD HH:mm') : ''}</p>
                    <p>关闭原因：{orderDetail.omsOrder.closedStatus == 1 ? '手动取消订单' : orderDetail.omsOrder.closedStatus == 2 ? '超时自动取消' : orderDetail.omsOrder.closedStatus == 3 ? '退款关闭' : orderDetail.omsOrder.closedStatus == 4 ? '退换退款关闭' : orderDetail.omsOrder.closedStatus == 5 ? '退款审核中' : orderDetail.omsOrder.closedStatus == 6 ? '待评价' : ''}</p>
                    <p>关闭时间：{orderDetail.omsOrder.modifyTime ? moment(orderDetail.omsOrder.modifyTime).format('YYYY/MM/DD HH:mm') : ''}</p>
                  </Card> :
                  <Steps current={orderDetail.omsOrder.status == 11 ? 2 : orderDetail.omsOrder.status == 10 ? 1 : orderDetail.omsOrder.status == 12 ? 3 : orderDetail.omsOrder.status == 13 ? 4 : 0} size="small" style={{ margin: '20px 0' }}>
                    <Step title="创建订单" description={orderDetail.omsOrder.createTime ? moment(orderDetail.omsOrder.createTime).format('YYYY/MM/DD HH:mm') : ''} />
                    <Step title="买家付款" description={orderDetail.omsOrder.paymentTime ? moment(orderDetail.omsOrder.paymentTime).format('YYYY/MM/DD HH:mm') : ''} />
                    <Step title="商家发货" description={<span><p>{orderDetail.omsOrder.deliveryTime ? moment(orderDetail.omsOrder.deliveryTime).format('YYYY/MM/DD HH:mm') : ''}</p>{orderDetail.omsOrder.status == 11 && (orderDetail.omsOrder.refundStatus == 1 || orderDetail.omsOrder.refundStatus == 7 || orderDetail.omsOrder.refundStatus == 9) ? <Button type="primary" onClick={() => this.handleProductSend(orderDetail)}>发货</Button> : null}</span>} />
                    <Step title="交易完成" description={orderDetail.omsOrder.receiveTime ? moment(orderDetail.omsOrder.receiveTime).format('YYYY/MM/DD HH:mm') : ''} />
                  </Steps>
              }
              <Card title="订单信息" style={{ margin: '20px 0' }}>
                <div style={{ display: 'flex' }}>
                  <div>
                    <p>订单编号：{orderDetail.omsOrder.orderSn} <span style={{ marginLeft: '50px' }}>邮费信息：{orderDetail.omsOrder.freightAmount == 0 ? '包邮' : orderDetail.omsOrder.freightAmount}</span></p>
                    <Divider dashed />
                    <div style={{ display: 'flex' }}>
                      <span>收货信息：</span>
                      <span>
                        <p>{orderDetail.omsOrder.receiverProvince + orderDetail.omsOrder.receiverCity + orderDetail.omsOrder.receiverRegion + orderDetail.omsOrder.receiverDetailAddress}</p>
                        <p>{orderDetail.omsOrder.receiverName}<span style={{ marginLeft: '20px' }}>{orderDetail.omsOrder.receiverPhone}</span>{orderDetail.omsOrder.status == 10 || orderDetail.omsOrder.status == 11 ? <Icon type="edit" theme="twoTone" style={{ marginLeft: '5px' }} onClick={() => { this.handleProductAddress(orderDetail.omsOrder) }} /> : null}</p>
                      </span>
                    </div>
                    {orderDetail.omsOrder.note ? <p>买家留言：{orderDetail.omsOrder.note}</p>
                      : null}
                  </div>
                  <div style={{ display: 'flex', marginLeft: '30px' }}>
                    <div>付款信息：</div>
                    <div>
                      <p>付款人：{orderDetail.omsOrder.memberUsername}</p>
                      <p>实付金额：{orderDetail.omsOrder.payAmount.toFixed(2)}</p>
                      <p>付款方式：{orderDetail.omsOrder.payType == 1 ? '支付宝' : '微信支付'}</p>
                      {orderDetail.omsOrder.paymentTime ? <p>付款时间：{moment(orderDetail.omsOrder.paymentTime).format('YYYY-MM-DD HH:mm')}</p> : null}
                    </div>
                  </div>
                </div>
              </Card>
              <Card title="物流信息" style={{ margin: '20px 0' }}>
                <p>物流公司：{orderDetail.omsOrder.deliveryCompany}</p>
                <p>物流单号：{orderDetail.omsOrder.deliverySn}</p>
                <p>物流详情：{logistics && logistics.length > 0 ? logistics[0].status : '暂无物流信息'} <span style={{ margin: '0 20px' }}>{orderDetail.omsOrder.deliveryTime ? moment(orderDetail.omsOrder.deliveryTime).format('YYYY-MM-DD HH:mm') : ''}</span><InlineButton onClick={() => this.goDetail(orderDetail.omsOrder.deliverySn)}>查看物流详情</InlineButton></p>
                {showDetail ?
                  <div>
                    <Steps progressDot current={0} direction="vertical" size="small">
                      {logistics && logistics.length > 0 && logistics.map((m, n) => {
                        // console.log(logistics)
                        return <Step title={m.status} key={n} description={m.time ? moment(m.time).format('YYYY-MM-DD HH:mm') : ''} />
                      })
                      }
                    </Steps>
                    <div>
                      <InlineButton onClick={() => this.goCollapse()}>收起</InlineButton>
                    </div>
                  </div>
                  : null
                }
              </Card>
            </div>
            : null}
          <div>
            <StandardTable
              rowKey={(item, index) => index}
              data={dataSource}
              columns={this.columns()}
              loading={loadingDetail}
              pagination={false}
              scroll={{ x: 'max-content', y: 500 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              {orderDetail.omsOrder ?
                <div style={{ alignSelf: 'right' }}>
                  <p>商品总价：￥{this.numberFormat(orderDetail.omsOrder.totalAmount)}</p>
                  <p>运费：+￥{this.numberFormat(orderDetail.omsOrder.freightAmount)}</p>
                  <p>活动：-￥{this.numberFormat(orderDetail.omsOrder.promotionAmount)}</p>
                  <p>优惠：-￥{this.numberFormat(orderDetail.omsOrder.couponAmount)}</p>
                  {/* <p>改价：<span style={{ color: 'green' }}>￥{this.numberFormat(orderDetail.omsOrder.payAmount - orderDetail.omsOrder.totalAmount)}</span></p> */}
                  <p>应付金额：<span style={{ color: 'red' }}>￥{this.numberFormat(orderDetail.omsOrder.payAmount)}</span></p>
                </div> : null
              }
            </div>
          </div>
        </div>
        <ProductAddressModal
          modalVisible={addressModalVisible}
          handleModalVisible={this.handleAddressModalVisible}
          currentItem={currentItem}
          afterOk={() => {
            this.props.dispatch({
              type: 'product/fetchOrderDetail',
              payload: query.id,
            });
          }}
        />
        <SendProductModal
          modalVisible={sendModalVisible}
          handleModalVisible={this.handleSendModalVisible}
          currentItem={currentItem}
          afterOk={() => {
            this.props.dispatch({
              type: 'product/fetchOrderDetail',
              payload: query.id,
            });
          }}
        />
      </PageHeader>
    );
  }
}
