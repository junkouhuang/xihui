Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum: 1,//当前页
    pageSize: 10,//每页条数
    pages: 0,//总页数,
    cousedis: -1,
    list:[], //数据列表
    status:0,
    returnorder:'',
    bz: '',//文本域
    wantreload:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      winHeight: wx.getSystemInfoSync().windowHeight,
      seenrenturnorder: false
    })
    that.getstorereturnlist();
  },

  onShow(){
    let that = this;
    if (that.data.wantreload){
      that.getstorereturnlist();
    }
  },
  
  /**
   * 导航切换
   */
  swichNav(e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    that.data.pageNum = 1;
    if (index == "0") {
      that.data.status = ''
      that.setData({
        list: [],
        status: 0
      })
    } else if (index == "1") {
      that.data.status = 1
      that.setData({
        list: [],
        status: 1
      })
    } else if (index == "2") {
      that.data.status = 2
      that.setData({
        list: [],
        status: 2
      })
    } else if (index == "3") {
      that.data.status = 3
      that.setData({
        list: [],
        status:3
      })
    }
    that.getstorereturnlist();
  },


  /**
   * swiperChange
   */
  swiperChange(e) {
    let that = this;
    let index = e.detail.current;
    that.data.pageNum = 1;
    if (index == "0") {
      that.setData({
        list: [],
        status: 0
      })
    } else if (index == "1") {
      that.setData({
        list: [],
        status: 1
      })
    } else if (index == "2") {
      that.setData({
        list: [],
        status: 2
      })
    } else if (index == "3") {
      that.setData({
        list: [],
        status: 3
      })
    }
    that.getstorereturnlist();
  },

  /**
   * 上拉加载更多
   */
  lower: function () {
    let that = this;
    if (that.data.pageNum < that.data.pages) {
      that.data.pageNum = that.data.pageNum + 1;
      that.setData({
        seenfoottxt: "数据正在加载中..."
      })
      that.getstorereturnlist();
    } else {
      that.setData({
        seenfoottxt: "已经见底啦~"
      })
    }
  },
  
  /**
   * 获取退货历史
   */
  getstorereturnlist(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getApp().globalData.url + '/storereturn/getstorereturnlist', 
      data: { 
        pageNum: that.data.pageNum, 
        pageSize: that.data.pageSize ,
        status: that.data.status == 0 ? "" : (that.data.status == 1 ? 1  :(that.data.status == 2 ? 2 : 3))
        },
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        wx.hideLoading();
        if (Object.is(res.statusCode, 200)) {
          if (Object.is(res.data.list.length, 0)) {
            that.setData({
              message: "暂无数据~",
              nodataimg: '/images/base/im_no_content.png',
              list: []
            })
          } else {
            that.data.pages = res.data.pages
            that.setData({
              seenfoottxt: '',
              list: that.data.list.concat(res.data.list)
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
        wx.hideLoading();
      }
    })
  },

  /**
   * 退货单详情
   */
  storereturndetail(e){
    let that=this;
    wx.navigateTo({
      url: '../storereturndetail/storereturndetail?list=' + JSON.stringify(that.data.list[e.currentTarget.dataset.id])
    })
  },

  closeconfirm(){
    let that = this;
    that.setData({
      seenrenturnorder: false
    })
  },

  sub(){
    let that=this;
    wx.request({
      url: getApp().globalData.url + '/storereturn/addstorereturn', //+ res.result
      data: { ordercode: that.data.returnorder, mdcode: getApp().globalData.mdcode, storeid: getApp().globalData.storeid, bz: that.data.bz},
      method: 'POST',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success) {
            that.setData({
              seenrenturnorder: false,
              list: []
            })
            that.getstorereturnlist();
          }else{
            getApp().wxToast({
              title: res.data.message, //标题，不写默认正在加载
              img: '../../images/toast/error.png', //icon路径，不写不显示
              duration: 500, //延时关闭，默认2000
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
        wx.hideLoading();
      }
    })
  },
  add(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/storereturn/getreturncode/' + getApp().globalData.mdcode,
      data: '',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success) {
            that.data.returnorder = res.data.content
            that.setData({
              seenrenturnorder: true,
              returnorder: res.data.content
            })
          } else {
            getApp().wxToast({
              title: res.data.message, //标题，不写默认正在加载
              img: '../../images/toast/error.png', //icon路径，不写不显示
              duration: 500, //延时关闭，默认2000
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
  },

  /**
   * 获取文本域输入值
   */
  inputTextarea(e) {
    let that = this;
    that.data.bz = e.detail.value;
  },


})