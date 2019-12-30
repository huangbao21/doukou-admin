import * as teacherService from '@/services/teacher';
const TeacherModel = {
  namespace: 'teacher',
  state: {
    teacherList: {},
    courseList: {},
    teacherDetail: {}
  },
  reducers: {
    save(state, { payload: { teacherList } }) {
      return { ...state, teacherList };
    },
    saveCourse(state, { payload: { courseList } }) {
      return { ...state, courseList };
    },
    saveDetail(state, { payload: { teacherDetail } }) {
      return { ...state, teacherDetail };
    }
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(teacherService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          teacherList: data,
        },
      });
    },
    *fetchCourseList({ payload }, { call, put }) {
      const data = yield call(teacherService.fetchCourseList, { ...payload });
      yield put({
        type: 'saveCourse',
        payload: {
          courseList: data,
        },
      });
    },
    *fetchTeacherDetail({ payload }, { call, put }) {
      const data = yield call(teacherService.fetchTeacherDetail, payload);
      yield put({
        type: 'saveDetail',
        payload: {
          teacherDetail: data,
        },
      });
    },
  },
};
export default TeacherModel;
