import React, { Component } from 'react';
import {
  Modal, Input, Tag, Radio, Row, Checkbox, Col, InputNumber, Select, Divider, Table
} from 'antd';
import { connect } from 'dva';
import options from '@/utils/cities';
import moment from 'moment';
import InlineButton from '@/components/InlineButton';

@connect(state => ({
  bindList: state.class.bindList,
  loadingList: state.loading.effects['class/fetchBindList'],
}))
export default class bindModal extends Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.currentItem != nextProps.currentItem&&nextProps.currentItem.id) {
      this.props.dispatch({
        type: 'class/fetchBindList',
        payload: { id: nextProps.currentItem.id },
      })
    }
  }
  columns = () => ([
    {
      title: '序号',
      key: 'serial',
      width: 80,
      align: 'center',
      render: (v, item, index) => {
        return index + 1;
      }
    }, {
      title: '课程名称',
      dataIndex: 'courseName',
      width: 150,
      align: 'center'
    }, {
      title: '绑定时间',
      dataIndex: 'bindTime',
      width: 150,
      align: 'center',
      render: v => moment(v).format('YYYY-MM-DD')
    },
  ])
  render() {
    const { modalVisible, handleModalVisible, loadingList, bindList, afterOk } = this.props;
    return (
      <Modal
        width={800}
        title='绑定课程'
        visible={modalVisible}
        footer={null}
        onCancel={() => {
          afterOk();
          handleModalVisible(false);
        }}
        bodyStyle={{
          top: '100px',
          maxHeight: '1200px',
          paddingLeft: '15',
          paddingRight: '15',
        }}
      >
        <Table
          pagination={false}
          rowKey={(item, index) => index}
          dataSource={bindList}
          loading={loadingList}
          columns={this.columns()}
          style={{ marginTop: '15px' }}
          scroll={{ x: 'max-content', y: 500 }}
        >
        </Table>
      </Modal>
    )
  }
}