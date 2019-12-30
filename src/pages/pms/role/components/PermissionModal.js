import React, { Component } from 'react';
import {
  Modal,
  Input,
  Row,
  Col,
  Form,
  Divider,
  Icon,
  Tree,
  message,
  Select
} from 'antd';
import { connect } from 'dva';
import options from '@/utils/cities';
import FormItem from 'antd/lib/form/FormItem';
import { fetchPermission, updatePermission, createRole } from '@/services/role';
import { fetchAddList } from '@/services/product';
import { get } from 'http';

const { TreeNode } = Tree;
const { TextArea } = Input;
@Form.create()
class EditModal extends Component {
  state = {
    confirmLoading: false,
    permissionList: [],
    checkedKeys: [],
    halfCheckedKeys: [],
    expandedKeys: [],
    // 是否改动过权限
    flag: false
  };

  okHandle = (e) => {
    e.preventDefault();
    const { form, handleModalVisible, afterOk, currentItem } = this.props;
    const { checkedKeys, halfCheckedKeys, flag } = this.state;
    form.validateFields((err, fieldValue) => {
      if (err) return;
      fieldValue.id = currentItem.id ? currentItem.id : null
      fieldValue.flag = flag
      fieldValue.permissionIds = [...checkedKeys, ...halfCheckedKeys]
      this.setState({
        confirmLoading: true
      })
      let actionPermission = fieldValue.id ? updatePermission : createRole
      actionPermission(fieldValue).then(res => {
        if (res) {
          form.resetFields();
          handleModalVisible(false);
          this.setState({
            confirmLoading: false,
            flag: false
          })
          afterOk()
        } else {
          this.setState({
            confirmLoading: false
          })
        }
      })
    })
  }
  getPermissionList = (id) => {
    fetchPermission(id).then(res => {
      if (res) {
        let checkedKeys = [];
        let expandedKeys = [];

        function getAllKeys(item) {
          item.map(v => {
            expandedKeys.push(String(v.id));
            v.children.length > 0 && getAllKeys(v.children);
          })
        }
        getAllKeys(res.permissionList);
        if (id != 0) {
          checkedKeys = res.rolePermissionList.map(item => {
            return String(item)
          })
        } else {
          checkedKeys = expandedKeys.slice(0);
        }
        this.setState({
          permissionList: res.permissionList,
          checkedKeys,
          expandedKeys
        })
      }
    })

  }
  renderTreeNodes = permissionLists => {
    return permissionLists.map(permissionList => {
      if (permissionList.children) {
        return (
          <TreeNode title={permissionList.name} key={permissionList.id}>
            {this.renderTreeNodes(permissionList.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={permissionList.id} title={permissionList.name}></TreeNode>
    })
  }
  onExpand = (expandedKeys, { expanded, node }) => {
    function deleteKey(nodes) {
      nodes.map(n => {
        n.props.children && deleteKey(n.props.children)
        let i = expandedKeys.indexOf(n.key);
        if (i != -1) {
          expandedKeys.splice(i, 1);
        }

      })
    }
    if (!expanded) {
      node.props.children && deleteKey(node.props.children)
    }
    this.setState({
      expandedKeys
    })
  }
  onCheck = (checkedKeys, info) => {
    this.setState({ checkedKeys, halfCheckedKeys: info.halfCheckedKeys, flag: true })
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.modalVisible && this.props.currentItem != nextProps.currentItem && (nextProps.currentItem.id || nextProps.currentItem.id == 0)) {
      this.getPermissionList(nextProps.currentItem.id)
    }
  }
  render() {
    const { form, modalVisible, currentItem, handleModalVisible, ...props } = this.props;
    const { getFieldDecorator } = form;
    const { confirmLoading, permissionList, checkedKeys, expandedKeys } = this.state
    return (
      <Modal
        width={600}
        title={'配置权限'}
        visible={modalVisible}
        maskClosable={false}
        confirmLoading={confirmLoading}
        onOk={this.okHandle}
        onCancel={() => {
          this.setState({ flag: false })
          this.props.form.resetFields();
          handleModalVisible(false);
        }}
        bodyStyle={{
          top: '100px',
          paddingLeft: '15',
          paddingRight: '15',
        }}
        {...props}
      >
        <FormItem label="角色名称" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: currentItem.name
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>
        <FormItem label="描述" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('description', {
            initialValue: currentItem.description
          })(
            <TextArea rows={4} placeholder="请输入" />
          )}
        </FormItem>
        <FormItem label="数据权限" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          {getFieldDecorator('level', {
            rules: [{ required: true, message: '请选择' }],
            initialValue: currentItem.level || 1
          })(
            <Select style={{ width: '100%' }}>
              <Select.Option value={1}>管理员</Select.Option>
              <Select.Option value={10}>总部</Select.Option>
              <Select.Option value={25}>校区提现</Select.Option>
              <Select.Option value={30}>校长</Select.Option>
              <Select.Option value={40}>教师</Select.Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="功能权限" labelCol={{ span: 7 }} wrapperCol={{ span: 10 }}>
          <Tree
            checkable
            autoExpandParent
            defaultExpandAll
            expandedKeys={expandedKeys}
            checkedKeys={checkedKeys}
            onCheck={this.onCheck}
            onExpand={this.onExpand}
          >
            {this.renderTreeNodes(permissionList)}
          </Tree>
        </FormItem>
      </Modal>
    );
  }
}

export default EditModal;
