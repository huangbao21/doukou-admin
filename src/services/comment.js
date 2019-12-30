import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function fetchList(params) {
    return request(API.COMMENT_LIST, {
      data: params,
    });
  }

export function fetchCommentTotal(params) {
    return request(API.PRODUCT_COMMENT_TOTAL, {
      data: params,
    })
}

export function fetchReplySave(params) {
  return request(API.COMMENT_REPLY_SAVE, {
    data: params,
    method: 'post'
  });
}

export function fetchCommentDelete(params) {
  return request(API.COMMENT_DELETE, {
    data: params,
  });
}