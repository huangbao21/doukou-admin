import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
  return request(API.COURSE_LIST, {
    data: params,
  });
}

export function fetchUpordown(params) {
  return request(API.COURSE_UPORDOWN, {
    data: params,
    method: 'post',
  });
}

export function fetchCourseDelete(params) {
  return request(API.COURSE_BASIS_DELETE, {
    data: params,
  })
}

export function fetchDetail(params) {
  return request(API.COURSE_BUY_DETAIL, {
    data: params,
  });
}

export function fetchTimeList(params) {
  return request(API.COURSE_IN_LIST, {
    data: params,
  });
}

export function fetchTimeAdd(params) {
  return request(API.COURSE_IN_ADD, {
    data: params,
    method: 'post'
  });
}

export function fetchTimeEdit(params) {
  return request(API.COURSE_IN_EDIT, {
    data: params,
    method: 'post'
  });
}

export function fetchTimeDelete(params) {
  return request(API.COURSE_IN_DELETE, {
    data: params,
  });
}

export function fetchCourseAdd(params) {
  return request(API.COURSE_BASIS_ADD, {
    data: params,
    method: 'post'
  });
}

export function fetchEditDetail(params) {
  return request(`${API.COURSE_EDIT_DETAIL}/${params}`, {
  })
}

export function fetchCourseEdit(params) {
  return request(API.COURSE_BASIS_EDIT, {
    data: params,
    method: 'post'
  });
}

export function fetchQuickEdit(params) {
  return request(API.COURSE_QUICK_EDIT, {
    data: params,
    method: 'post'
  });
}

export function fetchAllList(params) {
  return request(API.GROUP_COURSE_ALL, {
    data: params,
  });
}

export function fetchSortEdit(params) {
  return request(API.COURSE_SORT_EDIT, {
    data: params,
    method: 'post'
  })
}