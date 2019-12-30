import React, { Component, Fragment } from 'react';
import config from '@/config';
import { PageHeader, Table, Divider, Form, message, Row, Col, DatePicker, Button, Input, Modal, Icon, Tabs, Select, Cascader } from 'antd';
import { connect } from 'dva'
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment'
import QuickModal from './components/QuickModal'
import { fetchProductPublish, deleteProduct } from '@/services/product';
import router from 'umi/router';

const FormItem = Form.Item
const confirm = Modal.confirm;
const { TabPane } = Tabs;
const RangePicker = DatePicker.RangePicker;
const { Option } = Select

@connect(({ product, loading, user }) => ({
  productList: product.productList,
  btnPermission: user.btnPermission,
  noskuList: product.noskuList,
  loading: loading.models.product,
  loadingList: loading.effects['product/fetchList'],
  loadingNosku: loading.effects['product/fetchNoskuList'],
  categoryTreeList: product.categoryTreeList,
}))
@Form.create()
export default class ProductPage extends Component {
  state = {
    formValues: {},
    quickModalVisible: false,
    currentItem: {},
    publishStatus: 1,
    title: ''
  }

  handleSearch = (e) => {
    e.preventDefault()
    const { form } = this.props
    const { publishStatus } = this.state
    form.validateFields((err, values) => {
      if (err) return
      if (values.date && values.date.length > 0) {
        values.createTimeSt = values.date[0].format('YYYY-MM-DD');
        values.createTimeEn = values.date[1].format('YYYY-MM-DD');
        delete values.date
      }
      if (values.productCategoryIdsList && values.productCategoryIdsList.length > 0) {
        values.productCategoryId = values.productCategoryIdsList[values.productCategoryIdsList.length - 1]
        delete values.productCategoryIdsList
      }
      values.publishStatus = publishStatus
      this.setState({
        formValues: { ...values },
      })
      this.getList(values)
    })
  }
  handleFormReset = () => {
    const { form, dispatch } = this.props
    const { publishStatus } = this.state
    form.resetFields()
    this.setState({
      formValues: {},
    })
    dispatch({
      type: 'product/fetchList',
      payload: {
        publishStatus
      },
    })
  }
  handleStandardTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination
    const { formValues, publishStatus } = this.state;
    this.getList({
      ...formValues,
      pageNum: current,
      pageSize,
      publishStatus
    })
  }

  getList = (values) => {
    const { formValues, publishStatus } = this.state
    const { productList: { pageNum, pageSize } } = this.props;
    if (!values) {
      values = {
        ...formValues,
        publishStatus,
        pageNum,
        pageSize
      }
    }
    if (publishStatus == 2) {
      this.props.dispatch({
        type: 'product/fetchNoskuList',
        payload: values
      })
    } else {

      this.props.dispatch({
        type: 'product/fetchList',
        payload: values
      })
    }
  }

  handleEditClick = (item, type) => {
    // console.log(item)
    if (type == 1) {
      this.setState({
        title: '商品名称'
      })
    } else if (type == 2) {
      this.setState({
        title: '排序'
      })
    } else if (type == 3) {
      this.setState({
        title: '价格'
      })
      this.props.dispatch({
        type: 'product/fetchQuickInfo',
        payload: item.id
      })
    } else if (type == 4) {
      this.props.dispatch({
        type: 'product/fetchQuickInfo',
        payload: item.id
      })
      this.setState({
        title: '库存'
      })
    }
    this.setState({
      currentItem: item,
    });
    this.handleQuickModalVisible(true);
  }

  handleQuickModalVisible = (flag = false) => {
    this.setState({
      quickModalVisible: !!flag,
    });
  };
  handleDeleteClick = (item) => {
    confirm({
      title: '删除后不可恢复，是否确认删除该商品?',
      onOk: () => {
        return deleteProduct({ ids: item.id }).then(res => {
          if (res) {
            message.success('删除成功')
            this.getList(null)
          }
        })
      }
    })
  }
  handleSet = (item) => {
    const statusText = item.publishStatus == 1 ? '下架' : '上架'
    confirm({
      title: `确定要${statusText}该商品吗?`,
      onOk: () => {
        const id = item.id
        const curStatus = item.publishStatus
        const state = curStatus == 1 ? 0 : 1
        fetchProductPublish({ id, publishStatus: state }).then((data) => {
          if (data) {
            message.success(`${statusText}成功`)
            this.getList(null)
          } else {
            message.success(`${statusText}失败`)
          }
        })
      }
    })
  }

  onChange = (item) => {
    // console.log(item, 'item')
    if (item == 2) {
      this.props.dispatch({
        type: 'product/fetchNoskuList',
        payload: {}
      })
    } else {
      this.props.dispatch({
        type: 'product/fetchList',
        payload: {
          publishStatus: item
        }
      })
    }
    this.setState({
      publishStatus: item
    })
  }

  handleComment = (item) => {
    // console.log(item)
    router.push({
      pathname: '/pms/mallshop/product/comment',
      query: {
        productId: item.id,
        productName: item.name
      },
    });
  }

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


  componentDidMount() {
    this.props.dispatch({
      type: 'product/fetchList',
      payload: {
        publishStatus: 1
      }
    })
    this.props.dispatch({
      type: 'product/fetchProductCategoryTreeList',
      payload: {}
    })
  }
  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form
    const { categoryTreeList = [] } = this.props
    return (
      <Form onSubmit={this.handleSearch} >
        <Row gutter={24}>
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
          <Col span={8}>
            <FormItem label="">
              {getFieldDecorator('date', { initialValue: [] })(<RangePicker placeholder={['创建开始时间', '创建结束时间']} />)}
            </FormItem>
          </Col>
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
      </Form>
    )
  }
  renderTableColumns = () => {
    return [
      {
        title: '商品',
        align: 'center',
        width: 200,
        render: item => {
          return (
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              {item.albumPics && item.albumPics.length > 0 ? <img style={{ marginRight: '10px', textAlign: 'left' }} src={item.albumPics.split(',')[0]} width="50" /> : null}
              <div>
                <p style={{ textAlign: 'left' }} >{item.name}<Icon type="edit" theme="twoTone" onClick={() => this.handleEditClick(item, 1)} style={{ marginLeft: '5px' }} />
                </p>
              </div>
            </div>
          )
        }
      },
      {
        title: '商品价格',
        dataIndex: 'price',
        align: 'center',
        width: 110,
        render: (item, key) => {
          // console.log(item,key)
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>{item}</div>
              <Icon type="edit" theme="twoTone" onClick={() => this.handleEditClick(key, 3)} style={{ marginLeft: '5px' }} />
            </div>
          )
        }
      },
      {
        title: '库存',
        dataIndex: 'stock',
        align: 'center',
        width: 90,
        render: (item, key) => {
          // console.log(item,key)
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>{item}</div>
              <Icon type="edit" theme="twoTone" onClick={() => this.handleEditClick(key, 4)} style={{ marginLeft: '5px' }} />
            </div>
          )
        }
      },
      {
        title: '访问量',
        width: 110,
        align: 'center',
        render: item => {
          return (
            <div>
              <p>访客量：{item.uvCount ? item.uvCount : 0}</p>
              <p>浏览量：{item.pvCount ? item.pvCount : 0}</p>
            </div>
          )
        }
      },
      {
        title: '销售量',
        dataIndex: 'sale',
        align: 'center',
        width: 80
      },
      {
        title: '评价',
        width: 130,
        align: 'center',
        render: item => {
          return (
            <InlineButton onClick={() => this.handleComment(item)}>
              <div>
                <p style={{ textAlign: 'left' }}>评价数：{item.commentCount}</p>
                <p style={{ textAlign: 'left' }}>好评率：{item.goodFeel}</p>
              </div>
            </InlineButton>
          )
        }
      },
      {
        title: '排序',
        dataIndex: 'sort',
        width: 90,
        align: 'center',
        editable: true,
        render: (item, key) => {
          // console.log(item,key)
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>{item}</div>
              <Icon type="edit" theme="twoTone" onClick={() => this.handleEditClick(key, 2)} style={{ marginLeft: '5px' }} />
            </div>
          )
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
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
        title: '操作',
        align: 'center',
        width: 150,
        render: item => {
          return (
            <Fragment>
              {
                this.props.btnPermission['202102'] && <InlineButton onClick={() => {
                  router.push(`/pms/mallshop/product/add?id=${item.id}`)
                }}>编辑</InlineButton>
              }
              {
                this.props.btnPermission['202103'] && (
                  this.state.publishStatus == '1' ? <>
                    <Divider type="vertical" />
                    <InlineButton type='danger' onClick={() => this.handleSet(item)}>下架</InlineButton>
                  </> : this.state.publishStatus == '0' ? <>
                    <Divider type="vertical" />
                    <InlineButton type='success' onClick={() => this.handleSet(item)}>上架</InlineButton>
                    <Divider type="vertical" />
                    <InlineButton type="danger" onClick={() => this.handleDeleteClick(item)}>删除</InlineButton>
                  </> : null
                )
              }
              {

              }
              {
                this.state.publishStatus == '' && <>
                  <Divider type="vertical" />
                  {item.publishStatus == '0' ? <>
                    <InlineButton type='success' onClick={() => this.handleSet(item)}>上架</InlineButton>
                    <Divider type="vertical" />
                    <InlineButton type="danger" onClick={() => this.handleDeleteClick(item)}>删除</InlineButton>
                  </>
                    :
                    <InlineButton type='danger' onClick={() => this.handleSet(item)}>下架</InlineButton>
                  }
                </>
              }
            </Fragment>
          );
        }
      }
    ]
  }

  render() {
    const { productList, loadingList, noskuList, loadingNosku } = this.props;
    const { quickModalVisible, currentItem, title } = this.state;
    return (
      <PageHeader title="商品列表">
        <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
        {
          this.props.btnPermission['202101'] && <Button type="primary" onClick={() => {
            router.push('/pms/mallshop/product/add')
          }}>添加商品</Button>
        }

        <Tabs onChange={this.onChange} defaultActiveKey="1">
          <TabPane tab="上架中" key="1">
            <StandardTable
              rowKey="id"
              data={productList || {}}
              loading={loadingList}
              showSerialNumber={{ isShow: true }}
              columns={this.renderTableColumns()}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 600 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
            ></StandardTable>
          </TabPane>
          <TabPane tab="仓库中" key="0">
            <StandardTable
              rowKey="id"
              data={productList || {}}
              loading={loadingList}
              showSerialNumber={{ isShow: true }}
              columns={this.renderTableColumns()}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 600 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
            ></StandardTable>
          </TabPane>
          <TabPane tab="已售罄" key="2">
            <StandardTable
              rowKey="id"
              data={noskuList}
              loading={loadingNosku}
              showSerialNumber={{ isShow: true }}
              columns={this.renderTableColumns()}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 600 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
            ></StandardTable>
          </TabPane>
          <TabPane tab="全部" key="">
            <StandardTable
              rowKey="id"
              data={productList || {}}
              loading={loadingList}
              showSerialNumber={{ isShow: true }}
              columns={this.renderTableColumns()}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 'max-content', y: 600 }}
              style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
            ></StandardTable>
          </TabPane>
        </Tabs>
        <QuickModal
          modalVisible={quickModalVisible}
          handleModalVisible={this.handleQuickModalVisible}
          currentItem={currentItem}
          title={title}
          afterOk={() => {
            this.getList(null);
          }}
        />
      </PageHeader>
    )
  }
}
