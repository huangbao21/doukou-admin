import React from 'react';
import styles from './index.less';
import cartImg from '@/assets/cart.png';
import config from '@/config';

export default () => (
  <div className={styles.normal}>
    <div className={styles.wrapper}>
      <div>
        <h2 className={styles.title}>欢迎使用</h2>
        <p className={styles.subtitle}>{config.zh_name}管理后台</p>
      </div>
      <img src={cartImg} alt="cart" className={styles.cart} />
    </div>
  </div>
);
