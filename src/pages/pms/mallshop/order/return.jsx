import React, { Component, Fragment } from 'react';
import config from '@/config';
import { PageHeader, Form, DatePicker, Row, Col, Input, Button, Divider, Tag, Select, Modal, message, Icon, Tabs, Typography } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import OrderDetail from './components/OrderDetail'
import router from 'umi/router';

const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const { Option } = Select
const { confirm } = Modal
const { TabPane } = Tabs;
const { Paragraph } = Typography;

const StatusMap = {
  0: '待商家处理',
  1: '待买家处理',
  2: '退货中',
  3: '已完成',
  4: '已拒绝',
}
const StatusColorMap = {
  0: 'orange',
  1: 'orange',
  2: 'green',
  3: 'green',
  4: 'red',
}

@Form.create()
@connect(state => ({
  returnList: state.return.returnList,
  loading: state.loading.models.return,
  loadingList: state.loading.effects['return/fetchList'],
  btnPermission: state.user.btnPermission
}))
export default class ReturnList extends Component {
  state = {
    formValues: {},
    currentItem: {},
    detailmodalVisible: false,
    orderStatus: 9,
    title: ''
  };

  getList = values => {
    const { returnList: { pageNum, pageSize } } = this.props;
    const { formValues, orderStatus } = this.state;
    if (values === null || values === undefined) {
      values = {
        ...formValues,
        orderApplyState: orderStatus,
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
    data['orderApplyState'] = orderStatus
    this.props.dispatch({
      type: 'return/fetchList',
      payload: data
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      // console.log(values);
      values.orderApplyState = 9;
      if(values.applyTime){
        values.startTime = values.applyTime[0].format('YYYY-MM-DD')
        values.endTime = values.applyTime[1].format('YYYY-MM-DD')
      }
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
      type: 'return/fetchList',
      payload: {
        orderApplyState: orderStatus,
      },
    });
  };

  handleStandardTableChange = (pagination) => {
    console.log(pagination)
    const { current, pageSize, orderStatus } = pagination
    const { formValues } = this.state
    console.log(current)
    this.getList({
      pageNum: current,
      pageSize,
      orderApplyState: orderStatus,
      ...formValues
    })
  }



  componentDidMount() {
    const { orderStatus } = this.state;
    // 初始详情数据
    this.props.dispatch({
      type: 'return/fetchList',
      payload: {
        orderApplyState: orderStatus
      }
    });
  }

  onChange = (item) => {
    this.props.dispatch({
      type: 'return/fetchList',
      payload: {
        orderApplyState: item
      },
    });
    this.setState({
      orderStatus: item
    })
  }
  renderSearchForm = () => {
    const { returnList } = this.props
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={24}>
          <Col span={4}>
            <FormItem label="">
              {getFieldDecorator('keyword', {})(
                <Input placeholder="请输入订单编号" />
              )}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem label="">
              {getFieldDecorator('applyTime')(
                <RangePicker style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem label="">
              {getFieldDecorator('type', { initialValue: '' })(
                <Select style={{ width: '100%' }} placeholder='请选择退款类型'>
                  <Option value=''>全部</Option>
                  <Option key='0'>仅退款</Option>
                  <Option key='1'>退货退款</Option>
                </Select>
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
        </Row>
      </Form>
    );
  };
  columns = () => [
    {
      title:'订单款编号',
      dataIndex: 'orderSn',
      width: 150,
      align: 'center',
    },
    {
      title: '退款编号',
      dataIndex: 'returnSn',
      width: 150,
      align: 'center',
    },
    {
      title: '退款类型',
      dataIndex: 'type',
      width: 80,
      align: 'center',
      render: item => item == 0 ? '仅退款' : '退货退款'
    },
    {
      title: '退款金额',
      dataIndex: 'returnAmount',
      width: 90,
      align: 'center',
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      width: 90,
      align: 'center',
      render: v => v && moment(v).format('YYYY/MM/DD')
    },
    {
      title: '超时时间',
      dataIndex: 'delayTime',
      width: 100,
      align: 'center',
      render: v => v && moment(v).format('YYYY/MM/DD')
    },
    {
      title: '退款状态',
      dataIndex: 'orderApplyState',
      width: 150,
      align: 'center',
      render: v => {
        return <Tag color={StatusColorMap[v]}>{StatusMap[v]}</Tag>
      }
    },
    {
      title: '操作',
      align: 'center',
      width: 140,
      render: item => {
        return (
          <InlineButton onClick={() => {
            router.push(`/pms/mallshop/order/${item.id}`)
          }}>{(item.orderApplyState == 3 || item.orderApplyState == 4) ? '查看详情' : this.props.btnPermission['203201']?'处理':''}</InlineButton>
        );
      },
    },
  ];
  render() {
    const { returnList, loadingList } = this.props;
    const { currentItem, detailmodalVisible, quickModalVisible, courseState, title, formValues } = this.state;
    return (
      <PageHeader title="退款维权列表">
        <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
        <Tabs onChange={this.onChange} defaultActiveKey="">
          <TabPane tab="全部" key="9">
            <StandardTable
              rowKey={(item, index) => index}
              data={returnList}
              columns={this.columns()}
              loading={loadingList}
              showSerialNumber={{ isShow: false }}
              expandedRowRender={(item) => <OrderDetail item={item.items} formValues={formValues}></OrderDetail>}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '0px' }}
            />
          </TabPane>
          <TabPane tab="待商家处理" key="0">
            <StandardTable
              rowKey={(item, index) => index}
              data={returnList}
              columns={this.columns()}
              loading={loadingList}
              showSerialNumber={{ isShow: false }}
              expandedRowRender={(item) => <OrderDetail item={item.items} formValues={formValues}></OrderDetail>}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '0px' }}
            />
          </TabPane>
          <TabPane tab="待买家处理" key="1">
            <StandardTable
              rowKey={(item, index) => index}
              data={returnList}
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
      </PageHeader>
    );
  }
}
