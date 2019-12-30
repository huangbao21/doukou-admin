/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';
import Helper from './helper';
import API from '@/utils/api';
import router from 'umi/router';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器忙，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};
/**
 * 异常处理程序
 */

const errorHandler = response => {
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
    throw response;
  } else {
    notification.error({
      message: '网络错误',
      description: '请检查网络或联系管理员',
    });
    // router.replace('/login')
  }
};
/**
 * 配置request请求时的默认参数
 */
const request = extend({ errorHandler })
request.interceptors.request.use((url, options) => {
  const { method } = options;
  const accessToken = Helper.getCookie('accessToken');
  const tokenType = Helper.getCookie('type');
  const headers = { 'Authorization': `${tokenType} ${accessToken}` };
  const requestType = method.toLowerCase() == 'get' ? 'form' : 'json'
  options.params = method.toLowerCase() == 'get' ? options.data : ''
  return (
    {
      url: url,
      options: { ...options, headers, requestType },
    }
  );
});
request.interceptors.response.use(async (response, options) => {
  const res = await response.clone().json();
  const { code, data, message } = res;
  if (response.status == 200) {
    if (code == 200) {
      return data;
    } else if (code == 401) {
      // 暂未登录或token已经过期
      if (Helper.getCookie('refreshToken')) {
        router.push('/login');
      } else {
        if (response.url.indexOf('token/refresh') != -1) {
          Helper.setCookie('refreshToken', "true");
        }
        return refreshToken(response.url, options);
      }
      notification.error({
        message: code,
        description: message,
      });
    } else {
      // 403：没有相关权限，404：参数检验失败，500：操作失败
      notification.error({
        message: '请求错误',
        description: message,
      });
    }
  } else {
    errorHandler(response)
  }
})

async function refreshToken(url, options) {
  const res = await request(API.USER_REFRESH_TOKEN);
  if (res) {
    Helper.setLoginCookie(res);
    return await request(url, options);
  }
}

export const setUrlEncoded = (obj) => {
  let urlEncoded = '';
  if (obj && obj instanceof Object) {
    const keys = Object.keys(obj);
    if (keys && keys.length) {
      keys.forEach((key, index) => {
        urlEncoded += `${key}=${obj[key]}`;
        if (index + 1 < keys.length) {
          urlEncoded += '&';
        }
      });
    }
  }
  return urlEncoded;
}

export default request;
