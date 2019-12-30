import React, { Component, Fragment } from 'react';
import config from '@/config';
import {
  PageHeader,
  Form,
  DatePicker,
  Row,
  Col,
  Input,
  Button,
  Divider,
  Tag,
  Select,
  Modal,
  message,
  Icon,
  Tabs,
  Typography,
} from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import InlineButton from '@/components/InlineButton';
import moment from 'moment';
import router from 'umi/router';
import { delClass, stopClass } from '@/services/class';
import BindModal from './components/BindModal'

const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const { Option } = Select;
const { confirm } = Modal;
const { TabPane } = Tabs;
const { Paragraph } = Typography;

const StatusMap = {
  0: '使用中',
  1: '已停用',
  2: '未启用'
};
const StatusColorMap = {
  0: 'green',
  1: 'red',
  2: 'orange'
};

@Form.create()
@connect(state => ({
  classList: state.class.classList,
  loading: state.loading.models.class,
  loadingList: state.loading.effects['class/fetchList'],
}))
export default class ClassList extends Component {
  state = {
    formValues: {},
    currentItem: {},
    bindModalVisible: false
  };
  componentDidMount() {
    this.getList(null)
  }

  handleBindModalVisible = (flag = false) => {
    this.setState({
      bindModalVisible: !!flag
    })
  }
  /**
   * type: edit,view,copy
   */
  handleClass = (item, type) => {
    const { dispatch } = this.props;
    if (type) {
      router.push({
        pathname: '/pms/course/class/detailClass',
        query: { id: item.id, type: type == 'copy' ? 2 : 1, page: type }
      })
    } else {
      router.push({
        pathname: '/pms/course/class/detailClass'
      })
    }

  }
  handleDelete = item => {
    confirm({
      title: '确认删除该过课单么？',
      onOk: () => {
        return delClass({ id: item.id }).then(res => {
          if (res) {
            message.success('删除成功');
            this.getList(null);
          } else {
            message.error('操作失败');
          }
        })
      }
    })
  };
  handleStop = (item) => {
    let status = item.status == 0 ? 1 : 0;
    confirm({
      title: status == 0 ? '启用后不可更改课时内容，请确认课时无误后提交' : '确认停用该过课单么？',
      onOk: () => {
        return stopClass({ id: item.id, status }).then(res => {
          if (res) {
            message.success('操作成功');
            this.getList(null);
          } else {
            message.error('操作失败');
          }
        })
      }
    })
  }


  getList = values => {
    const { classList: { pageNum, pageSize } } = this.props;
    const { formValues } = this.state;
    if (values === null || values === undefined) {
      values = {
        ...formValues,
        pageNum,
        pageSize,
      };
    }
    this.props.dispatch({
      type: 'class/fetchList',
      payload: values,
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      if (values.date && values.date.length > 0) {
        values.startTime = values.date[0]
        values.endTime = values.date[1]
      }
      this.setState({ formValues: values });
      this.getList(values)
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'class/fetchList',
      payload: {},
    });
  };

  handleStandardTableChange = pagination => {
    const { current, pageSize } = pagination;
    const { formValues } = this.state;
    this.getList({
      pageNum: current,
      pageSize,
      ...formValues,
    });
  };
  columns = () => [
    {
      title: '过客单',
      dataIndex: 'name',
      width: 100,
      align: 'center',
    },
    {
      title: '内容数',
      width: 110,
      align: 'center',
      dataIndex: 'number'
    },
    {
      title: '过客单状态',
      dataIndex: 'status',
      width: 110,
      align: 'center',
      render: item => <Tag color={StatusColorMap[item]}>{StatusMap[item]}</Tag>
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 140,
      align: 'center',
      render: v => {
        return moment(v).format('YYYY/MM/DD HH:mm');
      },
    },
    {
      title: '绑定课程数',
      width: 110,
      align: 'center',
      render: item => <InlineButton onClick={() => {
        this.handleBindModalVisible(true)
        this.setState({ currentItem: item })
      }}>{item.courseNumber}</InlineButton>
    },
    {
      title: '操作',
      align: 'center',
      width: 150,
      render: item => {
        return (
          <Fragment>
            <Fragment>
              <InlineButton onClick={() => { this.handleClass(item, 'view') }}>查看</InlineButton>
              <Divider type="vertical" />
              <InlineButton onClick={() => { this.handleClass(item, 'copy') }}>复制</InlineButton>
              <Divider type="vertical" />
              <InlineButton onClick={() => { this.handleStop(item) }} type={item.status != 0 ? '' : 'danger'}>{item.status != 0 ? '启用' : '停用'}</InlineButton>
              {item.status == 2 && <>
                <Divider type="vertical" />
                <InlineButton onClick={() => { this.handleClass(item, 'edit') }}>编辑</InlineButton>
              </>}
              {item.status != 0 && <>
                <Divider type="vertical" />
                <InlineButton type='danger' onClick={() => { this.handleDelete(item) }}>删除</InlineButton>
              </>}

            </Fragment>
          </Fragment>
        );
      },
    },
  ];
  renderSearchForm = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem>
              {getFieldDecorator('name', { initialValue: '' })(
                <Input placeholder='请输入过客单名称' />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              {getFieldDecorator('status')(
                <Select placeholder="请选择过客单状态" >
                  <Option value=''>全部</Option>
                  <Option value={0}>使用中</Option>
                  <Option value={1}>已停用</Option>
                  <Option value={2}>未启用</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="">
              {getFieldDecorator('date', { initialValue: [] })(
                <RangePicker placeholder={['创建开始时间', '创建结束时间']} />,
              )}
            </FormItem>
          </Col>
          <Col span={5}>
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
    );
  };

  render() {
    const { classList, loadingList } = this.props;
    const { bindModalVisible, currentItem} = this.state;
    return (
      <PageHeader title="过客单管理">
        <div style={{ marginTop: '10px' }}>{this.renderSearchForm()}</div>
        <Button
          type="primary"
          htmlType="submit"
          onClick={this.handleClass}
          style={{ textAlign: 'right' }}
        >
          创建过客单
            </Button>
        <StandardTable
          rowKey={(item, index) => index}
          data={classList}
          columns={this.columns()}
          loading={loadingList}
          showSerialNumber={{ isShow: true }}
          onChange={this.handleStandardTableChange}
          scroll={{ x: 'max-content', y: 500 }}
          style={{ wordWrap: 'break-word', wordBreak: 'break-all', marginTop: '10px' }}
        />
        <BindModal
          modalVisible={bindModalVisible}
          handleModalVisible={this.handleBindModalVisible}
          currentItem={currentItem}
          afterOk={()=>{
            this.setState({currentItem:{}})
          }}
        ></BindModal>
      </PageHeader>
    );
  }
}
