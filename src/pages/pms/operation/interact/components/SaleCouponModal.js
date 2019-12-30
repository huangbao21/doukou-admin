import React, { Component, forwardRef } from 'react';
import { Modal, Input, Radio, Row, Checkbox, Col, Cascader, InputNumber, Select, Form, Button, DatePicker } from 'antd';
import { connect } from 'dva';
import options from '@/utils/cities';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import FormItem from 'antd/lib/form/FormItem';
import RadioInput from '@/components/RadioInput'
import { createCoupon } from '@/services/salecoupon'
import InlineButton from '@/components/InlineButton';

const RadioGroup = Radio.Group;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

@Form.create()
@connect((state) => ({
  courseList: state.course.courseList,
  productList: state.product.productList,
  productLoading: state.loading.effects['product/fetchList'],
  courseLoading: state.loading.effects['course/fetchList'],
}))
export default class SalecouponModal extends Component {
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
      // 新增
      fetch = createCoupon;
      fieldsValue.type = relationType;
      // 适用商品
      if (fieldsValue.matchProductType != 0) {
        fieldsValue.matchProductCourseIds = this.state.hasSelected
      }
      if (fieldsValue.ruleType.radioCheck == 0) {
        fieldsValue.ruleMatchMoney = fieldsValue.ruleType.data[0].inputConfig.value;
      } else {
        fieldsValue.ruleMatchMoney = fieldsValue.ruleType.data[1].inputConfig.value;
      }
      fieldsValue.ruleType = fieldsValue.ruleType.radioCheck;
      fieldsValue.startTime = fieldsValue.useTime[0];
      fieldsValue.endTime = fieldsValue.useTime[1];
      if (fieldsValue.limitNumberType.radioCheck == 1) {
        fieldsValue.limitNumber = fieldsValue.limitNumberType.data[1].inputConfig.value;
      }
      fieldsValue.limitNumberType = fieldsValue.limitNumberType.radioCheck;
      params = fieldsValue;
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

    form.resetFields(['keyword', 'courseName'])
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
      values = form.getFieldsValue(['keyword']);
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
    const { relationType } = this.props
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
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='满减活动'>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: currentItem.name
          })(
            <Input disabled={operateType == 'isView' || operateType == 'isEdit'} placeholder='请输入满减活动名称' />
          )}
        </FormItem>

        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='使用规则'>
          {getFieldDecorator('ruleType', {
            rules: [{
              required: true, validator: (rule, value, callback) => {
                if ((value.radioCheck == 0 && value.data[0].inputConfig.value > 0) || (value.radioCheck == 1 && value.data[1].inputConfig.value > 0)) {
                  callback();
                  return;
                }
                callback('必须大于0')
              }
            }],
            initialValue: {
              radioCheck: currentItem.ruleType || 0,
              data: [{
                withInput: true,
                inputConfig: {
                  suffix: '元',
                  value: currentItem.ruleType == 0 ? currentItem.ruleMatchMoney : ''
                },
                title: '订单满',
                value: 0
              }, {
                withInput: true,
                inputConfig: {
                  suffix: '元',
                  value: currentItem.ruleType == 1 ? currentItem.ruleMatchMoney : ''
                },
                title: '首单满',
                value: 1,
              }]
            }
          })(
            <RadioInput disabled={operateType == 'isView' || operateType == 'isEdit'} />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='优惠内容'>
          减免 {getFieldDecorator('ruleReductionMoney', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: currentItem.ruleReductionMoney
          })(
            <InputNumber disabled={operateType == 'isView' || operateType == 'isEdit'} min={0} />
          )} 元
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label={relationType == 1 ? '适用课程' : '适用商品'}>
          {getFieldDecorator('matchProductType', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: currentItem.matchProductType || 0
          })(
            <RadioGroup disabled={operateType == 'isView' || operateType == 'isEdit'}>
              <Radio value={0}>{relationType == 1 ? '全部课程可用' : '全部商品可用'}</Radio>
              <Radio value={1}>{relationType == 1 ? '选定课程' : '选定商品'}</Radio>
            </RadioGroup>
          )}
          {
            operateType == 'isAdd' ? (form.getFieldValue('matchProductType') == 1 && <InlineButton onClick={() => {
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
            }}>{this.state.hasSelected.length == 0 ? `选择${relationType == 1 ? '课程' : '商品'}` : `已选择${relationType == 1 ? '课程' : '商品'}(${this.state.hasSelected.length})`}</InlineButton>) : form.getFieldValue('matchProductType') == 1?`已选择${relationType == 1 ? '课程' : '商品'}(${currentItem.matchProductCourseIds.length})`:''
          }

        </FormItem>
        <Modal width={800}
          title={relationType == 1 ? '课程列表' : '商品列表'}
          visible={tableModalVisible}
          maskClosable={false}
          onCancel={() => {
            form.resetFields(['keyword', 'courseName'])
            this.setState({ tableModalVisible: false, selectedRows: this.state.hasSelected })
          }}
          onOk={() => {
            form.resetFields(['keyword', 'courseName'])
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
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='生效时间'>
          {getFieldDecorator('useTime',
            {
              rules: [{ required: true, message: '请选择时间' }],
              initialValue: currentItem.startTime ? [moment(currentItem.startTime),moment(currentItem.endTime)]:[]
            })(
              <RangePicker showTime={{ format: 'HH:mm:ss' }}  disabled={operateType == 'isView' || operateType == 'isEdit'}>
              </RangePicker>
            )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label='人数限制'>
          {getFieldDecorator('limitNumberType', {
            rules: [{
              required: true, validator: (rule, value, callback) => {
                if (value.radioCheck == 0 || value.data[1].inputConfig.value > 0) {
                  callback();
                  return;
                }
                callback('必须大于0')
              }
            }],
            initialValue: {
              radioCheck: currentItem.limitNumberType || 0,
              data: [{
                title: '无限制',
                value: 0
              }, {
                withInput: true,
                inputConfig: {
                  suffix: '人可享受优惠',
                  value: currentItem.limitNumberType == 1 ? currentItem.limitNumber : ''
                },
                title: '前',
                value: 1,
              }]
            }
          })(
            <RadioInput disabled={operateType == 'isView' || operateType == 'isEdit'} />
          )}

        </FormItem>
      </Modal>
    );
  }
}


