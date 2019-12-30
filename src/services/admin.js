import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
  return request(API.ADMIN_LIST, {
    data: params,
  });
}
export function createUser(params) {
  return request(API.ADMIN_CREATE, {
    method: 'post',
    data: params
  })
}
export function updateUser(params) {
  return request(API.ADMIN_UPDATE, {
    method: 'post',
    data: params
  })
}
export function delUser(params) {
  return request(API.ADMIN_DEL, {
    method: 'post',
    data: params
  })
}
export function disableUser(params) {
  return request(API.ADMIN_DISABLE, {
    method: 'post',
    data: params
  })
}
export function enableUser(params) {
  return request(API.ADMIN_ENABLE, {
    method: 'post',
    data: params
  })
}
