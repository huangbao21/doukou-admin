import * as couponService from '@/services/coupon';
const couponModel = {
  namespace: 'coupon',
  state: {
    couponList: {},
    historyList: {},
  },
  reducers: {
    save(state, { payload: { couponList } }) {
      return { ...state, couponList };
    },
    saveHistory(state, { payload: { historyList } }) {
      return { ...state, historyList };
    }
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(couponService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          couponList: data || {
            pageNum: 1,
            pageSize: 20
          },
        }
      });
    },
    *fetchHistoryList({ payload }, { call, put }) {
      const data = yield call(couponService.fetchHistoryList, { ...payload });
      yield put({
        type: 'saveHistory',
        payload: {
          historyList: data || {
            pageNum: 1,
            pageSize: 20
          },
        }
      });
    },
  },
};
export default couponModel;

