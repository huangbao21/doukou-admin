import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
  return request(API.COMMISSION_FINANCE_DETAIL_LIST, {
    data: params,
  });
}
export function withdrawMoney(params) {
  return request(API.COMMISSION_WITHDRAW, {
    method: 'POST',
    data: params
  })
}
export function fetchSummarize(params) {
  return request(API.COMMISSION_FINANCE_GET, {
    data: params,
  });
}
export function fetchDetail(params) {
  return request(API.COMMISSION_FINANCE_DETAIL, {
    data: params
  })
}
