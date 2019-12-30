import React, { Component } from 'react';
import { Form, Modal, Input, Row, Checkbox, Col, Spin, InputNumber, Select, Button, Divider } from 'antd';
import { connect } from 'dva';
import { fetchCampusAdd, fetchCampusEdit } from '@/services/campus';
import moment from 'moment';
import StandardTable from '@/components/StandardTable';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

@connect(state => ({
  loading: state.loading.effects['order/fetchDetail'],
}))
@Form.create()
class FormModal extends Component {
  state = {
    confirmLoading: false,
  };

  columns = () => [{
    title: '订单编号',
    dataIndex: 'orderSn',
    width: 100,
    align: 'center',
  },
  {
    title: '课程',
    dataIndex: 'productName',
    width: 100,
    align: 'center',
  },
  {
    title: '售价',
    dataIndex: 'productPrice',
    width: 80,
    align: 'center',
  }]

  handleCancel = e => {
    e.preventDefault();
    this.props.form.resetFields();
    this.props.handleModalVisible(false);
  };

  numberFormat = (num) => {
    if (Number(num) == 0) {
      return num + '.00'
    } else {
      return Number(num).toFixed(2)
    }
  }

  render() {
    const { modalVisible, form, handleModalVisible, currentItem, orderDetail, loading, ...props } = this.props;
    const { confirmLoading, cascader } = this.state;
    const { getFieldValue } = form;
    const list = {
      list: orderDetail.linkOrderList,
    }

    return (
      <Modal
        width={800}
        title={'查看更多'}
        visible={modalVisible}
        maskClosable={false}
        confirmLoading={confirmLoading}
        onCancel={this.handleCancel}
        footer={[
          <Button key="back" type="primary" onClick={this.handleCancel}>
            知道了
          </Button>
        ]}
        bodyStyle={{
          top: '100px',
          maxHeight: '1200px',
          paddingLeft: '0',
          paddingRight: '0',
        }}
        {...props}
      >
        <Spin spinning={this.props.loading}>
          <div style={{ padding: '0 20px' }}>
            <div>
              <p style={{ marginBottom: '10px' }}>用户名:{orderDetail.memberUsername} <span style={{ marginLeft: '20px' }}>手机号: {orderDetail.memberPhone}</span><span style={{ marginLeft: '20px' }}>购买方式:{orderDetail.itemType == 3 ? '付定金' : '全款付'}</span></p>
              <p>{orderDetail.note ? `购买留言: ${orderDetail.note}` : ""}</p>
              <p> 订单编号: {orderDetail.amorizes && orderDetail.amorizes[0].orderSn} <span style={{ marginLeft: '20px' }}> 订单创建时间: {moment(orderDetail.orderCreateTime).format('YYYY/MM/DD HH:mm')}</span></p>
              {orderDetail.itemType == 2 && orderDetail.amorizes && orderDetail.amorizes[0] ? <span><p style={{ marginBottom: '10px' }}>付款方式:{orderDetail.amorizes[0].payType == 1 ? '支付宝' : '微信支付'}</p><p style={{ marginBottom: '10px' }}>支付流水号:{orderDetail.amorizes[0].paymentSn}<span style={{ marginLeft: '20px' }}>支付时间: {orderDetail.amorizes[0].paymentTime && moment(orderDetail.amorizes[0].paymentTime).format('YYYY/MM/DD HH:mm')}</span></p>
              </span> : null}
            </div>
            <Divider />
            {
              orderDetail && orderDetail.itemType == 3 && orderDetail.amorizes && orderDetail.amorizes.map((item, index) => {
                // console.log(item, index)
                return (
                  <div key={index}>
                    {item.status == 3 ?
                      <div>
                        <p style={{ color: '#1890FF' }}>{index == 0 ? '定金' : '尾款'}</p>
                        <p style={{ marginBottom: '10px' }}>付款方式:{item.payType == 1 ? '支付宝' : '微信支付'}<span style={{ marginLeft: '20px' }}>支付流水号:{item.paymentSn}</span></p>
                        <p style={{ marginBottom: '10px' }}>支付金额:{item.payAmount.toFixed(2)} <span style={{ marginLeft: '20px' }}>支付时间: {moment(item.paymentTime).format('YYYY/MM/DD HH:mm')}</span></p>
                        <Divider />
                      </div> : <div>
                        <p style={{ color: '#1890FF' }}>{index == 0 ? '定金' : '尾款'}<span style={{ marginLeft: '20px', color: 'red' }}>待支付</span></p>
                        <p style={{ marginBottom: '10px' }}>待支付金额:{(item.totalAmount - item.payAmount).toFixed(2)} <span style={{ marginLeft: '20px' }}>计划付款时间: {moment(item.lastPaymentTime).format('YYYY/MM/DD HH:mm')}</span></p>
                        <Divider />
                      </div>
                    }
                  </div>
                )
              })
            }
            {orderDetail.status == 7 ?
              <div>
                <p style={{ color: '#1890FF' }}>订单状态</p>
                {/* {orderDetail.status == 3 ?
                <p>已结清</p> :
                orderDetail.status == 6 ?
                  <p>未结清</p> : */}

                <p>已退款<span style={{ marginLeft: '20px' }}>退款金额:{orderDetail.refundAmount.toFixed(2)}</span><span style={{ marginLeft: '20px' }}>退款备注:{orderDetail.refundRemark ? orderDetail.refundRemark : '无'}</span></p>
                <Divider />
              </div> : null
            }
            <div>
              <p style={{ color: '#1890FF' }}>关联订单</p>
              <StandardTable
                rowKey={(item, index) => index}
                data={list}
                pagination={false}
                columns={this.columns()}
                loading={loading}
                scroll={{ x: 'max-content', y: 500 }}
                style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
              />
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <p>商品总价：￥{this.numberFormat(orderDetail.allAmount)}</p>
                <p>活动：-￥{this.numberFormat(orderDetail.promotionAmount)}</p>
                <p>优惠：-￥{this.numberFormat(orderDetail.couponAmount)}</p>
                <p>实际支付：<span style={{ color: 'red' }}>￥{this.numberFormat(orderDetail.payAllAmount)}</span></p>
              </div>
            </div>
          </div>
        </Spin>
      </Modal>
    );
  }
}

export default FormModal;
