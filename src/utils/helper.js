/* eslint-disable */
import { message } from 'antd';
import moment from 'moment';

const isObj = require('is-obj');

let downloadingFile = {};

export default class Helper {

  static setLoginCookie(obj) {
    const token = obj;
    localStorage.accessToken = token.token;
    localStorage.type = token.tokenHead;
    localStorage.refreshToken = '';
  }
  static clearLoginCookie() {
    localStorage.accessToken = '';
    localStorage.type = '';
    localStorage.refreshToken = '';
  }


  static getCookie(name) {
    return localStorage[name];
  }

  static setCookie(name, v) {
    return localStorage[name] = v;
  }

  static objClean = obj => {
    for (const x of Object.keys(obj)) {
      if (obj[x] === undefined || obj[x] === null) {
        delete obj[x];
      }

      if (isObj(obj[x])) {
        Helper.objClean(obj[x]);
      }
    }

    return obj;
  };

  /**
   * 用于文件的导出
   * @param  { String }  url 导出地址
   * @return { File }
   */
  static download_file(url) {
    if (typeof downloadingFile.iframe === 'undefined') {
      var iframe = document.createElement('iframe');
      downloadingFile.iframe = iframe;
      document.body.appendChild(downloadingFile.iframe);
    }
    downloadingFile.iframe.src = url;
    downloadingFile.iframe.style.display = 'none';
    message.warning('正在下载，请稍等...');
  }
  /**
   * 
   * @param {File} file
   * @result 设置源图片的宽高
   */
  static setFileScale(file) {
    return new Promise((resolve,reject)=>{
      let fileReader = new FileReader();
      fileReader.onload = e => {
        let src = e.target.result;
        const image = new Image();
        image.onload = (e) => {
          file.width = e.target.width;
          file.height = e.target.height
          resolve();
        };
        image.onerror = reject;
        image.src = src;
      }
      fileReader.readAsDataURL(file);
    })
  }

  /**
   * 
   * @param {moment} start 
   * @param {moment} end 
   * @return {*} time
   */
  static getCountDownTime(start, end) {
    var time = moment.duration(end.diff(start))
    if (time._milliseconds <= 0) time = 0
    return time
  }
  /**
   * @function: 检测特殊字符
   * @param {String} str 
   */
  static checkSpecialStr(str) {
    var myReg = /[,!#$^+\\\[\]]/
    if (myReg.test(str)) {
      return true;
    }
    return false;
  }
  /**
   * 
   * @param {String} url 
   * @returns url
   */
  static prefixImg(url) {
    if (url) {
      let prefix = 'http://image-doukou.oss-cn-hangzhou.aliyuncs.com/';
      if (url.indexOf('http') != -1) return url;
      return prefix + url;
    }
  }
}
