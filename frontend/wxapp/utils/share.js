export function shareAppMessage(title, desc, path, imgUrl) {
  wx.shareAppMessage({
    title,
    desc, 
    path,
    imgUrl,
    success() { 
      console.log('分享成功')
    }
  })
}

export function shareTimeline(title, desc, imgUrl) {
  wx.shareTimeline({
    title,
    desc,
    imgUrl,
    success() {
      console.log('分享成功')
    }
  }) 
}