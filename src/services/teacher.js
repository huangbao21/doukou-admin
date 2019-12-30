import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
  return request(API.TEACHER_LIST, {
    data: params,
  });
}
export function fetchCourseList(params) {
  return request(API.TEACHER_COURSE_LIST, {
    data: params,
  });
}
export function createCourse(params) {
  return request(API.TEACHER_COURSE_CREATE, {
    method: 'post',
    data: params
  })
}
export function updateCourse(params) {
  return request(API.TEACHER_COURSE_UPDATE, {
    method: 'post',
    data: params
  })
}
export function deleteCourse(params) {
  return request(API.TEACHER_COURSE_DELETE, {
    data: params
  })
}

export function fetchTeacherDetail(params) {
  return request(`${API.TEACHER_EDIT_DETAIL}/${params}`, {
  })
}

export function fetchTeacherEdit(params) {
  return request(API.TEACHER_EDIT, {
    method: 'post',
    data: params
  })
}

export function fetchEdit(params){
  return request(API.TEACHER_BASIC_EDIT, {
    method: 'post',
    data: params
  })
}