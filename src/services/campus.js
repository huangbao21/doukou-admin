import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
  return request(API.CAMPUS_LIST, {
    data: params,
  });
}

export function fetchCampusDelete(params) {
  return request(API.CAMPUS_DELETE, {
    data: params,
  });
}

export function fetchCampusAdd(params) {
  return request(API.CAMPUS_ADD, {
    data: params,
    method: 'post',
  });
}

export function fetchCampusEdit(params) {
  return request(API.CAMPUS_EDIT, {
    data: params,
    method: 'post',
  });
}

export function fetchCampusAll(params) {
  return request(API.CAMPUS_ALL, {
    data: params,
  });
}

export function fetchCampusUpordown(params) {
  return request(API.CAMPUS_UPORDOWN, {
    data: params,
    method: 'post',
  });
}
