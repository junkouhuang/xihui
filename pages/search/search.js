Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum:1, //页数
    pageSize:10, //每页数量
    pages:0, //总页数
    list: [], //数据列表
    selecttype:0,//查询条件
    seenfoot:false,
    selectInfo:-1,
    selecttypetext:'款号',
    focus:true,
    type:1
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onLoad(options){
    let that =this;
    that.data.type=options.type;
    that.data.selectInfo=-1
  },

  /**
   * 条件：款号
   */
  spcode(){
    let that = this;
    that.data.selecttype=0;
    that.setData({
      selecttype: 0,
      selecttypetext: '款号',
      focus:true
    })
  },

  /**
   * 条件：条码
   */
  mxcode() {
    let that = this;
    that.data.selecttype = 1;
    that.setData({
      selecttype: 1,
      selecttypetext: '条码',
      focus: true
    })
  },

  /**
   * 条件：品名
   */
  spmc() {
    let that = this;
    that.data.selecttype = 2;
    that.setData({
      selecttype: 2,
      selecttypetext: '品名',
      focus: true
    })
  },

  /**
   * 查询
   */
  search() {
    let that = this;
    that.data.list=[];
    that.setData({
      list: [],
      seenfoot:false
    })
    that.getStoreStockInfo();
  },


  /**
   * 接口
   */
  getStoreStockInfo(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    let data=[];
    if (Object.is(parseInt(that.data.type), 1)){
      data = { pageNum: that.data.pageNum, pageSize: that.data.pageSize, selectInfo: that.data.selectInfo, selecttype: that.data.selecttype }
    } else if (Object.is(parseInt(that.data.type), 2)) {
      data = { pageNum: that.data.pageNum, pageSize: that.data.pageSize, selectInfo: that.data.selectInfo, selecttype: that.data.selecttype, selectRange:1 }
    }
    wx.request({
      url: getApp().globalData.url + '/stock/getStoreStockInfo',
      data: data,
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
            that.data.pages = res.data.pages;
            that.data.list = that.data.list.concat(res.data.list);
            if (Object.is(parseInt(that.data.type),1)){
              that.setData({
                list: that.data.list
              })
            } else if (Object.is(parseInt(that.data.type),2)){
              wx.navigateBack({
                delta:1
              })
            }
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
   * 获取款号
   */
  inputselectInfo(e) {
    let that = this;
    that.data.selectInfo = e.detail.value;
  },

  /**
   * 查看商品库存详情
   */
  spdetail(e){
    let that=this;
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../spdetail/spdetail?spcode=' + that.data.list[index].spcode + "&selectRange=-1", //传-1为查全部门店库存详情 传1为查询本店库存详情
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
    } else {
      that.setData({
        seenfoot: true
      })
    }
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

  onUnload(){
    let that = this;
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2];
    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      seenfoottxt: '',
      wantreload: true,
      list: that.data.list,
      selectInfo: that.data.selectInfo
    });
  }
})