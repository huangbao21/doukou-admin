import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
  return request(API.SALE_COUPON_LIST, {
    data: params,
  });
}
export function fetchHistoryList(params) {
  return request(API.SALE_COUPON_ORDER, {
    data: params,
  });
}
export function createCoupon(params) {
  return request(API.SALE_COUPON_CREATE, {
    method: 'post',
    data: params
  })
}
export function delCoupon(params) {
  return request(API.SALE_COUPON_DELETE, {
    data: params
  })
}
export function stopCoupon(params) {
  return request(API.SALE_COUPON_STOP, {
    data: params
  })
}
export function updateCoupon(params) {
  return request(API.SALE_COUPON_UPDATE, {
    method: 'POST',
    data: params
  })
}
