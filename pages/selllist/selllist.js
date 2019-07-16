Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum: 1,//当前页
    pageSize: 20,//每页条数
    pages: 0,//总页数
    list: [], //数据列表
    paystatus: '',//0待支付  1支付中  3已支付
    status: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      winHeight: wx.getSystemInfoSync().windowHeight
    })
    that.getselllist();
  },

  /**
   * 获取收银历史
   */
  getselllist() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getApp().globalData.url + '/sell/getselllist', //+ res.result
      data: { pageNum: that.data.pageNum, pageSize: that.data.pageSize, paystatus: that.data.paystatus, bustypes:0 },
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
              list: [],
              message: "暂无数据~",
              nodataimg: '/images/base/im_no_content.png',
            })
          } else {
            that.data.pages = res.data.pages;
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
   * swiperChange
   */
  swiperChange(e){
    let that = this;
    let index = e.detail.current;
    that.data.pageNum = 1;
    if (index == "0") {
      that.data.paystatus = ''
      that.setData({
        list:[],
        status: 0
      })
    } else if (index == "1") {
      that.data.paystatus = 0
      that.setData({
        list: [],
        status: 1
      })
    } else if (index == "2") {
      that.data.paystatus = 3
      that.setData({
        list: [],
        status: 2
      })
    }
    that.getselllist();
  },

  /**
   * 上拉加载更多
   */
  lower: function () {
    let that = this;
    if (that.data.pageNum < that.data.pages) {
      that.data.pageNum = that.data.pageNum + 1;
      that.setData({
        seenfoottxt:"数据正在加载中..."
      })
      that.getselllist();
    } else {
      that.setData({
        seenfoottxt: "已经见底啦~"
      })
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2];
    //直接调用上一个页面对象的setData()方法，把数据存到上一个页面中去
    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      addlist: []
    });
  },

  /**
   * 复制单号
   */
  copyordercode(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let ordercode = that.data.list[id].ordercode;
    wx.setClipboardData({ //设置系统剪贴板内容
      data: ordercode,
      success: function (res) {
        wx.getClipboardData({ //获取系统剪贴板内容
          success: function (res) {
            console.log(res);
            console.log("获取系统剪贴板内容成功！");
            console.log(res);
          }, fail: function () {
            console.log("获取系统剪贴板内容失败！");
          }
        })
      }, fail: function () {
        console.log("设置系统剪贴板内容失败！");
      }
    })
  },

  /**
   * 导航切换
   */
  swichNav(e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    that.data.pageNum=1;
    if(index=="0"){
      that.data.paystatus = ''
      that.setData({
        list: [],
        status: 0
      })
    }else if(index=="1"){
      that.data.paystatus = 0
      that.setData({
        list: [],
        status: 1
      })
    }else if(index=="2"){
      that.data.paystatus = 3
      that.setData({
        list: [],
        status: 2
      })
    }
    that.getselllist();
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
        showgotop:true
      })
    } else if (e.scrollTop <= 1000){
      that.setData({
        showgotop: false
      })
    }
  },

  /**
   * 付款&&打印小票
   */
  selllistdetail(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    if (Object.is(that.data.list[id].paystatus, 0)) {
      wx.navigateTo({ ///关闭所有页面，打开到应用内的某个页面
        url: '../barcode/barcode?ordercode=' + that.data.list[id].ordercode + "&amount=" + that.data.list[id].amount
      })
    } else if (Object.is(that.data.list[id].paystatus, 3)) {
      wx.navigateTo({
        url: '../selllistdetail/selllistdetail?parameter=' + JSON.stringify(that.data.list[id]) + '&sign=0'
      })
    }
  },

  /**
   * 收银历史详情
   */
  orderdetail(e){
    let that= this;
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../selllistdetail/selllistdetail?parameter=' + JSON.stringify(that.data.list[index])+'&sign=1'
    })
  }
})