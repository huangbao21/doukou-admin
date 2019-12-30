import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
  return request(API.GROUP_LIST, {
    data: params,
  });
}

export function fetchGroupDelete(params) {
  return request(API.GROUP_DELETE, {
    data: params
  });
}

export function fetchGroupAdd(params) {
  return request(API.GROUP_ADD, {
    data: params,
    method: 'post',
  });
}

export function fetchGroupEdit(params) {
  return request(API.GROUP_EDIT, {
    data: params,
    method: 'post',
  });
}

export function fetchUpordown(params) {
  return request(API.GROUP_UPORDOWN, {
    data: params
  });
}

export function fetchCourseList(params) {
  return request(API.GROUP_COURSE_LIST, {
    data: params,
  });
}

export function fetchCourseAdd(params) {
  return request(API.COURSE_ADD, {
    data: params,
    method: 'post',
  });
}

export function fetchCourseEdit(params) {
  return request(API.COURSE_EDIT, {
    data: params,
    method: 'post',
  });
}

export function fetchCourseDelete(params) {
  return request(API.COURSE_DELETE, {
    data: params,
  })
}

export function fetchGroupDetail(params) {
  return request(API.GROUP_DETAIL, {
    data: params,
  })
}

export function fetchGroupCourseDelete(params) {
  return request(API.GROUP_COURSE_DELETE, {
    data: params,
  })
}

export function fetchCourseDetail(params) {
  return request(API.COURSE_DETAIL, {
    data: params,
  })
}

export function fetchGroupCourseAdd(params) {
  return request(API.GROUP_COURSE_ADD, {
    data: params,
    method: 'post'
  })
}

export function fetchUpdateSort(params) {
  return request(API.COURSE_SORT, {
    data: params
  })
}

export function fetchGroupAll(params) {
  return request(API.GROUP_ALL_LIST, {
    data: params
  })
}

export function fetchOptionUpordown(params) {
  return request(API.OPTION_COURSE_UPORDOWN, {
    data: params,
    method: 'post'
  });
}