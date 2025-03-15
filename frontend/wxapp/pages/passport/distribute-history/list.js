import { formatTime } from '../../../utils/util'
const { getClaimPassports } = require('../../../model/user')
const app = getApp()

Page({
  data: {
    eventId: undefined,
    passports: [],
  },
  async onLoad(options) {
    const { id } = options
    const passports = await getClaimPassports(id)
    this.setData({
      eventId: id,
      passports: passports.edges.map(v => ({
        ...v.node,
        claimTime: formatTime(new Date(v.node.claimTime * 1000), 'YYYY/MM/DD HH:mm')
      })),
    })
  },
  onPullDownRefresh() {
    const { eventId } = this.data
    getClaimPassports(eventId).then(data => {
      console.log(data)
      this.setData({
        passports: data.edges.map(v => ({
          ...v.node,
          claimTime: formatTime(new Date(v.node.claimTime * 1000), 'YYYY/MM/DD HH:mm')
        })),
      })
    })
  },
})