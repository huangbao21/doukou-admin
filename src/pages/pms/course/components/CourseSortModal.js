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

@connect(state => ({
  courseDetail: state.course.courseList,
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
      type: 'course/fetchList',
      payload: data,
    });
  };

  handleStandardTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination
    const { currentItem } = this.props;
    this.getList({
      courseType: currentItem.name,
      pageNum: current,
      pageSize
    })

  }
  getList = (values) => {
    this.props.dispatch({
      type: 'course/fetchList',
      payload: values,
    })
  }

  columns = () => [
    {
      title: '课程名称',
      width: 180,
      align: 'center',
      render: item => {
        return (
          <div style={{ display: 'flex', }}>
            <span style={{ display: 'flex', alignItems: 'center', textAlign: 'left', fontSize: '13px' }}>{item.courseCover ? <img style={{ marginRight: '10px' }} src={item.courseCover} width="60" /> : null}{item.courseName}</span>
          </div>
        )
      }
    },
    {
      title: '课程价格',
      dataIndex: 'coursePrice',
      width: 80,
      align: 'center',
    },
    {
      title: '授课方式',
      dataIndex: 'courseStyle',
      width: 100,
      align: 'center',
    },
    // {
    //   title: '课时',
    //   dataIndex: 'courseTime',
    //   width: 80,
    //   align: 'center',
    // },
    {
      title: '创建时间',
      dataIndex: 'addTime',
      width: 100,
      align: 'center',
      render: v => {
        if (v) {
          return moment(v).format('YYYY/MM/DD');
        }
      },
    },
  ]

  render() {
    const { modalVisible, form, handleModalVisible, currentItem, groupId, loadingList, courseBasisList, ...props } = this.props;
    const { confirmLoading } = this.state;
    const { getFieldValue } = form;
    // console.log(currentItem)
    // console.log(groupId)
    return (
      <Modal
        width={900}
        title={currentItem.name}
        visible={modalVisible}
        // onOk={this.okHandle}
        maskClosable={false}
        confirmLoading={confirmLoading}
        onCancel={() => {
          this.props.form.resetFields();
          handleModalVisible(false);
        }}
        footer={[
          <Button key="back" type="primary" onClick={this.handleCancel}>
            确定
          </Button>
        ]}
        bodyStyle={{
          top: '100px',
          maxHeight: '1200px',
        }}
        {...props}
      >
        <StandardTable
          rowKey={(item, index) => index}
          data={courseBasisList ? courseBasisList : {}}
          columns={this.columns()}
          showSerialNumber={{ isShow: true }}
          onChange={this.handleStandardTableChange}
          scroll={{ x: 'max-content', y: 360 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
        />
      </Modal>
    );
  }
}

export default FormModal;
