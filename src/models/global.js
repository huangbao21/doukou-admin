import { queryNotices } from '@/services/user';
const GlobalModel = {
  namespace: 'global',
  state: {
    collapsed: false,
  },
  effects: {},
  reducers: {
    changeLayoutCollapsed(
      state = {
        collapsed: true,
      },
      { payload },
    ) {
      return { ...state, collapsed: payload };
    },
  },
  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      history.listen(({ pathname, search }) => {});
    },
  },
};
export default GlobalModel;
