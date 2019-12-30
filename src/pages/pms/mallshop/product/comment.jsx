import React, { Component } from 'react';
import config from '@/config';
import { connect } from 'dva'
import InlineButton from '@/components/InlineButton';
import { PageHeader, Row, Col, Card, Statistic, DatePicker, Icon, Rate, Divider, Pagination, Modal, message, Form, Input, Select, Button } from 'antd';
import moment from 'moment';
import ReplyModal from './components/ReplyModal'
import { fetchCommentDelete } from '@/services/comment'
import router from 'umi/router';
import Helper from '@/utils/helper';

const FormItem = Form.Item
const { RangePicker } = DatePicker
const confirm = Modal.confirm;
const { Option } = Select

@connect(state => ({
  commentList: state.comment.commentList,
  commentTotal: state.comment.commentTotal,
  loading: state.loading.models.comment,
}))
@Form.create()
export default class CommentList extends Component {
  state = {
    currentItem: {},
    replyModalVisible: false
  };

  deleteComment = (item) => {
    // console.log(item, 'item')
    confirm({
      title: '评价一周只能删除一条，确认删除该评价么？',
      onOk: () => {
        return fetchCommentDelete({
          id: item.id,
          productId: item.productId
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

  handleModalVisible = (flag = false) => {
    this.setState({
      replyModalVisible: !!flag,
    });
  };

  goReply = (item = {}) => {
    this.setState({
      currentItem: item,
    });
    this.handleModalVisible(true);
  };

  getList = values => {
    const { commentList: { pageNum, pageSize }, location: { query, state } } = this.props;
    const { formValues } = this.state;
    if (values === null || values === undefined) {
      values = {
        ...formValues,
        pageNum,
        pageSize,
        productId: query.productId
      };
    }
    let data = {};
    for (let i in values) {
      if (values[i] !== '' && values[i] !== undefined && values[i] !== null) {
        data[i] = values[i];
      }
    }
    data.productId = query.productId
    data.relationType = 2
    this.props.dispatch({
      type: 'comment/fetchList',
      payload: data
    });
  };

  pageChange = (page, pageSize) => {
    const { formValues } = this.state
    this.getList({
      pageNum: page,
      pageSize,
      ...formValues
    })
  }

  handleChange = (current, pageSize) => {
    // console.log(current, pageSize)
    const { formValues } = this.state
    this.getList({
      pageNum: current,
      pageSize,
      ...formValues
    })
  }

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      // console.log(values);
      if (values.date && values.date.length > 0) {
        values.startTime = values.date[0].format('YYYY-MM-DD');
        values.endTime = values.date[1].format('YYYY-MM-DD');
      }
      delete values.date
      this.setState({ formValues: values });
      this.getList(values);
    });
  };

  handleFormReset = () => {
    const { form, dispatch, location: { query, state } } = this.props;
    const { formValues } = this.state;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'comment/fetchList',
      payload: {
        productId: query.productId,
        relationType: 2
      }
    });
  };

  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSearch} >
        <Row gutter={24}>
          <Col span={5}>
            <FormItem>
              {getFieldDecorator('star', {

              })(
                <Select placeholder="请选择评价类型">
                  <Option value="">全部</Option>
                  <Option value="5">好评</Option>
                  <Option value="3">差评</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="">
              {getFieldDecorator('date', { initialValue: [] })(<RangePicker placeholder={['评价开始时间', '评价结束时间']} />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem>
              <span className="submitButtons">
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  重置
                </Button>
              </span>
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }

  componentDidMount() {
    const { location: { query, state } } = this.props;
    this.props.dispatch({
      type: 'comment/fetchCommentTotal',
      payload: {
        productId: query.productId,
        relationType: 2
      }
    })
    this.props.dispatch({
      type: 'comment/fetchList',
      payload: {
        productId: query.productId,
        relationType: 2
      }
    })
  }
  render() {
    const { commentList, commentTotal, location: { query, state } } = this.props
    const { replyModalVisible, currentItem } = this.state
    return (
      <PageHeader title="评价列表" subTitle="4星及以上为好评。4星以下为差评" onBack={() => {
        router.goBack(-1)
      }}>
        {commentTotal ?
          <div>
            <Row gutter={48}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="总评论数"
                    value={commentTotal.totalComment ? commentTotal.totalComment : 0}
                    valueStyle={{ color: '#1890FF' }}
                    prefix={<Icon type="pushpin" />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="好评"
                    value={commentTotal.praiseCount ? commentTotal.praiseCount : 0}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<Icon type="like" />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="差评"
                    value={commentTotal.badCount ? commentTotal.badCount : 0}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<Icon type="dislike" />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="好评率"
                    value={(commentTotal.praiseRate) * 100}
                    precision={2}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<Icon type="shop" />}
                    suffix="%"
                  />
                </Card>
              </Col>
            </Row>
          </div> : null}
        <div style={{ marginTop: '40px' }}>
          <h3>{query.productName}</h3>
          <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
          <Card title="评价内容">
            {commentList && commentList.list && commentList.list.map((item, index) => {
              return <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <img src={item.memberIcon ? Helper.prefixImg(item.memberIcon) : '/placehold.png'} alt="" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                  <div style={{ width: '75%' }}>
                    <p style={{ fontSize: '15px' }}>{item.memberNickName} <span style={{ fontSize: '13px' }}>{moment(item.createTime).format('YYYY/MM/DD HH:mm')}</span> </p>
                    <Rate disabled value={item.star} />
                    <p style={{ marginTop: '10px' }}>{item.content}</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                      {item.pics && item.pics.split(',').map((m, n) => {
                        return < img src={Helper.prefixImg(m)} alt="" style={{ height: '80px', marginRight: '15px' }} key={n} />
                      })}
                    </div>
                    {item.replayText && item.replayId != 0 ? <p style={{ marginTop: '10px' }}>回复：{item.replayText}</p> : null}
                  </div>
                  <div>
                    {item.replayText == "0" && item.replayId == 0 ?
                      <span>
                        <InlineButton onClick={() => this.goReply(item)}>回复</InlineButton>
                        <Divider type="vertical" />
                      </span> : null}
                    <InlineButton type="danger" onClick={() => this.deleteComment(item)}>删除</InlineButton>
                  </div>
                </div>
                {commentList.list.length - 1 == index ? null : <Divider />}
              </div>
            })
            }
          </Card>
          <Pagination
            style={{ textAlign: 'right', marginTop: '30px' }}
            showQuickJumper
            showSizeChanger
            defaultCurrent={1}
            total={commentList.total}
            onChange={this.pageChange}
            onShowSizeChange={this.handleChange}
            showTotal={total => `共 ${total}条 `}
            hideOnSinglePage
          />
          <ReplyModal
            modalVisible={replyModalVisible}
            handleModalVisible={this.handleModalVisible}
            currentItem={currentItem}
            afterOk={() => {
              this.getList(null);
            }}
          />
        </div>
      </PageHeader>
    );
  }
}