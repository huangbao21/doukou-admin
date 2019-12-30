import * as returnService from '@/services/return';
const ReturnModel = {
  namespace: 'return',
  state: {
    returnList: {},
    returnView:{},
    addressList:[],
  },
  reducers: {
    save(state, { payload: { returnList } }) {
      return { ...state, returnList };
    },
    saveView(state,{payload:{returnView}}){
      return {...state,returnView}
    },
    saveAddress(state, { payload: { addressList}}){
      return { ...state, addressList}
    }
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(returnService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          returnList: data,
        },
      });
    },
    *fetchView({ payload }, { call, put }) {
      const data = yield call(returnService.fetView, { ...payload });
      yield put({
        type: 'saveView',
        payload: {
          returnView: data,
        },
      });
    },
    *fetchAddress({ payload }, { call, put }) {
      const data = yield call(returnService.fetchAdress, { ...payload });
      yield put({
        type: 'saveAddress',
        payload: {
          addressList: data,
        },
      });
    },

  },
};
export default ReturnModel;
