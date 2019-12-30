import * as courseService from '@/services/course';
const courseModel = {
  namespace: 'course',
  state: {
    courseList: {},
    buyDetials: {},
    timeList: {},
    editDetail: {}
  },
  reducers: {
    save(state, { payload: { courseList } }) {
      return { ...state, courseList };
    },
    saveDetial(
      state,
      {
        payload: { buyDetials },
      },
    ) {
      return { ...state, buyDetials };
    },
    saveTime(
      state,
      {
        payload: { timeList },
      },
    ) {
      return { ...state, timeList };
    },
    saveEditDetail(state, { payload: { editDetail } }) {
      return { ...state, editDetail };
    }
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(courseService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          courseList: data,
        },
      });
    },
    *fetchDetail({ payload }, { call, put }) {
      const data = yield call(courseService.fetchDetail, { ...payload });
      yield put({
        type: 'saveDetial',
        payload: {
          buyDetials: data,
        },
      });
    },
    *fetchTimeList({ payload }, { call, put }) {
      const data = yield call(courseService.fetchTimeList, { ...payload });
      yield put({
        type: 'saveTime',
        payload: {
          timeList: data,
        },
      });
    },

    *fetchEditDetail({ payload }, { call, put }) {
      const data = yield call(courseService.fetchEditDetail, payload);
      yield put({
        type: 'saveEditDetail',
        payload: {
          editDetail: data,
        },
      });
    },
  },
};
export default courseModel;
