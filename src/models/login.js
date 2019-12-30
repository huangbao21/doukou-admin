import { parse, stringify } from 'qs';
import { routerRedux } from 'dva/router';
import Helper from '@/utils/helper';
import * as usersService from '@/services/user';

const Model = {
  namespace: 'login',
  state: {
    codeImage: '',
  },
  reducers: {
    saveCodeImage(state, { payload: { codeImage } }) {
      return { ...state, codeImage };
    },
    
  },
  effects: {
    *logout(_, { put }) {

      if (window.location.pathname !== '/login') {
        Helper.clearLoginCookie();
        yield put(
          routerRedux.replace({
            pathname: '/login',
          }),
        );
      }
    },
    *fetchCodeImage({ payload }, { call, put }) {
      const data = yield call(usersService.fetchCodeImage);
      yield put({
        type: 'saveCodeImage',
        payload: {
          codeImage: data,
        },
      });
    },
  },
};
export default Model;
