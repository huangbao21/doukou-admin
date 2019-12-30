import React, { Component, Fragment } from 'react';
import { Form, Modal, Input, Row, Checkbox, Col, InputNumber, Tag, Button, Divider } from 'antd';
import { connect } from 'dva';
import { fetchGroupProductAdd } from '@/services/product';
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
  addList: state.product.addList,
  loading: state.loading.models.product,
  loadingList: state.loading.effects['product/fetchAddList'],
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
    this.setState({
      selectedRows: []
    })
    this.props.handleModalVisible(false);
  };

  getList = values => {
    const { addList: { pageNum, pageSize }, groupId } = this.props;
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
      type: 'product/fetchAddList',
      payload: data,
    });
  };

  handleStandardTableChange = (pagination) => {
    const { current, pageSize } = pagination
    const { formValues, selectedRows } = this.state
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
      selectedRows: []
    });
    dispatch({
      type: 'product/fetchAddList',
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
    // console.log(this.state.selectedRows)
  }

  okHandle = e => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, groupId, afterOk } = this.props;
    const { selectedRows } = this.state
    let keys = []
    // console.log(selectedRows, 'selectedRows')
    selectedRows.forEach(item => {
      // console.log(item)
      keys.push(item)
    })
    console.log(keys, keys)
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.setState({
        confirmLoading: true,
      });
      fieldsValue.groupId = groupId
      fieldsValue.productIdList = keys
      if (fieldsValue.productIdList.length > 0) {
        fetchGroupProductAdd(fieldsValue)
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
      render: v => <Tag color={StatusColorMap[v]}>{StatusMap[v]}</Tag>,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: 80,
      align: 'center',
    },
  ]

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
                  placeholder="请输入商品名"
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
    const { modalVisible, form, handleModalVisible, currentItem, groupId, loadingList, addList, ...props } = this.props;
    const { confirmLoading, selectedRows } = this.state;
    const { getFieldValue } = form;
    return (
      <Modal
        width={800}
        title={'添加商品'}
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
        <div>{this.renderSearchForm()}</div>
        <StandardTable
          rowKey={(item, index) => { return item.id }}
          data={addList ? addList : {}}
          columns={this.columns()}
          onSelectRow={this.handleSelectRows}
          showSerialNumber={{ isShow: true }}
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
