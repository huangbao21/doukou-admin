import React, { PureComponent, Fragment } from 'react'
import { Table, Alert, Button } from 'antd'
import styles from './index.less'

function initTotalList(columns) {
  const totalList = []
  columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 })
    }
  })
  return totalList
}

class StandardTable extends PureComponent {
  constructor(props) {
    super(props)
    const { columns, showSelectedRows, showBatchName, showBatchFunction } = props
    const needTotalList = initTotalList(columns)

    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      showSelectedRows: showSelectedRows,
      needTotalList,
      showBatchName,
      showBatchFunction
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // clean state
    if (nextProps.selectedRows && nextProps.selectedRows.length === 0) {
      const needTotalList = initTotalList(nextProps.columns)
      this.setState({
        selectedRowKeys: [],
        needTotalList,
        showSelectedRows: nextProps.showSelectedRows,
      })
    }
    if (this.props.selectedRows != nextProps.selectedRows && nextProps.selectedRows.length>0){
      this.setState({ selectedRowKeys: nextProps.selectedRows})
    }
  }
  sendVal = () => {
    const { selectedRowKeys, selectedRows } = this.state
    this.props.showBatchFunction(selectedRowKeys, selectedRows)
  }

  //选择改变触发事件
  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    let needTotalList = [...this.state.needTotalList]
    needTotalList = needTotalList.map(item => {
      return {
        ...item,
        total: selectedRows.reduce((sum, val) => {
          return sum + parseFloat(val[item.dataIndex], 10)
        }, 0),
      }
    })
    //向父级传值
    if (this.props.onSelectRow) {
      this.props.onSelectRow(selectedRows, selectedRowKeys)
    }

    this.setState({ selectedRowKeys, needTotalList, selectedRows })
  }

  onSelectAll = () => {
    this.props.onSelectAll()
  }
  handleTableChange = (pagination, filters, sorter) => {
    this.props.onChange(pagination, filters, sorter)
  }

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], [])
  }

  componentDidMount() {
    //必须在这里声明，所以 ref 回调可以引用它
    if (this.props.onRef) {
      this.props.onRef(this)
    }
  }

  render() {
    const { selectedRowKeys, showSelectedRows, needTotalList, showBatchFunction, showBatchName } = this.state
    const { data={}, showSerialNumber, loading, columns, rowKey, getCheckboxProps, ...props } = this.props

    let { list=[], pageNum, pageSize, total, totalPage } = data
    const pagination = { data: { pageNum, pageSize, total, totalPage } }
    const realColumns = columns.slice()
    const paginationProps = pagination === false ? false : {
      current: pageNum,
      pageSize: pageSize,
      total: total,
      totalPage: totalPage,
      showSizeChanger: true,
      showQuickJumper: true,
      defaultPageSize: 20,
      pageSizeOptions: ['20', '30', '50'],
      showTotal: total => `共 ${total} 条`,
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps
    }
    const hasSelected = selectedRowKeys.length > 0;
    //序号功能
    if (showSerialNumber && showSerialNumber.isShow) {
      const obj = {
        title: '序号',
        key: 'numeriacalOrder',
        width: showSerialNumber.width ? showSerialNumber.width : 65,
        align: 'center',
        fixed: showSerialNumber ? showSerialNumber.fixed : '',
        render: (v, item, index) => {
          if (pagination && paginationProps.current && paginationProps.pageSize) {
            return (paginationProps.current - 1) * paginationProps.pageSize + index + 1
          } else {
            return index + 1
          }
        }
      }
      realColumns.unshift(obj)
    }
    return (
      <div className={styles.standardTable} >
        {
          showSelectedRows && (<div className={styles.tableAlert}>
            <Alert
              message={
                <Fragment>
                  已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                {needTotalList.map(item => (
                    <span style={{ marginLeft: 8 }} key={item.dataIndex}>
                      {item.title}总计&nbsp;
                    <span style={{ fontWeight: 600 }}>
                        {item.render ? item.render(item.total) : item.total}
                      </span>
                    </span>
                  ))}
                  {showBatchName && showBatchFunction && (<a
                    type="primary"
                    onClick={this.sendVal}
                    disabled={!hasSelected}
                    style={{ marginLeft: 16 }}
                  >
                    {showBatchName}
                  </a>)}
                  <a
                    onClick={this.cleanSelectedKeys}
                    disabled={!hasSelected}
                    style={{ marginLeft: 24 }}>
                    清空
                </a>
                </Fragment>
              }
              type="info"
              showIcon
            />
          </div>)
        }
        <Table
          loading={loading}
          rowKey={rowKey || 'key'}
          rowSelection={showSelectedRows ? rowSelection : null}
          dataSource={list}
          columns={realColumns}
          pagination={paginationProps}
          onChange={this.handleTableChange}
          bordered
          {...props}
        />
      </div>
    )
  }
}

export default StandardTable
