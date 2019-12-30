import React, { Component } from 'react';
import cartImg from '@/assets/cart.png';
import config from '@/config';
import options from '@/utils/cities';
import { PageHeader, Table, Divider, Cascader, Select, Form, message, Row, Col, DatePicker, Button, Input, Modal, Tabs } from 'antd';
import { connect } from 'dva'
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment'
import { fetchForbidden } from '@/services/student'
import OrderModal from './components/OrderModal'
import AddStudentModal from './components/AddStudentModal'

const FormItem = Form.Item
const confirm = Modal.confirm;
const RangePicker = DatePicker.RangePicker;


@connect(({ student, loading,user }) => ({
  studentList: student.studentList,
  loading: loading.models.student,
  loadingList: loading.effects['student/fetchList'],
  btnPermission: user.btnPermission

}))
@Form.create()
/**
 * @author bj
 */
export default class StudentPage extends Component {
  state = {
    formValues: {},
    orderModalVisible: false,
    addStudentModalVisible: false,
    currentItem: {},
    moreVisible: false
  }
  handleOrder = (item = {}) => {
    this.setState({
      currentItem: item
    })
    this.handleOrderModalVisible(true);
  }
  handleOrderModalVisible = (flag = false) => {
    const { dispatch } = this.props;
    this.setState({
      orderModalVisible: !!flag
    })
  }
  handleAddStudent = () => {
    this.handleAddStudentModalVisible(true);
  }
  handleAddStudentModalVisible = (flag = false) => {
    this.setState({ addStudentModalVisible: !!flag })
  }
  handleSearch = (e) => {
    e.preventDefault()
    const { form } = this.props
    form.validateFields((err, values) => {
      if (err) return
      if (values.date && values.date.length > 0) {
        values.createTimeSt = values.date[0].format('YYYY-MM-DD');
        values.createTimeEn = values.date[1].format('YYYY-MM-DD');
      }
      if (values.loginDate && values.loginDate.length > 0) {
        values.loginTimeSt = values.loginDate[0].format('YYYY-MM-DD');
        values.loginTimeEn = values.loginDate[1].format('YYYY-MM-DD');
      }
      if (values.city) {
        values.city = values.city.join('/');
      }
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
      type: 'student/fetchList',
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
  handleForbidden = (item) => {
    confirm({
      title: `确定要${item.status == 1 ? '禁用' : '启用'}吗?`,
      onOk: () => {
        const status = item.status == 1 ? 0 : 1
        return fetchForbidden({ id: item.id, status }).then(data => {
          if (data) {
            message.success('操作成功');
            this.getList(null);
          }
        })
      }
    })
  }
  getList = (values) => {
    const { formValues } = this.state
    const { studentList: { pageNum, pageSize } } = this.props;
    if (!values) {
      values = {
        ...formValues,
        pageNum,
        pageSize
      }
    }
    this.props.dispatch({
      type: 'student/fetchList',
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
          <Col span={6}>
            <FormItem>
              {getFieldDecorator('keyword')(<Input placeholder="请输入学员姓名/手机号" />)}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem>
              {getFieldDecorator('gender')(<Select style={{ width: '100%' }} placeholder="请选择性别" >
                <Select.Option value={0}>未知</Select.Option>
                <Select.Option value={1}>男</Select.Option>
                <Select.Option value={2}>女</Select.Option>
              </Select>)}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem>
              {getFieldDecorator('city')(
                <Cascader
                  options={options}
                  placeholder="请选择城市"
                  style={{ width: '100%' }}
                ></Cascader>
              )}
            </FormItem>
          </Col>

          <Col span={4}>
            <FormItem>
              {getFieldDecorator('sourceType')(<Select style={{ width: '100%' }} placeholder="请选择来源" >
                <Select.Option value={0}>系统注册</Select.Option>
                <Select.Option value={1}>手动录入</Select.Option>
              </Select>)}
            </FormItem>
          </Col>
          <Col span={7}>
            <Row style={{ width: "100%" }}>
              <Col md={11} sm={24} >
                <FormItem>
                  {getFieldDecorator('minCount', {})(<Input placeholder="购买课程数" />)}
                </FormItem>
              </Col>
              <Col md={2} sm={24}>
                <FormItem style={{ textAlign: 'center' }}>-</FormItem>
              </Col>
              <Col md={11} sm={24} >
                <FormItem>
                  {getFieldDecorator('maxCount', {})(<Input placeholder="购买课程数" />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <FormItem label="">
              {getFieldDecorator('date', { initialValue: [] })(<RangePicker placeholder={['创建开始时间', '创建结束时间']} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="">
              {getFieldDecorator('loginDate', { initialValue: [] })(<RangePicker placeholder={['登录开始时间', '登录结束时间']} />)}
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
        title: '用户名',
        dataIndex: 'name',
        align: 'center',
        width: 90
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        align: 'center',
        width: 120
      },
      {
        title: '购买课程/商品',
        align: 'center',
        width: 80,
        render: item => {
          return <InlineButton onClick={() => { this.handleOrder(item) }}>{`${item.purchaseNumber}/${item.buyProductNumber}`}</InlineButton>
        }
      },
      {
        title: '来源',
        align: 'center',
        width: 80,
        dataIndex: 'sourceType',
        render: item => item == 0 ? '系统注册' : '手动录入'
      },
      {
        title: '操作',
        align: 'center',
        width: 100,
        render: item => {
          return (
            <>
              <InlineButton onClick={() => {
                this.setState({
                  moreVisible: true,
                  currentItem: item
                })
              }}>查看更多</InlineButton>
              {this.props.btnPermission['104101']&&<>
                <Divider type="vertical" />
                {item.status == 1 ? <InlineButton type="danger" onClick={() => this.handleForbidden(item)}>禁用</InlineButton> : <InlineButton onClick={() => this.handleForbidden(item)}>启用</InlineButton>}
              </>}
             
            </>
          )
        }
      }
    ]
  }
  render() {
    const { studentList, loadingList } = this.props;
    const { orderModalVisible, currentItem, moreVisible, addStudentModalVisible } = this.state;
    return (
      <PageHeader title="学员管理">
        <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
        <Button type="primary" onClick={this.handleAddStudent}>录入学员</Button>
        {<StandardTable
          rowKey="id"
          data={studentList}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          columns={this.renderTableColumns()}
          onChange={this.handleStandardTableChange}
          style={{ marginTop: '10px' }}
        ></StandardTable>}
        <OrderModal
          modalVisible={orderModalVisible}
          currentItem={currentItem}
          handleModalVisible={this.handleOrderModalVisible}
          afterOk={() => {
            this.getList(null)
          }}
        >
        </OrderModal>
        <AddStudentModal
          modalVisible={addStudentModalVisible}
          handleModalVisible={this.handleAddStudentModalVisible}
          afterOk={() => {
            this.getList(null)
          }}
        ></AddStudentModal>
        <Modal title={'查看更多'}
          visible={moreVisible}
          footer={<Button type="primary" onClick={() => {
            this.setState({ moreVisible: false })
          }}>知道了</Button>}

          onCancel={() => {
            this.setState({ moreVisible: false, currentItem: {} })
          }}
        >
          <FormItem label="性别" labelCol={{ span: 6 }}>{currentItem.gender == 1 ? '男' : currentItem.gender == 2 ? '女' : '未知'}</FormItem>
          <FormItem label="生日" labelCol={{ span: 6 }}>{currentItem.birthday && moment(currentItem.birthday).format('YYYY-MM-DD')}</FormItem>
          <FormItem label="城市" labelCol={{ span: 6 }}>{currentItem.city}</FormItem>
          <FormItem label="创建时间" labelCol={{ span: 6 }}>{moment(currentItem.createTime).format('YYYY/MM/DD HH:mm')}</FormItem>
          <FormItem label="最近登录时间" labelCol={{ span: 6 }}>{moment(currentItem.loginTime).format('YYYY/MM/DD HH:mm')}</FormItem>
        </Modal>
      </PageHeader>
    )
  }
}
