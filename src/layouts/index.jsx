import React from 'react';
import BasicLayout from '@/layouts/BasicLayout';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import styles from './index.less';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

const Layout = props => {
    const { location, children } = props;
    const independPage = ['/login'];
    if (independPage.includes(location.pathname)) {
        return <ConfigProvider locale={zhCN}><div className={styles.normal}>{children}</div></ConfigProvider>;
    } else {
        return <ConfigProvider locale={zhCN}><BasicLayout {...props}></BasicLayout></ConfigProvider>;
    }
};

export default withRouter(connect()(Layout));
