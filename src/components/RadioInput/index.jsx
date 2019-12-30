import React from 'react'
import { Form, Input, Select, Button, Radio, InputNumber, DatePicker } from 'antd';
import moment from 'moment';
import Styles from './index.less'

const { RangePicker } = DatePicker;
export default class RadioInput extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {}),
      };
    }
    return null;
  }
  constructor(props) {
    super(props);

    this.numberInput;

    const value = props.value || {};
    this.state = {
      radioCheck: value.radioCheck || false,
      data: {}
    }
  }
  dateChange = (date, index) => {
    const { data } = this.state;
    data[index].dateConfig.value = date;
    if (!('value' in this.props)) {
      this.setState({ data })
    }
    this.triggerChange({ data })
  }
  numberChange = (e, index) => {
    const { data } = this.state;
    const number = parseInt(e.target.value || 0, 10);
    if (isNaN(number)) {
      return;
    }
    data[index].inputConfig.value = number;
    if (!('value' in this.props)) {
      this.setState({ data })
    }
    this.triggerChange({ data })
  }
  radioChange = e => {
    const radioCheck = e.target.value;
    if (!('value' in this.props)) {
      this.setState({ radioCheck })
    }
    this.triggerChange({ radioCheck });
  }

  triggerChange = changeValue => {
    // Should provide an event to pass value to Form.
    const { onChange } = this.props;
    if (onChange) {
      onChange({
        ...this.state,
        ...changeValue
      })
    }
  }
  // data: [{
  //   withInput: true,
  //   inputConfig: {
  //     suffix: '元',
  //     value: '2'
  //   },
  //   title: '购买课程满',
  //   value: '1',
  // }, {
  //   title: '购买课程4',
  //   value: '3',
  // }, {
  //   withDate: true,
  //   dateConfig: {
  //     value: []
  //   },
  //   title: '',
  //   value: '3',
  // }]
  render() {

    const { disabled = false } = this.props;
    const { number, radioCheck, data } = this.state;
    return <div>
      <Radio.Group value={radioCheck} onChange={this.radioChange} className={Styles.group}>
        {
          data.map((item, index) => {
            return (
              <Radio disabled={disabled} key={index} value={item.value}>{item.title} {item.withInput && <>
                <Input className={Styles.input} value={item.inputConfig.value} onChange={(e) => { this.numberChange(e, index) }} disabled={!disabled ? radioCheck == item.value ? false : true : true} />
                {` ${item.inputConfig.suffix}`}
              </>}{
                  item.withDate && <>
                    <RangePicker showTime={{ format: 'HH:mm:ss' }} format='YYYY-MM-DD HH:mm:ss' value={item.dateConfig.value} disabled={!disabled ? radioCheck == item.value ? false : true : true} onChange={(date) => { this.dateChange(date, index) }}>
                    </RangePicker>
                  </>
                }
              </Radio>
            )
          })
        }
      </Radio.Group>
    </div>

  }
}
