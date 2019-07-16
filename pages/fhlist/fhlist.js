Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum: 1,//当前页
    pageSize: 10,//每页条数
    pages: 0,//总页数,
    list:[],
    status:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      winHeight: wx.getSystemInfoSync().windowHeight
    })
    that.getfhlist();
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
      that.data.status = 3
      that.setData({
        list: [],
        status: 1
      })
    } else if (index == "2") {
      that.data.status = 4
      that.setData({
        list: [],
        status: 2
      })
    }
    that.getfhlist();
  },
  
  /**
  * swiperChange
  */
  swiperChange(e) {
    let that = this;
    let index = e.detail.current;
    that.data.pageNum = 1;
    if (index == "0") {
      that.data.status = ''
      that.setData({
        list: [],
        status: 0
      })
    } else if (index == "1") {
      that.data.status = 3
      that.setData({
        list: [],
        status: 1
      })
    } else if (index == "2") {
      that.data.status = 4
      that.setData({
        list: [],
        status: 2
      })
    }
    that.getfhlist();
  },

  getfhlist(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getApp().globalData.url + '/fh/getfhlist', //+ res.result
      data: { 
        pageNum: that.data.pageNum, 
        pageSize: that.data.pageSize, 
        status: that.data.status==0?"":(that.data.status==1?3:4)
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
            that.data.pages = res.data.pages;
            that.setData({
              seenfoottxt: '',
              list: that.data.list.concat(res.data.list)
            })
            let waitStoreInNum = 0;
            for (let i = 0; i < that.data.list.length; i++) {
              if (Object.is(that.data.list[i].status, 3)) {
                waitStoreInNum += 1;
              }
            }
            if (that.data.status != 2) {
              that.setData({
                waitStoreInNum: waitStoreInNum
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
   * 上拉加载更多
   */
  lower: function () {
    let that = this;
    if (that.data.pageNum < that.data.pages) {
      that.data.pageNum = that.data.pageNum + 1;
      that.setData({
        seenfoottxt: "数据正在加载中..."
      })
      that.getfhlist();
    } else {
      that.setData({
        seenfoottxt: "已经见底啦~"
      })
    }
  },

  /**
   * 收货详情
   */
  gotochildpage(e){
    let that =this;
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../fhlistdetail/fhlistdetail?parameter='+JSON.stringify(that.data.list[id]),
    })
  }
})