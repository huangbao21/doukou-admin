import React, { Component } from 'react';
import {
  Modal,
  Row,
  Button,
  Col,
  Form,
  Divider,
  Icon,
  message
} from 'antd';
import { connect } from 'dva';
import options from '@/utils/cities';
import FormItem from 'antd/lib/form/FormItem';
import { fetchOSSPolicy } from '@/services/oss';
import { fetchEdit } from '@/services/commission';

const payTypeMap = {
  1: '支付宝',
  2: '微信',
}
const businessType = {
  0:'付款',
  2:'付款',
  4:'提现',
  5:'提现',
  6:'退款',
  7:'退款',
}

class detailModal extends Component {
  state = {
  };

  okHandle = (e) => {
    e.preventDefault();
    const { handleModalVisible } = this.props;
    handleModalVisible(false);
  }
  render() {
    const { modalVisible, handleModalVisible, currentItem, ...props } = this.props;
    return (
      <Modal
        width={800}
        title='详情'
        visible={modalVisible}
        maskClosable={false}
        footer={<Button type="primary" onClick={this.okHandle}>知道了</Button>}
        onCancel={() => {
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
        {
          <Row gutter={8}>
            <Col span={8}>
              <FormItem label={`${businessType[currentItem.businessType]}用户`} labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                {currentItem.nickname}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={`${businessType[currentItem.businessType]}人电话`} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                {currentItem.phone}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={`${businessType[currentItem.businessType]}方式`} labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                {payTypeMap[currentItem.payType]}
              </FormItem>
            </Col>
            {
              currentItem.businessType == 2&&
              <Col span={8}>
                <FormItem label='订单编号' labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                  {currentItem.orderSn}
                </FormItem>
              </Col>
            }
            {currentItem.businessType == 5 && <Col span={8}>
              <FormItem label='提现备注' labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                {payTypeMap[currentItem.msg]}
              </FormItem>
            </Col>}
            
            <Col span={23}>
              <FormItem label={`${businessType[currentItem.businessType]}流水号`} labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
                {currentItem.tradeSn}
              </FormItem>
            </Col>
          </Row>
        }
      </Modal>
    );
  }
}

export default detailModal;
