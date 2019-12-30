import React, { Component, Fragment } from 'react';
import config from '@/config';
import { PageHeader, Tag, Form, Row, Col, Input, DatePicker, Button, Select, Divider } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import { FORM_ITEM_LAYOUT, TAIL_FORM_ITEM_LAYOUT } from '@/utils/constants';
import OrderModal from './components/OrderModal';
import RefundModal from './components/RefundModal'
import Helper from '@/utils/helper'
import API from '@/utils/api'
import { fetchOrderDownload } from '@/services/order';

const FormItem = Form.Item;
const { Option } = Select;
const RangePicker = DatePicker.RangePicker;

const moneyStatusMap = {
  3: '已结清',
  6: '未结清',
  7: '已退款'
};

const moneyStatusColorMap = {
  3: 'green',
  6: 'red',
  7: 'orange',
};

const payTypeMap = {
  1: '支付宝支付',
  2: '微信支付',
};

@Form.create()
@connect(state => ({
  orderList: state.order.orderList,
  orderDetail: state.order.orderDetail,
  loading: state.loading.models.order,
  loadingList: state.loading.effects['order/fetchList'],
  btnPermission: state.user.btnPermission
}))
export default class OrderList extends Component {
  state = {
    formValues: {},
    modalVisible: false,
    refundModalVisible: false,
    currentItem: {},
  };
  columns = () => [
    // {
    //   title: '订单编号',
    //   dataIndex: 'orderSn',
    //   width: 150,
    //   align: 'center',
    // },
    {
      title: '课程',
      dataIndex: 'productName',
      width: 150,
      align: 'center',
    },
    {
      title: '售价',
      dataIndex: 'productPrice',
      width: 100,
      align: 'center',
    },
    {
      title: '用户名',
      dataIndex: 'memberUsername',
      width: 130,
      align: 'center',
    },
    {
      title: '支付方式',
      dataIndex: 'payType',
      width: 110,
      align: 'center',
      render: v => payTypeMap[v],
    },
    {
      title: '校区',
      dataIndex: 'followCampus',
      width: 140,
      align: 'center',
    },
    {
      title: '来源',
      dataIndex: 'campusName',
      width: 100,
      align: 'center',
    },
    // {
    //   title: '待支付金额',
    //   // dataIndex: `${productPrice}-${realAmount}`,
    //   width: 100,
    //   align: 'center',
    //   render: v => {
    //     if (v.status == 6) {
    //       return `${v.realAmount}` - `${v.payAmount}`;
    //     } else {
    //       return 0
    //     }
    //   },
    // },
    // {
    //   title: '计划付款时间',
    //   dataIndex: 'paymentTime',
    //   width: 140,
    //   align: 'center',
    //   render: v => {
    //     return moment(v).format('YYYY/MM/DD HH:mm');
    //   },
    // },
    {
      title: '订单状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: v => <Tag color={moneyStatusColorMap[v]}>{moneyStatusMap[v]}</Tag>
    },
    {
      title: '操作',
      align: 'center',
      width: 180,
      render: item => {
        return (
          <Fragment>
            <Fragment>
              <InlineButton onClick={() => this.handleDetail(item)}>查看详情</InlineButton>
              {
                this.props.btnPermission['106101'] && (
                  item.status !== 7 ?
                    <Fragment>
                      <Divider type="vertical" />
                      <InlineButton onClick={() => this.handleRefund(item)}>订单退款</InlineButton>
                    </Fragment> : null
                )

              }
            </Fragment>
          </Fragment>
        );
      },
    },
  ];

  getList = values => {
    const {
      orderList: { pageNum, pageSize },
    } = this.props;
    const { formValues } = this.state;
    if (values === null || values === undefined) {
      values = {
        ...formValues,
        pageNum,
        pageSize,
      };
    }
    let data = {};
    for (let i in values) {
      if (values[i] !== '' && values[i] !== undefined && values[i] !== null) {
        data[i] = values[i];
      }
    }
    this.props.dispatch({
      type: 'order/fetchList',
      payload: data,
    });
  };

  handleStandardTableChange = (pagination) => {
    const { current, pageSize } = pagination
    const { formValues } = this.state
    this.getList({
      pageNum: current,
      pageSize,
      ...formValues
    })
  }

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      console.log(values);
      if (values.lastPaymentTime) {
        values.lastPaymentTime = values.lastPaymentTime.format('YYYY-MM-DD');
      }
      if (values.date && values.date.length > 0) {
        values.payTimeSt = values.date[0].format('YYYY-MM-DD');
        values.payTimeEn = values.date[1].format('YYYY-MM-DD');
      }
      this.setState({ formValues: values });
      this.getList(values);
    });
  };

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
      payload: item.itemId,
    });
    this.handleModalVisible(true);
  };

  handleRefundModalVisible = (flag = false) => {
    this.setState({
      refundModalVisible: !!flag,
    });
  };

  handleRefund = (item = {}) => {
    this.setState({
      currentItem: item,
    });
    this.handleRefundModalVisible(true);
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'order/fetchList',
      payload: {},
    });
  };

  exportExcel = () => {
    let values = this.props.form.getFieldsValue();
    console.log(values)
    if (values.lastPaymentTime) {
      values.lastPaymentTime = values.lastPaymentTime.format('YYYY-MM-DD');
    }
    fetchOrderDownload(values)
      .then((data) => {
        console.log(data)
        if (data) {
          Helper.download_file(data.vistUrl)
        }
      })
  }

  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem label="">
              {getFieldDecorator('keyword', {})(
                <Input
                  placeholder="请输入付款用户/手机/订单编号/课程名"
                />,
              )}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem label="">
              {getFieldDecorator('campusName', {})(
                <Input
                  placeholder="请输入校区"
                />,
              )}
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem label="">
              {getFieldDecorator('payType', {})(
                <Select placeholder="请选择支付方式" style={{ width: '100%' }}>
                  <Option value="">全部</Option>
                  <Option value="1">支付宝</Option>
                  <Option value="2">微信</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="">
              {getFieldDecorator('date', { initialValue: [] })(<RangePicker placeholder={['付款开始时间', '付款结束时间']} />)}
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem label="">
              {getFieldDecorator('status', {})(
                <Select placeholder="请选择订单状态" style={{ width: '100%' }}>
                  <Option value="">全部</Option>
                  <Option value="3">已结清</Option>
                  <Option value="6">未结清</Option>
                  <Option value="7">已退款</Option>
                </Select>,
              )}
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

  componentDidMount() {
    this.props.dispatch({
      type: 'order/fetchList',
      payload: {},
    });
  }


  render() {
    const { orderList, loadingList, orderDetail } = this.props;
    const { modalVisible, currentItem, refundModalVisible } = this.state;
    // console.log(orderList)
    return (
      <PageHeader title="订单管理">
        <div style={{ marginTop: '20px' }}>{this.renderSearchForm()}</div>
        <StandardTable
          rowKey={(item, index) => index}
          data={orderList ? orderList : {}}
          columns={this.columns()}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          onChange={this.handleStandardTableChange}
          scroll={{ x: 'max-content', y: 500 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
        />
        <OrderModal
          modalVisible={modalVisible}
          handleModalVisible={this.handleModalVisible}
          currentItem={currentItem}
          orderDetail={orderDetail}
          afterOk={() => {
            this.getList(null);
          }}
        />
        <RefundModal
          modalVisible={refundModalVisible}
          handleModalVisible={this.handleRefundModalVisible}
          currentItem={currentItem}
          afterOk={() => {
            this.getList(null);
          }}
        />
      </PageHeader>
    );
  }
}
