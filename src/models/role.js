import * as roleService from '@/services/role';
const RoleModel = {
  namespace: 'role',
  state: {
    roleList: {},
  },
  reducers: {
    save(state, { payload: { roleList },}) {
      return { ...state, roleList };
    },
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(roleService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          roleList: data,
        },
      });
    },
  },
};
export default RoleModel;
