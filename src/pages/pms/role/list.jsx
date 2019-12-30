import React, { Component, Fragment } from 'react';
import config from '@/config';
import { PageHeader, Form, Row, Col, Input, Button } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import PermissionModal from './components/PermissionModal';
import RoleModel from './components/RoleModal';
import moment from 'moment';


const FormItem = Form.Item;

const levelMap = {
  1: '管理员',
  10: '总部',
  25: '校区提现',
  30: '校长',
  40: '教师'
}

@Form.create()
@connect(state => ({
  roleList: state.role.roleList,
  loading: state.loading.models.role,
  loadingList: state.loading.effects['role/fetchList'],
  btnPermission: state.user.btnPermission
}))
/**
 * @author bj
 */
export default class RoleList extends Component {
  state = {
    permissionModalVisible: false,
    roleModalVisible: false,
    currentItem: {},
    formValues: {}
  }
  handleAdd = () => {
    this.handleRoleModalVisible(true)
  }
  handlePermission = (item = {}) => {
    this.setState({
      currentItem: item
    })
    this.handlePermissionModalVisible(true);
  }
  handleRoleModalVisible = (flag = false) => {
    this.setState({
      roleModalVisible: !!flag
    })
  }
  handlePermissionModalVisible = (flag = false) => {
    this.setState({
      permissionModalVisible: !!flag
    })
  }
  getList = values => {
    const {
      roleList: { pageNum, pageSize },
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
      type: 'role/fetchList',
      payload: data,
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      // console.log(values);
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
      type: 'role/fetchList',
      payload: {},
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

  componentDidMount() {
    this.props.dispatch({
      type: 'role/fetchList',
      payload: {},
    });
  }
  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label="">
              {getFieldDecorator('name', {})(
                <Input
                  style={{ width: '100%' }}
                  placeholder="请输入角色名"
                />,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem>
              <span>
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
      title: '角色名',
      dataIndex: 'name',
      width: 120,
      align: 'center',
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 120,
      align: 'center',
    },
    {
      title: '数据权限',
      dataIndex: 'level',
      width: 120,
      align: 'center',
      render: item => levelMap[item]
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 140,
      align: 'center',
      render: v => {
        return moment(v).format('YYYY/MM/DD HH:mm');
      },
    },
    {
      title: '操作',
      align: 'center',
      width: 120,
      render: item => {
        return (
          this.props.btnPermission['501102'] && <InlineButton onClick={() => this.handlePermission(item)}>编辑</InlineButton>

        );
      },
    },
  ];
  render() {
    const { roleList, loadingList } = this.props;
    const { permissionModalVisible, roleModalVisible, currentItem } = this.state;
    return (
      <PageHeader title="角色管理">
        <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
        {
          this.props.btnPermission['501101'] && <Button
            type="primary"
            onClick={() => { this.handlePermission({ id: 0 }) }}
            style={{ marginTop: '0px' }}
          >
            创建角色
        </Button>
        }

        <StandardTable
          rowKey="id"
          data={roleList}
          columns={this.columns()}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          onChange={this.handleStandardTableChange}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
        />
        <RoleModel
          modalVisible={roleModalVisible}
          handleModalVisible={this.handleRoleModalVisible}
          afterOk={() => {
            this.getList(null)
          }}
        >
        </RoleModel>
        <PermissionModal
          modalVisible={permissionModalVisible}
          currentItem={currentItem}
          handleModalVisible={this.handlePermissionModalVisible}
          afterOk={() => {
            this.getList(null)
          }}
        >
        </PermissionModal>
      </PageHeader>
    );
  }
}
