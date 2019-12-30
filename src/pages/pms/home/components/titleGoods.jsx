import React, { Component } from 'react';
import { PageHeader, Input, Form, Icon, Radio, Select, Button, message, InputNumber } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { connect } from 'dva'
import Styles from '../style.less'
import { fetchOSSPolicy } from '@/services/oss';
import { saveModule } from '@/services/courseHome'

@Form.create()
@connect(({ courseHome, loading }) => ({
    loading: loading.models.courseHome,
    allGroup: courseHome.allGroup,
}))
export default class TitleGoods extends Component {
    saveConfig = ()=>{
        const { form, dispatch, afterSave } = this.props
        form.validateFields((err, fieldValue) => {
            if (err) return;
            let moduleList = [{
                code: fieldValue.code,
                id: fieldValue.id,
                name: fieldValue.name,
                groupId: fieldValue.groupId,
                previewNum: fieldValue.previewNum
            }]
            let partList = [];
            saveModule({ moduleList, partList }).then(res => {
                if (res) {
                    message.success("保存成功");
                    dispatch({
                        type: 'courseHome/fetchModules',
                        payload: {}
                    })
                    afterSave()
                }
            })
        })
    }
    render() {
        const { form: { getFieldDecorator }, moduleItem, afterSave,allGroup } = this.props
        let groupOptions = allGroup.map(group=>{
            return (
                <Select.Option key={group.id}>{group.groupName}</Select.Option>
            )
        })
        groupOptions.unshift(<Select.Option key={'0'} disabled>无</Select.Option>)
        return (
            <div className={Styles.editContent}>
                <FormItem style={{ display: 'none' }}>
                    {getFieldDecorator('id', {
                        initialValue: moduleItem.id
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem style={{ display: 'none' }}>
                    {getFieldDecorator('code', {
                        initialValue: moduleItem.code
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem label="组件类型" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }}>
                    {moduleItem.typeName}
                </FormItem>
                <FormItem label="模块名称" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }}>
                    {getFieldDecorator('name', {
                        initialValue: moduleItem.name,
                        rules: [{ required: true, message: '请输入' }]
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem label="首页预览个数" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }} help='预览个数可选4-10个'>
                    {getFieldDecorator('previewNum', {
                        initialValue: moduleItem.previewNum,
                    })(
                        <InputNumber min={4} max={10} />
                    )}
                </FormItem>
                <FormItem label="分组" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }}>
                    {getFieldDecorator('groupId', {
                        initialValue: String(moduleItem.groupId),
                    })(
                        <Select style={{ width: '100%' }}>
                            {groupOptions}
                        </Select>
                    )}
                </FormItem>

                <div className={Styles.saveBtn}>
                    <Button className={Styles.saveBtn} onClick={() => { afterSave() }}>取消</Button>
                    <Button type="primary" onClick={() => { this.saveConfig() }}>保存</Button>
                </div>
            </div>
        )
    }
}