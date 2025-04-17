import { getUserUnreadMessage } from '../../../model/usercenter';

let interval = null;

Component({
  data: {
    customerServiceMessage: '',
    system: 0,
    customerService: 0,
    reward: 0,
    badge: 0,
  },
  pageLifetimes: {
    hide: function () {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    },
    show: function () {
      this.loadUnreadMessage();

      const _this = this;
      interval = setInterval(async () => _this.loadUnreadMessage(), 5 * 1000);
    },
  },
  lifetimes: {
    detached: function () {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    },
  },
  methods: {
    async loadUnreadMessage() {
      const messages = await getUserUnreadMessage();
      const total =
        parseInt(messages.conversation) + parseInt(messages.notification);

      this.setData({
        ...messages,
      });
    },
    navigateTo(e) {
      const { url } = e.currentTarget.dataset;
      wx.navigateTo({ url });
    },
  },
});
