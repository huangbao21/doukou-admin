import * as mallServices from '@/services/mall';
const mallModel = {
  namespace: 'mall',
  state: {
    moduleList: {},
    groupList:[],
    productList:[]
  },
  reducers: {
    save(state, { payload: { moduleList } }) {
      return { ...state, moduleList };
    },
    saveGroup(state, { payload: { groupList } }) {
      return { ...state, groupList };
    },
    saveProduct(state, { payload: { productList}}){
      return { ...state, productList}
    }
  },
  effects: {
    *fetchModules({ payload }, { call, put }) {
      const data = yield call(mallServices.fetchModules, { ...payload });
      yield put({
        type: 'save',
        payload: {
          moduleList: data,
        }
      });
    },
    *fetchGroup({ payload }, { call, put }) {
      const data = yield call(mallServices.fetchGroup, { ...payload });
      yield put({
        type: 'saveGroup',
        payload: {
          groupList: data,
        }
      });
    },
    *fetchProductAll({ payload }, { call, put }) {
      const data = yield call(mallServices.fetchProductAll, { ...payload });
      yield put({
        type: 'saveProduct',
        payload: {
          productList: data,
        }
      });
    },
  },
};
export default mallModel;

