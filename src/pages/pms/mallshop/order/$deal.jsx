import React, { Component } from 'react';
import { PageHeader, Steps, Divider, Icon, Button, Modal, message, Radio, Form, Cascader, Input } from 'antd';
import router from 'umi/router';
import { connect } from 'dva';
import Styles from './style.less'
import moment from 'moment'
import Helper from '@/utils/helper'
import RejectModal from './components/RejectModal';
import { updateInfo } from '@/services/return'
import InlineButton from '@/components/InlineButton';

import WithDeliveryModal from './components/WithDeliveryModal';

const confirm = Modal.confirm;
const { Step } = Steps;
const FormItem = Form.Item;
const TextArea = Input.TextArea


@connect(state => ({
  returnView: state.return.returnView,
  loading: state.loading.models.return,
  loadingList: state.loading.effects['return/fetchView'],
}))
@Form.create()
export default class Deal extends Component {
  constructor(props) {
    super(props)
    this.timeId;
    this.state = {
      countDown: 0,
      rejectModalVisible: false,
      deliveryModalVisible: false,
      id: 0,
      scaleImg: '',
      viewDeliveryFlag: false
    }
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'return/fetchAddress'
    })
    this.init();

  }
  componentWillUnmount() {
    clearInterval(this.timeId);
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.returnView != nextProps.returnView) {
      this.getCountDown(moment(), moment(nextProps.returnView.delayTime))
    }
  }
  init = () => {
    const { match, dispatch } = this.props;
    this.setState({
      id: match.params.deal
    })
    dispatch({
      type: 'return/fetchView',
      payload: match.params
    })
  }
  handleRejectModalVisible = (flag = false) => {
    this.setState({
      rejectModalVisible: !!flag
    })
  }
  handleDeliveryModalVisible = (flag = false) => {
    this.setState({
      deliveryModalVisible: !!flag
    })
  }
  handleScaleImg = () => {

  }
  handleReject = () => {
    this.handleRejectModalVisible(true)
  }
  handleDelivery = () => {
    this.handleDeliveryModalVisible(true)
  }
  handleAgree = () => {
    const { returnView, form } = this.props;
    const { id } = this.state;
    if (returnView.type == 0 || (returnView.type == 1 && returnView.orderApplyState == 2)) {
      confirm({
        title: `同意后，退款将原路返回至买家账户`,
        icon: <Icon type="info-circle" style={{ color: '#1890ff' }} />,
        content: <>
          <p style={{ marginTop: '30px' }}>
            <span>退款方式:</span>
            <span>{returnView.type == 0 ? ' 仅退款' : ' 退货退款'}</span>
          </p>
          <p>
            <span>退款金额:</span>
            <span style={{ color: 'red' }}>{` ￥${returnView.realPayAmout}`}</span>
          </p>
        </>,
        onOk: () => {

          return updateInfo({ id, status: 2 }).then((data) => {
            if (data) {
              message.success('处理成功')
              this.init();
              clearInterval(this.timeId)
            }
          })
        }
      })
    } else {
      this.handleDelivery();
    }
  }
  getCountDown = (start, end) => {
    var time = Helper.getCountDownTime(start, end);
    let timeStr;
    var sec = 0;
    if (time) {
      timeStr = `${time.days()} 天 ${time.hours()} 小时 ${time.minutes()} 分钟 ${time.seconds()} 秒`
      sec = time.seconds();
      this.timeId = setInterval(() => {
        if (sec > 0) {
          sec--
        } else {
          clearInterval(this.timeId);
          this.getCountDown(moment(), end);
        }
        timeStr = `${time.days()} 天 ${time.hours()} 小时 ${time.minutes()} 分钟 ${sec} 秒`
        this.setState({
          countDown: timeStr
        })
      }, 1000);
    } else {
      timeStr = '0 天 0 小时 0 分钟 0 秒'
    }

    this.setState({
      countDown: timeStr
    })

  }
  render() {
    const { returnView = {} } = this.props;
    const { countDown, id, rejectModalVisible, deliveryModalVisible, scaleImg, viewDeliveryFlag } = this.state;

    if (Object.keys(returnView).length == 0) return <></>
    const proofImgs = returnView.proofPics.split(',');
    let proofNode = proofImgs.map((item, index) => {
      return (
        <img style={{ width: '80px', marginLeft: '30px', cursor: 'pointer' }} key={index} src={Helper.prefixImg(item)} onClick={() => {
          this.setState({
            scaleImg: item
          })
        }} />
      )
    })
    return <>
      <PageHeader title='退款维权' onBack={() => router.go(-1)}>

        <div className={Styles.stepContainer}>
          {returnView.type == 0 &&
            <Steps style={{ width: '50%' }} current={returnView.orderApplyState == 0 ? 1 : 3}>
              <Step title="买家申请退款" description={moment(returnView.createTime).format('YYYY-MM-DD HH:mm')} />
              <Step title="商家处理退款申请" description={returnView.sellerHandleTime && moment(returnView.sellerHandleTime).format('YYYY-MM-DD HH:mm')} />
              <Step title="完成" description={returnView.orderApplyState == 3 && moment(returnView.handleTime).format('YYYY-MM-DD HH:mm')} />
            </Steps>}
          {returnView.type == 1 &&
            <Steps style={{ width: '50%' }} current={returnView.orderApplyState == 0 ? 1 : returnView.orderApplyState == 1 ? 2 : returnView.orderApplyState == 2 ? 3 : 4}>
              <Step title="买家申请退款" description={moment(returnView.createTime).format('YYYY-MM-DD')} />
              <Step title="商家处理申请" description={returnView.sellerHandleTime && moment(returnView.sellerHandleTime).format('YYYY-MM-DD HH:mm')} />
              <Step title="等待买家退货" description={returnView.buyerHandleTime && moment(returnView.buyerHandleTime).format('YYYY-MM-DD HH:mm')} />
              <Step title="完成" description={returnView.orderApplyState == 4 && moment(returnView.handleTime).format('YYYY-MM-DD HH:mm')} />
            </Steps>}

        </div>
        <div className={Styles.content}>
          <div className={Styles.left}>
            <h3 className={Styles.title}>退款订单</h3>
            <div className={Styles.product}>
              <img className={Styles.img} src={returnView.items[0].productPic} />
              <div className={Styles.info}>
                <p>{returnView.items[0].productName}</p>
                <p>￥{returnView.items[0].productPrice}</p>
              </div>
            </div>
            <Divider></Divider>
            <div className={Styles.refundInfo}>
              <li>
                <span className={Styles.key}>退款类型:</span>
                <span className={Styles.value}>{returnView.type == 0 ? '仅退款' : '退货退款'}</span>
              </li>
              <li>
                <span className={Styles.key}>退款金额:</span>
                <span className={Styles.value}>{`${returnView.returnAmount} 元 ${returnView.freight != 0 ? '（含运费: ' + returnView.freight + ' 元）' : ''}`}</span>
              </li>
              <li>
                <span className={Styles.key}>退款原因:</span>
                <span className={Styles.value}>{returnView.reason}</span>
              </li>
              <li>
                <span className={Styles.key}>退款编号:</span>
                <span className={Styles.value}>{returnView.returnSn}</span>
              </li>
            </div>
            <Divider></Divider>
            <div className={Styles.buyerInfo}>
              <li>
                <span className={Styles.key}>订单编号:</span>
                <span className={Styles.value}>{returnView.orderSn}</span>
              </li>
              <li>
                <span className={Styles.key}>付款时间:</span>
                <span className={Styles.value}>{returnView.payTime && moment(returnView.payTime).format('YYYY-MM-DD HH:mm')}</span>
              </li>
              <li>
                <span className={Styles.key}>买家:</span>
                <span className={Styles.value}>{returnView.returnName}</span>
              </li>
              <li>
                <span className={Styles.key}>物流信息:</span>
                <span className={Styles.value}>{returnView.orderDeliveryCompany ? `${returnView.orderDeliveryCompany}(${returnView.orderDeliverySn})` : '--'}</span>
              </li>
              <li>
                <span className={Styles.key}>运费:</span>
                <span className={Styles.value}>{returnView.freight != '0' ? returnView.freight : '包邮'}</span>
              </li>
              <li>
                <span className={Styles.key}>优惠:</span>
                <span className={Styles.value}>{`${returnView.preferential} 元`}</span>
              </li>
              <li>
                <span className={Styles.key}>实付:</span>
                <span className={Styles.value}>{`${returnView.realPayAmout} 元`}</span>
              </li>
            </div>
          </div>
          <div className={Styles.right}>
            <h3 className={Styles.title}>
              {returnView.orderApplyState == 0 ? <><Icon type="info-circle" style={{ marginRight: '10px', color: '#1890ff' }} />等待商家处理退款申请</> : returnView.orderApplyState == 1 ? <><Icon type="info-circle" style={{ marginRight: '10px', color: '#1890ff' }} />你已同意退货申请，等待买家退货</> : returnView.orderApplyState == 2 ? <><Icon type="info-circle" style={{ marginRight: '10px', color: '#1890ff' }} />买家已退货，等待商家确认收货</> : returnView.orderApplyState == 3 ? <><Icon type="check-circle" style={{ marginRight: '10px', color: '#87d068' }} />已同意退款</> : <><Icon type="info-circle" style={{ marginRight: '10px', color: '#f50' }} />已拒绝</>}
            </h3>
            <div className={Styles.info}>
              <div style={{ marginBottom: '20px' }}>
                {/* 买家已退货，等待商家确认收货 */}
                {returnView.orderApplyState == 2 &&
                  <>
                    <p>
                      <span className={Styles.key}>物流公司:</span>
                      <span className={Styles.value}>{returnView.deliveryCompany}</span>
                    </p>
                    <p>
                      <span className={Styles.key}>物流单号:</span>
                      <span className={Styles.value}>{returnView.deliverySn}</span>
                    </p>
                    <p>
                      <span className={Styles.key}>物流详情:</span>
                      <span className={Styles.value}>{returnView.deliveryDetail.logisticsVOList ? returnView.deliveryDetail.logisticsVOList[0].status : '暂无物流信息'}</span>
                      <InlineButton style={{ marginLeft: '10px' }} onClick={() => { this.setState({ viewDeliveryFlag: !viewDeliveryFlag }) }}>{viewDeliveryFlag ? '收起' : '物流详情'}</InlineButton>
                    </p>
                    {viewDeliveryFlag && <Steps size='small' progressDot current={0} direction="vertical">
                      {
                        returnView.deliveryDetail.logisticsVOList ? returnView.deliveryDetail.logisticsVOList.map((deItem, deIndex) => {
                          return <Step key={deIndex} title={deItem.status} description={moment(deItem.time).format('YYYY-MM-DD HH:mm')} />
                        }) : <Step title='暂无物流信息' />
                      }

                    </Steps>}

                    <p>
                      <span className={Styles.key}>联系电话:</span>
                      <span className={Styles.value}>{returnView.returnPhone}</span>
                    </p>
                  </>
                }
                {proofImgs.length > 0 &&
                  <p>
                    <span className={Styles.key}>退款凭证:</span>
                    {proofNode}
                  </p>
                }
                {/*  待商家处理 已拒绝*/}
                {(returnView.orderApplyState == 0 || returnView.orderApplyState == 2 || returnView.orderApplyState == 4) &&
                  <p>
                    <span className={Styles.key}>退款说明:</span>
                    <span className={Styles.value}>{returnView.description}</span>
                  </p>
                }
                {/* 同意退款 */}
                {(returnView.orderApplyState == 3) &&
                  <>
                    <p>
                      <span className={Styles.key}>退款金额:</span>
                      <span className={Styles.value}>￥{returnView.returnAmount}</span>
                    </p>
                    <p>
                      <span className={Styles.key}>退款方式:</span>
                      <span className={Styles.value}>{returnView.returnType == 1 ? '支付宝' : '微信'}</span>
                    </p>
                    <p>
                      <span className={Styles.key}>退款状态:</span>
                      <span className={Styles.value}>{returnView.returnState == 1 ? '退款中' : '退款完成'}</span>
                    </p>
                  </>
                }
                {/* 拒绝退款 */}
                {
                  returnView.orderApplyState == 4 && <p>
                    <span className={Styles.key}>拒绝原因:</span>
                    <span className={Styles.value}>{returnView.handleNote}</span>
                  </p>
                }

              </div>
              {/* 待商家处理 */}
              {returnView.orderApplyState == 0 && <>
                <div>
                  <p>收到买家<span style={{ color: 'red' }}>{returnView.type == 0 ? ' 仅退款 ' : ' 退货退款 '}</span>申请，请尽快处理</p>
                  {
                    returnView.type == 1 && <p>请在<span style={{ color: 'red' }}>{` ${countDown} `}</span>内处理本次申请，若逾期未处理，将自动同意退货申请</p>
                  }

                </div>
                <div style={{ marginTop: '40px' }}>
                  <Button type="primary" style={{ marginRight: '15px' }} onClick={this.handleAgree}>{returnView.type == 0 ? '同意退款申请' : '同意退货申请'}</Button>
                  <Button onClick={this.handleReject}>{returnView.type == 0 ? '拒绝退款申请' : '拒绝退货申请'}</Button>
                </div>
              </>
              }
              {/* 等待买家退货 */}
              {returnView.orderApplyState == 1 &&
                <div>
                  <p>你已同意买家退货申请</p>
                  <p>买家在<span style={{ color: 'red' }}>{` ${countDown} `}</span>内未处理退货，将自动关闭该次退货申请</p>
                </div>
              }
              {/* 买家已退货，等待商家确认收货 */}
              {returnView.orderApplyState == 2 &&
                <div>
                  {/* <p>请在<span style={{ color: 'red' }}>{` ${countDown} `}</span>内确认，如逾期未处理，将自动退款给买家</p> */}
                  <div style={{ marginTop: '40px' }}>
                    <Button type="primary" style={{ marginRight: '15px' }} onClick={this.handleAgree}>确认收货并退款</Button>
                    <Button onClick={this.handleReject}>拒绝收货</Button>
                  </div>
                </div>
              }

            </div>
          </div>
        </div>
        <RejectModal
          modalVisible={rejectModalVisible}
          handleModalVisible={this.handleRejectModalVisible}
          currentId={id}
          afterOk={() => {
            clearInterval(this.timeId);
            this.init();
          }}
        ></RejectModal>
        <WithDeliveryModal
          modalVisible={deliveryModalVisible}
          handleModalVisible={this.handleDeliveryModalVisible}
          afterOk={() => {
            clearInterval(this.timeId);
            this.init();
          }}></WithDeliveryModal>
        <Modal
          width={500}
          visible={!!scaleImg}
          footer={null}
          onCancel={() => {
            this.setState({
              scaleImg: ''
            })
          }}>
          <div>
            <img style={{ width: '100%' }} src={Helper.prefixImg(scaleImg)}></img>
          </div>
        </Modal>
      </PageHeader>
    </>
  }
}