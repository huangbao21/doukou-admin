import React, { Component, Fragment } from 'react';
import config from '@/config';
import { PageHeader, Form, DatePicker, Row, Col, Input, Button, Divider, Tabs, Modal, message, Icon } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import GroupModal from './components/GroupModal'
import CourseModal from './components/CourseModal'
import CourseGroupModal from './components/CourseGroupModal'
import AddCourseModal from './components/AddCourseModal'
import CourseSortModal from './components/CourseSortModal'
import SortModal from './components/SortModal'
import { fetchGroupDelete, fetchUpordown, fetchCourseDelete, fetchOptionUpordown } from '@/services/group';

const FormItem = Form.Item;
const { TabPane } = Tabs;
const confirm = Modal.confirm;

const statusSetMap = {
  1: '停用',
  2: '启用',
}

const typeMap = {
  1: '课程分类',
  2: '授课方式',
  3: '课程难度',
  10: '服务承诺'
}

@Form.create()
@connect(state => ({
  groupList: state.group.groupList,
  courseList: state.group.courseList,
  groupDetail: state.group.groupDetail,
  courseDetail: state.group.courseDetail,
  courseBasisList: state.course.courseList,
  loading: state.loading.models.group,
  loadingDetailList: state.loading.effects['group/fetchGroupDetail'],
  loadingList: state.loading.effects['group/fetchList'],
  loadingCourseList: state.loading.effects['group/fetchCourseList'],
}))
export default class groupList extends Component {
  state = {
    formValues: {},
    currentItem: {},
    modalVisible: false,
    courseModalVisible: false,
    typeState: 1,
    groupId: '',
    courseGroupmodalVisible: false,
    addCoursemodalVisible: false,
    courseSortmodalVisible: false,
    sortModalVisible: false
  };
  columns = () => [
    {
      title: '分组名称',
      dataIndex: 'groupName',
      width: 120,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'addTime',
      width: 120,
      align: 'center',
      render: v => {
        return moment(v).format('YYYY/MM/DD HH:mm');
      },
    },
    {
      title: '课程数',
      align: 'center',
      width: 80,
      render: item => {
        return (
          <Fragment>
            <InlineButton onClick={() => this.handleCourseCount(item)}>{item.courseCount}</InlineButton>
          </Fragment>
        );
      },
    },
    {
      title: '操作',
      align: 'center',
      width: 160,
      render: item => {
        return (
          <Fragment>
            <Fragment>
              <InlineButton onClick={() => this.handleGroup(item)}>编辑</InlineButton>
              <Divider type="vertical" />
              {
                item.state !== 0 ?
                  <span>
                    <InlineButton type={item.state === 1 ? 'danger' : 'success'} onClick={() => this.handleSet(item)}>{statusSetMap[item.state]}</InlineButton>
                    <Divider type="vertical" />
                  </span> : null

              }
              <InlineButton type="danger" onClick={() => { this.handleDeleteClick(item) }}>删除</InlineButton>
              <Divider type="vertical" />
              <InlineButton onClick={() => this.handleAddCourse(item)}>添加课程</InlineButton>
            </Fragment>
          </Fragment>
        );
      },
    },
  ];

