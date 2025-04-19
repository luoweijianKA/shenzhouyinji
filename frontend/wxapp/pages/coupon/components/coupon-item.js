Component({
  properties: {
    item: {
      type: Object,
      value: {},
    },
  },
  methods: {
    handeQrcode(e) {
      this.triggerEvent('qrcode');
    },
  },
});
