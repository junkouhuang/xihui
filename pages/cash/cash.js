Page({
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that=this;
    wx.request({
      url: getApp().globalData.url + '/yunst_user/getYunstAmount', //+ res.result
      data: "",
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success) {
            that.setData({
              allAmount: res.data.content.allAmount.toFixed(2),
              freezenAmount: res.data.content.freezenAmount.toFixed(2),
              tqAmount: res.data.content.tqAmount.toFixed(2)
            })
          } else {
            getApp().wxToast({
              title: res.data.message, //标题，不写默认正在加载
              img: '../../images/toast/error.png', //icon路径，不写不显示
              duration: 500, //延时关闭，默认2000
              show: function () { //显示函数
                wx.hideLoading();
              },
              hide: function () { //关闭函数
              }
            });
          }
        } else if (Object.is(res.statusCode, 401)) { //用于检测登陆时间是否过期，过期则返回登陆界面
          wx.showModal({
            title: '错误',
            content: '登录已过期，请重新登录',
            success: (res) => {
              if (res.confirm) {
                wx.reLaunch({
                  url: '../login/login',
                })
              }
            }
          })
        }
      }, fail: (err) => {

      }
    })
  },

  /**
   * 提现
   */
  extract(e){
    let that = this;
    wx.navigateTo({
      url: '../extract/extract?tqAmount=' + that.data.tqAmount + '&tel=' + that.data.tel
    })
  }
})