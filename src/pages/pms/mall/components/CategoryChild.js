import React, { Component, Fragment } from 'react'
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import { Divider, Tag, Modal, message } from 'antd'
import { connect } from 'dva';
import moment from 'moment';
import { fetchCategoryChildren, fetchCategoryUpdateState, fetchCategoryDelete } from '@/services/product';
import ProductModal from './ProductModal'

const statusSetMap = {
  0: '启用',
  1: '停用',
  2: '启用'
}
const confirm = Modal.confirm;

@connect(state => ({
  childList: state.product.childList,
  loadingChildList: state.loading.effects['product/fetchCategoryChildren'],
}))
export default class TotalDetailTableWrapper extends Component {
  state = {
    list: [],
    productModalVisible: false,
    currentItem: {}
  }

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
      align: 'center',
      width: 80,
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
      width: 120,
      render: item => {
        return (
          <Fragment>
            <Fragment>
              <InlineButton onClick={() => this.handleProduct(item)}>修改</InlineButton>
              <Divider type="vertical" />
              <InlineButton type={item.showStatus === 1 ? 'danger' : 'success'} onClick={() => this.handleSetSort(item)}>{statusSetMap[item.showStatus]}</InlineButton>
              <Divider type="vertical" />
              <InlineButton type="danger" onClick={() => { this.handleCategoryDelete(item) }}>删除</InlineButton>
            </Fragment>
          </Fragment>
        );
      },
    },
  ];

  getList = () => {
    const { item } = this.props
    fetchCategoryChildren(item.id).then(res => {
      if (res) {
        this.setState({
          list: res
        })
      }
    })
  }

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
            this.getList()
          }
        })
      }
    })
  }

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
              this.getList();
            }
          })
      },
    });
  };

  componentDidMount() {
    this.getList()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.item !== this.props.item) {
      this.getList()
    }
  }

  render() {
    const { item, childList, loadingChildList } = this.props
    const { list, productModalVisible, currentItem } = this.state

    return (
      <div>
        <StandardTable
          bordered={false}
          rowKey={(item, index) => index}
          data={list}
          columns={this.categoryColumns()}
          loading={loadingChildList}
          showSerialNumber={{ isShow: false }}
          onChange={this.handleTableChange}
          scroll={{ x: 'max-content', y: 500 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
        />
        <ProductModal
          modalVisible={productModalVisible}
          handleModalVisible={this.handleProductModalVisible}
          currentItem={currentItem}
          type={1}
          afterOk={() => {this.getList()}}
          title={'二级分类'}
        />
      </div>
    )
  }
}