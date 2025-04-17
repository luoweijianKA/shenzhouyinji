import TabMenu from './data';
import { YIN_ICON, CHAO_ICON } from '../constants/index';

const app = getApp();

Component({
  data: {
    active: 0,
    total: 0,
    yinIcon: YIN_ICON,
    chaoIcon: CHAO_ICON,
    list: TabMenu,
  },

  methods: {
    onChange(event) {
      this.setData({ active: event.detail.value });

      wx.switchTab({
        url: this.data.list[event.detail.value].url.startsWith('/')
          ? this.data.list[event.detail.value].url
          : `/${this.data.list[event.detail.value].url}`,
      });
    },

    init() {
      const page = getCurrentPages().pop();
      const route = page ? page.route.split('?')[0] : '';
      const active = this.data.list.findIndex(
        (item) =>
          (item.url.startsWith('/') ? item.url.substr(1) : item.url) ===
          `${route}`,
      );
      this.setData({ active });
    },
  },
});
