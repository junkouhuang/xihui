Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[] //数据列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let obj = JSON.parse(options.parameter);
    wx.request({
      url: getApp().globalData.url + '/fh/getfhdetails/' + obj.id, 
      data: "",
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          let zsl=0;
          let zje = 0;
          for (let i = 0; i < res.data.length;i++){
            zsl = zsl + res.data[i].fhsl;
            zje = zje + res.data[i].sellprice
          }
          that.setData({
            ordercode: obj.ordercode,
            createtime: obj.createtime,
            status: obj.status,
            bz: obj.bz,
            toatal:zsl,
            totalamount: zje,
            list: res.data
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

  rcvfh(){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定收货入库？',
      success: (res) => {
        if (res.confirm) {
          let data = new Array();
          for (let i = 0; i < that.data.list.length; i++) {
            data.push({
              spid: that.data.list[i].spid,
              mxid: that.data.list[i].mxid,
              spcode: that.data.list[i].spcode,
              spmc: that.data.list[i].spmc,
              mxcode: that.data.list[i].mxcode,
              unicode: that.data.list[i].unicode,
              shsl: that.data.list[i].fhsl,
            })
          }
          let array = new Array();
          array = { id: that.data.id, fhDetails: data }
          wx.request({
            url: getApp().globalData.url + '/fh/rcvfh',
            data: JSON.stringify(array),
            method: 'POST',
            header: {
              'content-type': 'application/json;charset=UTF-8',
              'Authorization': 'bearer  ' + getApp().globalData.access_token,
            },
            success: (res) => {
              if (Object.is(res.statusCode, 200)) {
                if (res.data.success) {
                  wx.navigateBack({
                    delta: 1
                  })
                }else{
                  getApp().wxToast({
                    title: res.data.message, //标题，不写默认正在加载
                    img: '../../images/toast/error.png', //icon路径，不写不显示
                    duration: 1500, //延时关闭，默认2000
                    show: function () { //显示函数

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
        }
      }
    })
  },
})