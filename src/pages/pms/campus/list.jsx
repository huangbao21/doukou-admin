import React, { Component, Fragment } from 'react';
import cartImg from '@/assets/cart.png';
import config from '@/config';
import { PageHeader, Table, Divider, Form, Row, Col, DatePicker, Button, Input, Modal, message, Tag } from 'antd';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import { connect } from 'dva';
import moment from 'moment';
import { fetchCampusDelete, fetchCampusUpordown } from '@/services/campus';
import CampusModal from './components/CampusModal';

const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const confirm = Modal.confirm;
const statusSetMap = {
  0: '启用',
  1: '停用',
}

@Form.create()
@connect(state => ({
  campusList: state.campus.campusList,
  loading: state.loading.models.campus,
  btnPermission: state.user.btnPermission,
  loadingList: state.loading.effects['campus/fetchList'],
}))
export default class CampusList extends Component {
  getList = values => {
    const {
      campusList: { pageNum, pageSize },
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
      type: 'campus/fetchList',
      payload: data,
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      console.log(values);
      if (values.date && values.date.length > 0) {
        values.startDate = values.date[0].format('YYYY-MM-DD');
        values.endDate = values.date[1].format('YYYY-MM-DD');
      }
      delete values.date;
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
      type: 'campus/fetchList',
      payload: {},
    });
  };

  handleCampusModalVisible = (flag = false) => {
    this.setState({
      campusModalVisible: !!flag,
    });
  };

  handleCampus = (item = {}) => {
    console.log(item);
    this.setState({
      currentItem: item,
    });
    this.handleCampusModalVisible(true);
  };

  handleDeleteClick = item => {
    console.log(item);
    confirm({
      title: '确定删除该校区吗?',
      onOk: () => {
        return fetchCampusDelete({
          ids: item.id,
        })
          .then((data) => {
            if (data) {
              message.success('删除成功');
              this.getList(null);
            }
          })
      },
    });
  };

  handleSet = (item) => {
    confirm({
      title: `确定要${statusSetMap[item.status]}该校区吗?`,
      onOk: () => {
        const id = item.id
        const type = item.status === 1 ? 0 : 1
        fetchCampusUpordown({ id, type }).then((data) => {
          if (data) {
            message.success(`${statusSetMap[item.status]}成功`)
            this.getList(null)
          }
        })
      }
    })
  }

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
      title: '校区名',
      dataIndex: 'name',
      width: 100,
      align: 'center',
    },
    {
      title: '地址',
      width: 150,
      align: 'center',
      render: v => {
        return v.area.replace(/[\/]/g, "") + v.address
      }
    },
    {
      title: '经纬度',
      dataIndex: 'lonLat',
      width: 110,
      align: 'center',
    },
    {
      title: '负责人',
      dataIndex: 'personName',
      width: 100,
      align: 'center',
    },
    {
      title: '负责人电话',
      dataIndex: 'personMobile',
      width: 120,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: v => {
        return v == 1 ? <Tag color='green'>已启用</Tag> : <Tag color='red'>已停用</Tag>
      }
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
      width: 150,
      render: item => {
        return (
          <Fragment>
            <Fragment>
              {
                this.props.btnPermission['103102'] && <>
                  <InlineButton onClick={() => this.handleCampus(item)}>编辑</InlineButton>
                  <Divider type="vertical" />
                </>
              }
              <span>
                <InlineButton type={item.status === 1 ? 'danger' : 'success'} onClick={() => this.handleSet(item)}>{statusSetMap[item.status]}</InlineButton>
                <Divider type="vertical" />
              </span>

              {

                this.props.btnPermission['103103'] && <InlineButton type="danger" onClick={() => { this.handleDeleteClick(item) }}>
                  删除
              </InlineButton>
              }

            </Fragment>
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
          <Col span={5}>
            <FormItem label="">
              {getFieldDecorator('name', {})(<Input placeholder="请输入校区名" />)}
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
        </Row>
      </Form>
    );
  };
  componentDidMount() {
    this.props.dispatch({
      type: 'campus/fetchList',
      payload: {},
    });
  }

  state = {
    formValues: {},
    campusModalVisible: false,
    currentItem: {},
  };
  render() {
    const { campusList, loadingList, btnPermission } = this.props;
    const { campusModalVisible, currentItem } = this.state;
    return (
      <PageHeader title="校区管理">
        <div style={{ marginTop: '20px' }}>{this.renderSearchForm()}</div>
        {btnPermission['103101'] && <Button
          type="primary"
          htmlType="submit"
          onClick={this.handleCampus}
          style={{ marginTop: '20px' }}
        >
          新建校区
        </Button>}

        <StandardTable
          rowKey={(item, index) => index}
          data={campusList ? campusList : {}}
          columns={this.columns()}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          onChange={this.handleStandardTableChange}
          scroll={{ x: 'max-content', y: 600 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
        />
        <CampusModal
          modalVisible={campusModalVisible}
          handleModalVisible={this.handleCampusModalVisible}
          currentItem={currentItem}
          afterOk={() => {
            this.getList(null);
          }}
        />
      </PageHeader>
    );
  }
}
