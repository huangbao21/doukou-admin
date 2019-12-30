import * as usersService from '@/services/user';
const UserModel = {
  namespace: 'user',
  state: {
    currentUser: {},
    menus: {},
    btnPermission:{}
  },
  reducers: {
    saveMenus(state, { payload: { menus } }) {
      return { ...state, menus,btnPermission:menus.btnMap||{} };
    },
    saveCurrentUser(state, { payload: { currentUser } }) {
      return { ...state, currentUser };
    },
  },
  effects: {
    *fetchPermissionAll({ payload = {} }, { call, put }) {
      const data = yield call(usersService.fetchPermissionAll, {});
      yield put({
        type: 'saveMenus',
        payload: { menus: data || {} },
      });
    },

    *fetchUserInfo({ payload }, { call, put }) {
      const data = yield call(usersService.fetchUserInfo, {});
      yield put({
        type: 'saveCurrentUser',
        payload: {
          currentUser: data
        },
      });
    },
  },
};
export default UserModel;
