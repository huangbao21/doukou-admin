import React, { Component, Fragment } from 'react';
import config from '@/config';
import { PageHeader, Table, Form, Row, Col, Button, Input, Modal, message } from 'antd';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import { connect } from 'dva';
import moment from 'moment';
import { fetchCommissionConfirm } from '@/services/commission';

const FormItem = Form.Item;
const confirm = Modal.confirm;

@Form.create()
@connect(state => ({
  commissionList: state.commission.commissionList,
  loading: state.loading.models.commission,
  loadingList: state.loading.effects['commission/fetchList'],
}))
export default class commissionList extends Component {
  state = {
    formValues: {},
  };

  getList = values => {
    const { commissionList: { pageNum, pageSize } } = this.props;
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
      type: 'commission/fetchList',
      payload: data,
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      this.setState({ formValues: values });
      this.getList(values);
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'commission/fetchList',
      payload: {},
    });
  };

  handleDeleteClick = item => {
    console.log(item);
    confirm({
      title: '确定核发佣金吗?',
      onOk: () => {
        return fetchCommissionConfirm({
          id: item.id,
        })
          .then((data) => {
            if (data) {
              message.success('核发成功');
              this.getList(null);
            }
          })
      },
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

  columns = () => [
    {
      title: '用户名',
      dataIndex: 'realname',
      width: 120,
      align: 'center',
    },
    {
      title: '支付宝',
      dataIndex: 'alipayAccount',
      width: 150,
      align: 'center',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 150,
      align: 'center',
    },
    {
      title: '可提现余额',
      dataIndex: 'walletMoneyBefore',
      width: 100,
      align: 'center',
    },
    {
      title: '申请余额',
      dataIndex: 'recordMoney',
      width: 100,
      align: 'center',
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      width: 180,
      align: 'center',
      render: v => {
        return moment(v).format('YYYY/MM/DD HH:mm');
      },
    },
    {
      title: '操作',
      align: 'center',
      width: 100,
      render: item => {
        return (
          <Fragment>
            <InlineButton onClick={() => { this.handleDeleteClick(item) }}>
              核发
              </InlineButton>
          </Fragment>
        );
      },
    },
  ];
  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={20}>
          <Col span={6}>
            <FormItem label="">
              {getFieldDecorator('phone', {})(<Input placeholder="请输入用户手机号" />)}
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

  componentDidMount() {
    this.props.dispatch({
      type: 'commission/fetchList',
      payload: {},
    });
  }

  render() {
    const { commissionList, loadingList } = this.props;
    const { campusModalVisible } = this.state;
    return (
      <PageHeader title="提现核发">
        <div style={{ marginTop: '20px' }}>{this.renderSearchForm()}</div>
        <StandardTable
          rowKey={(item, index) => index}
          data={commissionList ? commissionList : {}}
          columns={this.columns()}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          onChange={this.handleStandardTableChange}
          scroll={{ x: 'max-content', y: 600 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
        />
      </PageHeader>
    );
  }
}
