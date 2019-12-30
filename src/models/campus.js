import * as campusService from '@/services/campus';
const CampusModel = {
  namespace: 'campus',
  state: {
    campusList: {}
  },
  reducers: {
    save(state, { payload: { campusList } }) {
      return { ...state, campusList};
    }
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(campusService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          campusList: data,
        }
      });
    },
  },
};
export default CampusModel;

