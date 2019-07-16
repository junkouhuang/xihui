Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum: 1,//当前页
    pageSize: 10,//每页条数
    pages: 0,//总页数,
    dh:"",
    list:[],
    status:0,
    wantreload:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      winHeight: wx.getSystemInfoSync().windowHeight
    })
    that.listf();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    if (that.data.wantreload){
      that.data.pageNum = 1;
      that.data.list = [];
      that.setData({
        status: that.data.status,
        list: []
      })
      that.listf();
    }
  },

  /**
 * swiperChange
 */
  swiperChange(e) {
    let that = this;
    let index = e.detail.current;
    that.data.pageNum = 1;
    if (index == "0") {
      that.data.paystatus = 3
      that.setData({
        list: [],
        status: 0
      })
      that.listf();
    } else if (index == "1") {
      that.data.paystatus = 4
      that.setData({
        list: [],
        status: 1
      })
      that.listt();
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
      that.data.paystatus = 3
      that.setData({
        list: [],
        status: 0
      })
      that.listf();
    } else if (index == "1") {
      that.data.paystatus = 4
      that.setData({
        list: [],
        status: 1
      })
      that.listt();
    } 
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
      if (Object.is(parseInt(that.data.status), 0)) {
        that.listf();
      } else if (Object.is(parseInt(that.data.status), 1)) {
        that.listt();
      }
    } else {
      that.setData({
        seenfoottxt: "已经见底啦~"
      })
    }
  },

  /**
   * 调出
   */
  listf(){
    let that=this;
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: getApp().globalData.url + '/storedh/listf',
      data: { pageNum: that.data.pageNum, pageSize: that.data.pageSize },
      method: 'GET',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        wx.hideLoading();
        if (Object.is(res.statusCode, 200)) {
          if (Object.is(res.data.length, 0)) {
            that.setData({
              list: [],
              message: "暂无数据~",
              nodataimg: '/images/base/im_no_content.png',
            })
          }else{
            that.data.pages = res.data.pages
            that.data.list = that.data.list.concat(res.data.list)
            that.setData({
              seenfoottxt:'',
              list: that.data.list
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
   * 调入
   */
  listt() {
    let that = this;
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: getApp().globalData.url + '/storedh/listt',
      data: { pageNum: that.data.pageNum, pageSize: that.data.pageSize },
      method: 'GET',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        wx.hideLoading();
        if (Object.is(res.statusCode, 200)) {
          that.data.pages = res.data.pages
          that.data.list = that.data.list.concat(res.data.list)
          that.setData({
            seenfoottxt: '',
            list: that.data.list
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
        wx.hideLoading();
      }
    })
  },

  /**
   * 跳转详情页
   */
  allocatinglistdetail(e){
    let that=this;
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../allocatinglistdetail/allocatinglistdetail?parameter=' + JSON.stringify(that.data.list[index]) + "&zt=" + that.data.status
    })
  },

  /**
   * 新增调货单
   */
  add(){
    wx.navigateTo({
      url:'../allocatingnew/allocatingnew'
    })
  },
})