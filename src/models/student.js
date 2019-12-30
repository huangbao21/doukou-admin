import * as studentService from '@/services/student';
const studentModel = {
  namespace: 'student',
  state: {
    studentList: {},
    orderList: {},
    productOrderList:{},
    classObj:{}
  },
  reducers: {
    save(state, { payload: { studentList } }) {
      return { ...state, studentList };
    },
    saveOrder(state, { payload: { orderList } }) {
      return { ...state, orderList }
    },
    saveProductOrder(state, { payload: { productOrderList } }) {
      return { ...state, productOrderList }
    },
    saveClassObj(state, { payload: { classObj } }) {
      return { ...state, classObj }
    }
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(studentService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          studentList: data,
        }
      });
    },
    *fetchOrderList({ payload }, { call, put }) {
      const data = yield call(studentService.fetchOrderList, { ...payload });
      yield put({
        type: 'saveOrder',
        payload: {
          orderList: data,
        }
      });
    },
    *fetchProductOrderList({ payload }, { call, put }) {
      const data = yield call(studentService.fetchProductOrderList, { ...payload });
      yield put({
        type: 'saveProductOrder',
        payload: {
          productOrderList: data,
        }
      });
    },
    *fetchClassObj({ payload }, { call, put }) {
      const data = yield call(studentService.fetchMemberClass, { ...payload });
      yield put({
        type: 'saveClassObj',
        payload: {
          classObj: data,
        }
      });
    },
  },
};
export default studentModel;

