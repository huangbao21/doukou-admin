import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(param) {
  return request(API.COMMISSION_LIST, {
    data: param,
  });
}
export function fetchEdit(params) {
  return request(API.COMMISSION_EDIT, {
    data: params,
    method: 'post'
  });
}

export function fetchCommissionConfirm(params) {
  return request(API.COMMISSION_CONFIRM, {
    data: params,
    method: 'post'
  });
}