  columns1 = () => [
    {
      title: '课程分类',
      dataIndex: 'name',
      width: 120,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 120,
      align: 'center',
      render: v => {
        return moment(v).format('YYYY/MM/DD HH:mm');
      },
    },
    {
      title: '课程数',
      align: 'center',
      width: 80,
      render: item => {
        return (
          <Fragment>
            <InlineButton onClick={() => this.handleCourseSort(item)}>{item.courseNum}</InlineButton>
          </Fragment>
        );
      },
    },
    {
      title: '排序',
      dataIndex: 'sort',
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
              onClick={() => this.handleSortEdit(key)}
              style={{ marginLeft: '5px' }}
            />
          </div>
        );
      },
    },
    {
      title: '操作',
      align: 'center',
      width: 120,
      render: item => {
        return (
          <Fragment>
            <Fragment>
              <InlineButton onClick={() => this.handleCourse(item)}>修改</InlineButton>
              <Divider type="vertical" />
              {
                item.status !== 0 ?
                  <span>
                    <InlineButton type={item.status === 1 ? 'danger' : 'success'} onClick={() => this.handleSetSort(item)}>{statusSetMap[item.status]}</InlineButton>
                    <Divider type="vertical" />
                  </span> : null

              }
              <InlineButton type="danger" onClick={() => { this.handleDelete(item) }}>删除</InlineButton>
            </Fragment>
          </Fragment>
        );
      },
    },
  ];

  columns2 = () => [
    {
      title: '授课方式',
      dataIndex: 'name',
      width: 120,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 120,
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
          <Fragment>
            <Fragment>
              <InlineButton onClick={() => this.handleCourse(item)}>修改</InlineButton>
              <Divider type="vertical" />
              <InlineButton type="danger" onClick={() => { this.handleDelete(item) }}>删除</InlineButton>
            </Fragment>
          </Fragment>
        );
      },
    },
  ];

  columns3 = () => [
    {
      title: '课程难度',
      dataIndex: 'name',
      width: 120,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 120,
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
          <Fragment>
            <Fragment>
              <InlineButton onClick={() => this.handleCourse(item)}>修改</InlineButton>
              <Divider type="vertical" />
              <InlineButton type="danger" onClick={() => { this.handleDelete(item) }}>删除</InlineButton>
            </Fragment>
          </Fragment>
        );
      },
    },
  ];

  columns10 = () => [
    {
      title: '承诺名称',
      dataIndex: 'name',
      width: 120,
      align: 'center',
    },
    {
      title: '承诺内容',
      dataIndex: 'descrition',
      width: 180,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 120,
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
          <Fragment>
            <Fragment>
              <InlineButton onClick={() => this.handleCourse(item)}>修改</InlineButton>
              <Divider type="vertical" />
              <InlineButton type="danger" onClick={() => { this.handleDelete(item) }}>删除</InlineButton>
            </Fragment>
          </Fragment>
        );
      },
    },
  ];


  getList = values => {
    const { groupList: { pageNum, pageSize } } = this.props;
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
      type: 'group/fetchList',
      payload: data,
    });
  };

  getCourseList = values => {
    const { courseList: { pageNum, pageSize } } = this.props;
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
      type: 'group/fetchCourseList',
      payload: data,
    });
  };

  handleDeleteClick = item => {
    // console.log(item);
    if (item.courseCount !== 0) {
      Modal.error({
        title: '无法删除',
        content: '分组内课程没有清零，无法删除该分组',
      });
    } else {
      confirm({
        title: '确定删除该分组吗?',
        onOk: () => {
          return fetchGroupDelete({
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
    }
  };

  handleDelete = item => {
    const { typeState } = this.state
    if (typeState == 1 && item.courseNum !== 0) {
      Modal.error({
        title: '无法删除',
        content: '课程没有清零，无法删除该分类',
      });
    } else {
      confirm({
        title: `确定删除该${typeMap[typeState]}吗?`,
        onOk: () => {
          return fetchCourseDelete({
            ids: item.id,
          })
            .then((data) => {
              if (data) {
                message.success('删除成功');
                this.getCourseList({ type: typeState });
              }
            })
        },
      });
    }
  };

  handleSet = (item) => {
    confirm({
      title: `确定要${statusSetMap[item.state]}该分组吗?`,
      onOk: () => {
        const id = item.id
        const curStatus = item.state
        const state = curStatus === 1 ? 2 : 1
        fetchUpordown({ id, type: state }).then((data) => {
          if (data) {
            message.success(`${statusSetMap[item.state]}成功`)
            this.getList(null)
          }
        })
      }
    })
  }

  handleSetSort = (item) => {
    confirm({
      title: `确定要${statusSetMap[item.status]}该分类吗?`,
      onOk: () => {
        const id = item.id
        const curStatus = item.status
        const status = curStatus === 1 ? 2 : 1
        fetchOptionUpordown({ id, type: status }).then((data) => {
          if (data) {
            message.success(`${statusSetMap[item.status]}成功`)
            this.getCourseList({ type: 1 })
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

  handleCourseTableChange = (pagination) => {
    const { current, pageSize } = pagination
    const { formValues, typeState } = this.state
    this.getCourseList({
      pageNum: current,
      pageSize,
      type: typeState,
      ...formValues
    })
  }

  handleModalVisible = (flag = false) => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleGroup = (item = {}) => {
    // console.log(item);
    this.setState({
      currentItem: item,
    });
    this.handleModalVisible(true);
  };

  handleCourseModalVisible = (flag = false) => {
    this.setState({
      courseModalVisible: !!flag,
    });
  };


  handleCourse = (item = {}) => {
    this.setState({
      currentItem: item,
    });
    this.handleCourseModalVisible(true);
  };

  handleCourseGroupmodalVisible = (flag = false) => {
    this.setState({
      courseGroupmodalVisible: !!flag,
    });
  };


  handleCourseCount = (item = {}) => {
    this.setState({
      currentItem: item,
    });
    this.props.dispatch({
      type: 'group/fetchGroupDetail',
      payload: {
        groupId: item.id
      }
    });
    this.setState({
      groupId: item.id
    })
    this.handleCourseGroupmodalVisible(true);
  };

  handleAddCourse = (item = {}) => {
    // console.log(item);
    this.setState({
      currentItem: item,
    });
    this.props.dispatch({
      type: 'group/fetchCourseDetail',
      payload: {
        groupId: item.id
      }
    });
    this.setState({
      groupId: item.id
    })
    this.handleAddCoursemodalVisible(true);
  };

  handleAddCoursemodalVisible = (flag = false) => {
    this.setState({
      addCoursemodalVisible: !!flag,
    });
  };

  handleSortEdit = (item = {}) => {
    // console.log(item);
    this.setState({
      currentItem: item,
    });
    this.handleSortModalVisible(true);
  };

  handleSortModalVisible = (flag = false) => {
    this.setState({
      sortModalVisible: !!flag,
    });
  };



  handleCourseSort = (item = {}) => {
    // console.log(item);
    this.setState({
      currentItem: item,
    });
    this.props.dispatch({
      type: 'course/fetchList',
      payload: {
        courseType: item.name
      }
    });
    this.handleCourseSortmodalVisible(true);
  };

  handleCourseSortmodalVisible = (flag = false) => {
    this.setState({
      courseSortmodalVisible: !!flag,
    });
  };


  onChange = (item) => {
    if (item > 0) {
      this.props.dispatch({
        type: 'group/fetchCourseList',
        payload: {
          type: item
        },
      });
      this.setState({
        typeState: item
      })
    } else {
      this.props.dispatch({
        type: 'group/fetchList',
        payload: {},
      });
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'group/fetchList',
      payload: {},
    });
  }

  render() {
    const { groupList, loadingList, courseList, loadingCourseList, groupDetail, loadingDetailList, courseDetail, courseBasisList } = this.props;
    const { currentItem, modalVisible, courseModalVisible, typeState, courseGroupmodalVisible, groupId, addCoursemodalVisible, courseSortmodalVisible, sortModalVisible } = this.state;
    return (
      <div>
        <Tabs onChange={this.onChange}>
          <TabPane tab="课程分组" key="0">
            <PageHeader title="课程分组设置">
              <Button type="primary" htmlType="submit" onClick={this.handleGroup} style={{ marginTop: '10px' }}>
                新建分组
        </Button>
              <StandardTable
                rowKey={(item, index) => index}
                data={groupList ? groupList : {}}
                columns={this.columns()}
                loading={loadingList}
                showSerialNumber={{ isShow: true }}
                onChange={this.handleStandardTableChange}
                scroll={{ x: 'max-content', y: 600 }}
                style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
              />
            </PageHeader>
            <GroupModal
              modalVisible={modalVisible}
              handleModalVisible={this.handleModalVisible}
              currentItem={currentItem}
              afterOk={() => {
                this.getList(null);
              }}
            />
            <CourseGroupModal
              modalVisible={courseGroupmodalVisible}
              handleModalVisible={this.handleCourseGroupmodalVisible}
              currentItem={currentItem}
              groupDetail={groupDetail}
              groupId={groupId}
              afterOk={() => {
                this.getList(null);
              }}
            />
            <AddCourseModal
              modalVisible={addCoursemodalVisible}
              handleModalVisible={this.handleAddCoursemodalVisible}
              currentItem={currentItem}
              courseDetail={courseDetail}
              // loadingList={loadingDetailList}
              groupId={groupId}
              afterOk={() => {
                this.getList(null);
              }}
            />
          </TabPane>
          <TabPane tab="课程分类" key="1">
            <PageHeader title="课程分类">
              <Button type="primary" htmlType="submit" onClick={this.handleCourse} style={{ marginTop: '10px' }}>
                新建分类
        </Button>
              <StandardTable
                rowKey={(item, index) => index}
                data={courseList ? courseList : {}}
                columns={this.columns1()}
                loading={loadingCourseList}
                showSerialNumber={{ isShow: true }}
                onChange={this.handleCourseTableChange}
                scroll={{ x: 'max-content', y: 600 }}
                style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
              />
            </PageHeader>
            <CourseSortModal
              modalVisible={courseSortmodalVisible}
              handleModalVisible={this.handleCourseSortmodalVisible}
              currentItem={currentItem}
              courseBasisList={courseBasisList}
              // loadingList={loadingDetailList}
              // groupId={groupId}
              afterOk={() => {
                this.getList(null);
              }}
            />
            <SortModal
              modalVisible={sortModalVisible}
              handleModalVisible={this.handleSortModalVisible}
              currentItem={currentItem}
              afterOk={() => {
                this.getCourseList({ type: typeState });
              }}
            />
          </TabPane>
          <TabPane tab="授课方式" key="2">
            <PageHeader title="授课方式">
              <Button type="primary" htmlType="submit" onClick={this.handleCourse} style={{ marginTop: '10px' }}>
                新建授课方式
        </Button>
              <StandardTable
                rowKey={(item, index) => index}
                data={courseList ? courseList : {}}
                columns={this.columns2()}
                loading={loadingCourseList}
                showSerialNumber={{ isShow: true }}
                onChange={this.handleCourseTableChange}
                scroll={{ x: 'max-content', y: 600 }}
                style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
              />
            </PageHeader>
          </TabPane>
          <TabPane tab="课程难度" key="3">
            <PageHeader title="课程难度">
              <Button type="primary" htmlType="submit" onClick={this.handleCourse} style={{ marginTop: '10px' }}>
                新建课程难度
        </Button>
              <StandardTable
                rowKey={(item, index) => index}
                data={courseList ? courseList : {}}
                columns={this.columns3()}
                loading={loadingCourseList}
                showSerialNumber={{ isShow: true }}
                onChange={this.handleCourseTableChange}
                scroll={{ x: 'max-content', y: 600 }}
                style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
              />
            </PageHeader>
          </TabPane>
          <TabPane tab="服务承诺" key="10">
            <PageHeader title="服务承诺">
              <Button type="primary" htmlType="submit" onClick={this.handleCourse} style={{ marginTop: '10px' }}>
                新建服务承诺
        </Button>
              <StandardTable
                rowKey={(item, index) => index}
                data={courseList ? courseList : {}}
                columns={this.columns10()}
                loading={loadingCourseList}
                onChange={this.handleCourseTableChange}
                scroll={{ x: 'max-content', y: 600 }}
                style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
              />
            </PageHeader>
          </TabPane>
        </Tabs>
        <CourseModal
          modalVisible={courseModalVisible}
          handleModalVisible={this.handleCourseModalVisible}
          currentItem={currentItem}
          type={Number(typeState)}
          afterOk={() => {
            this.getCourseList({ type: typeState });
          }}
          title={`${typeMap[typeState]}`}
        />
      </div>
    );
  }
}
