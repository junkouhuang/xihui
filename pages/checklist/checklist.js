Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum:1, //页码
    pageSize:10, //每页条数
    pages:0, //总页数
    list:[], //数据列表
    wantreload: true //是否重新刷新页面
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    if (that.data.wantreload) {
      that.data.pageNum = 1;
      that.data.list = [];
      that.setData({
        list:[],
        seenfoot: false
      })
      that.pagelist();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if (that.data.pageNum < that.data.pages) {
      that.data.pageNum = that.data.pageNum + 1;
      that.pagelist();
    } else {
      that.setData({
        seenfoot: true
      })
    }
  },


  /**
   * 盘点
   */
  check(e){
    let that =this;
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../check/check?isopennewdh=false&pdid=' + that.data.list[index].id + "&pddh=" + that.data.list[index].ordercode + "&status=" + that.data.list[index].status + "&pdorder=" + that.data.list[index].ordercode + "&bz=" + that.data.list[index].pdbz,
    })
  },

  /**
   * 盘点历史
   */
  pagelist(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getApp().globalData.url + '/pd/pagelist',
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
            that.setData({
              list: [],
              message: "暂无数据~",
              nodataimg: '/images/base/im_no_content.png',
            })
          } else {
            that.data.pages = res.data.pages;
            that.data.list = that.data.list.concat(res.data.list)
            that.setData({
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
   * 新开盘点单
   */
  tocheck(){
    let that = this;
    let ishaswaitfinshpdd=false;
    let pddh='';
    let index='';
    for(let i=0;i<that.data.list.length;i++){
      if (that.data.list[i].status == 0 || that.data.list[i].status == 1){
        ishaswaitfinshpdd=true;
        pddh=that.data.list[i].ordercode;
        index=i;
      }
    }
    if(ishaswaitfinshpdd){
      wx.showModal({
        title:'提示' ,
        content: '盘点单'+pddh + '未完成，是否继续',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../check/check?isopennewdh=false&pdid=' + that.data.list[index].id+"&pddh="+that.data.list[index].ordercode + "&status="+that.data.list[index].status
            })
          }
        }
      })
    }else{
      wx.navigateTo({
        url: '../check/check'
      })
    }
  }
})