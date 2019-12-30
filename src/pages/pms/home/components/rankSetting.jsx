import React, { Component } from 'react';
import { PageHeader, Input, Form, Icon, Radio, Select, Button, message } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { connect } from 'dva'
import Styles from '../style.less'
import { fetchOSSPolicy } from '@/services/oss';
import { saveModule } from '@/services/courseHome'

@Form.create()
@connect(({ courseHome, loading }) => ({
    loading: loading.models.courseHome,
    allRank: courseHome.allRank,
}))
export default class RankSetting extends Component {

    saveConfig = () => {
        const { form, dispatch, afterSave } = this.props
        form.validateFields((err, fieldValue) => {
            if (err) return;
            let moduleList = [{
                code: fieldValue.code,
                id: fieldValue.id,
                name: fieldValue.name,
                rankType: fieldValue.rankType
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
        const { form: { getFieldDecorator }, moduleItem, afterSave, allRank } = this.props
        let rankOptions = allRank.map(rank => {
            return (
                <Select.Option key={rank.id}>{rank.name}</Select.Option>
            )
        })
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
                <FormItem label="排行方式" labelCol={{ span: 5 }} wrapperCol={{ span: 10 }}>
                    {getFieldDecorator('rankType', {
                        initialValue: String(moduleItem.rankType),
                    })(
                        <Select style={{ width: '100%' }}>
                            {rankOptions}
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