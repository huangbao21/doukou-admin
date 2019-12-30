import { stat } from 'fs';

const server = '/api/';
// const server = 'http://192.168.10.159:8086/api/';
export default class API {
  // OSS
  static ALIYUN_OSS_POLICY = server + 'aliyun/oss/policy';
  // 登录
  static USER_MSG_CODE = server + 'admin/getAuthCode';
  static USER_LOGIN = server + 'admin/login';
  static USER_PERMISSION_ALLLIST = server + 'permission/allList';
  static USER_REFRESH_TOKEN = server + 'admin/token/refresh';

  // 个人信息
  static USER_INFO = server + 'admin/info';

  // 校区管理
  static CAMPUS_LIST = server + 'admin/campus/list';
  static CAMPUS_DELETE = server + 'admin/campus/delete';
  static CAMPUS_ADD = server + 'admin/campus/create';
  static CAMPUS_EDIT = server + 'admin/campus/update';
  static CAMPUS_ALL = server + 'admin/campus/all';
  static CAMPUS_UPORDOWN = server + 'admin/campus/upordown'

  // 课程首页设置
  static APP_SETTING_SAVE = server + 'app/setting/save';
  static APP_SETTING_MODULE = server + 'app/setting/module';
  static APP_SETTING_DEL = server + 'app/setting/del';
  static APP_PART_CODE = server + 'app/setting/part';

  // 电商首页设置
  static MALL_SETTING_SAVE = server + 'mall/setting/save';
  static MALL_SETTING_MODULE = server + 'mall/setting/module';
  static MALL_PART_CODE = server + 'mall/setting/part';
  static MALL_SETTING_DEL = server + 'mall/setting/del';

  // 学员管理
  static STUDENT_LIST = server + 'student/getlist';
  static STUDENT_FORBIDDEN = server + 'student/forbidden';
  static STUDENT_ORDER = server + 'student/order';
  static STUDENT_PRODUCT_ORDER = server + 'student/product/order';
  static STUDENT_MEMBER_CLASS = server + 'student/member/class';
  static STUDENT_COMPLETE = server + 'student/complete';
  static STUDENT_ADD = server + 'student/add';

  // 财务概况
  static COMMISSION_FINANCE_DETAIL = server + 'finance/info'
  static COMMISSION_FINANCE_DETAIL_LIST = server + 'finance/list'
  static COMMISSION_FINANCE_GET = server + 'finance/profile'
  static COMMISSION_WITHDRAW= server + 'withdraw'

  // 佣金核发
  static COMMISSION_LIST = server + 'commission/list'
  static COMMISSION_EDIT = server + 'commission/edit'
  static COMMISSION_CONFIRM = server + 'commission/confirm'

  // 教师管理
  static TEACHER_LIST = server + 'teacher/list';
  static TEACHER_COURSE_LIST = server + 'teacher/course/list';
  static TEACHER_COURSE_CREATE = server + 'teacher/course/create';
  static TEACHER_COURSE_UPDATE = server + 'teacher/course/update';
  static TEACHER_COURSE_DELETE = server + 'teacher/course/delete';
  static TEACHER_EDIT_DETAIL = server + 'teacher/get/teacher'
  static TEACHER_EDIT = server + 'teacher/update'
  static TEACHER_BASIC_EDIT = server + 'teacher/basicUpdate'

  // 订单管理
  static ORDER_LIST = server + 'order/list';
  static ORDER_DETAIL = server + 'order/detail'
  static ORDER_EXPORT = server + 'order/download'
  static ORDER_REFUND = server + 'order/item/refund/create'

