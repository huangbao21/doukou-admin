import React, { Component, Fragment } from 'react';
import { parse, stringify } from 'qs';
import { PageHeader, Form, DatePicker, Row, Col, Input, Button, Divider, Typography, Icon } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import Styles from './style.less';
import router from 'umi/router';
import TeacherModal from './components/TeacherModal'


const FormItem = Form.Item;
const { Paragraph } = Typography;
const RangePicker = DatePicker.RangePicker;

@Form.create()
@connect(state => ({
  teacherList: state.teacher.teacherList,
  loading: state.loading.models.teacher,
  loadingList: state.loading.effects['teacher/fetchList'],
  btnPermission: state.user.btnPermission,
}))
export default class TeacherList extends Component {
  state = {
    formValues: {},
    currentItem: {},
    teacherList: {},
    modalVisible: false
  }

  handleTeacherDetail = (item) => {
    router.push({
      pathname: '/pms/teacher/detail',
      query: {
        id: item.id,
      },
    });
  }

  getList = values => {
    const { teacherList: { pageNum, pageSize } } = this.props;
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
      type: 'teacher/fetchList',
      payload: data,
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      // console.log(values);
      if (values.date && values.date.length > 0) {
        values.createTimeSt = values.date[0].format('YYYY-MM-DD');
        values.createTimeEn = values.date[1].format('YYYY-MM-DD');
      }
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
      type: 'teacher/fetchList',
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
  handleCourse = (item) => {
    let params = {
      teacherId: item.id,
      teacherName: item.personName
    }
    router.push(`/pms/teacher/course?${stringify(params)}`)
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.teacherList != nextProps.teacherList) {
      this.setState({ teacherList: nextProps.teacherList })
    }
  }

  handleModalVisible = (flag = false) => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleModal = (item = {}) => {
    // console.log(item);
    this.setState({
      currentItem: item,
    });
    this.handleModalVisible(true);
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'teacher/fetchList',
      payload: {},
    });
  }
  columns = () => [
    {
      title: '教师姓名',
      dataIndex: 'personName',
      width: 100,
      align: 'center',
    },
    {
      title: '归属校区',
      dataIndex: 'campusName',
      width: 150,
      align: 'center',
    },
    {
      title: '所属角色',
      dataIndex: 'roleName',
      width: 100,
      align: 'center',
    },
    {
      title: '手机号',
      dataIndex: 'personMobile',
      width: 120,
      align: 'center',
    },
    {
      title: '账号创建时间',
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
          <>
            <InlineButton onClick={() => { this.handleModal(item) }}>编辑</InlineButton>
            <Divider type="vertical" />
            {this.props.btnPermission['105101'] && <InlineButton onClick={() => this.handleTeacherDetail(item)}>教师简介</InlineButton>}
            {/* <Divider type="vertical" />
            <InlineButton onClick={() => this.handleCourse(item)}>排课</InlineButton> */}
          </>
        );
      },
    },
  ];

  handleTeacherDetail = (item) => {
    router.push({
      pathname: '/pms/teacher/detail',
      query: {
        id: item.id,
      },
    });
  }

  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={48}>
          <Col span={7}>
            <FormItem label="">
              {getFieldDecorator('keyword', {})(
                <Input
                  placeholder="请输入教师姓名/手机号/校区"
                />,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="">
              {getFieldDecorator('date', { initialValue: [] })(<RangePicker placeholder={['创建开始时间', '创建结束时间']} />)}
            </FormItem>
          </Col>
          <Col span={6}>
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
    const { loadingList } = this.props;
    const { teacherList, currentItem, modalVisible } = this.state;
    return (
      <PageHeader title="教师管理">
        <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
        <StandardTable
          rowKey={'id'}
          data={teacherList}
          columns={this.columns()}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          onChange={this.handleStandardTableChange}
          scroll={{ x: 'max-content', y: 600 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '0px' }}
        />
        <TeacherModal
          modalVisible={modalVisible}
          handleModalVisible={this.handleModalVisible}
          currentItem={currentItem}
          afterOk={() => {
            this.getList(null);
          }}
        />
      </PageHeader>
    );
  }
}
