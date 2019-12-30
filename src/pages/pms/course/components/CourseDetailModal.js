import React, { Component, Fragment } from 'react';
import { Form, Modal, Input, Row, Select, Col, InputNumber, Tag, Button, Divider, DatePicker } from 'antd';
import { connect } from 'dva';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import StandardTable from '@/components/StandardTable';
import { spawn } from 'child_process';

const FormItem = Form.Item;
const { confirm } = Modal
const { Option } = Select
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

const itemTypeMap = {
  0: '正常订单',
  1: '秒杀订单',
  2: '全额购买',
  3: '分期付款',
};

@connect(state => ({
  buyDetials: state.course.buyDetials,
  loading: state.loading.models.course,
  loadingList: state.loading.effects['course/fetchDetail'],
}))
@Form.create()
class FormModal extends Component {
  state = {
    confirmLoading: false,
    selectedRows: [],
    formValues: {},
    currentItemList: [],
  };
  handleCancel = e => {
    e.preventDefault();
    this.props.form.resetFields();
    this.props.handleModalVisible(false);
  };

  getList = values => {
    const { buyDetials: { pageNum, pageSize }, currentItem, productId } = this.props;
    const { formValues } = this.state;
    if (values === null || values === undefined) {
      values = {
        ...formValues,
        pageNum,
        pageSize,
        productId
      };
    }
    let data = {};
    for (let i in values) {
      if (values[i] !== '' && values[i] !== undefined && values[i] !== null) {
        data[i] = values[i];
      }
    }
    this.props.dispatch({
      type: 'course/fetchDetail',
      payload: data,
    });
  };

  handleStandardTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination
    const { currentItem, productId } = this.props;
    this.getList({
      productId,
      pageNum: current,
      pageSize
    })

  }

  columns = () => [
    {
      title: '姓名',
      dataIndex: 'memberUsername',
      width: 110,
      align: 'center',
    },
    {
      title: '用户手机号',
      dataIndex: 'memberPhone',
      width: 110,
      align: 'center',
    },
    {
      title: '购买时间',
      dataIndex: 'paymentTime',
      width: 100,
      align: 'center',
      render: v => {
        if (v) {
          return moment(v).format('YYYY/MM/DD');
        }
      },
    },
    {
      title: '购买方式',
      dataIndex: 'itemType',
      width: 100,
      align: 'center',
      render: v => itemTypeMap[v]
    },
    {
      title: '已支付金额',
      dataIndex: 'realAmount',
      width: 80,
      align: 'center',
    },
    {
      title: '待支付金额',
      width: 80,
      align: 'center',
      render: v => {
        if (v.status == 6) {
          return `${v.realAmount}` - `${v.payAmount}`;
        } else {
          return 0
        }
      },
    },
    {
      title: '校区',
      dataIndex: 'followCampus',
      width: 100,
      align: 'center',
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: v => <Tag color={moneyStatusColorMap[v]}>{moneyStatusMap[v]}</Tag>
    },
  ]

  handleSearch = e => {
    e.preventDefault();
    const { form, productId } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      values.productId = productId
      if (values.date && values.date.length > 0) {
        values.paymentTimeSt = values.date[0].format('YYYY-MM-DD');
        values.paymentTimeEn = values.date[1].format('YYYY-MM-DD');
      }
      delete values.date
      this.setState({ formValues: values });
      this.getList(values);
    });
  };

  handleFormReset = () => {
    const { form, dispatch, productId } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'course/fetchDetail',
      payload: {
        productId
      },
    });
  };

  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={48}>
          <Col span={6}>
            <FormItem label="">
              {getFieldDecorator('keyword', {})(
                <Input
                  style={{ width: '100%' }}
                  placeholder="请输入用户名/手机号/校区"
                />,
              )}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem label="">
              {getFieldDecorator('itemType', {})(
                <Select placeholder="请选择购买方式" style={{ width: '100%' }}>
                  <Option value="">全部</Option>
                  <Option value="2">全额购买</Option>
                  <Option value="3">分期付款</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="">
              {getFieldDecorator('date', { initialValue: [] })(<RangePicker placeholder={['购买开始时间', '购买结束时间']} />)}
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

  render() {
    const { modalVisible, form, handleModalVisible, currentItem, loadingList, buyDetials, productId, ...props } = this.props;
    const { confirmLoading } = this.state;
    const { getFieldValue } = form;
    // console.log(currentItem)
    return (
      <Modal
        width={1200}
        title={currentItem.courseName}
        visible={modalVisible}
        maskClosable={false}
        confirmLoading={confirmLoading}
        onCancel={() => {
          this.props.form.resetFields();
          handleModalVisible(false);
        }}
        footer={[
          <Button key="back" type="primary" onClick={this.handleCancel}>
            确定
          </Button>
        ]}
        bodyStyle={{
          top: '10px',
          maxHeight: '1200px',
          overflow: 'auto'
        }}
        {...props}
      >
        <div>{this.renderSearchForm()}</div>
        <StandardTable
          rowKey={(item, index) => index}
          data={buyDetials ? buyDetials : {}}
          columns={this.columns()}
          loading={loadingList}
          showSerialNumber={{ isShow: true, width: 60 }}
          onChange={this.handleStandardTableChange}
          scroll={{ x: 'max-content', y: 360 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
        />
      </Modal>
    );
  }
}

export default FormModal;
