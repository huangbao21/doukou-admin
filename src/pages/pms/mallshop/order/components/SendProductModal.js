import React, { Component, Fragment } from 'react';
import { Form, Modal, Input, Row, Checkbox, Col, InputNumber, Tag, Button, Divider, Select } from 'antd';
import { connect } from 'dva';
import { fetchProductSend, fetchLogisticsAll } from '@/services/product';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import StandardTable from '@/components/StandardTable';
import { spawn } from 'child_process';

const FormItem = Form.Item;
const { confirm } = Modal
const { Option } = Select;

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

@connect(state => ({
  addList: state.product.addList,
  loading: state.loading.models.product,
  loadingList: state.loading.effects['product/fetchAddList'],
}))
@Form.create()
class FormModal extends Component {
  state = {
    confirmLoading: false,
    selectedRows: [],
    formValues: {},
    currentItemList: [],
    logisticsAll: []
  };
  handleCancel = e => {
    e.preventDefault();
    this.props.form.resetFields();
    this.props.handleModalVisible(false);
  };

  okHandle = e => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, afterOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.setState({
        confirmLoading: true,
      })
      fieldsValue.orderId = currentItem.orderId ? currentItem.orderId : currentItem.omsOrder.id
      fetchProductSend(fieldsValue).then(d => {
        if (d) {
          form.resetFields()
          handleModalVisible(false)
          this.setState({
            confirmLoading: false
          });
          afterOk()
        } else {
          this.setState({
            confirmLoading: false,
          });
        }
      })
    });
  };

  componentDidMount() {
    fetchLogisticsAll().then(res => {
      if (res) {
        const list = [];
        res.forEach((item, index) => {
          list.push(
            <Option key={item.type} value={item.name}>
              {item.name}
            </Option>
          );
        });
        this.setState({
          logisticsAll: list,
        });
      }
    })
  }

  columns = () => [
    {
      title: '商品',
      width: 180,
      dataIndex: 'productName',
      align: 'center',
      render: (item, key) => {
        return <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={key.productPic} style={{ width: '50px', height: '100%' }} />
          <p>{item}</p>
        </div>
      }
    },
    {
      title: '订单编号',
      dataIndex: 'productSn',
      width: 120,
      align: 'center',
    },
    {
      title: '价格',
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
    // {
    //   title: '优惠',
    //   dataIndex: 'stock',
    //   width: 80,
    //   align: 'center',
    // },
    {
      title: '小计',
      width: 80,
      align: 'center',
      render: v => v.productPrice * v.productQuantity
    },
    {
      title: '状态',
      dataIndex: 'id',
      width: 100,
      align: 'center',
      render: (v, key) => { return this.props.currentItem.status ? <Tag color={StatusColorMap[this.props.currentItem.status]}>{StatusMap[this.props.currentItem.status]}</Tag> : <Tag color={StatusColorMap[this.props.currentItem.omsOrder.status]}>{StatusMap[this.props.currentItem.omsOrder.status]}</Tag> }
    },
  ]

  render() {
    const { modalVisible, form, handleModalVisible, currentItem, loadingList, ...props } = this.props;
    const { confirmLoading, logisticsAll } = this.state;
    const dataSource = {
      list: currentItem.items ? currentItem.items : currentItem.itemList ? currentItem.itemList : []
    }
    // console.log(currentItem)
    return (
      <Modal
        width={800}
        title='订单发货'
        visible={modalVisible}
        onOk={this.okHandle}
        maskClosable={false}
        confirmLoading={confirmLoading}
        okText='发货'
        onCancel={() => {
          this.props.form.resetFields();
          handleModalVisible(false);
        }}
        bodyStyle={{
          top: '100px',
          maxHeight: '1200px',
        }}
        {...props}
      >
        <StandardTable
          rowKey={(item, index) => index}
          data={dataSource}
          columns={this.columns()}
          pagination={false}
          loading={loadingList}
          scroll={{ x: 'max-content', y: 360 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
        />
        <div style={{ display: 'flex', marginTop: '30px' }}>
          <div>收货信息：</div>
          <div>
            <p>收货人：{currentItem.receiverName ? currentItem.receiverName : currentItem.omsOrder ? currentItem.omsOrder.receiverName : ''}</p>
            <p>收货电话：{currentItem.receiverPhone ? currentItem.receiverPhone : currentItem.omsOrder ? currentItem.omsOrder.receiverPhone : ''}</p>
            <p>收货地址：{currentItem.address ? currentItem.address : currentItem.omsOrder ? currentItem.omsOrder.receiverProvince + currentItem.omsOrder.receiverCity + currentItem.omsOrder.receiverRegion + currentItem.omsOrder.receiverDetailAddress : ''}</p>
          </div>
        </div>
        <Form>
          <FormItem label="物流信息" style={{ display: 'flex' }} required>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 10 }}>
              {form.getFieldDecorator('deliveryCompany', {
                rules: [{ required: true, message: '请选择物流公司' }],
              })(<Select style={{ width: '300px' }} placeholder="请选择物流公司">{logisticsAll}</Select>)}
            </FormItem>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 10 }}>
              {form.getFieldDecorator('deliverySn', {
                rules: [{ required: true, message: `请填写快递单号` }],
              })(<Input style={{ width: '300px' }} placeholder={`请填写快递单号`} />)}
            </FormItem>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default FormModal;
