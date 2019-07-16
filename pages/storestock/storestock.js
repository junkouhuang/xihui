Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum: 1, //页码
    pageSize: 15, //每页条数
    pages: 0, //总页数
    list: [], //数据列表 
    seenfoottxt: '', //是否显示底部提示文字
    wantreload: false, //是否重新加载页面数据
    selectInfo:'' //查询条件
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    let that = this;
    that.getStoreStockInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;
    if (that.data.wantreload) {
      if (Object.is(that.data.selectInfo,-1)){
        that.getStoreStockInfo()
      }else{
        //计算库存+数量
        that.getStockAndSl();
      }
    }
  },

  /**
   * 总库存+总数量
   */
  getStockAndSl() {
    let that = this;
    let totalStock = 0;
    let totalPrice = 0;
    for (let i = 0; i < that.data.list.length; i++) {
      totalStock = totalStock + that.data.list[i].sl;
      totalPrice = totalPrice + that.data.list[i].price * that.data.list[i].sl;
    }
    that.data.totalStock = parseFloat(totalStock);
    that.data.totalPrice = parseFloat(totalPrice);
    that.setData({
      totalStock: that.data.totalStock,
      totalPrice: that.data.totalPrice
    })
  },

  /**
   * 本店库存列表
   */
  getStoreStockInfo() {
    let that = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: getApp().globalData.url + '/stock/getStoreStockInfo',
      data: { pageNum: that.data.pageNum, pageSize: that.data.pageSize, selectRange:1 },
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        wx.hideLoading();
        if (Object.is(res.statusCode, 200)) {
          if (Object.is(res.data, "")) {
            getApp().wxToast({
              message: "暂无数据~",
              duration: 1500, //延时关闭，默认2000
              show: function () { //显示函数
                wx.hideLoading();
              },
              hide: function () { //关闭函数
              }
            });
          } else {
            that.data.pages = res.data.pages;
            that.data.list = that.data.list.concat(res.data.list);
            that.setData({
              seenfoottxt: '',
              list: that.data.list
            })
            //计算库存+数量
            that.getStockAndSl();
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

  /**
   * 下拉加载更多
   */
  onReachBottom: function () {
    let that = this;
    if (that.data.pageNum < that.data.pages) {
      that.data.pageNum = that.data.pageNum + 1;
      that.getStoreStockInfo();
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
   * 查看商品库存详情
   */
  spdetail(e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../spdetail/spdetail?spcode=' + that.data.list[index].spcode + "&selectRange=1", //传-1为查全部门店库存详情 传1为查询本店库存详,
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