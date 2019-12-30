import React, { Component, Fragment } from 'react';
import config from '@/config';
import { PageHeader, Form, DatePicker, Row, Col, Input, Button, Divider, Tabs, Modal, message, Tag, Table, Icon } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import CategoryChild from './components/CategoryChild'
import GroupModal from './components/GroupModal'
import ProductModal from './components/ProductModal'
import GroupCountModal from './components/GroupCountModal'
import AddProductModal from './components/AddProductModal'
import CategoryChildrenModal from './components/CategoryChildrenModal'
import { fetchCourseDelete, fetchOptionUpordown } from '@/services/group';
import { fetchCategoryDelete, fetchCategoryUpdateState, fetchGroupDelete, fetchDisable, fetchEnable, fetchAddressDelete, fetchAddressUpdateState } from '@/services/product'
import SortModal from './components/SortModal'

const FormItem = Form.Item;
const { TabPane } = Tabs;
const confirm = Modal.confirm;

const statusSetMap = {
  0: '启用',
  1: '停用',
  2: '启用'
}

const typeMap = {
  1: '商品分类',
  2: '退货地址',
  22: '服务承诺',
}

@Form.create()
@connect(state => ({
  categoryList: state.product.categoryList,
  loadingCategoryList: state.loading.effects['product/fetchProductCategory'],
  groupList: state.product.groupList,
  loadingList: state.loading.effects['product/fetchGroupList'],
  deleteList: state.product.deleteList,
  addList: state.product.addList,
  productOptionList: state.group.courseList,
  loadingProductList: state.loading.effects['group/fetchCourseList'],
  courseBasisList: state.course.courseList,
  loadingDetailList: state.loading.effects['product/fetchAddList'],
  addressList: state.product.addressList,
  loadingAddressList: state.loading.effects['product/fetchAddressList'],
  loading: state.loading.models.group,
}))
export default class groupList extends Component {
  state = {
    formValues: {},
    currentItem: {},
    modalVisible: false,
    productModalVisible: false,
    typeState: 1,
    groupId: '',
    groupCountmodalVisible: false,
    addModalVisible: false,
    categoryModalVisible: false,
    expandedRowKeys: [],
    sortModalVisible: false
  };

  groupColumns = () => [
    {
      title: '商品分组',
      dataIndex: 'groupName',
      width: 100,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'addTime',
      width: 130,
      align: 'center',
      render: v => {
        return moment(v).format('YYYY/MM/DD HH:mm');
      },
    },
    {
      title: '商品数',
      align: 'center',
      width: 80,
      render: item => {
        return (
          <Fragment>
            <InlineButton onClick={() => this.handleGroupCount(item)}>{item.productNum}</InlineButton>
          </Fragment>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'state',
      width: 100,
      align: 'center',
      render: v => {
        return v == 1 ? <Tag color='green'>已启用</Tag> : <Tag color='red'>已停用</Tag>
      }
    },
    {
      title: '操作',
      align: 'center',
      width: 180,
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
              <InlineButton onClick={() => this.handleAddProduct(item)}>添加商品</InlineButton>
            </Fragment>
          </Fragment>
        );
      },
    },
  ];

