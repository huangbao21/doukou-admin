import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
  return request(API.COUPON_LIST, {
    data: params,
  });
}
export function fetchHistoryList(params) {
  return request(API.COUPON_HISTORY_LIST, {
    data: params,
  });
}
export function fetchCouponShareCode(id){
  return request(`${API.COUPON_SHARE}/${id}`);
}
export function createCoupon(params) {
  return request(API.COUPON_CREATE, {
    method: 'post',
    data: params
  })
}
export function delCoupon(id) {
  return request(`${API.COUPON_DELETE}/${id}`)
}
export function stopCoupon(id) {
  return request(`${API.COUPON_STOP}/${id}`)
}
export function updateCoupon(params) {
  return request(API.COUPON_UPDATE,{
    method:'POST',
    data:params
  })
}
export function fetchAllCoupon(params){
  return request(API.COUPON_ALL,{
    data: params
  })
}
export function viewCoupon(id) {
  return request(`${API.COUPON_VIEW}/${id}`)
}
