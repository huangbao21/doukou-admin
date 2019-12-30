import React, { Component, Fragment } from 'react';
import { Form, Modal, Input, Row, Checkbox, Col, InputNumber, Tag, Button, Divider } from 'antd';
import { connect } from 'dva';
import { fetchGroupCourseAdd } from '@/services/group';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import StandardTable from '@/components/StandardTable';
import { spawn } from 'child_process';

const FormItem = Form.Item;
const { confirm } = Modal

const StatusMap = {
  0: '未上架',
  1: '上架中',
  2: '已下架',
}
const StatusColorMap = {
  0: 'orange',
  1: 'green',
  2: 'red',
}

@connect(state => ({
  courseDetail: state.group.courseDetail,
  loading: state.loading.models.group,
  loadingList: state.loading.effects['group/fetchCourseDetail'],
}))
@Form.create()
class FormModal extends Component {
  state = {
    confirmLoading: false,
    selectedRows: [],
    formValues: {},
    currentItemList: []
  };
  handleCancel = e => {
    e.preventDefault();
    this.props.form.resetFields();
    this.props.handleModalVisible(false);
    this.setState({ selectedRows: [] })
  };

  getList = values => {
    const { courseDetail: { pageNum, pageSize }, groupId } = this.props;
    const { formValues } = this.state;
    if (values === null || values === undefined) {
      values = {
        ...formValues,
        pageNum,
        pageSize,
        groupId
      };
    }
    let data = {};
    for (let i in values) {
      if (values[i] !== '' && values[i] !== undefined && values[i] !== null) {
        data[i] = values[i];
      }
    }
    this.props.dispatch({
      type: 'group/fetchCourseDetail',
      payload: data,
    });
  };

  handleStandardTableChange = (pagination) => {
    const { current, pageSize } = pagination
    const { formValues } = this.state
    const { groupId } = this.props
    this.getList({
      pageNum: current,
      pageSize,
      ...formValues,
      groupId
    })
  }

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      // console.log(values)
      values['groupId'] = this.props.groupId
      this.setState({ formValues: values });
      this.getList(values);
    });
  };

  handleFormReset = () => {
    const { form, dispatch, groupId } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'group/fetchCourseDetail',
      payload: {
        groupId
      },
    });
  };

  handleSelectRows = (selectedRows, keys) => {
    let toData = keys.join(',')
    // console.log(toData, keys)
    this.setState({
      currentItemList: toData,
    })
    this.setState({ selectedRows: keys })
  }

  okHandle = e => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, groupId, afterOk } = this.props;
    const { selectedRows } = this.state
    let keys = []
    selectedRows.forEach(item => {
      keys.push(item)
    })
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // console.log(fieldsValue);
      this.setState({
        confirmLoading: true,
      });
      fieldsValue.groupId = groupId
      fieldsValue.courseIds = keys
      if (fieldsValue.courseIds.length > 0) {
        fetchGroupCourseAdd(fieldsValue)
          .then(d => {
            if (d) {
              form.resetFields()
              handleModalVisible(false)
              this.setState({
                confirmLoading: false,
                selectedRows: []
              });
              afterOk()
            } else {
              this.setState({
                confirmLoading: false,
              });
            }
          })
      } else {
        form.resetFields()
        handleModalVisible(false)
        this.setState({
          confirmLoading: false,
        });
      }
    });
  };

  columns = () => [
    {
      title: '课程名称',
      width: 180,
      align: 'center',
      render: item => {
        return (
          <div style={{ display: 'flex' }}>
            <span style={{ display: 'flex', alignItems: 'center', textAlign: 'left', fontSize: '13px' }}>{item.courseCover ? <img style={{ marginRight: '10px' }} src={item.courseCover} width="60" /> : null}</span>
            <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: '13px', textAlign: 'left', marginBottom: '10px' }}>{item.courseName}</p>
              <p style={{ fontSize: '13px', textAlign: 'left', marginBottom: '0' }}>￥{item.coursePrice}</p>
            </span>
          </div>
        )
      }
    },
    {
      title: '创建时间',
      dataIndex: 'addTime',
      width: 120,
      align: 'center',
      render: v => {
        if (v) {
          return moment(v).format('YYYY/MM/DD');
        }
      },
    },
    {
      title: '状态',
      dataIndex: 'courseState',
      width: 100,
      align: 'center',
      render: v => <Tag color={StatusColorMap[v]}>{StatusMap[v]}</Tag>,
    },
  ]

  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="">
              {getFieldDecorator('courseName', {})(
                <Input
                  style={{ width: '100%' }}
                  placeholder="请输入课程名"
                />,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
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
    const { modalVisible, form, handleModalVisible, currentItem, groupId, loadingList, courseDetail, ...props } = this.props;
    const { confirmLoading, selectedRows } = this.state;
    const { getFieldValue } = form;
    // console.log(currentItem)
    // console.log(groupId)
    return (
      <Modal
        width={800}
        title={'添加课程'}
        visible={modalVisible}
        onOk={this.okHandle}
        maskClosable={false}
        confirmLoading={confirmLoading}
        onCancel={this.handleCancel}
        bodyStyle={{
          top: '100px',
          maxHeight: '1200px',
        }}
        {...props}
      >
        <div style={{ marginTop: '20px' }}>{this.renderSearchForm()}</div>
        <StandardTable
          rowKey={(item, index) => { return item.id }}
          data={courseDetail ? courseDetail : {}}
          columns={this.columns()}
          onSelectRow={this.handleSelectRows}
          loading={loadingList}
          showSelectedRows={true}
          selectedRows={selectedRows}
          onChange={this.handleStandardTableChange}
          scroll={{ x: 'max-content', y: 360 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
        />
      </Modal>
    );
  }
}

export default FormModal;
