import React, { Component } from 'react';
import { Form, Icon, Input, Button, Checkbox, message, Row, Col, Tooltip } from 'antd';
import { connect } from 'dva';
import styles from './page.less';
import config from '@/config';
import { fetchLogin, fetchSmsCode } from '@/services/user';
import router from 'umi/router';

const FormItem = Form.Item;

@connect(({ loading }) => ({
  loading: loading.models.user,
}))
@Form.create()
export default class LoginPage extends Component {
  state = {
    smsText: '获取验证码',
    isDisabled: false,
  };
  componentWillUnmount() {
    clearInterval(this.timeId)
  }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        fetchLogin(values)
          .then(data => {
            if (data) {
              clearInterval(this.timerId);
              router.push('/');
            }
          })
      }
    });
  };
  getSmsCode = e => {
    const { getFieldValue, getFieldsValue } = this.props.form;
    var values = getFieldsValue();
    var countDown = 60;

    if (!getFieldValue('personMobile')) {
      this.props.form.setFields({
        personMobile: {
          value: '',
          errors: [new Error('请填写手机号')],
        },
      });
      return;
    }
    fetchSmsCode(values)
      .then(res => {
        if (res) {
          message.success('验证码发送成功');
          this.setState({
            smsText: '60s',
            isDisabled: true,
          });
          this.timerId = setInterval(() => {
            if (countDown > 0) {
              countDown--;
              this.setState({
                smsText: `${countDown}s`,
              });
            } else {
              clearInterval(this.timerId);
              this.setState({
                smsText: '获取验证码',
                isDisabled: false,
              });
            }
          }, 1000);
        }
      })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.box}>
        <div className={styles.wrapper}>
          <div className={styles.loginBox}>
            <h2 className={styles.title}>{config.zh_name}管理系统</h2>
            <Form onSubmit={this.handleSubmit} className="login-form">
              <FormItem>
                {getFieldDecorator('personMobile', {
                  rules: [{ required: true, message: '手机号不能为空' }],
                })(<Input className={styles.inputWrapper} placeholder="请输入手机号" />)}
              </FormItem>
              <FormItem>
                <Row>
                  <Col span={15}>
                    {getFieldDecorator('smsCode', {
                      rules: [{ required: true, message: '短信验证码不能为空' }],
                    })(<Input className={styles.inputWrapper} placeholder="请输入短信验证码" />)}
                  </Col>
                  <Col span={8} offset={1}>
                    <Button
                      ghost
                      className={styles.codeBtn}
                      disabled={this.state.isDisabled}
                      htmlType="button"
                      onClick={this.getSmsCode}
                    >
                      {this.state.smsText}
                    </Button>
                  </Col>
                </Row>
              </FormItem>
              <Button type="primary" htmlType="submit" className={styles.button}>
                登录
              </Button>
              <div></div>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}
