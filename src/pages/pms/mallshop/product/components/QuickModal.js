import React, { Component } from 'react';
import {
  Form,
  Modal,
  Input,
} from 'antd';
import { connect } from 'dva';
import { fetchQuickEdit } from '@/services/product';
import options from '@/utils/cities';
import TextArea from 'antd/lib/input/TextArea';
import Styles from '../style.less'

const FormItem = Form.Item;

@connect(state => ({
  quickInfo: state.product.quickInfo
}))
@Form.create()
class FormModal extends Component {
  state = {
    confirmLoading: false,
    pmsSkuStockVOList: []
  };
  handleChange = (e, item, arry) => {
    let name = e.target.name;
    let value = e.target.value;
    if (value <= 0) return;
    item[name] = value;
    this.setState({
      pmsSkuStockVOList: arry
    })

  }
  okHandle = e => {
    e.preventDefault();
    const { form, currentItem, handleModalVisible, afterOk,quickInfo } = this.props;
    const { pmsSkuStockVOList } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      fieldsValue.id = currentItem.id
      if (pmsSkuStockVOList.length > 0) {
        fieldsValue.pmsSkuStockVOList = pmsSkuStockVOList
      }else{
        fieldsValue.pmsSkuStockVOList = quickInfo.pmsSkuStockVOList
      }
      this.setState({
        confirmLoading: true,
      });
      fetchQuickEdit(fieldsValue)
        .then(d => {
          if (d) {
            form.resetFields()
            handleModalVisible(false)
            this.setState({
              confirmLoading: false,
            });
            afterOk();
          } else {
            this.setState({
              confirmLoading: false,
            });
          }
        })
    });
  };

  componentDidMount() {
  }

  render() {
    const { modalVisible, form, handleModalVisible, currentItem, title, quickInfo = {}, ...props } = this.props;
    const { pmsSkuStockVOList } = this.state;
    const { confirmLoading } = this.state;
    const { getFieldValue } = form;
    let quickInfoData = pmsSkuStockVOList.length > 0 ? pmsSkuStockVOList : quickInfo.pmsSkuStockVOList ? quickInfo.pmsSkuStockVOList : [];
    return (
      <Modal
        width={500}
        title={`编辑${title}`}
        visible={modalVisible}
        onOk={this.okHandle}
        maskClosable={false}
        confirmLoading={confirmLoading}
        onCancel={() => {
          this.props.form.resetFields();
          handleModalVisible(false);
        }}
        bodyStyle={{
          top: '100px',
          maxHeight: '1200px',
          paddingLeft: '0',
          paddingRight: '0',
        }}
        {...props}
      >
        {
          title == "排序" ?
            <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={`${title}`}>
              {form.getFieldDecorator('sort', {
                rules: [{ required: true, message: `${title}不能为空` }],
                initialValue: currentItem.sort,
              })(<Input placeholder={`请输入${title}`} type="number" min={0} />)}
            </FormItem> :
            title == "商品名称" ?
              <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={`${title}`}>
                {form.getFieldDecorator('name', {
                  rules: [{ required: true, message: `${title}不能为空` }],
                  initialValue: currentItem.name,
                })(<Input placeholder={`请输入${title}`} />)}
              </FormItem> :
              title == "价格" ?
                (currentItem.productStyle == 2 && <div className={Styles.quickModify}>
                  <div className={Styles.row}>
                    {quickInfo.attributeParamList && quickInfo.attributeParamList.map(item => {
                      return <p key={item.id}>{item.name}</p>
                    })}
                    <p ><span className={Styles.required}>{title}</span></p>
                  </div>
                  {quickInfoData.map(item => {
                    return <div key={item.id} className={Styles.row}>
                      {item.sp1 && <p>{item.sp1}</p>}
                      {item.sp2 && <p>{item.sp2}</p>}
                      {item.sp3 && <p>{item.sp3}</p>}
                      <p><Input name="price" value={item.price} onChange={(e) => { this.handleChange(e, item, quickInfoData) }} /></p>
                    </div>
                  })}
                </div> ||
                  <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={`${title}`}>
                    {form.getFieldDecorator('price', {
                      rules: [{ required: true, message: `${title}不能为空` }],
                      initialValue: currentItem.price,
                    })(<Input placeholder={`请输入${title}`} type="number" min={0} />)}
                  </FormItem>) : 
                title == "库存" ?
                  (currentItem.productStyle == 2 && <div className={Styles.quickModify}>
                    <div className={Styles.row}>
                      {quickInfo.attributeParamList && quickInfo.attributeParamList.map(item => {
                        return <p key={item.id}>{item.name}</p>
                      })}
                      <p ><span className={Styles.required}>{title}</span></p>
                    </div>
                    {quickInfoData.map(item => {
                      return <div key={item.id} className={Styles.row}>
                        {item.sp1 && <p>{item.sp1}</p>}
                        {item.sp2 && <p>{item.sp2}</p>}
                        {item.sp3 && <p>{item.sp3}</p>}
                        <p><Input name="stock" value={item.stock} onChange={(e) => { this.handleChange(e, item, quickInfoData) }} /></p>
                      </div>
                    })}
                  </div> ||
                    <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={`${title}`}>
                      {form.getFieldDecorator('stock', {
                        rules: [{ required: true, message: `${title}不能为空` }],
                        initialValue: currentItem.stock,
                      })(<Input placeholder={`请输入${title}`} type="number" min={0} />)}
                    </FormItem>):null
        }

      </Modal>
    );
  }
}

export default FormModal;
