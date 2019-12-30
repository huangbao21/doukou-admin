import * as financeService from '@/services/finance';
const financeModel = {
  namespace: 'finance',
  state: {
    financeList: {},
    orderList: {}
  },
  reducers: {
    save(state, { payload: { financeList } }) {
      return { ...state, financeList };
    },
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(financeService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          financeList: data,
        }
      });
    },
  },
};
export default financeModel;

