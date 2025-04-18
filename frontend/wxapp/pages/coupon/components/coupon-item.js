import { formatTime } from '../../../utils/util.js';

Component({
  properties: {
    item: {
      type: Object,
      value: {},
    },
  },
  lifetimes: {
    attached() {
      const { item } = this.data;
      if (!item) return;

      this.setData({
        item: {
          ...item,
          effectiveTimeText:
            formatTime(item.effectiveTime * 1000, 'YYYY年MM月DD日') || '',
        },
      });
    },
  },
  methods: {
    handeQrcode(e) {
      this.triggerEvent('qrcode');
    },
  },
});
