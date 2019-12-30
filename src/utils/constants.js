export const PAGE_SIZE = 3;

export const REG_EXP = {
  phone: /^1[34578]\d{9}$/,
  idCard: /(^\d{15}$)|(^\d{17}([0-9]|X)$)/,
};

export const FORM_ITEM_LAYOUT = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

export const TAIL_FORM_ITEM_LAYOUT = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};
export const LONG_FORM_ITEM_LAYOUT = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
