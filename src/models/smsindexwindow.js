import * as smsindexwindowService from '@/services/smsindexwindow';
const smsindexwindowModel = {
  namespace: 'smsindexwindow',
  state: {
    smsindexwindowList: {},
  },
  reducers: {
    save(state, { payload: { smsindexwindowList } }) {
      return { ...state, smsindexwindowList };
    },
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(smsindexwindowService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          smsindexwindowList: data,
        }
      });
    },
  },
};
export default smsindexwindowModel;

