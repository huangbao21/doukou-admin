import React, { Component, Fragment } from 'react';
import config from '@/config';
import { PageHeader, Form, DatePicker, Row, Col, Input, Button, Divider, Tag, Select, Modal, message, Icon, Tabs, Typography } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import OrderDetail from './components/OrderDetail'
import router from 'umi/router';
import PriceModal from './components/PriceModal'
import SendProductModal from './components/SendProductModal'
import Helper from '@/utils/helper'
import { fetchOrderDownload } from '@/services/product';

const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const { Option } = Select
const { confirm } = Modal
const { TabPane } = Tabs;
const { Paragraph } = Typography;

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
  productList: state.product.productOrderList,
  loading: state.loading.models.product,
  loadingList: state.loading.effects['product/fetchOrderList'],
  btnPermission: state.user.btnPermission
}))
export default class CourseList extends Component {
  state = {
    formValues: {},
    currentItem: {},
    orderStatus: 9,
    modalVisible: false,
    sendModalVisible: false
  };

  getList = values => {
    const {
      productList: { pageNum, pageSize },
    } = this.props;
    const { formValues, orderStatus } = this.state;
    if (values === null || values === undefined) {
      values = {
        ...formValues,
        status: orderStatus,
        pageNum,
        pageSize
      };
    }
    let data = {};
    for (let i in values) {
      if (values[i] !== '' && values[i] !== undefined && values[i] !== null) {
        data[i] = values[i];
      }
    }
    data['status'] = orderStatus
    this.props.dispatch({
      type: 'product/fetchOrderList',
      payload: data
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      // console.log(values);
      if (values.date && values.date.length > 0) {
        values.createTimeStart = values.date[0].format('YYYY-MM-DD');
        values.createTimeEnd = values.date[1].format('YYYY-MM-DD');
      }
      values.status = this.state.orderStatus;
      this.setState({ formValues: values });
      this.getList(values);
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    const { formValues, orderStatus } = this.state;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'product/fetchOrderList',
      payload: {
        status: orderStatus
      },
    });
  };

  handleStandardTableChange = (pagination) => {
    // console.log(pagination)
    const { current, pageSize, orderStatus } = pagination
    const { formValues } = this.state
    // console.log(current)
    this.getList({
      pageNum: current,
      pageSize,
      status: orderStatus,
      ...formValues
    })
  }

  onChange = (item) => {
    const { formValues } = this.state;

    formValues.status = item;

    // console.log(item, '233')
    this.props.dispatch({
      type: 'product/fetchOrderList',
      payload: {
        ...formValues
      },
    });
    this.setState({
      formValues,
      orderStatus: item
    })
  }

  goDetail = (item) => {
    router.push({
      pathname: '/pms/mallshop/order/detail',
      query: {
        id: item.orderId,
      },
    });
  }

  handleModalVisible = (flag = false) => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handlePrice = (item = {}) => {
    this.setState({
      currentItem: item,
    });
    this.handleModalVisible(true);
  };

  handleSendModalVisible = (flag = false) => {
    this.setState({
      sendModalVisible: !!flag,
    });
  };

  handleProductSend = (item = {}) => {
    this.setState({
      currentItem: item,
    });
    this.handleSendModalVisible(true);
  };

  exportExcel = () => {
    let values = this.props.form.getFieldsValue();
    if (values.date && values.date.length > 0) {
      values.createTimeStart = values.date[0].format('YYYY-MM-DD');
      values.createTimeEnd = values.date[1].format('YYYY-MM-DD');
    }
    delete values.date
    values.status = this.state.orderStatus
    fetchOrderDownload(values)
      .then((data) => {
        console.log(data)
        if (data) {
          Helper.download_file(data.vistUrl)
        }
      })
  }

  componentDidMount() {
    // 初始详情数据
    this.props.dispatch({
      type: 'product/fetchOrderList',
      payload: {
        status: 9
      }
    });
  }

