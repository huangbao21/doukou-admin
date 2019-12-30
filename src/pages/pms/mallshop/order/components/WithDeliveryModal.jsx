import React, { Component } from 'react'
import StandardTable from '@/components/StandardTable'
import { Divider, Modal, message, Radio, Form, Cascader, Input, Icon } from 'antd'
import { updateInfo } from '@/services/return'
import { connect } from 'dva';
import options from '@/utils/cities'
import Styles from '../style.less'
import { fetchAdressAdd} from '@/services/product'

const { TextArea } = Input;

const FormItem = Form.Item;
@Form.create()
@connect(state => ({
  returnView: state.return.returnView,
  addressList: state.return.addressList,
}))
export default class WithDeliveryModal extends Component {
  state = {
    confirmLoading: false,
  }

  componentDidMount() {
  }
  okHandle = async (e) => {
    e.preventDefault();
    const { form, handleModalVisible, type, afterOk, returnView } = this.props;
    form.validateFields(async (err, fieldValue) => {
      if (err) return;
      this.setState({
        confirmLoading: true,
      });
      fieldValue.id = returnView.id;
      fieldValue.status = 2;
      let adressRes;
      if (fieldValue.companyAddressId ==-1){
        fieldValue.area = fieldValue.area.join('/')
        console.log(fieldValue,1)
        adressRes = await fetchAdressAdd(fieldValue);
        console.log(adressRes,2)
        if (adressRes) fieldValue.companyAddressId = adressRes;
      }
      updateInfo(fieldValue).then(d => {
        if (d) {
          form.resetFields();
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
    })
  }


  render() {
    const { modalVisible, form, handleModalVisible, returnView, addressList, ...props } = this.props;
    const { confirmLoading } = this.state;
    let addressRadio = addressList.map((item, index) => {
      return <Radio key={item.id} value={item.id} style={{ display: 'block', height: '30px', lineHeight: '30px' }}>{`【${item.name}】${item.area.replace(/\//g, ' ')}${item.detailAddress} ${item.phone}`}
        {index == 0 && <span style={{ color: '#ffbb96', marginLeft: '30px' }}>默认地址</span>}
      </Radio>
    })
    return <Modal
      width={800}
      title={<><Icon type="info-circle" style={{ color: '#1890ff', marginRight: '10px' }} />需同意后，买家才能退货给你，买家退货后你需再次确认收货，退款将原路返回至买家账户</>}
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
      {...props}>
      <div style={{ padding: '20px' }}>
        <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label='退款方式'>退货退款</FormItem>
        <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label='退款金额'>{`￥${returnView.returnAmount}`}</FormItem>
        <div className={Styles.addressContainer}>
          <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label='退货地址'>
            {form.getFieldDecorator('companyAddressId', {
              initialValue: addressList.length>0?addressList[0].id:-1
            })(
              <Radio.Group style={{ width: '100%' }}>
                {addressRadio}
                <Radio value={-1} style={{ marginBottom: '10px' }}>新增地址</Radio>
              </Radio.Group>
            )}
          </FormItem>
        </div>

        {form.getFieldValue('companyAddressId') == -1 &&
          <div>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label='收货人'>
              {form.getFieldDecorator('name', {
                rules: [{ required: true, message: `收货人不能为空` }],
              })(<Input placeholder={`请输入收货人`} />)}
            </FormItem>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label='联系电话'>
              {form.getFieldDecorator('phone', {
                rules: [{ required: true, message: `联系电话不能为空` }],
              })(<Input type="number" placeholder={`请输入联系电话`} />)}
            </FormItem>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label="省市区">
              {form.getFieldDecorator('area', {
                rules: [{ required: true, message: '请选择省市区' }],
              })(
                <Cascader
                  options={options}
                  placeholder="请选择省市区"
                  style={{ width: '100%' }}
                />,
              )}
            </FormItem>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label="详细地址">
              {form.getFieldDecorator('detailAddress', {
                rules: [
                  { required: true, message: '详细地址不能为空' },
                  { max: 120, message: '不能超过120字' },
                ],
              })(<TextArea rows={4} placeholder="请输入详细地址" />)}
            </FormItem>
          </div>
        }

      </div>
    </Modal>
  }
}