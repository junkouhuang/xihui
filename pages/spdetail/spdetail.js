Page({
  /**
   * 页面的初始数据
   */
  data: {
   pageNum: 1,//当前页
   pageSize:15,//每页条数
   pages: 0,//总页数
   seenfoot: false,
   list:[], //数据列表
   listitem:[],
   spcode:'',//查询条件
   selectRange:-1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.data.spcode = options.spcode;
    that.data.selectRange = options.selectRange;
    that.getProductStockInfoByUnicode();
    that.getProductDetailStoreStockInfo();
    that.setData({
      swiper_height: wx.getSystemInfoSync().windowWidth,
    })
  },

  /**
   * 获取商品基本信息
   */
  getProductStockInfoByUnicode() {
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/stock/getProductStockInfoByUnicode/' + that.data.spcode,
      data: "",
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          that.setData({
            list: res.data.content
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
      }
    })
  },

  /**
   * 库存详情
   */
  getProductDetailStoreStockInfo(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/stock/getProductDetailStoreStockInfo/'+that.data.spcode,
      data: { pageNum: that.data.pageNum, pageSize: that.data.pageSize,selectRange: that.data.selectRange},
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          that.data.pages = res.data.pages;
          that.data.listitem = that.data.listitem.concat(res.data.list)
          that.setData({
            listitem: that.data.listitem 
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
      that.getProductDetailStoreStockInfo();
    } else {
      that.setData({
        seenfoot: true
      })
    }
  },

  //浏览图片手指触摸动作开始
  touchStart: function (e) {
    this.touchStartTime = e.timeStamp
  },

  //浏览图片手指触摸动作结束
  touchEnd: function (e) {
    this.touchEndTime = e.timeStamp
  },

  //浏览图片手指触摸动作点击
  multipleTap: function (e) {
    let that = this;
    let current = e.target.dataset.src;
    // 控制点击事件在350ms内触发，加这层判断是为了防止长按时会触发点击事件
    if (this.touchEndTime - this.touchStartTime < 350) {
      let term = [];
      term[0] = that.data.list.spimgpath.trim("");
      wx.previewImage({
        current: current,
        urls: term // 需要预览的图片http链接列表  
      })
    }
  }
})