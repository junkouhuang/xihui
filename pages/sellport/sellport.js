Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum:1, //页码
    pageSize:10, //每页条数
    pages:0, //总页数
    list: [], //数据列表
    seenfoottxt: '', //是否显示底部提示文字
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    that.getextendselldetaills();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this;
    that.data.pageNum = 1;
    that.data.list = [];
    that.onLoad();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if (that.data.pageNum < that.data.pages) {
      that.data.pageNum = that.data.pageNum + 1;
      that.getextendselldetaills();
      that.setData({
        seenfoottxt: "数据正在加载中..."
      })
    } else {
      that.setData({
        seenfoottxt: "已经见底啦~"
      })
    }
  },

  /**
   * 获取销售报表
   */
  getextendselldetaills(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
    wx.request({
      url: getApp().globalData.url + '/sell/getSellDetailList',
      data: {
        pageNum: that.data.pageNum,
        pageSize: that.data.pageSize
      },
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        wx.hideLoading();
        if (Object.is(res.statusCode, 200)) {
          if (Object.is(res.data.list, "")) {
            getApp().wxToast({
              message: "暂无数据~",
              duration: 1000, //延时关闭，默认2000
              show: function () { //显示函数
                wx.hideLoading();
              },
              hide: function () { //关闭函数
              }
            });
          } else {
            that.data.pages = res.data.pages;
            that.data.list = that.data.list.concat(res.data.list)
            that.setData({
              seenfoottxt: '',
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

  arrowsup(e) {
    let that = this;
    that.setData({
      cousedis: -1
    })
  },

  arrowsdowm(e) {
    let that = this;
    that.setData({
      cousedis: e.currentTarget.dataset.id
    })
  },

  /**
  * 置顶
  */
  gotop: function () {
    let that = this;
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
    that.setData({
      showgotop: false
    })
  },

  /**
   * 滚轮事件
   */
  onPageScroll: function (e) {
    let that = this;
    // 容器滚动时将此时的滚动距离赋值给 this.data.scrollTop
    if (e.scrollTop > 1000) {
      that.setData({
        showgotop: true
      })
    } else if (e.scrollTop <= 1000) {
      that.setData({
        showgotop: false
      })
    }
  },
})