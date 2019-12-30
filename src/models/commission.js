import * as commissionService from '@/services/commission';
const commissionModel = {
  namespace: 'commission',
  state: {
    commissionList: {},
    orderList: {}
  },
  reducers: {
    save(state, { payload: { commissionList } }) {
      return { ...state, commissionList };
    },
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(commissionService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          commissionList: data,
        }
      });
    },
  },
};
export default commissionModel;

