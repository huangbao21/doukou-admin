import React, { Component, Fragment } from 'react';
import { Form, Modal, Input, Row, message, Col, InputNumber, Tag, Button, Divider, Icon } from 'antd';
import { connect } from 'dva';
import { fetchGroupCourseDelete, fetchUpdateSort } from '@/services/group';
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
  groupDetail: state.group.groupDetail,
  loading: state.loading.models.group,
  loadingList: state.loading.effects['group/fetchGroupDetail'],
}))
@Form.create()
class FormModal extends Component {
  state = {
    confirmLoading: false,
    selectedRows: [],
    hasDelete: false,
    editId: 0,
    id: '',
    connteSort: ''
  };
  handleCancel = e => {
    e.preventDefault();
    this.props.form.resetFields();
    this.props.handleModalVisible(false);
    this.setState({ selectedRows: [] })
    this.props.afterOk()
  };

  getList = values => {
    const { groupDetail: { pageNum, pageSize }, groupId } = this.props;
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
      type: 'group/fetchGroupDetail',
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

  handleDelete = item => {
    const { groupId, selectedRows } = this.state
    const { afterOk } = this.props
    let ids = []
    if (selectedRows.length !== 0) {
      selectedRows.forEach(item => {
        ids.push(item)
      })
    } else {
      ids.push(item.id)
    }

    // console.log(ids.join(','))
    ids = ids.join(',')
    confirm({
      title: '确定删除该课程吗?',
      onOk: () => {
        return fetchGroupCourseDelete({
          ids
        })
          .then((data) => {
            if (data) {
              message.success('删除成功');
              this.getList(groupId);
              this.setState({
                hasDelete: false,
                selectedRows: []
              })
              afterOk()
            }
          })
      },
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
      title: '添加时间',
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
    {
      title: '顺序',
      dataIndex: 'connteSort',
      width: 80,
      align: 'center',
      editable: true,
      render: (item, key) => {
        // console.log(item, key)
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {this.state.editId == key.id ?
              <FormItem style={{ margin: 0 }}>
                <Input
                  defaultValue={item}
                  key={item}
                  id={`${key.id}`}
                  onPressEnter={this.handleEdit}
                  onBlur={this.handleEdit}
                  onChange={this.changeValue}
                />
              </FormItem>
              :
              <div>{item}</div>}
            <Icon type="edit" theme="twoTone" onClick={() => this.handleEditClick(key)} style={{ marginLeft: '5px' }} />
          </div>
        )
      }
    },
    {
      title: '操作',
      width: 80,
      align: 'center',
      render: item => {
        return (
          <Fragment>
            <InlineButton type="danger" onClick={() => { this.handleDelete(item) }}>删除</InlineButton>
          </Fragment>
        );
      },
    },
  ]

  handleEditClick = (item) => {
    // console.log(item)
    this.setState({
      id: item.id,
      connteSort: item.connteSort,
    })
    this.setState({ editId: item.id }, () => {
      const inputDom = document.getElementById(`${item.id}`)
      inputDom.focus()
    });
  }

  changeValue = (event) => {
    this.setState({
      connteSort: event.target.value,
      id: event.target.id
    })
  }

  handleEdit = () => {
    const { groupId } = this.props
    this.setState({
      editId: 0
    })
    let value = {
      connteId: this.state.id,
      connteSort: this.state.connteSort,
    }
    fetchUpdateSort(value).then(d => {
      if (d) {
        this.handleFormReset()
        message.success('修改顺序成功')
        this.getList({
          groupId
        })
      }
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
      type: 'group/fetchGroupDetail',
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
    if (selectedRows.length === 0) {
      this.setState({
        hasDelete: false,
      })
      return
    } else {
      this.setState({
        hasDelete: true,
      })
    }
    this.setState({ selectedRows: keys })
  }

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
    const { modalVisible, form, handleModalVisible, currentItem, groupDetail, groupId, loadingList, ...props } = this.props;
    const { confirmLoading, selectedRows, hasDelete } = this.state;
    const { getFieldValue } = form;
    // console.log(currentItem)
    // console.log(groupId)
    return (
      <Modal
        width={800}
        title={currentItem.groupName}
        visible={modalVisible}
        maskClosable={false}
        confirmLoading={confirmLoading}
        onCancel={this.handleCancel}
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
        <div>{this.renderSearchForm()}</div>
        <Button style={{ marginBottom: '10px' }} type="primary" disabled={!hasDelete} onClick={() => { this.handleDelete() }}>
          批量删除</Button>
        <StandardTable
          rowKey={(item, index) => { return item.id }}
          data={groupDetail}
          columns={this.columns()}
          loading={loadingList}
          showSelectedRows={true}
          selectedRows={selectedRows}
          onSelectRow={this.handleSelectRows}
          onChange={this.handleStandardTableChange}
          scroll={{ x: 'max-content', y: 360 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
        />
      </Modal>
    );
  }
}

export default FormModal;
