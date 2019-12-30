import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
  return request(API.ORDER_LIST, {
    data: params,
  });
}

export function fetchDetail(params) {
  return request(`${API.ORDER_DETAIL}/${params}`, {
    
  })
}

export function fetchOrderDownload(params) {
  return request(API.ORDER_EXPORT, {
    data: params,
  })
}

export function fetchOrderRefund(params) {
  return request(API.ORDER_REFUND, {
    data: params,
    method: 'post',
  });
}