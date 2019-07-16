Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      ordercode: options.ordercode,
      username: options.username,
      amount: options.amount,
      sendtime: options.sendtime
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that = this;
  },

  retun(){
    wx.navigateBack({
      delta:3
    })
  },
  print(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/sell/getsell/TT581116336353185792',//+ that.data.ordercode
      data:'',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        let parameter = new Array();
        parameter = { "ordercode": res.data.ordercode, createtime: res.data.createtime }
        that.data.timerTask = setTimeout(function () {
          wx.navigateTo({
            url: '../printdetail/printdetail?parameter=' + JSON.stringify(parameter) + "&sellSpInfoList=" + JSON.stringify(res.data.sellDetailList) + '&plies=3'
          })
        }, 1500)
      }, fail: (err) => {
      }
    })
  }
})