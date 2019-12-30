import React, { Component } from 'react';
import {
  Modal,
  Input,
  Tag,
  Radio,
  Row,
  Card,
  Checkbox,
  Col,
  InputNumber,
  Form,
  Select,
  Tabs,
  DatePicker,
  Divider
} from 'antd';
import { connect } from 'dva';
import options from '@/utils/cities';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import OrderDetail from './OrderDetail'
import InlineButton from '@/components/InlineButton';
import FormItem from 'antd/lib/form/FormItem';
import Styles from '../style.less'
import Helper from '@/utils/helper';

@connect((state) => ({
  classObj: state.student.classObj,
  loading: state.loading.models.student
}))
export default class viewClassModal extends Component {
  state = {}
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.modalVisible&&this.props.currentItem != nextProps.currentItem && nextProps.currentItem.afterClassId) {
      this.props.dispatch({
        type: 'student/fetchClassObj',
        payload: { orderId: nextProps.currentItem.orderId, memberId: nextProps.studentId },
      })
    }
  }
  render() {
    const { modalVisible, handleModalVisible, classObj, currentItem, ...props } = this.props;
    return (<Modal
      width={1000}
      title={'过客单'}
      visible={modalVisible}
      maskClosable={false}
      footer={null}
      onCancel={() => {
        handleModalVisible(false);
      }}
      bodyStyle={{
        top: '100px',
        paddingLeft: '15',
        paddingRight: '15',
      }}
      {...props}>
      {(currentItem.afterClassId && classObj.orderSn) ? <>
        {classObj.samplePicture && <>
          <div className={Styles.title}>结业证书</div>
          <div className={Styles.certificate}>
            <img src={Helper.prefixImg(classObj.samplePicture)} />
          </div>
        </>}

        <div className={Styles.courseContent}>
          <div className={Styles.title}>课程内容<span> ( 共{classObj.classList.length + classObj.loadClassList.length}项内容，已完成{classObj.loadClassList.length}项 )</span></div>
          {classObj.loadClassList.map((item, i) => {
            return <div key={i}>
              <div className={Styles.subtitle}>{item.className}</div>
              <div className={Styles.pic}>
                {item.pictureList.map((pic, picIndex) => {
                  return <img key={picIndex} src={Helper.prefixImg(pic)} />
                })}

              </div>
              <div className={Styles.time}>( {moment(item.uploadTime).format('YYYY-MM-DD HH:mm')} )</div>
            </div>
          })}
          {classObj.classList.map((item, i) => {
            return <div key={i}>
              <div className={Styles.subtitle}>{item.name}</div>
            </div>
          })}

        </div>

      </> : <p>暂无过课单</p>}

    </Modal>)
  }
}