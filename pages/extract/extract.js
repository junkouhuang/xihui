Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    list:[],
    showbtn:false,
    money:0,
    bankCardNo:'',
    bizorderno:'',
    verificationCode:'',
    all:"",
    tel:'',
    timerTask:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    that.data.tqAmount = options.tqAmount
    that.data.tel = options.tel
    that.setData({
      tqAmount: that.data.tqAmount
    })
  },
  extract(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/yunst_user/withdrawApply', //+ res.result
      data: { amount: that.data.money, bankCardNo: that.data.bankCardNo},
      method: 'POST',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          that.data.bizorderno = res.data.content.bizorderno
          that.setData({
            tip: "短信已发送至" + that.data.tel,
            placeholderName: "请输入手机短信验证码",
            isShowConfirm: true,
            type: "number",
            value: '',
            method: "okconfirm",
            bInput: "bInputMessage"
          })
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
  bInputMessage(e){
    let that =this;
    that.data.verificationCode=e.detail.value;
  },
  getall(){
    let that=this;
    if (that.data.tqAmount>0){
      that.data.money = that.data.tqAmount;
      that.setData({
        all: that.data.tqAmount,
        showbtn: true
      })
    }else{
      getApp().wxToast({
        title: "账户余额不足", //标题，不写默认正在加载
        duration: 500, //延时关闭，默认2000
        show: function () { //显示函数
          wx.hideLoading();
        },
        hide: function () { //关闭函数
        }
      });
    }
  },
  okconfirm(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/yunst_user/withdrawApplyConfirm', //+ res.result
      data: { bizorderno: that.data.bizorderno, verificationCode: that.data.verificationCode},
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success) {
            getApp().wxToast({
              title: res.data.message,
              duration: 1000, //延时关闭，默认2000
              show: function () { //显示函数
                this.data.timerTask=setTimeout(function () {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 1000)
              },
              hide: function () { //关闭函数
              }
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

      }
    })
  },
  closeconfirm(){
    let that=this;
    that.setData({
      isShowConfirm:false
    })
  },
  money(e){
    let that=this;
    that.data.money=e.detail.value;
    if (that.data.money != ""){
      that.setData({
        showbtn:true
      })
    }else{
      that.setData({
        showbtn: false
      })
    }
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/yunst_user/getYunstBankCardList', //+ res.result
      data: "",
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          that.data.bankCardNo = res.data.content[0].bankcard;
          let tel = res.data.content[0].tel;
          that.data.tel = tel.substr(0, 3) + "****" + tel.substr(7);
          if (res.data.success) {
            that.setData({
              list: res.data.content
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

      }
    })
  },
  bindPickerChange(){
    let that=this;
    that.setData({
      index: e.detail.value
    })
    that.data.bankCardNo = that.data.list[e.detail.value].bankcard;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that = this;
    clearInterval(that.data.timerTask);
  },
})