  // 课程设置
  static GROUP_LIST = server + 'course/group/list'
  static GROUP_ALL = server + 'course/group/all/list'
  static GROUP_DELETE = server + 'course/group/delete';
  static GROUP_ADD = server + 'course/group/create';
  static GROUP_EDIT = server + 'course/group/update';
  static GROUP_UPORDOWN = server + 'course/group/upordown'
  static GROUP_COURSE_LIST = server + 'admin/option/list'
  static GROUP_COURSE_ALL = server + 'admin/option/all/list'
  static COURSE_ADD = server + 'admin/option/create';
  static COURSE_EDIT = server + 'admin/option/update';
  static COURSE_DELETE = server + 'admin/option/delete'
  static GROUP_DETAIL = server + 'course/group/connte/list'
  static GROUP_COURSE_DELETE = server + 'course/group/connte/delete'
  static COURSE_DETAIL = server + 'course/group/connte/get/course/list'
  static GROUP_COURSE_ADD = server + 'course/group/connte/create'
  static COURSE_SORT = server + 'course/group/connte/updateconntesort'
  static GROUP_ALL_LIST = server + 'course/group/all/list'
  static OPTION_COURSE_UPORDOWN = server + 'admin/option/course/upordown'
  static COURSE_SORT_EDIT = server + 'admin/option/quickupdate'

  // 账号管理
  static ADMIN_LIST = server + 'admin/list'
  static ADMIN_CREATE = server + 'admin/create'
  static ADMIN_UPDATE = server + 'admin/update'
  static ADMIN_DEL = server + 'admin/delete'
  static ADMIN_DISABLE = server + 'admin/disable'
  static ADMIN_ENABLE = server + 'admin/enable'

  // 角色管理
  static ROLE_LIST = server + 'role/list'
  static ROLE_ALL = server + 'role/all'
  static ROLE_CREATE = server + 'role/create'
  static ROLE_PERMISSION = server + 'role/permission'
  static ROLE_PERMISSION_TREELIST = server + 'role/permission/treeList'
  static ROLE_PERMISSION_UPDATE = server + 'role/permission/update'

  // 课程管理
  static COURSE_LIST = server + 'course/basis/list'
  static COURSE_ALL_LIST = server + 'course/basis/all/list'
  static COURSE_UPORDOWN = server + 'course/basis/course/upordown'
  static COURSE_BASIS_DELETE = server + 'course/basis/delete'
  static COURSE_BUY_DETAIL = server + 'course/basis/buy/details'
  static COURSE_IN_LIST = server + 'course/in/list'
  static COURSE_IN_ADD = server + 'course/in/create'
  static COURSE_IN_EDIT = server + 'course/in/update'
  static COURSE_IN_DELETE = server + 'course/in/delete'
  static COURSE_BASIS_ADD = server + 'course/basis/create'
  static COURSE_EDIT_DETAIL = server + 'course/basis/get'
  static COURSE_BASIS_EDIT = server + 'course/basis/update'
  static COURSE_QUICK_EDIT = server + 'course/basis/update/quick'

  // 商品管理
  static PRODUCT_CREATE = server + 'product/create'
  static PRODUCT_LIST = server + 'product/list'
  static PRODUCT_NOSKU_LIST = server + 'product/nosku/list'
  static PRODUCT_QUICK_EDIT = server + 'product/quick/update'
  static PRODUCT_UPDATE = server + 'product/update'
  static PRODUCT_PUSLISH = server + 'product/update/publishStatus'
  static PRODUCT_DELETE = server + 'product/update/deleteStatus'
  static PRODUCT_QUICK_INFO = server + 'product/getInfo/quick'
  // 电商管理-退款维权
  static RETURNAPPLY_LIST = server + 'returnApply/list'
  static RETURNAPPLY_UPDATE = server + 'returnApply/update'
  static RETURNAPPLY_VIEW = server + 'returnApply'
  // 电商管理-订单列表
  static ORDER_PRODUCT_LIST = server + 'order/product/list'
  static PRODUCT_ORDER_DETAIL = server + 'order/product/detail'
  static ORDER_PRICE_EDIT = server + 'order/update/payAmount'
  static ORDER_PRODUCT_SEND = server + 'order/product/send'
  static PRODUCT_ORDER_ADDRESS = server + 'order/product/order/address'

  // 营销互动-优惠券
  static COUPON_LIST = server + 'coupon/list'
  static COUPON_HISTORY_LIST = server + 'couponHistory/list'
  static COUPON_CREATE = server + 'coupon/create'
  static COUPON_DELETE = server + 'coupon/delete'
  static COUPON_UPDATE = server + 'coupon/update'
  static COUPON_VIEW = server + 'coupon'
  static COUPON_ALL = server + 'coupon/all'
  static COUPON_STOP = server + 'coupon/stop'
  static COUPON_SHARE = server + 'coupon/share'

