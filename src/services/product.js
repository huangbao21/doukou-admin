import request from '@/utils/request';
import API from '@/utils/api';
import Helper from '@/utils/helper';

export function createProduct(params) {
  return request(API.PRODUCT_CREATE, {
    method: 'POST',
    data: params
  })
}
export function updateProduct(params) {
  return request(API.PRODUCT_UPDATE, {
    method: 'POST',
    data: params
  })
}

export function fetchList(param) {
  return request(API.PRODUCT_LIST, {
    data: param,
  });
}

export function fetchInfo(id){
  return request(`${API.PRODUCT_GETINFO}/${id}`);
}

export function fetchNoskuList(param) {
  return request(API.PRODUCT_NOSKU_LIST, {
    data: param,
  });
}

export function fetchPriceEdit(param) {
  return request(API.ORDER_PRICE_EDIT, {
    data: param,
    method: 'post'
  });
}

export function fetchProductSend(param) {
  return request(API.ORDER_PRODUCT_SEND, {
    data: param,
    method: 'post'
  });
}

export function fetchLogisticsAll(param) {
  return request(API.LOGISTIC_ALL, {
    data: param
  });
}

export function fetchProductAddress(param) {
  return request(API.PRODUCT_ORDER_ADDRESS, {
    data: param,
    method: 'post'
  });
}

export function fetchOrderList(param) {
  return request(API.ORDER_PRODUCT_LIST, {
    data: param,
  });
}

export function fetchQuickEdit(params) {
  return request(API.PRODUCT_QUICK_EDIT, {
    data: params,
    method: 'post'
  });
}

export function fetchProductPublish(params) {
  return request(API.PRODUCT_PUSLISH, {
    data: params,
  });
}
export function deleteProduct(params){
  return request(API.PRODUCT_DELETE,{
    data: params
  })
}

export function fetchOrderDetail(params) {
  return request(`${API.PRODUCT_ORDER_DETAIL}/${params}`, {
  })
}

export function fetchQuickInfo(params) {
  return request(`${API.PRODUCT_QUICK_INFO}/${params}`, {
  })
}

export function fetchLogisticsDetail(params) {
  return request(`${API.LOGISTICS_DETAIL}/${params}`, {
  })
}

export function fetchProductCategory(params) {
  return request(API.PRODUCT_CATEGORY, {
    data: params,
  });
}

export function fetchCategoryTreeList(params) {
  return request(API.PRODUCT_CATEGORY_TREELIST, {
    data: params
  })
}

export function fetchCategoryAdd(params) {
  return request(API.CATEGORY_ADD, {
    data: params,
    method: 'post',
  });
}

export function fetchCategoryEdit(params) {
  return request(API.CATEGORY_EDIT, {
    data: params,
    method: 'post',
  });
}

export function fetchCategoryDelete(params) {
  return request(API.CATEGORY_DELETE, {
    data: params,
  });
}

export function fetchCategoryUpdateState(params) {
  return request(API.CATEGORY_UPDATE_STATE, {
    data: params,
  });
}

export function fetchCategoryChildren(params) {
  return request(`${API.PRODUCT_CATEGORY_CHILDREN}/${params}`, {
  })
}

export function fetchGroupList(params) {
  return request(API.PRODUCT_GROUP_LIST, {
    data: params,
  });
}

export function fetchGroupAdd(params) {
  return request(API.PRODUCT_GROUP_ADD, {
    data: params,
    method: 'post',
  });
}

export function fetchGroupEdit(params) {
  return request(API.PRODUCT_GROUP_EDIT, {
    data: params,
    method: 'post',
  });
}

export function fetchAddList(params) {
  return request(API.PRODUCT_ADD_LIST, {
    data: params,
  });
}

export function fetchGroupDelete(params) {
  return request(API.PRODUCT_GROUP_DELETE, {
    data: params,
    method: 'post'
  });
}

export function fetchDisable(params) {
  return request(API.PRODUCT_GROUP_DISABLE, {
    data: params,
    method: 'post'
  });
}

export function fetchEnable(params) {
  return request(API.PRODUCT_GROUP_ENABLE, {
    data: params,
    method: 'post'
  });
}

export function fetchGroupProductAdd(params) {
  return request(API.GROUPP_RODUCT_ADD, {
    data: params,
    method: 'post'
  });
}

export function fetchDeleteList(params) {
  return request(API.PRODUCT_DELETE_LIST, {
    data: params,
  });
}

export function fetchGroupProductDelete(params) {
  return request(API.GROUP_PRODUCT_DELETE, {
    data: params,
    method: 'post'
  })
}

export function fetchAddressList(params) {
  return request(API.ADDRESS_LIST, {
    data: params,
  });
}

export function fetchAdressAdd(params) {
  return request(API.ADDRESS_ADD, {
    data: params,
    method: 'post',
  });
}

export function fetchAdressEdit(params) {
  return request(API.ADDRESS_EDIT, {
    data: params,
    method: 'post',
  });
}

export function fetchAddressDelete(params) {
  return request(API.ADDRESS_DELETE, {
    data: params
  });
}

export function fetchAddressUpdateState(params) {
  return request(API.ADDRESS_UPDATE_STATE, {
    data: params
  });
}

export function fetchSortEdit(params) {
  return request(API.PRODUCT_CATEGORY_SORT, {
    data: params,
    method: 'post'
  });
}

export function fetchOrderDownload(params) {
  return request(API.PRODUCT_ORDER_DOWNLOAD, {
    data: params,
  });
}