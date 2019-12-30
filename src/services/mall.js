import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchModules() {
  return request(API.MALL_SETTING_MODULE, {
  });
}
export function fetchPart(code) {
  return request(`${API.MALL_PART_CODE}/${code}`)
}
export function delModules(params) {
  return request(API.MALL_SETTING_DEL, {
    data: params
  })
}
export function saveModule(params) {
  return request(API.MALL_SETTING_SAVE, {
    data: params,
    method: 'post'
  })
}
export function fetchGroup(params) {
  return request(API.PRODUCT_GROUP_ALL, {
    data: params,
  })
}
export function fetchProductAll(params) {
  return request(API.PRODUCT_ALL_LIST, {
    data: params
  })
}