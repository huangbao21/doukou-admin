/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import Link from 'umi/link';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import RightContent from '@/components/GlobalHeader/RightContent';
import logo from '../assets/logo.png';
import router from 'umi/router';
import config from '@/config';
import { Menu, Icon, Button } from 'antd';
import Helper from '@/utils/helper';

const deepMenuData = menusData => {
  let tempMenus = [];
  if (menusData && menusData.length > 0) {
    menusData.forEach(item => {
      let menuitem = {
        path: item.uri,
        name: item.name,
        icon: item.icon ? item.icon : 'code-sandbox',
        children: item.children && deepMenuData(item.children),
      };
      tempMenus.push(menuitem);
    });
  }
  return tempMenus;
};



const BasicLayout = props => {
  const { dispatch, children, menus } = props;

  const [menuDataState, setMenuData] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  // const [isCollapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (menus.children) {
      // 初始显示 默认菜单
      if (localStorage.menuKey) {

        setSelectedKeys([localStorage.menuKey])
        setMenuData(menus.children[localStorage.menuKey])
      } else {
        setSelectedKeys([menus.top[0].id.toString()])
        setMenuData(menus.children[menus.top[0].id])
      }
    }
  }, [menus])

  useEffect(() => {
    const accessToken = Helper.getCookie('accessToken');
    if (!accessToken) {
      router.push('/login');
    } else {
      dispatch({
        type: 'user/fetchPermissionAll',
        payload: {},
      });
      dispatch({
        type: 'user/fetchUserInfo',
        payload: {},
      });
    }
  }, []);

  const onSelect = ({ item, key, keyPath, selectedKeys }) => {
    localStorage.menuKey = selectedKeys;
    setSelectedKeys(selectedKeys)
    setMenuData(menus.children[key])
    router.push(menus.children[key][0].uri)
  }

  const menuDataRender = () => {
    let menuData = deepMenuData(menuDataState);
    return menuData;
  };

  const headerRender = (rightProps) => {
    if (menus.top && menus.top.length > 0) {
      let menuItem
      menuItem = menus.top.map((item, index) => {
        return (<Menu.Item key={item.id}>{item.name}</Menu.Item>)
      })
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* <Button onClick={() => setCollapsed(!isCollapsed)} style={{ background: 'transparent', border: 'none' }}>
              <Icon type={isCollapsed ? 'menu-unfold' : 'menu-fold'} style={{ color: '#FFFFFF' }} />
            </Button> */}
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={selectedKeys}
              style={{ lineHeight: '64px' }}
              onSelect={onSelect}
            >
              {menuItem}
            </Menu>
          </div>
          <RightContent {...rightProps} />
        </div>)
    }
  };

  const handleMenuCollapse = payload =>
    dispatch &&
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload,
    });

  return (
    <ProLayout
      logo={logo}
      title={config.zh_name}
      // collapsed={isCollapsed}
      // onCollapse={handleMenuCollapse(isCollapsed)}
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      headerRender={menus.top && menus.top.length > 0 ? headerRender : null}
      footerRender={false}
      menuDataRender={menuDataRender}
      rightContentRender={menus.top && menus.top.length > 0 ? null : rightProps => <RightContent {...rightProps} />}
      {...props}
    >
      {children}
    </ProLayout>
  );
};

export default connect(({ global, user }) => ({
  collapsed: global.collapsed,
  menus: user.menus,
  currentUser: user.currentUser,
}))(BasicLayout);
