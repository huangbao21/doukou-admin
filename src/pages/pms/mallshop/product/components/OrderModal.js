import React, { Component } from 'react';
import {
  Modal,
  Input,
  Radio,
  Row,
  Card,
  Checkbox,
  Col,
  InputNumber,
  Select,
  Cascader,
} from 'antd';
import { connect } from 'dva';
import options from '@/utils/cities';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';

const RadioGroup = Radio.Group;
const { Option } = Select;
const { TextArea } = Input;

@connect(({ student, loading }) => ({
  orderList: student.orderList,
  loading: loading.models.student,
  loadingList: loading.effects['student/fetchOrderList'],
}))
class orderModal extends Component {
  state = {
  };


  handleStandardTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination
    const {currentItem} = this.props;
    this.getList({
      id: currentItem.id,
      pageNum: current,
      pageSize
    })

  }
  getList = (values) => {
    this.props.dispatch({
      type: 'student/fetchOrderList',
      payload: values,
    })
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { modalVisible, currentItem } = this.props;
    if (nextProps.modalVisible != modalVisible && nextProps.modalVisible && nextProps.currentItem.id) {
      this.getList({ id: nextProps.currentItem.id});
    }
  }
  renderTableColumns = () => {
    return [
      {
        title: '购买课程',
        dataIndex: 'productName',
        align: 'center',
        width: 120
      },
      {
        title: '售价',
        dataIndex: 'price',
        align: 'center',
        width: 120
      },
      {
        title: '购买方式',
        dataIndex: 'type',
        align: 'center',
        width: 120,
        render: item=>{
          return item == 1?'支付宝':'微信'
        }
      },
      {
        title: '实际支付金额',
        dataIndex: 'actualMoney',
        align: 'center',
        width: 120
      },
      {
        title: '剩余应付金额',
        dataIndex: 'surplusMoney',
        align: 'center',
        width: 120
      },
      {
        title: '购买时间',
        dataIndex: 'paymentTime',
        align: 'center',
        width: 120,
        render: item=>moment(item).format('YYYY-MM-DD')
      },
      {
        title: '任课老师',
        dataIndex: 'followTeacher',
        align: 'center',
        width: 120
      },
    ]
  }
  render() {
    const { modalVisible, handleModalVisible, orderList, loadingList, currentItem, ...props } = this.props;
    return (
      <Modal
        width={1000}
        title={'课程订单'}
        visible={modalVisible}
        maskClosable={false}
        footer={null}
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
        <StandardTable
          rowKey="orderId"
          data={orderList}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          columns={this.renderTableColumns()}
          onChange={this.handleStandardTableChange}
        ></StandardTable>
      </Modal>
    );
  }
}

export default orderModal;