  renderSearchForm = () => {
    const { productList } = this.props
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={24}>
          <Col span={10}>
            <FormItem label="">
              {getFieldDecorator('keyword', {})(
                <Input placeholder="请输入订单编号/商品名/购买人/购买人电话" />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="">
              {getFieldDecorator('date', { initialValue: [] })(<RangePicker placeholder={['创建开始时间', '创建结束时间']} />)}
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
          <Col span={3}>
            <Button icon="download" type="primary" onClick={this.exportExcel}>导出</Button>
          </Col>
        </Row>
      </Form>
    );
  };
  columns = () => [
    {
      title: '订单编号',
      dataIndex: 'orderSn',
      width: 150,
      align: 'center',
    },
    {
      title: '实付款',
      dataIndex: 'payAmount',
      width: 90,
      align: 'center',
      render: (v, key) => {
        return <p style={{ marginBottom: '0' }}>{v}{key.status == 0 ? <Icon type="edit" theme="twoTone" style={{ marginLeft: '5px' }} onClick={() => { this.handlePrice(key) }} /> : null}</p>
      }
    },
    {
      title: '购买人',
      dataIndex: 'nickName',
      width: 80,
      align: 'center',
    },
    {
      title: '支付方式',
      dataIndex: 'payType',
      width: 90,
      align: 'center',
      render: v => {
        return v == 1 ? "支付宝" : v == 2 ? "微信支付" : ""
      }
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: v => <Tag color={StatusColorMap[v]}>{StatusMap[v]}</Tag>,
    },
    {
      title: '订单创建时间',
      dataIndex: 'createTime',
      width: 150,
      align: 'center',
      render: v => {
        return moment(v).format('YYYY/MM/DD HH:mm');
      },
    },
    {
      title: '操作',
      align: 'center',
      width: 140,
      render: item => {
        return (
          <Fragment>
            <InlineButton onClick={() => this.goDetail(item)}>查看详情</InlineButton>
            {this.props.btnPermission['203101'] && (item.status == 11 && (item.refundStatus == 1 || item.refundStatus == 7 || item.refundStatus == 9) ?
              <span>
                <Divider type="vertical" />
                <InlineButton type='success' onClick={() => this.handleProductSend(item)}>发货</InlineButton>
              </span> : null)
            }
          </Fragment>
        );
      },
    },
  ];
  render() {
    const { productList, loadingList } = this.props;
    const { currentItem, formValues, modalVisible, orderStatus, sendModalVisible } = this.state;
    return (
      <PageHeader title="订单列表">
        <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
        <Tabs onChange={this.onChange} defaultActiveKey="">
          <TabPane tab="所有订单" key="9">
            <StandardTable
              rowKey={(item, index) => index}
              data={productList ? productList : {}}
              columns={this.columns()}
              loading={loadingList}
              showSerialNumber={{ isShow: false }}
              expandedRowRender={(item) => <OrderDetail item={item.items} formValues={formValues}></OrderDetail>}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '0px' }}
            />
          </TabPane>
          <TabPane tab="待付款" key="10">
            <StandardTable
              rowKey={(item, index) => index}
              data={productList ? productList : {}}
              columns={this.columns()}
              loading={loadingList}
              showSerialNumber={{ isShow: false }}
              expandedRowRender={(item) => <OrderDetail item={item.items} formValues={formValues}></OrderDetail>}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '0px' }}
            />
          </TabPane>
          <TabPane tab="待发货" key="11">
            <StandardTable
              rowKey={(item, index) => index}
              data={productList ? productList : {}}
              columns={this.columns()}
              loading={loadingList}
              showSerialNumber={{ isShow: false }}
              expandedRowRender={(item) => <OrderDetail item={item.items} formValues={formValues}></OrderDetail>}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '0px' }}
            />
          </TabPane>
          <TabPane tab="待收货" key="12">
            <StandardTable
              rowKey={(item, index) => index}
              data={productList ? productList : {}}
              columns={this.columns()}
              loading={loadingList}
              showSerialNumber={{ isShow: false }}
              expandedRowRender={(item) => <OrderDetail item={item.items} formValues={formValues}></OrderDetail>}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '0px' }}
            />
          </TabPane>
          <TabPane tab="已完成" key="13">
            <StandardTable
              rowKey={(item, index) => index}
              data={productList ? productList : {}}
              columns={this.columns()}
              loading={loadingList}
              showSerialNumber={{ isShow: false }}
              expandedRowRender={(item) => <OrderDetail item={item.items} formValues={formValues}></OrderDetail>}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '0px' }}
            />
          </TabPane>
          <TabPane tab="已关闭" key="14">
            <StandardTable
              rowKey={(item, index) => index}
              data={productList ? productList : {}}
              columns={this.columns()}
              loading={loadingList}
              showSerialNumber={{ isShow: false }}
              expandedRowRender={(item) => <OrderDetail item={item.items} formValues={formValues}></OrderDetail>}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '0px' }}
            />
          </TabPane>
        </Tabs>
        <PriceModal
          modalVisible={modalVisible}
          handleModalVisible={this.handleModalVisible}
          currentItem={currentItem}
          afterOk={() => {
            this.getList({ status: orderStatus });
          }}
        />
        <SendProductModal
          modalVisible={sendModalVisible}
          handleModalVisible={this.handleSendModalVisible}
          currentItem={currentItem}
          afterOk={() => {
            this.getList({ status: orderStatus });
          }}
        />
      </PageHeader>
    );
  }
}
