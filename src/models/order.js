import * as orderService from '@/services/order';
const OrderModel = {
  namespace: 'order',
  state: {
    orderList: {},
    orderDetail: {}
  },
  reducers: {
    save(state, { payload: { orderList } }) {
      return { ...state, orderList };
    },
    saveDetail(state, { payload: { orderDetail } }) {
      return { ...state, orderDetail };
    }
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(orderService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          orderList: data,
        },
      });
    },

    *fetchDetail({ payload }, { call, put }) {
      const data = yield call(orderService.fetchDetail, payload);
      yield put({
        type: 'saveDetail',
        payload: {
          orderDetail: data,
        },
      });
    },
  },
};
export default OrderModel;
