import React, { Component } from 'react'
import StandardTable from '@/components/StandardTable'
import { Divider } from 'antd'

export default class TotalDetailTableWrapper extends Component {
  state = {
    list: []
  }

  componentDidMount() {
    // this.getList()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.formValues !== this.props.formValues) {
      // this.getList()
    }
  }

  render() {
    const { item } = this.props
    // console.log(this.props.item)
    return item && item.map((v, index) => {
      return (
        <div key={index}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', width: '40%', marginRight: '30px', alignItems: 'center' }}>
              <img src={v.productPic} alt="" style={{ width: '50px', height: '100%' }} />
              <p style={{ fontSize: '12px' }}>{v.productName}</p>
            </div>
            <p style={{ fontSize: '12px', marginRight: '30px' }}>{v.sp1}&nbsp;{v.sp2}&nbsp;{v.sp3}</p>
            {v.productQuantity ? <p style={{ fontSize: '12px', marginRight: '30px' }}>x{v.productQuantity}</p> : v.productCount ? <p style={{ fontSize: '12px', marginRight: '30px' }}>x{v.productCount}</p>:null}
            <p style={{ fontSize: '12px' }}>￥{v.productPrice}</p>
          </div>
          {
            item.length - 1 == index ?
              null : <Divider />
          }
        </div>
      )
    })
  }
}