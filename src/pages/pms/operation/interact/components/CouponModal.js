import React, { Component, forwardRef } from 'react';
import { Modal, Input, Radio, Row, Checkbox, Col, Cascader, InputNumber, Select, Form, Button } from 'antd';
import { connect } from 'dva';
import options from '@/utils/cities';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import FormItem from 'antd/lib/form/FormItem';
import RadioInput from '@/components/RadioInput'
import { createCoupon, updateCoupon } from '@/services/coupon'
import InlineButton from '@/components/InlineButton';

const RadioGroup = Radio.Group;
const { Option } = Select;
const { TextArea } = Input;

@Form.create()
@connect((state) => ({
  courseList: state.course.courseList,
  productList: state.product.productList,
  productLoading: state.loading.effects['product/fetchList'],
  courseLoading: state.loading.effects['course/fetchList'],
  categoryTreeList: state.product.categoryTreeList,
}))
export default class CouponModal extends Component {
  constructor(props) {
    super(props)
    this.inputNumber;
  }
  state = {
    confirmLoading: false,
    tableModalVisible: false,
    formValues: {},
    selectedRows: [],
    hasSelected: [],
  };
  cascaderData = (arry) => {
    let data = [];
    data = arry.map(item => {
      item.value = item.id;
      item.label = item.name;
      item.children = item.children.length > 0 && this.cascaderData(item.children);
      return item;
    })
    return data;
  }
  okHandle = e => {
    e.preventDefault();
    const { form, handleModalVisible, afterOk, currentItem, operateType, relationType } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.setState({
        confirmLoading: true,
      });
      let fetch;
      let params = {};
      if (operateType == 'isEdit') {
        fetch = updateCoupon;
        params.id = currentItem.id;
        params.publishCount = fieldsValue.publishCount;
      } else {
        // 新增
        fetch = createCoupon;
        fieldsValue.relationType = relationType;
        if (fieldsValue.source.radioCheck == 1 || fieldsValue.source.radioCheck == 2) {
          fieldsValue.giftRules = fieldsValue.source.data[0].inputConfig.value;
        } else {
          fieldsValue.giftRules = null
        }
        if (fieldsValue.useType != 0) {
          fieldsValue.productIdList = this.state.hasSelected
        }
        fieldsValue.source = fieldsValue.source.radioCheck;
        if (fieldsValue.minPoint.radioCheck == 0) {
          fieldsValue.minPoint = 0;
        } else {
          fieldsValue.minPoint = fieldsValue.minPoint.data[0].inputConfig.value;
        }
        if (fieldsValue.useTimeRules.radioCheck == 1) {
          fieldsValue.day = fieldsValue.useTimeRules.data[0].inputConfig.value;
          fieldsValue.useTimeRules = fieldsValue.useTimeRules.radioCheck;
        } else if (fieldsValue.useTimeRules.radioCheck == 2) {
          fieldsValue.day = fieldsValue.useTimeRules.data[1].inputConfig.value;
          fieldsValue.useTimeRules = fieldsValue.useTimeRules.radioCheck;
        } else {
          fieldsValue.startTime = moment(fieldsValue.useTimeRules.data[2].dateConfig.value[0]).format('YYYY-MM-DD HH:mm:ss')
          fieldsValue.endTime = moment(fieldsValue.useTimeRules.data[2].dateConfig.value[1]).format('YYYY-MM-DD HH:mm:ss')
          fieldsValue.useTimeRules = fieldsValue.useTimeRules.radioCheck;
        }
        params = fieldsValue;
      }
      fetch(params).then(d => {
        if (d) {
          handleModalVisible(false);
          this.setState({
            confirmLoading: false,
          });
          form.resetFields();
          this.setState({ hasSelected: [], selectedRows: [] })
          afterOk();
        } else {
          this.setState({
            confirmLoading: false,
          });
        }
      })


    })
  }
  handleFormReset = () => {
    const { form, dispatch, relationType } = this.props

    form.resetFields(['keyword', 'productCategoryIdsList', 'courseName'])
    this.setState({
      formValues: {},
    })
    if (relationType == 1) {
      dispatch({
        type: 'course/fetchList',
        payload: {},
      })
    } else {
      dispatch({
        type: 'product/fetchList',
        payload: {},
      })
    }
  }
  handleSearch = (e) => {
    e.preventDefault()
    const { form, relationType, dispatch } = this.props
    let values;
    if (relationType == 1) {
      values = form.getFieldsValue(['courseName']);
      dispatch({
        type: 'course/fetchList',
        payload: {
          ...values,
        },
      })
    } else {
      values = form.getFieldsValue(['keyword', 'productCategoryIdsList']);
      if (values.productCategoryIdsList && values.productCategoryIdsList.length > 0) {
        values.productCategoryId = values.productCategoryIdsList[values.productCategoryIdsList.length - 1]
        delete values.productCategoryIdsList
      }
      dispatch({
        type: 'product/fetchList',
        payload: {
          ...values,
        },
      })
    }
    this.setState({
      formValues: { ...values },
    })
  }
  handleStandardTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination
    const { relationType, dispatch } = this.props;
    const { formValues } = this.state;
    if (relationType == 1) {
      dispatch({
        type: 'course/fetchList',
        payload: {
          ...formValues,
          pageNum: current,
          pageSize
        },
      })
    } else {
      dispatch({
        type: 'product/fetchList',
        payload: {
          ...formValues,
          pageNum: current,
          pageSize
        },
      })
    }
  }
  handleSelectRows = (selectedRowKeys, keys) => {
    this.setState({ selectedRows: keys })
  }
  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form
    const { categoryTreeList = [], relationType } = this.props
    return (
      <Form onSubmit={this.handleSearch} >
        <Row gutter={24}>
          {relationType == 1 && <Col span={5}>
            <FormItem label="">
              {getFieldDecorator('courseName', {})(<Input placeholder="请输入课程名称" />)}
            </FormItem>
          </Col>}
          {relationType == 2 && <>
            <Col span={5}>
              <FormItem>
                {getFieldDecorator('keyword')(<Input placeholder="请输入商品名" />)}
              </FormItem>
            </Col>
            <Col span={5}>
              <FormItem label="">
                {getFieldDecorator('productCategoryIdsList')(
                  <Cascader style={{ width: '100%' }} options={this.cascaderData(categoryTreeList)} placeholder="请选择商品分类"></Cascader>
                )}
              </FormItem>
            </Col>
          </>}

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
      </Form>)
  }
  renderTableColumns = () => {
    const { relationType } = this.props;
    let columns = [];
    if (relationType == 1) {
      columns = [{
        title: '课程名称',
        width: 220,
        align: 'center',
        dataIndex: 'courseName'
      }, {
        title: '价格',
        width: 220,
        align: 'center',
        dataIndex: 'coursePrice'
      }, {
        title: '状态',
        width: 220,
        align: 'center',
        dataIndex: 'courseState',
        render: v => v == 0 ? '未上架' : v == 1 ? '上架中' : '已下架'
      }]
    } else {
      columns = [{
        title: '商品名称',
        width: 220,
        align: 'center',
        dataIndex: 'name'
      }, {
        title: '价格',
        width: 220,
        align: 'center',
        dataIndex: 'price'
      }, {
        title: '状态',
        width: 220,
        align: 'center',
        dataIndex: 'publishStatus',
        render: v => v == 0 ? '下架' : '上架'
      }]
    }
    return columns;
  }
  render() {
    const { form, modalVisible, handleModalVisible, currentItem, operateType, courseList, productList, relationType, productLoading, courseLoading, ...props } = this.props;
    const { confirmLoading, tableModalVisible, selectedRows } = this.state;
    const { getFieldDecorator } = form;
    let tableData = relationType == 1 ? courseList : productList;
    return (
      <Modal
        width={600}
        title={'优惠券'}
        visible={modalVisible}
        maskClosable={false}
        confirmLoading={confirmLoading}
        footer={operateType == 'isView' ? null : undefined}
        onOk={this.okHandle}
        onCancel={() => {
          this.props.form.resetFields();
          this.setState({ hasSelected: [], selectedRows: [] })
          handleModalVisible(false);
        }}
        bodyStyle={{
          top: '100px',
          maxHeight: '1200px',
          paddingLeft: '15',
          paddingRight: '15',
        }}
        {...props}
      >
        <h3>基本信息</h3>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='优惠券名'>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: currentItem.name
          })(
            <Input disabled={operateType == 'isView' || operateType == 'isEdit'} placeholder='请输入优惠券名称' />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='发放数量'>
          {getFieldDecorator('publishCount', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: currentItem.publishCount
          })(
            <InputNumber disabled={operateType == 'isView'} min={1} max={99999} placeholder='请输入' />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='发放渠道' >
          {getFieldDecorator('source', {
            rules: [{
              required: true, validator: (rule, value, callback) => {
                if (value.radioCheck == 99 || value.radioCheck == 3 || value.data[0].inputConfig.value > 0) {
                  callback();
                  return;
                }
                callback('必须大于0')
              }
            },],
            initialValue: {
              radioCheck: currentItem.source || 1,
              data: [{
                withInput: true,
                inputConfig: {
                  suffix: '元',
                  value: (currentItem.source == 1 || currentItem.source == 2)? currentItem.giftRules : ''
                },
                title: relationType == 1 ? '购买商品满' : '购买课程满',
                value: relationType == 1 ? 2 : 1,
              }, {
                title: '小程序领取',
                value: 3,
              },
              {
                title: '其他',
                value: 99,
              }]
            }
          })(
            <RadioInput disabled={operateType == 'isView' || operateType == 'isEdit'} />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label={relationType == 1 ? '适用课程' : '适用商品'}>
          {getFieldDecorator('useType', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: currentItem.useType || 0
          })(
            <RadioGroup disabled={operateType == 'isView' || operateType == 'isEdit'}>
              <Radio value={0}>{relationType == 1 ? '全部课程可用' : '全部商品可用'}</Radio>
              <Radio value={2}>{relationType == 1 ? '选定课程' : '选定商品'}</Radio>
            </RadioGroup>
          )}
          {
            operateType == 'isAdd' ? (form.getFieldValue('useType') == 2 && <InlineButton onClick={() => {
              if (relationType == 1) {
                this.props.dispatch({
                  type: 'course/fetchList',
                  payload: {},
                })
              } else {
                this.props.dispatch({
                  type: 'product/fetchList',
                  payload: {},
                })
              }
              this.setState({ tableModalVisible: true })
            }}>{this.state.hasSelected.length == 0 ? `选择${relationType == 1 ? '课程' : '商品'}` : `已选择${relationType == 1 ? '课程' : '商品'}(${this.state.hasSelected.length})`}</InlineButton>) : form.getFieldValue('useType') == 2 ? `已选择${relationType == 1 ? '课程' : '商品'}(${currentItem.productIdList.length})` : ''
          }

        </FormItem>
        <Modal width={800}
          title={relationType == 1 ? '课程列表' : '商品列表'}
          visible={tableModalVisible}
          maskClosable={false}
          onCancel={() => {
            form.resetFields(['keyword', 'productCategoryIdsList', 'courseName'])
            this.setState({ tableModalVisible: false, selectedRows: this.state.hasSelected })
          }}
          onOk={() => {
            form.resetFields(['keyword', 'productCategoryIdsList', 'courseName'])
            this.setState({ tableModalVisible: false, hasSelected: this.state.selectedRows })
          }}
          bodyStyle={{
            top: '100px',
            paddingLeft: '15',
            paddingRight: '15',
          }}
        >
          <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
          <StandardTable
            rowKey="id"
            data={tableData}
            loading={relationType == 1 ? courseLoading : productLoading}
            columns={this.renderTableColumns()}
            onChange={this.handleStandardTableChange}
            onSelectRow={this.handleSelectRows}
            selectedRows={selectedRows}
            showSelectedRows={true}
            scroll={{ x: 'max-content', y: 600 }}
            style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
          ></StandardTable>
        </Modal>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='使用门槛'>
          {getFieldDecorator('minPoint', {
            rules: [{
              required: true, validator: (rule, value, callback) => {
                if (value.radioCheck == 0 || value.data[0].inputConfig.value > 0) {
                  callback();
                  return;
                }
                callback('必须大于0')
              }
            }],
            initialValue: {
              radioCheck: currentItem.minPoint,
              data: [{
                withInput: true,
                inputConfig: {
                  suffix: '元',
                  value: currentItem.minPoint != 0 ? currentItem.minPoint : ''
                },
                title: '订单满',
                value: currentItem.minPoint != 0 ? currentItem.minPoint : '1',
              }, {
                title: '无门槛',
                value: 0,
              }]
            }
          })(
            <RadioInput disabled={operateType == 'isView' || operateType == 'isEdit'} />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='优惠内容'>
          减免 {getFieldDecorator('amount', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: currentItem.amount
          })(
            <InputNumber disabled={operateType == 'isView' || operateType == 'isEdit'} min={0} />
          )} 元
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='使用时间'>
          {getFieldDecorator('useTimeRules', {
            rules: [{
              required: true, message: '请输入', validator: (rule, value, callback) => {
                if (value.radioCheck == 1 && value.data[0].inputConfig.value > 0) {
                  callback();
                  return;
                } else if (value.radioCheck == 2 && value.data[1].inputConfig.value > 0) {
                  callback();
                  return;
                } else if (value.radioCheck == 3 && value.data[2].dateConfig.value.length > 0) {
                  callback();
                  return;
                }
                callback('请输入');

              }
            }],
            initialValue: {
              radioCheck: currentItem.useTimeRules || 1,
              data: [{
                withInput: true,
                inputConfig: {
                  suffix: '天内可用',
                  value: currentItem.useTimeRules == 1 ? currentItem.day : ''
                },
                title: '领券当日',
                value: 1,
              }, {
                withInput: true,
                inputConfig: {
                  suffix: '天内可用',
                  value: currentItem.useTimeRules == 2 ? currentItem.day : ''
                },
                title: '领券次日',
                value: 2,
              }, {
                withDate: true,
                dateConfig: {
                  value: currentItem.useTimeRules == 3 ? [moment(currentItem.startTime), moment(currentItem.endTime)] : []
                },
                title: '',
                value: 3,
              }]
            }
          })(
            <RadioInput disabled={operateType == 'isView' || operateType == 'isEdit'} />
          )}
        </FormItem>
        <h3>领取和使用限制</h3>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='领取人限制'>
          {getFieldDecorator('limit', {
            rules: [{ required: true, message: '请选择' }],
            initialValue: 0
          })(
            <RadioGroup disabled={operateType == 'isView' || operateType == 'isEdit'}>
              <Radio value={0}>无限制，所有人可领</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='领取次数'>
          每人限领 {getFieldDecorator('perLimit', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: currentItem.perLimit || 1
          })(
            <InputNumber disabled={operateType == 'isView' || operateType == 'isEdit'} min={1} max={10} />
          )} 张
        </FormItem>
        <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label='是否与其他优惠共用'>
          {getFieldDecorator('otherDiscount', {
            rules: [{ required: true, message: '请选择' }],
            initialValue: currentItem.otherDiscount || 0
          })(
            <RadioGroup disabled={operateType == 'isView' || operateType == 'isEdit'}>
              <Radio value={0}>否</Radio>
              <Radio value={1}>是</Radio>
            </RadioGroup>
          )}
        </FormItem>
      </Modal>
    );
  }
}


