import React, { Component, Fragment } from 'react';
import { parse, stringify } from 'qs';
import { PageHeader, Form, DatePicker, Row, Col, Input, Button, Divider, Icon, Modal,message } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import CourseModal from './components/CourseModal';
import moment from 'moment';
import Styles from './style.less';
import router from 'umi/router';
import { deleteCourse } from '@/services/teacher';

const FormItem = Form.Item;
const confirm = Modal.confirm;
@Form.create()
@connect(({ teacher, loading }) => ({
  courseList: teacher.courseList,
  loading: loading.models.teacher,
  loadingList: loading.effects['teacher/fetchCourseList'],
}))
export default class CourseList extends Component {
  state = {
    formValue: {},
    currentItem: {},
    courseModalVisible: false
  }
  handleDelete = (item) => {
    const { location: { query } } = this.props
    confirm({
      title: '确定删除该条记录么?',
      onOk: () => {
        return deleteCourse({
          ids: item.id,
          teacherId: query.teacherId
        }).then((data) => {
          if (data) {
            message.success('删除成功');
            this.getList(null);
          }
        })
      },
    });
  }
  getList = values => {
    const { location: { query }, courseList: { pageNum, pageSize }, dispatch } = this.props;
    const { formValues } = this.state;
    if (!values) {
      values = {
        ...formValues,
        pageNum,
        pageSize,
      };
    }
    values.teacherId = query.teacherId
    dispatch({
      type: 'teacher/fetchCourseList',
      payload: values
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
  handleCourse = (item = {}) => {
    this.setState({ currentItem: item });
    this.handleCourseModalVisible(true);
  }
  handleCourseModalVisible = (flag = false) => {
    this.setState({
      courseModalVisible: !!flag,
    });
  }
  componentDidMount() {
    const { dispatch } = this.props;
    this.getList();
    dispatch({
      type: 'courseHome/fetchAllCourse',
      payload: {}
    })
  }
  columns = () => [
    {
      title: '教师姓名',
      dataIndex: 'teacherName',
      width: 100,
      align: 'center',
    },
    {
      title: '课程名',
      dataIndex: 'courseName',
      width: 100,
      align: 'center',
    },
    {
      title: '开课时间',
      dataIndex: 'courseStartTime',
      width: 100,
      align: 'center',
      render: item => item&&moment(item).format('YYYY/MM/DD HH:mm')
    },
    {
      title: '课时数',
      dataIndex: 'courseCount',
      width: 100,
      align: 'center',
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      render: item => {
        return (
          <>
            <InlineButton onClick={() => this.handleCourse(item)}>编辑</InlineButton>
            <Divider type="vertical" />
            <InlineButton onClick={() => { this.handleDelete(item) }}>删除</InlineButton>
          </>
        )
      }
    },
  ]
  render() {
    const { courseList, loadingList, location: { query } } = this.props
    const { courseModalVisible, currentItem } = this.state;
    return (
      <PageHeader title='排课' onBack={() => {
        router.push('/pms/teacher/list');
      }}>
        <Button type="primary" onClick={() => { this.handleCourse() }}>添加排课</Button>
        <StandardTable
          rowKey={'id'}
          data={courseList}
          columns={this.columns()}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          onChange={this.handleStandardTableChange}
          scroll={{ y: 600 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}>
        </StandardTable>
        <CourseModal
          modalVisible={courseModalVisible}
          handleModalVisible={this.handleCourseModalVisible}
          teacher={query}
          currentItem={currentItem}
          afterOk={() => {
            this.getList(null);
          }}>
        </CourseModal>
      </PageHeader>
    )
  }
}