import * as productService from '@/services/product';
const productModel = {
  namespace: 'product',
  state: {
    productList: {},
    noskuList: {},
    productOrderList: {},
    orderDetail: {},
    logisticsDetail: {},
    categoryList: {},
    categoryTreeList: [],
    childList: {},
    groupList: {},
    addList: {},
    deleteList: {},
    addressList: {},
    quickInfo: {}
  },
  reducers: {
    save(state, { payload: { productList } }) {
      return { ...state, productList };
    },
    saveNosku(state, { payload: { noskuList } }) {
      return { ...state, noskuList };
    },
    saveOrder(state, { payload: { productOrderList } }) {
      return { ...state, productOrderList };
    },
    saveDetail(state, { payload: { orderDetail } }) {
      return { ...state, orderDetail };
    },
    saveQuickInfo(state, { payload: { quickInfo } }) {
      return { ...state, quickInfo };
    },
    saveLogistics(state, { payload: { logisticsDetail } }) {
      return { ...state, logisticsDetail };
    },
    saveCategory(state, { payload: { categoryList } }) {
      return { ...state, categoryList };
    },
    saveTreeList(state, { payload: { categoryTreeList } }) {
      return { ...state, categoryTreeList };
    },
    saveChild(state, { payload: { childList } }) {
      return { ...state, childList };
    },
    saveGroup(state,{payload: { groupList }}) {
      return { ...state, groupList };
    },
    saveAddList(state, { payload: { addList } }) {
      return { ...state, addList };
    },
    saveDeleteList(state, { payload: { deleteList } }) {
      return { ...state, deleteList };
    },
    saveAddress(state, { payload: { addressList } }) {
      return { ...state, addressList };
    }
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const data = yield call(productService.fetchList, { ...payload });
      yield put({
        type: 'save',
        payload: {
          productList: data,
        }
      });
    },
    *fetchNoskuList({ payload }, { call, put }) {
      const data = yield call(productService.fetchNoskuList, { ...payload });
      yield put({
        type: 'saveNosku',
        payload: {
          noskuList: data,
        }
      });
    },
    *fetchOrderList({ payload }, { call, put }) {
      const data = yield call(productService.fetchOrderList, { ...payload });
      yield put({
        type: 'saveOrder',
        payload: {
          productOrderList: data,
        }
      });
    },
    *fetchOrderDetail({ payload }, { call, put }) {
      const data = yield call(productService.fetchOrderDetail, payload);
      yield put({
        type: 'saveDetail',
        payload: {
          orderDetail: data,
        },
      });
    },
    *fetchQuickInfo({ payload }, { call, put }) {
      const data = yield call(productService.fetchQuickInfo, payload);
      yield put({
        type: 'saveQuickInfo',
        payload: {
          quickInfo: data,
        },
      });
    },
    *fetchLogisticsDetail({ payload }, { call, put }) {
      const data = yield call(productService.fetchLogisticsDetail, payload);
      yield put({
        type: 'saveLogistics',
        payload: {
          logisticsDetail: data,
        },
      });
    },
    *fetchProductCategory({ payload }, { call, put }) {
      const data = yield call(productService.fetchProductCategory, { ...payload });
      yield put({
        type: 'saveCategory',
        payload: {
          categoryList: data,
        }
      });
    },
    *fetchProductCategoryTreeList({ payload }, { call, put }) {
      const data = yield call(productService.fetchCategoryTreeList, { ...payload });
      yield put({
        type: 'saveTreeList',
        payload: {
          categoryTreeList: data,
        }
      });
    },
    *fetchCategoryChildren({ payload }, { call, put }) {
      const data = yield call(productService.fetchCategoryChildren, payload);
      yield put({
        type: 'saveChild',
        payload: {
          childList: data,
        },
      });
    },
    *fetchGroupList({ payload }, { call, put }) {
      const data = yield call(productService.fetchGroupList, { ...payload });
      yield put({
        type: 'saveGroup',
        payload: {
          groupList: data,
        },
      });
    },
    *fetchAddList({ payload }, { call, put }) {
      const data = yield call(productService.fetchAddList, { ...payload });
      yield put({
        type: 'saveAddList',
        payload: {
          addList: data,
        },
      });
    },
    *fetchDeleteList({ payload }, { call, put }) {
      const data = yield call(productService.fetchDeleteList, { ...payload });
      yield put({
        type: 'saveDeleteList',
        payload: {
          deleteList: data,
        },
      });
    },
    *fetchAddressList({ payload }, { call, put }) {
      const data = yield call(productService.fetchAddressList, { ...payload });
      yield put({
        type: 'saveAddress',
        payload: {
          addressList: data,
        },
      });
    },
  },
};
export default productModel;

