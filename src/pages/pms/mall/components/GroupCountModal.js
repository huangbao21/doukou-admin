import React, { Component, Fragment } from 'react';
import { Form, Modal, Input, Row, message, Col, InputNumber, Tag, Button, Divider, Icon } from 'antd';
import { connect } from 'dva';
import { fetchGroupProductDelete } from '@/services/product';
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
  deleteList: state.product.deleteList,
  loading: state.loading.models.product,
  loadingList: state.loading.effects['product/fetchDeleteList'],
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
    this.setState({
      selectedRows: []
    })
    this.props.afterOk()
  };

  getList = values => {
    const { deleteList: { pageNum, pageSize }, groupId } = this.props;
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
    data.groupId = groupId
    this.props.dispatch({
      type: 'product/fetchDeleteList',
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
    const { selectedRows } = this.state
    const { afterOk, groupId } = this.props
    let productIdList = []
    if (selectedRows.length !== 0) {
      selectedRows.forEach(item => {
        productIdList.push(item)
      })
    } else {
      productIdList.push(item.id)
    }
    confirm({
      title: '确定删除该商品吗?',
      onOk: () => {
        return fetchGroupProductDelete({
          groupId,
          productIdList
        }).then((data) => {
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
      title: '商品',
      width: 180,
      align: 'center',
      render: item => {
        return (
          <div style={{ display: 'flex' }}>
            <span style={{ display: 'flex', alignItems: 'center', textAlign: 'left', fontSize: '13px' }}>{item.pic ? <img style={{ marginRight: '10px' }} src={item.pic} width="60" /> : null}</span>
            <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: '13px', textAlign: 'left', marginBottom: '10px' }}>{item.name}</p>
              <p style={{ fontSize: '13px', textAlign: 'left', marginBottom: '0' }}>￥{item.price}</p>
            </span>
          </div>
        )
      }
    },
    // {
    //   title: '价格',
    //   dataIndex: 'price',
    //   width: 80,
    //   align: 'center',
    // },
    {
      title: '添加时间',
      dataIndex: 'createTime',
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
      dataIndex: 'publishStatus',
      width: 100,
      align: 'center',
      render: v => <Tag color={StatusColorMap[v]}>{StatusMap[v]}</Tag>
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: 80,
      align: 'center',
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

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
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
      type: 'product/fetchDeleteList',
      payload: {
        groupId
      },
    });
  };

  handleSelectRows = (selectedRows, keys) => {
    let toData = keys.join(',')
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
              {getFieldDecorator('productName', {})(
                <Input
                  style={{ width: '100%' }}
                  placeholder="请输入商品名称"
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
    const { modalVisible, form, handleModalVisible, currentItem, deleteList, groupId, loadingList, ...props } = this.props;
    const { confirmLoading, selectedRows, hasDelete } = this.state;
    const { getFieldValue } = form;
    return (
      <Modal
        width={900}
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
          data={deleteList ? deleteList : {}}
          columns={this.columns()}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
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
