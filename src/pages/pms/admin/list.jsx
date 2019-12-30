import React, { Component } from 'react';
import cartImg from '@/assets/cart.png';
import config from '@/config';
import { PageHeader, Tag, Table, Divider, Form, message, Row, Col, DatePicker, Button, Input, Modal, Icon } from 'antd';
import { connect } from 'dva'
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import EditModal from './components/EditModal';
import moment from 'moment'
import { fetchCampusAll } from '@/services/campus';
import { updateUser, createUser, disableUser, enableUser, delUser } from '@/services/admin';
import { fetchRolesAll } from '@/services/role';
import Styles from './style.less'

const FormItem = Form.Item
const confirm = Modal.confirm;
const statusMap = {
  0: '禁用',
  1: '启用',
  2: '已删除',
};
const statusColorMap = {
  0: 'red',
  1: 'green',
  2: '#f50'
};

@connect(({ admin, loading, user }) => ({
  adminList: admin.adminList,
  loading: loading.models.admin,
  loadingList: loading.effects['admin/fetchList'],
  btnPermission: user.btnPermission

}))
@Form.create()
/**
 * @author bj
 */
export default class AdminPage extends Component {
  state = {
    formValues: {},
    editModalVisible: false,
    currentItem: {},
    rolesMap: {},
    rolesList: [],
    campusList: [],
    adminList: {}
  }
  componentDidMount() {
    Promise.all([fetchCampusAll(), fetchRolesAll()]).then(res => {
      if (res) {
        let rolesMap = {};
        res[1].map(item => {
          rolesMap[item.id] = item.level;
        })
        this.setState({
          campusList: res[0],
          rolesList: res[1],
          rolesMap
        })
      }
    })
    this.getList(null)
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.adminList != nextProps.adminList) {
      this.setState({ adminList: nextProps.adminList })
    }
  }
  handleEdit = (item = {}) => {
    this.setState({
      currentItem: item
    })
    this.handleEditModalVisible(true);
  }
  /**
   * key:0-> 删除 1->禁用 2->启用
   */
  handleConfirm = (item, key) => {
    let fetch = key == 0 ? delUser : key == 1 ? disableUser : enableUser
    confirm({
      title: `确定要${key == 0 ? '删除' : key == 1 ? '禁用' : '启用'}吗?`,
      onOk: () => {
        return fetch({ id: item.id }).then(res => {
          if (res) {
            message.success('操作成功');
            this.getList(null);
          } else {
            message.error('操作失败')
          }
        })
      }
    })
  }
  handleEditModalVisible = (flag = false) => {
    this.setState({
      editModalVisible: !!flag
    })
  }
  handleSearch = (e) => {
    e.preventDefault()
    const { form } = this.props
    form.validateFields((err, values) => {
      if (err) return
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
      type: 'admin/fetchList',
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
    const { adminList: { pageNum, pageSize } } = this.props;
    if (!values) {
      values = {
        ...formValues,
        pageNum,
        pageSize
      }
    }
    this.props.dispatch({
      type: 'admin/fetchList',
      payload: values
    })
  }
  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSearch} >
        <Row gutter={24}>
          <Col span={6}>
            <FormItem>
              {getFieldDecorator('keyword')(<Input placeholder="请输入用户名/角色/手机号" />)}
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
        dataIndex: 'personName',
        align: 'center',
        width: 120
      },
      {
        title: '角色',
        dataIndex: 'roleName',
        align: 'center',
        width: 120
      },
      {
        title: '手机号',
        dataIndex: 'personMobile',
        align: 'center',
        width: 120,
      },
      {
        title: '校区',
        width: 120,
        align: 'center',
        render: ((item, record) => {
          let str = [];
          if (item.isShow) {
            str = item.campusNames.map((campus, index) => {
              return <p key={item.campusIds[index]}>{campus}</p>
            })
          } else {
            item.campusNames.forEach((campus, index) => {
              if (index < 3) {
                str.push(<p key={item.campusIds[index]}>{campus}</p>)
              }
            })
          }
          return <div className={Styles.rowellipsis} >{str}{item.campusNames.length > 3 ? str.length > 3 ? <Icon onClick={() => {
            item.isShow = false;
            this.setState({ adminList: this.state.adminList });
          }} type="up" /> : <Icon onClick={() => {
            item.isShow = true;
            this.setState({ adminList: this.state.adminList });
          }} type="down" /> : ''}</div>
        })
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        align: 'center',
        width: 120,
        render: item => item && moment(item).format('YYYY/MM/DD')
      },
      {
        title: '最近登录时间',
        dataIndex: 'loginTime',
        align: 'center',
        width: 120,
        render: item => moment(item).format('YYYY/MM/DD'),
      },
      {
        title: '状态',
        dataIndex: 'status',
        align: 'center',
        width: 70,
        render: item => <Tag color={statusColorMap[item]}>{statusMap[item]}</Tag>,
      },
      {
        title: '操作',
        align: 'center',
        width: 120,
        render: item => {
          return (
            <>
              {
                this.props.btnPermission['502102'] && <>
                  <InlineButton onClick={() => this.handleEdit(item)}>修改</InlineButton>
                  <Divider type="vertical" />
                </>
              }

              {this.props.btnPermission['502103'] && (
                item.status == 0 ? <InlineButton onClick={() => this.handleConfirm(item, 2)}>启用</InlineButton> : <InlineButton type="danger" onClick={() => this.handleConfirm(item, 1)}>禁用</InlineButton>
              )

              }
              {
                this.props.btnPermission['502104'] && <>
                  <Divider type="vertical" />
                  <InlineButton type="danger" onClick={() => this.handleConfirm(item, 0)}>删除</InlineButton>
                </>
              }

            </>)
        }
      }
    ]
  }
  render() {
    const { loadingList } = this.props;
    const { editModalVisible, currentItem, rolesList, campusList, rolesMap, adminList } = this.state;
    return (
      <PageHeader title="账号管理">
        <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
        {this.props.btnPermission['502101'] && <Button
          type="primary"
          onClick={this.handleEdit}
          style={{ marginTop: '0px' }}
        >
          创建账号
        </Button>}

        <StandardTable
          rowKey="id"
          data={adminList}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          columns={this.renderTableColumns()}
          onChange={this.handleStandardTableChange}
          style={{ marginTop: '10px' }}
        ></StandardTable>
        <EditModal
          rolesList={rolesList}
          campusList={campusList}
          rolesMap={rolesMap}
          modalVisible={editModalVisible}
          currentItem={currentItem}
          handleModalVisible={this.handleEditModalVisible}
          afterOk={() => {
            this.getList(null)
          }}
        >
        </EditModal>
      </PageHeader>
    )
  }
}
