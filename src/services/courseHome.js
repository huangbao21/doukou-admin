import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchModules() {
  return request(API.APP_SETTING_MODULE, {
  });
}
export function fetchPart(code) {
  return request(`${API.APP_PART_CODE}/${code}`)
}
export function delModules(params) {
  return request(API.APP_SETTING_DEL, {
    data: params
  })
}
export function saveModule(params) {
  return request(API.APP_SETTING_SAVE, {
    data: params,
    method: 'post'
  })
}
export function fetchAllCourse() {
  return request(API.COURSE_ALL_LIST)
}
export function fetchAllGroup() {
  return request(API.GROUP_ALL)
}
export function fetchAllRank(params) {
  return request(API.GROUP_COURSE_ALL, {
    data: params
  })
}