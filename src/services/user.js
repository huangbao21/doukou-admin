import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchSmsCode(param) {
  return request(API.USER_MSG_CODE, {
    method: 'post',
    data: param,
  });
}
export function fetchPermissionAll(param) {
  return request(API.USER_PERMISSION_ALLLIST, {}).then(d => {
    return d ? d : d;
  });
}
export function fetchLogin(param) {
  return request(API.USER_LOGIN, {
    method: 'post',
    data: param,
  }).then(data => {
    if (data) {
      Helper.setLoginCookie(data);
    }
    return data;
  });
}

export function fetchUserInfo(params) {
  return request(API.USER_INFO, {
    data: params
  })
}
