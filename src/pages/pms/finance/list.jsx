import React, { Component } from 'react';
import cartImg from '@/assets/cart.png';
import config from '@/config';
import { PageHeader, Table, Tag, Divider, Form, message, Row, Col, DatePicker, Button, Input, Select, Modal, Radio } from 'antd';
import { connect } from 'dva'
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import DetailModal from './components/detailModal'
import { fetchDetail, fetchSummarize } from '@/services/finance'
import { fetchCampusAll } from '@/services/campus'
import moment from 'moment'
import Styles from './style.less'
import WithdrawModal from './components/WithdrawModal'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm;
const { RangePicker } = DatePicker
const dealStatusMap = {
  1: '提现中',
  2: '成功',
  3: '失败',
};
const dealStatusColorMap = {
  1: 'orange',
  2: 'green',
  3: 'red',
};

@connect(({ finance, loading,user }) => ({
  currentUser: user.currentUser,
  financeList: finance.financeList,
  loading: loading.models.finance,
  loadingList: loading.effects['finance/fetchList'],

}))
@Form.create()
/**
 * @author bj
 */
export default class FinancePage extends Component {
  state = {
    formValues: {},
    detailModalVisible: false,
    withdrawModalVisible: false,
    currentItem: {},
    income: 0,
    expense: 0,
    rangeTime: [],
    radioTime: 0,
    campusList: []
  }
  handleDetail = (item = {}) => {
    fetchDetail({ businessType: item.businessType, id: item.id }).then(res => {
      if (res) {
        this.setState({
          currentItem: { ...res, ...{ businessType: item.businessType } }
        })
        this.handleDetailModalVisible(true);
      }
    })
  }
  handleWithdrawModalVisible = (flag = false) => {
    this.setState({ withdrawModalVisible: !!flag });
  }
  handleDetailModalVisible = (flag = false) => {
    const { dispatch } = this.props;
    this.setState({
      detailModalVisible: !!flag
    })
  }
  handleSearch = (e) => {
    e.preventDefault()
    const { form } = this.props
    form.validateFields((err, values) => {
      if (err) return
      values.startTime = values.rangeTime && moment(values.rangeTime[0]).format('YYYY-MM-DD');
      values.endTime = values.rangeTime && moment(values.rangeTime[1]).format('YYYY-MM-DD');
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
      type: 'finance/fetchList',
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
    const { financeList: { pageNum, pageSize } } = this.props;
    if (!values) {
      values = {
        ...formValues,
        pageNum,
        pageSize
      }
    }
    this.props.dispatch({
      type: 'finance/fetchList',
      payload: values
    })
  }
  timeChange = (e) => {
    let startTime, endTime;
    if (Array.isArray(e)) {
      this.setState({
        radioTime: -1,
        rangeTime: e
      })
      startTime = e[0].format("YYYY-MM-DD");
      endTime = e[1].format("YYYY-MM-DD");
    } else {
      let diff = e.target.value;
      this.setState({
        radioTime: diff,
        rangeTime: []
      })
      if (diff === 1) {
        startTime = moment().format('YYYY-MM-DD');
        endTime = moment().format('YYYY-MM-DD');
      } else if (diff) {
        endTime = moment().subtract(1, 'days').format('YYYY-MM-DD');
        startTime = moment().subtract(diff, 'days').format('YYYY-MM-DD');
      }
    }
    fetchSummarize({ startTime, endTime }).then(res => {
      if (res) {
        this.setState({
          income: res.income,
          expense: res.expense
        })
      }
    })

  }
  componentDidMount() {
    fetchCampusAll().then(res => {
      this.setState({ campusList: res })
    })
    fetchSummarize().then(res => {
      if (res) {
        this.setState({
          income: res.income,
          expense: res.expense
        })
      }
    })
    this.getList(null)
  }
  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form
    const { campusList } = this.state;
    let options = [];
    options = campusList.map(campus => {
      return <Option value={campus.id} key={campus.id}>{campus.name}</Option>
    })
    return (
      <Form onSubmit={this.handleSearch} >
        <Row gutter={24}>
          <Col md={4} sm={24}>
            <FormItem>
              {getFieldDecorator('payType')(
                <Select placeholder="请选择平台账户" >
                  <Option key="1">支付宝</Option>
                  <Option key="2">微信</Option>
                </Select>)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem>
              {getFieldDecorator('businessType')(
                <Select placeholder="请选择交易类型" >
                  <Option key="0">商品售卖</Option>
                  <Option key="2">课程售卖</Option>
                  <Option key="4">佣金提现</Option>
                  <Option key="5">校区提现</Option>
                  <Option key="6">课程退款</Option>
                  <Option key="7">商品退款</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem>
              {getFieldDecorator('campusId')(
                <Select placeholder="请选择校区"
                  showSearch
                  filterOption={(input, option) => {
                    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }}>
                  {options}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem>
              {getFieldDecorator('businessStatus')(
                <Select placeholder='交易状态' >
                  <Option key="1">提现中</Option>
                  <Option key="2">成功</Option>
                  <Option key="3">失败</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem>
              {getFieldDecorator('rangeTime')(<RangePicker />)}
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
        title: '交易时间',
        dataIndex: 'createTime',
        align: 'center',
        width: 120,
        render: item => item && moment(item).format('YYYY/MM/DD')
      },
      {
        title: '平台账户',
        dataIndex: 'payType',
        align: 'center',
        width: 120,
        render: item => item == 1 ? '支付宝' : item == 2 ? '微信' : '对公账户'
      },
      {
        title: '收入',
        align: 'center',
        dataIndex: 'income',
        width: 120,
        render: item => {
          return item ? <span style={{ color: '#f5222d' }}>{`+${item}`}</span> : '--'
        }
      },
      {
        title: '支出',
        align: 'center',
        dataIndex: 'expense',
        width: 120,
        render: item => {
          return item ? <span style={{ color: '#52c41a' }}>{`-${item}`}</span> : '--'
        }
      },
      {
        title: '校区',
        dataIndex: 'campusName',
        width: 100,
        align: 'center',
      },
      {
        title: '交易类型',
        dataIndex: 'businessType',
        align: 'center',
        width: 120,
        render: item => item == 0 ? '商品售卖' : item == 2 ? '课程售卖' : item == 4 ? '佣金提现' : item == 5 ? '校区提现' : item == 6 ? '课程退款' : item == 7 ? '商品退款' : '未知类型'
      },
      {
        title: '交易状态',
        dataIndex: 'businessStatus',
        align: 'center',
        width: 120,
        render: item => <Tag color={dealStatusColorMap[item]}>{dealStatusMap[item]}</Tag>,
      },
      {
        title: '操作',
        align: 'center',
        width: 120,
        render: item => {
          return <InlineButton onClick={() => this.handleDetail(item)}>详情</InlineButton>
        }
      }
    ]
  }
  render() {
    const { financeList, loadingList, currentUser } = this.props;
    // console.log(this.props)
    const { detailModalVisible, currentItem, income, expense, radioTime, rangeTime, withdrawModalVisible } = this.state;
    return (
      <PageHeader title="财务概况">

        <Radio.Group onChange={this.timeChange} style={{ marginLeft: '20px' }} defaultValue={0} value={radioTime}>
          <Radio.Button value={1}>今日</Radio.Button>
          <Radio.Button value={7}>7日</Radio.Button>
          <Radio.Button value={30}>30日</Radio.Button>
          <Radio.Button value={0}>全部</Radio.Button>
        </Radio.Group>
        <RangePicker onChange={this.timeChange} style={{ marginLeft: '10px' }} value={rangeTime} />
        <div className={Styles.overview}>
          <div className={Styles.box}>
            <p>账户收入</p>
            <p className={Styles.value} style={{ color: '#f5222d' }}>{income}</p>
          </div>
          <div className={Styles.box}>
            <p>账户支出</p>
            <p className={Styles.value} style={{ color: '#52c41a' }}>{expense}</p>
          </div>
        </div>
        <Divider />
        <h3 style={{ fontWeight: 'bold' }}>收支明细</h3>
        <div style={{ marginTop: '20px' }}>{this.renderSearchForm()}</div>
        <div className={Styles.overview}>
          <div className={Styles.box}>
            <p>收入合计</p>
            <p className={Styles.value} style={{ color: '#f5222d' }}>{financeList.income}</p>
          </div>
          <div className={Styles.box}>
            <p>支出合计</p>
            <p className={Styles.value} style={{ color: '#52c41a' }}>{financeList.expense}</p>
          </div>
        </div>
        {
          currentUser.roleLevel == 25 && <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={() => { this.handleWithdrawModalVisible(true) }}>提现</Button>
          </div>
        }
        
        {<StandardTable
          rowKey={(item, index) => index}
          data={financeList}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          columns={this.renderTableColumns()}
          onChange={this.handleStandardTableChange}
          style={{ marginTop: '15px' }}
        ></StandardTable>}
        <DetailModal
          modalVisible={detailModalVisible}
          currentItem={currentItem}
          handleModalVisible={this.handleDetailModalVisible}
          afterOk={() => {
            this.getList(null)
          }}
        >
        </DetailModal>
        <WithdrawModal
          modalVisible={withdrawModalVisible}
          handleModalVisible={this.handleWithdrawModalVisible}
          afterOk={()=>{
            this.getList(null)
          }}
        ></WithdrawModal>
      </PageHeader>
    )
  }
}
