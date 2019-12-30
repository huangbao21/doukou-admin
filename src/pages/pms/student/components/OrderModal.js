import React, { Component } from 'react';
import {
  Modal, Input, Tag, Radio, Row, Card, Checkbox, Col, InputNumber, Form, Select, Tabs, DatePicker, Divider
} from 'antd';
import { connect } from 'dva';
import options from '@/utils/cities';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import OrderDetail from './OrderDetail'
import InlineButton from '@/components/InlineButton';
import FormItem from 'antd/lib/form/FormItem';
import ViewClassModal from './ViewClassModal'
import { completeClass } from '@/services/student';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const classStatusMap = {
  0: '进行中',
  1: '已结课'
}
const classStatusColorMap = {
  0: 'green',
  1: 'blue'
}
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
@connect(({ student, loading }) => ({
  orderList: student.orderList,
  productOrderList: student.productOrderList,
  loading: loading.models.student,
  loadingList: loading.effects['student/fetchOrderList'],
  loadingProductList: loading.effects['student/fetchProductOrderList'],
}))
class orderModal extends Component {
  state = {
    completeVisible: false,
    memberVisible: false,
    confirmLoading: false,
    orderCurrentItem: {},
    viewClassModalVisible: false,
    expandFlag: false
  };
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { modalVisible, currentItem } = this.props;
    if (nextProps.modalVisible != modalVisible && nextProps.modalVisible && nextProps.currentItem.id) {
      this.getList({ id: nextProps.currentItem.id });
    }
  }
  handleViewClassModalVisible = (flag = false) => {
    if (!flag) this.setState({ orderCurrentItem: {} });
    this.setState({
      viewClassModalVisible: !!flag
    })
  }
  handleStandardTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination
    const { currentItem } = this.props;
    this.getList({
      id: currentItem.id,
      pageNum: current,
      pageSize
    })
  }
  handleProductStandardTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination
    const { currentItem } = this.props;
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
    this.props.dispatch({
      type: 'student/fetchProductOrderList',
      payload: values,
    })
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
        title: '购买时间',
        dataIndex: 'paymentTime',
        align: 'center',
        width: 120,
        render: item => moment(item).format('YYYY-MM-DD')
      },
      {
        title: '状态',
        dataIndex: 'classStatus',
        align: 'center',
        width: 120,
        render: v => <Tag color={classStatusColorMap[v]}>{classStatusMap[v]}</Tag>
      },
      {
        title: '校区',
        dataIndex: 'followCampus',
        align: 'center',
        width: 120
      },
      {
        title: '操作',
        align: 'center',
        width: 150,
        render: item => {
          return (
            <>
              <InlineButton onClick={() => {
                this.setState({ viewClassModalVisible: true, orderCurrentItem: item })
              }}>查看过客单</InlineButton>
              {
                (item.classStatus == 0 && item.afterClassId!=0) && (<><Divider type="vertical" /><InlineButton onClick={() => {
                  this.setState({ completeVisible: true, orderCurrentItem: item })
                }}>结课</InlineButton></>)
              }
            </>
          )
        }
      }
    ]
  }
  renderProductTableColumns = () => {
    return [
      {
        title: '实付款',
        dataIndex: 'actualMoney',
        align: 'center',
        width: 120
      },
      {
        title: '支付方式',
        dataIndex: 'type',
        align: 'center',
        width: 120,
        render: v => {
          return v == 1 ? "支付宝" : v == 2 ? "微信支付" : ""
        }
      },
      {
        title: '订单状态',
        dataIndex: 'status',
        align: 'center',
        width: 120,
        render: v => <Tag color={StatusColorMap[v]}>{StatusMap[v]}</Tag>,
      },
      {
        title: '订单创建时间',
        dataIndex: 'createTime',
        align: 'center',
        width: 120,
        render: v => {
          return moment(v).format('YYYY/MM/DD HH:mm');
        },
      },
    ]
  }
  render() {
    const { form, modalVisible, handleModalVisible, orderList, productOrderList, loadingProductList, loadingList, currentItem, ...props } = this.props;
    const { completeVisible, viewClassModalVisible, orderCurrentItem } = this.state;
    let expandRowKeys=[];
    return (
      <Modal
        width={1000}
        title={'已购订单'}
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
        <Tabs>
          <TabPane tab="课程" key="1">
            <StandardTable
              rowKey="orderId"
              data={orderList}
              loading={loadingList}
              showSerialNumber={{ isShow: true }}
              columns={this.renderTableColumns()}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
            ></StandardTable>
          </TabPane>
          <TabPane tab="商品" key="2">
            <StandardTable
              rowKey={(record) => {
                expandRowKeys.push(record.orderId)
                return record.orderId
                }}
              data={productOrderList}
              loading={loadingProductList}
              expandedRowKeys={expandRowKeys}
              showSerialNumber={{ isShow: true }}
              expandedRowRender={(item) => <OrderDetail item={item.items} ></OrderDetail>}
              columns={this.renderProductTableColumns()}
              onChange={this.handleProductStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
            ></StandardTable>
          </TabPane>
        </Tabs>
        <Modal
          width={800}
          title={'结课'}
          visible={completeVisible}
          maskClosable={false}
          onOk={() => {
            form.validateFields((err, values) => {
              if (err) return
              values.beginTime = values.classTime[0]
              values.endTime = values.classTime[1]
              values.orderItemId = orderCurrentItem.orderItemId;
              values.memberId = currentItem.id
              values.courseId = orderCurrentItem.courseId
              return completeClass(values).then(res => {
                if (res) {
                  form.resetFields();
                  this.setState({ completeVisible: false, orderCurrentItem: {} })
                  this.getList({ id: currentItem.id });
                }
              })
            })
          }}
          onCancel={() => {
            form.resetFields();
            this.setState({ completeVisible: false })
          }}
          bodyStyle={{
            top: '100px',
            maxHeight: '1200px',
            paddingLeft: '15',
            paddingRight: '15',
          }}>
          <FormItem help={<span style={{color:'red'}}>请与学员确认真实姓名。</span>}  label="学员姓名" labelCol={{ span: 6 }} wrapperCol={{ span: 10 }}>
            {form.getFieldDecorator('memberName', { rules: [{ required: true, message: '请输入' }], initialValue: orderCurrentItem.realname||''})(
              <Input placeholder="请输入学员真实姓名" />
            )}
          </FormItem>
          <FormItem label="上课时间" labelCol={{ span: 6 }} wrapperCol={{ span: 10 }}>
            {form.getFieldDecorator('classTime', { rules: [{ required: true, message: '请选择' }], })(
              <RangePicker />
            )}
          </FormItem>
          <FormItem label="结课时间" labelCol={{ span: 6 }} wrapperCol={{ span: 10 }}>
            {form.getFieldDecorator('completeTime', { rules: [{ required: true, message: '请选择' }], })(
              <DatePicker />
            )}
          </FormItem>
        </Modal>
        <ViewClassModal
          modalVisible={viewClassModalVisible}
          currentItem={orderCurrentItem}
          studentId={currentItem.id}
          handleModalVisible={this.handleViewClassModalVisible}
        ></ViewClassModal>
      </Modal>

    );
  }
}

export default orderModal;
