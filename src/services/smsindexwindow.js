import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
  return request(API.INDEX_WINDOW_LIST, {
    data: params,
  });
}
export function createCoupon(params) {
  return request(API.INDEX_WINDOW_CREATE, {
    method: 'post',
    data: params
  })
}
export function delCoupon(params) {
  return request(API.INDEX_WINDOW_DELETE, {
    data: params
  })
}
export function stopCoupon(params) {
  return request(API.INDEX_WINDOW_STOP, {
    data: params
  })
}
export function updateCoupon(params) {
  return request(API.INDEX_WINDOW_UPDATE, {
    method: 'POST',
    data: params
  })
}
