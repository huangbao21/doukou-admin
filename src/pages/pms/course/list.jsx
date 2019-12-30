import React, { Component, Fragment } from 'react';
import config from '@/config';
import { PageHeader, Form, DatePicker, Row, Col, Input, Button, Divider, Tag, Select, Modal, message, Icon, Tabs, Typography } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import { fetchCourseList } from '@/services/group';
import { fetchUpordown, fetchCourseDelete } from '@/services/course';
import CourseDetailModal from './components/CourseDetailModal';
import QuickModal from './components/QuickModal';
import router from 'umi/router';

const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const { Option } = Select;
const { confirm } = Modal;
const { TabPane } = Tabs;
const { Paragraph } = Typography;

const StatusMap = {
  0: '未上架',
  1: '上架中',
  2: '已下架',
};
const StatusColorMap = {
  0: 'orange',
  1: 'green',
  2: 'red',
};

@Form.create()
@connect(state => ({
  courseList: state.course.courseList,
  loading: state.loading.models.course,
  loadingList: state.loading.effects['course/fetchList'],
  buyDetials: state.course.buyDetials,
  btnPermission: state.user.btnPermission
}))
export default class CourseList extends Component {
  state = {
    formValues: {},
    currentItem: {},
    sortList: [],
    styleList: [],
    detailmodalVisible: false,
    productId: '',
    courseState: 1,
    title: '',
  };
  columns = () => [
    {
      title: '课程名称',
      width: 220,
      align: 'center',
      render: item => {
        return (
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            {item.courseCover && item.courseCover.length > 0 ? (
              <img
                style={{ marginRight: '10px', textAlign: 'left' }}
                src={item.courseCover.split(',')[0]}
                width="60"
              />
            ) : null}
            <div>
              <Paragraph ellipsis={{ rows: 2, expandable: true }} style={{ textAlign: 'left', fontSize: '13px' }}>
                {item.courseName}
                <Icon
                  type="edit"
                  theme="twoTone"
                  onClick={() => this.handleEditClick(item, 2)}
                  style={{ marginLeft: '5px' }}
                />
              </Paragraph>
              <p style={{ textAlign: 'left', fontSize: '13px' }}>
                ￥{item.coursePrice}
                <Icon
                  type="edit"
                  theme="twoTone"
                  onClick={() => this.handleEditClick(item, 3)}
                  style={{ marginLeft: '5px' }}
                />
              </p>
            </div>
          </div>
        );
      },
    },
    {
      title: '课程分类',
      dataIndex: 'courseType',
      width: 100,
      align: 'center',
    },
    // {
    //   title: '授课方式',
    //   dataIndex: 'courseStyle',
    //   width: 100,
    //   align: 'center',
    // },
    // {
    //   title: '课时',
    //   dataIndex: 'courseCount',
    //   width: 80,
    //   align: 'center',
    //   // render: (item) => {
    //   //   return (
    //   //     <Fragment>
    //   //       <InlineButton onClick={() => this.handleTime(item)}>{item.courseCount}</InlineButton>
    //   //     </Fragment>
    //   //   );
    //   // }
    // },
    {
      title: '课程状态',
      dataIndex: 'courseState',
      width: 100,
      align: 'center',
      render: v => <Tag color={StatusColorMap[v]}>{StatusMap[v]}</Tag>,
    },
    {
      title: '访问量',
      width: 110,
      align: 'center',
      render: item => {
        return (
          <div>
            <p>访客量：{item.uv_count}</p>
            <p>浏览量：{item.pv_count}</p>
          </div>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'addTime',
      align: 'center',
      width: 120,
      render: (item) => {
        return (
          <span>
            {item ? moment(item).format('YYYY/MM/DD') : ''}<br />
            {item ? moment(item).format('HH:mm') : ''}
          </span>
        )
      }
    },
    {
      title: '报名人数',
      width: 90,
      align: 'center',
      render: item => {
        return (
          <Fragment>
            <InlineButton onClick={() => this.handleDetail(item)}>
              {item.courseSaleCount}
            </InlineButton>
          </Fragment>
        );
      },
    },
    {
      title: '评价',
      width: 130,
      align: 'center',
      render: item => {
        return (
          <InlineButton onClick={() => this.handleComment(item)}>
            <div>
              <p style={{ textAlign: 'left' }}>评价数：{item.commentCount ? item.commentCount : 0}</p>
              <p style={{ textAlign: 'left' }}>好评率：{item.goodFeel ? item.goodFeel : ''}</p>
            </div>
          </InlineButton>
        )
      }
    },
    {
      title: '排序',
      dataIndex: 'courseSort',
      width: 80,
      align: 'center',
      editable: true,
      render: (item, key) => {
        // console.log(item,key)
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div>{item}</div>
            <Icon
              type="edit"
              theme="twoTone"
              onClick={() => this.handleEditClick(key, 1)}
              style={{ marginLeft: '5px' }}
            />
          </div>
        );
      },
    },
    {
      title: '操作',
      align: 'center',
      width: this.state.courseState == 1 ? 120 : 180,
      render: item => {
        return (
          <Fragment>
            <Fragment>
              {this.props.btnPermission[102102] && <><InlineButton onClick={() => this.handleCourse(item, 1)}>编辑</InlineButton>
                <Divider type="vertical" /></>
              }

              {this.props.btnPermission[102103] && (this.state.courseState == 1 ? null : (
                <span>
                  <InlineButton type="danger" onClick={() => this.handleDeleteClick(item)}>
                    删除
                  </InlineButton>
                  <Divider type="vertical" />
                </span>
              ))}
              {
                this.props.btnPermission['102104'] && <InlineButton
                  type={item.courseState === 1 ? 'danger' : 'success'}
                  onClick={() => this.handleSet(item)}
                >
                  {item.courseState == 1 ? '下架' : '上架'}
                </InlineButton>
              }

            </Fragment>
          </Fragment>
        );
      },
    },
  ];

  handleComment = (item) => {
    console.log(item)
    router.push({
      pathname: '/pms/course/comment',
      query: {
        productId: item.id,
        productName: item.courseName
      },
    });
  }

  handleSet = item => {
    const statusText = item.courseState == 1 ? '下架' : '上架';
    // console.log(item, '233')
    confirm({
      title: `确定要${statusText}该课程吗?`,
      onOk: () => {
        const id = item.id;
        const curStatus = item.courseState;
        const state = curStatus === 1 ? 2 : 1;
        fetchUpordown({ id, type: state }).then(data => {
          if (data) {
            message.success(`${statusText}成功`);
            this.getList(null);
          }
        });
      },
    });
  };

  handleDeleteClick = item => {
    // console.log(item);
    if (item.courseState == 1) {
      Modal.error({
        title: '无法删除',
        content: '上架中的课程不可删除，请下架后再删除课程',
      });
    } else {
      confirm({
        title: '确定删除该课程吗?删除后无法恢复。',
        onOk: () => {
          return fetchCourseDelete({
            ids: item.id,
          }).then(data => {
            if (data) {
              message.success('删除成功');
              this.getList(null);
            }
          });
        },
      });
    }
  };

  handleEditClick = (item, titleType) => {
    // console.log(item)
    if (titleType == 1) {
      this.setState({
        title: '排序',
      });
    } else if (titleType == 2) {
      this.setState({
        title: '课程名称',
      });
    } else if (titleType == 3) {
      this.setState({
        title: '课程价格',
      });
    }
    this.setState({
      currentItem: item,
    });
    this.handleQuickModalVisible(true);
  };

  handleQuickModalVisible = (flag = false) => {
    this.setState({
      quickModalVisible: !!flag,
    });
  };

  getList = values => {
    const {
      courseList: { pageNum, pageSize },
    } = this.props;
    const { formValues, courseState } = this.state;
    if (values === null || values === undefined) {
      values = {
        ...formValues,
        pageNum,
        pageSize,
        courseState,
      };
    }
    let data = {};
    for (let i in values) {
      if (values[i] !== '' && values[i] !== undefined && values[i] !== null) {
        data[i] = values[i];
      }
    }
    data['courseState'] = courseState;
    // console.log(data)
    this.props.dispatch({
      type: 'course/fetchList',
      payload: data,
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    const { courseState } = this.state;
    form.validateFields((err, values) => {
      if (err) return;
      // console.log(values);
      if (values.date && values.date.length > 0) {
        values.addTimeSt = values.date[0].format('YYYY-MM-DD');
        values.addTimeEn = values.date[1].format('YYYY-MM-DD');
      }
      values['courseState'] = courseState;
      // console.log(values)
      this.setState({ formValues: values });
      this.getList(values);
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    const { courseState } = this.state;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'course/fetchList',
      payload: {
        courseState,
      },
    });
  };

  handleStandardTableChange = pagination => {
    // console.log(pagination)
    const { current, pageSize } = pagination;
    const { formValues } = this.state;
    // console.log(current)
    this.getList({
      pageNum: current,
      pageSize,
      ...formValues,
    });
  };

  renderSearchForm = () => {
    const { courseList, btnPermission } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { sortList, styleList } = this.state;
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={48}>
          <Col span={5}>
            <FormItem label="">
              {getFieldDecorator('courseName', {})(<Input placeholder="请输入课程名称" />)}
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem>
              {getFieldDecorator('courseType', {})(
                <Select placeholder="请选择课程分类">
                  <Option value="">全部</Option>
                  {sortList}
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem>
              {getFieldDecorator('courseStyle', {})(
                <Select placeholder="请选择授课方式">
                  <Option value="">全部</Option>
                  {styleList}
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="">
              {getFieldDecorator('date', { initialValue: [] })(
                <RangePicker placeholder={['创建开始时间', '创建结束时间']} />,
              )}
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
          {
            btnPermission['102101'] &&
            <Col span={5}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.handleCourse}
                style={{ textAlign: 'right' }}
              >
                创建课程
            </Button>
            </Col>
          }

        </Row>
      </Form>
    );
  };

  componentDidMount() {
    // 初始详情数据
    this.props.dispatch({
      type: 'course/saveEditDetail',
      payload: { editDetail: {} },
    });
    this.props.dispatch({
      type: 'course/fetchList',
      payload: {
        courseState: this.state.courseState,
      },
    });
    fetchCourseList({
      type: 1,
    }).then(data => {
      if (data && data.list) {
        const list1 = [];
        data.list.forEach((item, index) => {
          list1.push(
            <Option key={item.id} value={item.name}>
              {item.name}
            </Option>,
          );
        });
        this.setState({
          sortList: list1,
        });
      }
    });

    fetchCourseList({
      type: 2,
    }).then(data => {
      if (data && data.list) {
        const list = [];
        data.list.forEach((item, index) => {
          list.push(
            <Option key={item.id} value={item.name}>
              {item.name}
            </Option>,
          );
        });
        this.setState({
          styleList: list,
        });
      }
    });
  }

  handleDetailmodalVisible = (flag = false) => {
    this.setState({
      detailmodalVisible: !!flag,
    });
  };

  handleDetail = (item = {}) => {
    this.setState({
      currentItem: item,
    });
    this.setState({
      productId: item.id,
    });
    this.props.dispatch({
      type: 'course/fetchDetail',
      payload: {
        productId: item.id,
      },
    });
    this.handleDetailmodalVisible(true);
  };

  handleCourse = (item, edit) => {
    if (edit == 1) {
      router.push({
        pathname: '/pms/course/addoredit',
        query: {
          id: item.id,
        },
      });
    } else {
      router.push({
        pathname: '/pms/course/addoredit',
      });
    }
  };

  handleTime = item => {
    router.push({
      pathname: '/pms/course/addoredit',
      query: {
        courseId: item.id,
      },
    });
  };

  onChange = item => {
    if (item == 2) {
      this.props.dispatch({
        type: 'course/fetchList',
        payload: {
          courseState: `0,${item}`,
        },
      });
      this.setState({
        courseState: `0,${item}`,
      });
    } else {
      this.props.dispatch({
        type: 'course/fetchList',
        payload: {
          courseState: item,
        },
      });
      this.setState({
        courseState: item,
      });
    }
  };

  render() {
    const { courseList, loadingList, buyDetials, btnPermission } = this.props;
    const {
      currentItem,
      detailmodalVisible,
      productId,
      quickModalVisible,
      courseState,
      title,
    } = this.state;
    // console.log(courseList);
    return (
      <PageHeader title="课程管理">
        <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
        <Tabs onChange={this.onChange} defaultActiveKey="1">
          <TabPane tab="上架中" key="1">
            <StandardTable
              rowKey={(item, index) => index}
              data={courseList ? courseList : {}}
              columns={this.columns()}
              loading={loadingList}
              showSerialNumber={{ isShow: true }}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
            />
          </TabPane>
          <TabPane tab="仓库中" key="2">
            <StandardTable
              rowKey={(item, index) => index}
              data={courseList ? courseList : {}}
              columns={this.columns()}
              loading={loadingList}
              showSerialNumber={{ isShow: true }}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
            />
          </TabPane>
          <TabPane tab="全部" key="">
            <StandardTable
              rowKey={(item, index) => index}
              data={courseList ? courseList : {}}
              columns={this.columns()}
              loading={loadingList}
              showSerialNumber={{ isShow: true }}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 500 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '0px' }}
            />
          </TabPane>
        </Tabs>
        <CourseDetailModal
          modalVisible={detailmodalVisible}
          handleModalVisible={this.handleDetailmodalVisible}
          currentItem={currentItem}
          // buyDetials={buyDetials}
          // loadingList={loadingDetailList}
          productId={productId}
          afterOk={() => {
            this.getList(null);
          }}
        />
        <QuickModal
          modalVisible={quickModalVisible}
          handleModalVisible={this.handleQuickModalVisible}
          currentItem={currentItem}
          // type={Number(typeState)}
          afterOk={() => {
            this.getList(null);
          }}
          title={title}
        />
      </PageHeader>
    );
  }
}
