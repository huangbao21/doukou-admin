import * as adminService from '@/services/admin';
const adminModel = {
  namespace: 'admin',
  state: {
    adminList: {},
  },
  reducers: {
    save(state, { payload: { adminList } }) {
      return { ...state, adminList };
    },
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(adminService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          adminList: data,
        }
      });
    },
  },
};
export default adminModel;

