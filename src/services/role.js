import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
  return request(API.ROLE_LIST, {
    data: params,
  });
}
export function fetchRolesAll() {
  return request(API.ROLE_ALL);
}
export function createRole(params) {
  return request(API.ROLE_CREATE, {
    data: params,
    method: 'post'
  })
}
export function fetchPermission(id) {
  return request(`${API.ROLE_PERMISSION}/${id}`)
}
export function updatePermission(params) {
  return request(API.ROLE_PERMISSION_UPDATE, {
    data: params,
    method: 'post'
  })
}