  // 营销互动-满减优惠
  static SALE_COUPON_LIST = server + 'smsSaleCoupon/list'
  static SALE_COUPON_DELETE = server + 'smsSaleCoupon/delete'
  static SALE_COUPON_CREATE = server + 'smsSaleCoupon/create'
  static SALE_COUPON_UPDATE = server + 'smsSaleCoupon/update'
  static SALE_COUPON_ORDER = server + 'smsSaleCouponOrder/list'
  static SALE_COUPON_STOP = server + 'smsSaleCoupon/stopStatus'

  // 营销互动-首页弹窗
  static INDEX_WINDOW_LIST = server+'smsIndexWindow/list'
  static INDEX_WINDOW_CREATE = server+'smsIndexWindow/create'
  static INDEX_WINDOW_DELETE = server+'smsIndexWindow/delete'
  static INDEX_WINDOW_UPDATE = server+'smsIndexWindow/update'
  static INDEX_WINDOW_STOP = server+'smsIndexWindow/stopStatus'

  // 运营管理-电商设置
  static PRODUCT_CATEGORY = server + 'productCategory/parlist'
  static CATEGORY_ADD = server + 'productCategory/create'
  static CATEGORY_EDIT = server + 'productCategory/update'
  static PRODUCT_ALL_LIST = server + 'product/all/list'
  static PRODUCT_GETINFO = server + 'product/getInfo'
  static PRODUCT_GROUP_LIST = server + 'product/group/list'
  static PRODUCT_GROUP_ALL = server + 'product/group/all'
  static PRODUCT_GROUP_ADD = server + 'product/group/create'
  static PRODUCT_GROUP_EDIT = server + 'product/group/update'
  static PRODUCT_ADD_LIST = server + 'product/group/product/add/list'
  static PRODUCT_GROUP_DELETE = server + 'product/group/delete'
  static PRODUCT_GROUP_DISABLE = server + 'product/group/disable'
  static PRODUCT_GROUP_ENABLE = server + 'product/group/enable'
  static GROUPP_RODUCT_ADD = server + 'product/group/relative/add'
  static PRODUCT_DELETE_LIST = server + 'product/group/product/delete/list'
  static GROUP_PRODUCT_DELETE = server + 'product/group/relative/delete'
  static ADDRESS_LIST = server + 'companyAddress/list'
  static ADDRESS_ALL_LIST = server + 'companyAddress/alllist'
  static PRODUCT_CATEGORY_CHILDREN = server + 'productCategory/list'
  static PRODUCT_CATEGORY_TREELIST = server + 'productCategory/treelist'
  static ADDRESS_ADD = server + 'companyAddress/add'
  static ADDRESS_EDIT = server + 'companyAddress/update'
  static ADDRESS_DELETE = server + 'companyAddress/delete'
  static ADDRESS_UPDATE_STATE = server + 'companyAddress/updatestate'
  static CATEGORY_UPDATE_STATE = server + 'productCategory/update/showStatus'
  static CATEGORY_DELETE = server + 'productCategory/delete'
  static PRODUCT_CATEGORY_SORT = server + 'productCategory/quickUpdate'
  static PRODUCT_ORDER_DOWNLOAD = server + 'order/product/download'

  // 物流信息
  static LOGISTICS_DETAIL = server + 'logistics/detail'
  static LOGISTIC_ALL = server + 'logistics/all'

  // 评论
  static PRODUCT_COMMENT_TOTAL = server + 'comment/total'
  static COMMENT_LIST = server + 'comment/list'
  static COMMENT_REPLY_SAVE = server + 'commentReplay/save'
  static COMMENT_DELETE = server + 'comment/delete'


  // 过课单
  static CLASS_ALL = server + 'after/class/all'
  static CLASS_ALL_LIST = server + 'after/class/list'
  static CLASS_SEE = server + 'after/class/see'
  static CLASS_ADD = server + 'after/class/add'
  static CLASS_DEL = server + 'after/class/del'
  static CLASS_STOP = server + 'after/class/stop'
  static CLASS_BIND = server + 'after/class/bind'
}
