import * as salecouponService from '@/services/salecoupon';
const salecouponModel = {
  namespace: 'salecoupon',
  state: {
    salecouponList: {},
    historyList:{}
  },
  reducers: {
    save(state, { payload: { salecouponList } }) {
      return { ...state, salecouponList };
    },
    saveHistory(state, { payload: { historyList}}){
      return { ...state, historyList};
    }
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(salecouponService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          salecouponList: data||{
            pageNum: 1,
            pageSize: 20
          },
        }
      });
    },
    *fetchHistoryList({payload},{call,put}){
      const data = yield call(salecouponService.fetchHistoryList, { ...payload });
      yield put({
        type: 'saveHistory',
        payload: {
          historyList: data
        }
      });
    }
  },
};
export default salecouponModel;

