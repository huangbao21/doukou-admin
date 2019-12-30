import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
  return request(API.RETURNAPPLY_LIST, {
    data: params,
  });
}
export function fetView(params) {
  return request(`${API.RETURNAPPLY_VIEW}/${params.deal}`);
}
export function updateInfo(params) {
  return request(API.RETURNAPPLY_UPDATE, {
    data: params,
    method: 'POST'
  })
}
export function fetchAdress(params){
  return request(API.ADDRESS_ALL_LIST,{
    data: params
  })
}
