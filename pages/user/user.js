Page({
  data: {
    isShowConfirm:'',
    pwdVal:''
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    let that = this;
    that.setData({
      mdmc: getApp().globalData.mdmc,
      mdcode: getApp().globalData.mdcode
    })
  },
  onShow() {
    let that = this;
    that.setData({
      isShowConfirm: false,
      payFocus: false,
      pwdVal: ''
    })
  },

  /**
   * 退出登录
   */
  logout: () => {
    wx.showModal({
      title: '提示',
      content: '确定退出登录？',
      success: (res) => {
        if (res.confirm) {
          wx.reLaunch({
            url: '../login/login',
          })
        }
      }
    })
  },

  /**
   * 打开密码框
   */
  case(){
    let that=this;
    that.setData({
      isShowConfirm:true,
      payFocus:true
    })
  },

  /**
   * 关掉密码框
   */
  close(){
    let that = this;
    that.setData({
      isShowConfirm: false,
      pwdVal:''
    })
  },


  tocash() {
    let that=this;
    wx.request({
      url: getApp().globalData.url + '/yunst_user/checkYunstPasswd', //+ res.result
      data: { passwd: that.data.pwdVal },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success) {
            that.setData({
              isShowConfirm:false
            })
            wx.navigateTo({
              url: "../cash/cash"
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
* 输入密码监听
*/
  inputPwd: function (e) {
    let that = this;
    this.setData({ pwdVal: e.detail.value });
    if (e.detail.value.length >= 6) {
      that.setData({
        payFocus: false,
      })
      that.tocash();
    }
  },

  /**
   * 获取焦点
   */
  getFocus(){
    let that = this;
    that.setData({
      payFocus:true
    })
  }
})
