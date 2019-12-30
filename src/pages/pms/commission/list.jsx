import React, { Component } from 'react';
import cartImg from '@/assets/cart.png';
import config from '@/config';
import { PageHeader, Tag,Table, Divider, Form, message, Row, Col, DatePicker, Button, Input, Modal } from 'antd';
import { connect } from 'dva'
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment'
import IssueModal from './components/IssueModal'

const FormItem = Form.Item
const confirm = Modal.confirm;
const issueStatusMap = {
  1: '交易失败',
  2: '未完成',
};
const issueStatusColorMap = {
  2: 'green',
  1: 'red',
};

@connect(({ commission, loading }) => ({
  commissionList: commission.commissionList,
  loading: loading.models.commission,
  loadingList: loading.effects['commission/fetchList'],

}))
@Form.create()
/**
 * @author bj
 */
export default class CommissionPage extends Component {
  state = {
    formValues: {},
    issueModalVisible: false,
    currentItem: {}
  }
  handleIssue = (item = {}) => {
    this.setState({
      currentItem: item
    })
    this.handleIssueModalVisible(true);
  }
  handleIssueModalVisible = (flag = false) => {
    const { dispatch } = this.props;
    this.setState({
      issueModalVisible: !!flag
    })
  }
  handleSearch = (e) => {
    e.preventDefault()
    const { form } = this.props
    form.validateFields((err, values) => {
      if (err) return
      values.createTime = values.createTime && moment(values.createTime).format('YYYY-MM-DD');
      values.loginTime = values.loginTime && moment(values.loginTime).format('YYYY-MM-DD');
      this.setState({
        formValues: { ...values },
      })
      this.getList(values)
    })
  }
  handleFormReset = () => {
    const { form, dispatch } = this.props
    form.resetFields()
    this.setState({
      formValues: {},
    })
    dispatch({
      type: 'commission/fetchList',
      payload: {},
    })
  }
  handleStandardTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination
    const { formValues } = this.state;
    this.getList({
      ...formValues,
      pageNum: current,
      pageSize
    })
  }
  getList = (values) => {
    const { formValues } = this.state
    const { commissionList: { pageNum, pageSize } } = this.props;
    if (!values) {
      values = {
        ...formValues,
        pageNum,
        pageSize
      }
    }
    this.props.dispatch({
      type: 'commission/fetchList',
      payload: values
    })
  }
  componentDidMount() {
    this.getList(null)
  }
  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSearch} >
        <Row gutter={24}>
          <Col md={4} sm={24}>
            <FormItem>
              {getFieldDecorator('keyword')(<Input placeholder="请输入id/用户昵称/用户手机号" />)}
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
    )
  }
  renderTableColumns = () => {
    return [
      {
        title: '用户ID',
        dataIndex: 'memberId',
        align: 'center',
        width: 120
      },
      {
        title: '用户昵称',
        dataIndex: 'nickname',
        align: 'center',
        width: 120
      },
      {
        title: '用户手机号',
        dataIndex: 'phone',
        align: 'center',
        width: 120
      },
      {
        title: '待核发金额',
        dataIndex: 'issuanceAmount',
        align: 'center',
        width: 120,
      },
      {
        title: '结算区间',
        align: 'center',
        width: 120,
        render: item => {
          return item.settleStartTime && `${moment(item.settleStartTime).format('YYYY/MM/DD')}-${moment(item.settleEndTime).format('YYYY/MM/DD')}`
        }
      },
      {
        title: '结算时间',
        dataIndex: 'settleTime',
        align: 'center',
        width: 120,
        render: item => item && moment(item).format('YYYY/MM/DD HH:mm')
      },
      {
        title: '状态',
        dataIndex: 'approveStatus',
        align: 'center',
        width: 120,
        render: item => <Tag color={issueStatusColorMap[item]}>{issueStatusMap[item]}</Tag>,
      },
      {
        title: '操作',
        align: 'center',
        width: 120,
        render: item => {
          return <InlineButton onClick={() => this.handleIssue(item)}>核发</InlineButton>
        }
      }
    ]
  }
  render() {
    const { commissionList, loadingList } = this.props;
    const { issueModalVisible, currentItem } = this.state;
    return (
      <PageHeader title="佣金核发">
        <div style={{ marginTop: '20px' }}>{this.renderSearchForm()}</div>
        <p>请于每月5日之前核发上月佣金。</p>
        {<StandardTable
          rowKey="id"
          data={commissionList}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          columns={this.renderTableColumns()}
          onChange={this.handleStandardTableChange}
          style={{ marginTop: '10px' }}
        ></StandardTable>}
        <IssueModal
          modalVisible={issueModalVisible}
          currentItem={currentItem}
          handleModalVisible={this.handleIssueModalVisible}
          afterOk={() => {
            this.getList(null)
          }}
        >
        </IssueModal>
      </PageHeader>
    )
  }
}
