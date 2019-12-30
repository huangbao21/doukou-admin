import * as commentService from '@/services/comment';
const commentModel = {
  namespace: 'comment',
  state: {
    commentList: {},
    commentTotal:{}
  },
  reducers: {
    save(state, { payload: { commentList } }) {
      return { ...state, commentList };
    },
    saveTotal(state, { payload: { commentTotal } }) {
      return { ...state, commentTotal };
    },
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(commentService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          commentList: data,
        }
      });
    },
    *fetchCommentTotal({ payload }, { call, put }) {
      const data = yield call(commentService.fetchCommentTotal, { ...payload });
      yield put({
        type: 'saveTotal',
        payload: {
          commentTotal: data,
        },
      });
    },
  },
};
export default commentModel;