  categoryColumns = () => [
    {
      title: '商品分类',
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
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      align: 'center',
      editable: true,
      render: (item, key) => {
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
      title: '状态',
      dataIndex: 'showStatus',
      width: 100,
      align: 'center',
      render: v => {
        return v == 1 ? <Tag color='green'>已启用</Tag> : <Tag color='red'>已停用</Tag>
      }
    },
    {
      title: '操作',
      align: 'center',
      width: 200,
      render: item => {
        return (
          <Fragment>
            <Fragment>
              <InlineButton onClick={() => this.handleProduct(item)}>修改</InlineButton>
              <Divider type="vertical" />
              <InlineButton type={item.showStatus === 1 ? 'danger' : 'success'} onClick={() => this.handleSetSort(item)}>{statusSetMap[item.showStatus]}</InlineButton>
              <Divider type="vertical" />
              <InlineButton type="danger" onClick={() => { this.handleCategoryDelete(item) }}>删除</InlineButton>
              <Divider type="vertical" />
              <InlineButton onClick={() => { this.handleCategoryChild(item) }}>添加二级分类</InlineButton>
            </Fragment>
          </Fragment>
        );
      },
    },
  ];

  columns22 = () => [
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
              <InlineButton onClick={() => this.handleProduct(item)}>修改</InlineButton>
              <Divider type="vertical" />
              <InlineButton type="danger" onClick={() => { this.handleDelete(item) }}>删除</InlineButton>
            </Fragment>
          </Fragment>
        );
      },
    },
  ];

  addressColumns = () => [
    {
      title: '联系人',
      dataIndex: 'name',
      width: 90,
      align: 'center',
    },
    {
      title: '地址',
      width: 200,
      align: 'center',
      render: v => v.area.replace(/[\/]/g, "") + v.detailAddress
    },
    {
      title: '地址类型',
      width: 100,
      align: 'center',
      render: v => {
        return (
          v.receiveStatus == 1 ?
            <span>默认地址</span> :
            <InlineButton onClick={() => this.handleAddressSet(v)}>设为默认</InlineButton>)
      }
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
              <InlineButton onClick={() => this.handleProduct(item)}>编辑</InlineButton>
              <Divider type="vertical" />
              <InlineButton type="danger" onClick={() => { this.handleDeleteAddress(item) }}>删除</InlineButton>
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
      type: 'product/fetchGroupList',
      payload: data,
    });
  };


  getCategoryList = values => {
    const { categoryList: { pageNum, pageSize } } = this.props;
    const { formValues } = this.state;
    if (values === null || values === undefined) {
      values = {
        ...formValues,
        pageNum,
        pageSize
      };
    }
    let data = {};
    for (let i in values) {
      if (values[i] !== '' && values[i] !== undefined && values[i] !== null) {
        data[i] = values[i];
      }
    }
    this.props.dispatch({
      type: 'product/fetchProductCategory',
      payload: data,
    });
  };

  getAddressList = values => {
    const { addressList: { pageNum, pageSize } } = this.props;
    const { formValues } = this.state;
    if (values === null || values === undefined) {
      values = {
        ...formValues,
        pageNum,
        pageSize
      };
    }
    let data = {};
    for (let i in values) {
      if (values[i] !== '' && values[i] !== undefined && values[i] !== null) {
        data[i] = values[i];
      }
    }
    this.props.dispatch({
      type: 'product/fetchAddressList',
      payload: data,
    });
  };

  getProductList = values => {
    const { productOptionList: { pageNum, pageSize } } = this.props;
    const { formValues } = this.state;
    if (values === null || values === undefined) {
      values = {
        ...formValues,
        pageNum,
        pageSize,
        relationType: 2
      };
    }
    let data = {};
    for (let i in values) {
      if (values[i] !== '' && values[i] !== undefined && values[i] !== null) {
        data[i] = values[i];
      }
    }
    data.relationType = 2
    this.props.dispatch({
      type: 'group/fetchCourseList',
      payload: data,
    });
  };

  handleDeleteClick = item => {
    // console.log(item);
    if (item.productNum !== 0) {
      Modal.error({
        title: '无法删除',
        content: '该分组下存在上架商品，请下架商品后再删除该类目。',
      });
    } else {
      confirm({
        title: '确定删除该分组吗？',
        onOk: () => {
          return fetchGroupDelete({
            id: item.id,
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

  handleCategoryDelete = item => {
    confirm({
      title: `确定删除该分类吗?`,
      onOk: () => {
        return fetchCategoryDelete({
          id: item.id
        })
          .then((data) => {
            if (data) {
              message.success('删除成功');
              this.getCategoryList();
            }
          })
      },
    });
  };

  handleDelete = item => {
    const { typeState } = this.state
    confirm({
      title: `确定删除该${typeMap[typeState]}吗?`,
      onOk: () => {
        return fetchCourseDelete({
          ids: item.id,
          relationType: 2
        })
          .then((data) => {
            if (data) {
              message.success('删除成功');
              this.getProductList({ type: typeState, relationType: 2 });
            }
          })
      },
    });
  };

  handleAddressSet = (item) => {
    console.log(item, 'item')
    confirm({
      title: `确定要设为默认地址吗?`,
      onOk: () => {
        const id = item.id
        fetchAddressUpdateState({ id, receiveStatus: 1 }).then((data) => {
          if (data) {
            message.success(`已设为默认地址`)
            this.getAddressList(null)
          }
        })
      }
    })
  }

  handleDeleteAddress = item => {
    confirm({
      title: `确定删除该退货地址吗?`,
      onOk: () => {
        return fetchAddressDelete({
          ids: item.id,
        })
          .then((data) => {
            if (data) {
              message.success('删除成功');
              this.getAddressList(null);
            }
          })
      },
    });
  };

  handleSet = (item) => {
    confirm({
      title: `确定要${statusSetMap[item.state]}该分组吗?`,
      onOk: () => {
        const id = item.id
        const curStatus = item.state
        const state = curStatus === 1 ? 2 : 1
        let fetch = curStatus == 1 ? fetchDisable : fetchEnable;
        fetch({ id }).then((data) => {
          if (data) {
            message.success(`${statusSetMap[item.state]}成功`)
            this.getList(null)
          }
        })
      }
    })
  }

  handleSetSort = (item) => {
    console.log(item)
    confirm({
      title: `确定要${statusSetMap[item.showStatus]}该分类吗?`,
      onOk: () => {
        const ids = []
        ids.push(item.id)
        const curStatus = item.showStatus
        const state = curStatus === 1 ? 0 : 1
        fetchCategoryUpdateState({ ids, showStatus: state }).then((data) => {
          if (data) {
            message.success(`${statusSetMap[item.showStatus]}成功`)
            this.getCategoryList()
          }
        })
      }
    })
  }

  handleTableChange = (pagination) => {
    const { current, pageSize } = pagination
    const { formValues } = this.state
    this.getCategoryList({
      pageNum: current,
      pageSize,
      ...formValues
    })
  }

  handleAddressChange = (pagination) => {
    const { current, pageSize } = pagination
    const { formValues } = this.state
    this.getAddressList({
      pageNum: current,
      pageSize,
      ...formValues
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
    this.getProductList({
      pageNum: current,
      pageSize,
      type: typeState,
      relationType: 2,
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

  handleProductModalVisible = (flag = false) => {
    this.setState({
      productModalVisible: !!flag,
    });
  };


  handleProduct = (item = {}) => {
    this.setState({
      currentItem: item,
    });
    this.handleProductModalVisible(true);
  };

  handleGroupCountmodalVisible = (flag = false) => {
    this.setState({
      groupCountmodalVisible: !!flag,
    });
  };


  handleGroupCount = (item = {}) => {
    this.setState({
      currentItem: item,
    });
    this.props.dispatch({
      type: 'product/fetchDeleteList',
      payload: {
        groupId: item.id
      }
    });
    this.setState({
      groupId: item.id
    })
    this.handleGroupCountmodalVisible(true);
  };

  handleAddProduct = (item = {}) => {
    // console.log(item);
    this.setState({
      currentItem: item,
    });
    this.props.dispatch({
      type: 'product/fetchAddList',
      payload: {
        groupId: item.id
      }
    });
    this.setState({
      groupId: item.id
    })
    this.handleAddModalVisible(true);
  };

  handleAddModalVisible = (flag = false) => {
    this.setState({
      addModalVisible: !!flag,
    });
  };

  handleCategoryChild = (item) => {
    this.setState({
      currentItem: item,
    });
    this.handleCategoryModalVisible(true);
  };

  handleCategoryModalVisible = (flag = false) => {
    this.setState({
      categoryModalVisible: !!flag,
    });
  };

  handExpandedRowsChange = (arr) => {
    this.setState({
      expandedRowKeys: arr
    })
  }


  onChange = (item) => {
    if (item == 0) {
      this.props.dispatch({
        type: 'product/fetchGroupList',
        payload: {},
      })
    }
    if (item == 1) {
      this.props.dispatch({
        type: 'product/fetchProductCategory',
        payload: {},
      })
    }
    if (item == 2) {
      this.props.dispatch({
        type: 'product/fetchAddressList',
        payload: {},
      })
    }
    if (item == 22) {
      this.props.dispatch({
        type: 'group/fetchCourseList',
        payload: {
          type: item,
          relationType: 2
        },
      })
    }
    this.setState({
      typeState: item
    })
  }

  handleSortEdit = (item = {}) => {
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

  componentDidMount() {
    this.props.dispatch({
      type: 'product/fetchGroupList',
      payload: {},
    });
  }
  render() {
    const { categoryList, loadingCategoryList, groupList, loadingList, productOptionList, loadingProductList, deleteList, loadingDetailList, addList, courseBasisList, addressList, loadingAddressList } = this.props;
    const { currentItem, modalVisible, productModalVisible, typeState, groupCountmodalVisible, groupId, addModalVisible, categoryModalVisible, expandedRowKeys, sortModalVisible } = this.state;
    return (
      <div>
        <Tabs onChange={this.onChange}>
          <TabPane tab="商品分组" key="0">
            <PageHeader title="商品分组">
              <Button type="primary" htmlType="submit" onClick={this.handleGroup} style={{ marginTop: '10px' }}>新建分组 </Button>
              <StandardTable
                rowKey={(item, index) => index}
                data={groupList ? groupList : {}}
                columns={this.groupColumns()}
                loading={loadingList}
                showSerialNumber={{ isShow: true }}
                onChange={this.handleStandardTableChange}
                scroll={{ x: 'max-content', y: 500 }}
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
            <GroupCountModal
              modalVisible={groupCountmodalVisible}
              handleModalVisible={this.handleGroupCountmodalVisible}
              currentItem={currentItem}
              deleteList={deleteList}
              groupId={groupId}
              afterOk={() => {
                this.getList(null);
              }}
            />
            <AddProductModal
              modalVisible={addModalVisible}
              handleModalVisible={this.handleAddModalVisible}
              currentItem={currentItem}
              addList={addList}
              loadingList={loadingDetailList}
              groupId={groupId}
              afterOk={() => {
                this.getList(null);
              }}
            />
          </TabPane>
          <TabPane tab="商品分类" key="1">
            <PageHeader title="商品分类">
              <Button type="primary" htmlType="submit" onClick={this.handleProduct} style={{ marginTop: '10px' }}>
                新建分类
        </Button>
              <StandardTable
                bordered={false}
                rowKey={(item, index) => index}
                data={categoryList ? categoryList : {}}
                columns={this.categoryColumns()}
                loading={loadingCategoryList}
                showSerialNumber={{ isShow: false }}
                onChange={this.handleTableChange}
                expandedRowKeys={expandedRowKeys}
                onExpandedRowsChange={this.handExpandedRowsChange}
                expandedRowRender={(item) => <CategoryChild item={item} />}
                scroll={{ x: 'max-content', y: 500 }}
                style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
              />
              <CategoryChildrenModal
                modalVisible={categoryModalVisible}
                handleModalVisible={this.handleCategoryModalVisible}
                currentItem={currentItem}
                afterOk={() => {
                  this.getCategoryList(null);
                }}
              />
            </PageHeader>
            <SortModal
              modalVisible={sortModalVisible}
              handleModalVisible={this.handleSortModalVisible}
              currentItem={currentItem}
              afterOk={() => {
                this.getCategoryList(null);
              }}
            />
          </TabPane>
          <TabPane tab="服务承诺" key="22">
            <PageHeader title="服务承诺">
              <Button type="primary" htmlType="submit" onClick={this.handleProduct} style={{ marginTop: '10px' }}>
                新建服务承诺
        </Button>
              <StandardTable
                rowKey={(item, index) => index}
                data={productOptionList ? productOptionList : {}}
                columns={this.columns22()}
                loading={loadingProductList}
                onChange={this.handleCourseTableChange}
                scroll={{ x: 'max-content', y: 500 }}
                style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
              />
            </PageHeader>
          </TabPane>
          <TabPane tab="退货地址" key="2">
            <PageHeader title="退货地址">
              <Button type="primary" htmlType="submit" onClick={this.handleProduct} style={{ marginTop: '10px' }}>
                新建退货地址
        </Button>
              <StandardTable
                rowKey={(item, index) => index}
                data={addressList ? addressList : {}}
                columns={this.addressColumns()}
                loading={loadingAddressList}
                onChange={this.handleAddressChange}
                showSerialNumber={{ isShow: true }}
                scroll={{ x: 'max-content', y: 500 }}
                style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
              />
            </PageHeader>
          </TabPane>
        </Tabs>
        <ProductModal
          modalVisible={productModalVisible}
          handleModalVisible={this.handleProductModalVisible}
          currentItem={currentItem}
          type={Number(typeState)}
          afterOk={() => {
            typeState == 1 ?
              this.getCategoryList(null) :
              typeState == 2 ?
                this.getAddressList(null) :
                this.getProductList({ type: typeState });
          }}
          title={`${typeMap[typeState]}`}
        />
      </div>
    );
  }
}
