import * as groupService from '@/services/group';
const GroupModel = {
  namespace: 'group',
  state: {
    groupList: {},
    courseList: {},
    groupDetail: {},
    courseDetail: {}
  },
  reducers: {
    save(state,{payload: { groupList }}) {
      return { ...state, groupList };
    },
    saveCourse(state,{payload: { courseList }}) {
      return { ...state, courseList };
    },
    saveDetail(state, { payload: { groupDetail } }) {
      return { ...state, groupDetail };
    },
    saveCourseDetail(state, { payload: { courseDetail } }) {
      return { ...state, courseDetail };
    }
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(groupService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          groupList: data,
        },
      });
    },

    *fetchCourseList({ payload }, { call, put }) {
      const data = yield call(groupService.fetchCourseList, { ...payload });
      yield put({
        type: 'saveCourse',
        payload: {
          courseList: data,
        },
      });
    },

    *fetchGroupDetail({ payload }, { call, put }) {
      const data = yield call(groupService.fetchGroupDetail, { ...payload });
      yield put({
        type: 'saveDetail',
        payload: {
          groupDetail: data,
        },
      });
    },

    *fetchCourseDetail({ payload }, { call, put }) {
      const data = yield call(groupService.fetchCourseDetail, { ...payload });
      yield put({
        type: 'saveCourseDetail',
        payload: {
          courseDetail: data,
        },
      });
    },
  },
};
export default GroupModel;
