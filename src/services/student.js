import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(param) {
  return request(API.STUDENT_LIST, {
    data: param,
  });
}
export function fetchOrderList(param) {
  return request(API.STUDENT_ORDER, {
    data: param,
  });
}
export function fetchMemberClass(params) {
  return request(API.STUDENT_MEMBER_CLASS, {
    data: params
  })
}
export function fetchProductOrderList(param) {
  return request(API.STUDENT_PRODUCT_ORDER, {
    data: param,
  });
}
export function fetchForbidden(param) {
  return request(API.STUDENT_FORBIDDEN, {
    data: param,
    method: 'post'
  });
}
export function completeClass(params) {
  return request(API.STUDENT_COMPLETE, {
    method: 'POST',
    data: params
  })
}
export function addStudent(params) {
  return request(API.STUDENT_ADD, {
    method: 'POST',
    data: params
  })
}