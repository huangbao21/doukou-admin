import * as courseHomeService from '@/services/courseHome';
const courseHomeModel = {
  namespace: 'courseHome',
  state: {
    moduleList: {},
    allCourse: [],
    allRank: [],
    allGroup: []
  },
  reducers: {
    save(state, { payload: { moduleList } }) {
      return { ...state, moduleList };
    },
    saveCourse(state, { payload: { allCourse } }) {
      return { ...state, allCourse }
    },
    saveRank(state, { payload: { allRank } }) {
      return { ...state, allRank }
    },
    saveGroup(state, { payload: { allGroup } }){
      return { ...state, allGroup}
    }
  },
  effects: {
    *fetchModules({ payload }, { call, put }) {
      const data = yield call(courseHomeService.fetchModules, { ...payload });
      yield put({
        type: 'save',
        payload: {
          moduleList: data,
        }
      });
    },
    *fetchAllCourse({ payload }, { call, put }) {
      const data = yield call(courseHomeService.fetchAllCourse, { ...payload })
      yield put({
        type: 'saveCourse',
        payload: {
          allCourse: data,
        }
      });
    },
    *fetchAllRank({ payload }, { call, put }) {
      const data = yield call(courseHomeService.fetchAllRank, { ...payload })
      yield put({
        type: 'saveRank',
        payload: {
          allRank: data,
        }
      });
    },
    *fetchAllGroup({ payload }, { call, put }) {
      const data = yield call(courseHomeService.fetchAllGroup, { ...payload })
      yield put({
        type: 'saveGroup',
        payload: {
          allGroup: data,
        }
      });
    }
  },
};
export default courseHomeModel;

