Page({
  openqrcode(){
    let that = this;
    wx.scanCode({
      success: (res) => {
        wx.request({
          url: getApp().globalData.url + '/barcode/' + res.result , 
          data: '',
          method: 'GET',
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'bearer  ' + getApp().globalData.access_token,
          },
          success: (res) => {
            if (Object.is(res.statusCode, 200)) {
              if (Object.is(res.data, "")) {
                getApp().wxToast({
                  title: '无效条码', //标题，不写默认正在加载
                  duration: 1000, //延时关闭，默认2000
                  show: function () { //显示函数
                    wx.hideLoading();
                  },
                  hide: function () { //关闭函数
                  }
                });
              } else {
                wx.navigateTo({
                  url: '../spdetail/spdetail?spcode=' + res.data.spcode +"&selectRange=-1", //传-1为查全部门店库存详情 传1为查询本店库存详情
                })
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
            that.setData({
              loading: false
            })
          }
        })
      },
      fail: (res) => {
      }
    })
  }
})


