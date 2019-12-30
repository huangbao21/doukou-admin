import * as classService from '@/services/class';
const classModel = {
  namespace: 'class',
  state: {
    classList: {},
    detailList:[],
    bindList:[]
  },
  reducers: {
    save(state, { payload: { classList } }) {
      return { ...state, classList };
    },
    saveDetailList(state, { payload: { detailList}}){
      return { ...state, detailList}
    },
    saveBindList(state, { payload: { bindList } }) {
      return { ...state, bindList }
    },
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(classService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          classList: data,
        }
      });
    },
    *fetchDetailList({ payload }, { call, put }) {
      const data = yield call(classService.fetchViewList, { ...payload });
      yield put({
        type: 'saveDetailList',
        payload: {
          detailList: data,
        }
      });
    },
    *fetchBindList({ payload }, { call, put }) {
      const data = yield call(classService.fetchBind, { ...payload });
      yield put({
        type: 'saveBindList',
        payload: {
          bindList: data,
        }
      });
    },
  },
};
export default classModel;

