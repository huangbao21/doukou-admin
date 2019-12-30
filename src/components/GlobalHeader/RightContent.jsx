import { Icon, Tooltip } from 'antd';
import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import Avatar from './AvatarDropdown';
import styles from './index.less';

const GlobalHeaderRight = props => {
  let className = `${styles.right}  ${styles.dark}`
  return (
    <div className={className}>
      <Avatar {...props}></Avatar>
    </div>
  );
};

export default connect()(GlobalHeaderRight);
