import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(param) {
  return request(API.CLASS_ALL_LIST, {
    data: param,
  });
}
export function fetchViewList(param) {
  return request(API.CLASS_SEE, {
    data: param,
  });
}
export function fetchClassAll(params) {
  return request(API.CLASS_ALL, {
    data: params,
  });
}
export function fetchBind(params) {
  return request(API.CLASS_BIND, {
    data: params
  })
}
export function addClass(params) {
  return request(API.CLASS_ADD, {
    method: 'POST',
    data: params
  })
}
export function delClass(params) {
  return request(API.CLASS_DEL, {
    data: params
  })
}
export function stopClass(params) {
  return request(API.CLASS_STOP, {
    data: params
  })
}
