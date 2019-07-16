Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum: 1,//当前页
    pageSize: 20,//每页条数
    pages: 0,//总页数
    list:[], //数据列表
    searchstr:'-1'
  },


  /**
   * 查找
   */
    search(){
      let that = this;
      that.data.pageNum = 1;
      that.data.list=[];
      that.bysp();
    },

  /**
   * 查询
   */
  bysp(){
    let that = this;
    wx.showLoading({
      title: '查询中',
    })
    wx.request({
      url: getApp().globalData.url + '/stock/bysp/' + getApp().globalData.storeid,
      data: { pageNum: that.data.pageNum, pageSize: that.data.pageSize,"searchstr": that.data.searchstr},
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        wx.hideLoading();
        if (Object.is(res.statusCode, 200)) {
          wx.hideLoading();
          if (Object.is(res.data.list.length, 0)) {
            that.setData({
              message: "暂无数据~",
              nodataimg:'/images/base/im_no_content.png',
              list: []
            })
          } else {
            that.data.pages = res.data.pages;
            that.data.list = that.data.list.concat(res.data.list);
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
        } else if (Object.is(res.data.status, 404)) {
          getApp().wxToast({
            title: res.data.status, //标题，不写默认正在加载
            duration: 1500, //延时关闭，默认2000
            show: function () { //显示函数

            },
            hide: function () { //关闭函数
            }
          });
        }
      }, fail: (err) => {
        wx.hideLoading();
      }
    })
  },

  /**
   * 获取款号
   */
  inputspcode(e){
    let that=this;
    if (Object.is(e.detail.value,'')){
      that.data.searchstr = -1;
    }else{
      that.data.searchstr = e.detail.value;
    }
  },
  
  multipleTap(){
    let urlArray = ["https://graph.baidu.com/resource/106b029dcf72177543b0801553160145.jpg"];
    wx.previewImage({
      urls: urlArray // 需要预览的图片http链接列表  
    })
  },

  /***
   * 商品明细
   */
  mx(e){
    let that = this;
    let index = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../splistdetail/splistdetail?storeid=' + getApp().globalData.storeid + '&splistdata=' + JSON.stringify(that.data.list[index])
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom(){
    let that = this;
    if (that.data.pageNum < that.data.pages) {
      that.data.pageNum = that.data.pageNum + 1;
      that.setData({
        seenfoottxt: "数据正在加载中..."
      })
      that.bysp();
    } else {
      that.setData({
        seenfoottxt: "已经见底啦~"
      })
    }
  }
})