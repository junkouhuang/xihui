Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeid:-1,
    spid: -1,
    splistdata:[],
    nuilist:[],
    histortlist: [],
    canclick:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.data.storeid = options.storeid;
    that.data.splistdata = JSON.parse(options.splistdata);
    that.setData({
      swiper_height: wx.getSystemInfoSync().windowWidth ,
      splistdata: that.data.splistdata
    })
    that.mx();
    wx.getStorage({
      key: 'histortlist',
      success: function (res) {
        that.data.histortlist = res.data
      },
    })
  },

  /**
   * 
   */
  mx(){
    let that = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: getApp().globalData.url + '/stock/mx/' + that.data.storeid + '/' + that.data.splistdata.id ,
      data: '',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        wx.hideLoading();
        if (Object.is(res.statusCode, 200)) {
          if (Object.is(res.data.length, 0)) {
            that.setData({
              message: "暂无数据~",
            })
          } else {
            that.setData({
              list: res.data
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
      term[0] = "http://119.23.48.31/" + that.data.splistdata.spimgpath.trim("");
      wx.previewImage({
        current: current,
        urls: term // 需要预览的图片http链接列表  
      })
    }
  },

  /**
   * 唯一码
   */
  uni(e){
    let that = this;
    let index = e.currentTarget.dataset.id;
    wx.request({
      url: getApp().globalData.url + '/stock/uni/' + that.data.storeid + '/' + that.data.list[index].id,
      data: '',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        wx.hideLoading();
        if (Object.is(res.statusCode, 200)) {
          if (Object.is(res.data.length, 0)) {
            that.setData({
              message: "暂无数据~",
            })
          } else {
            for (let i = 0; i < res.data.length;i++){
              res.data[i]["sl"]=0;
           }
            that.data.nuilist = res.data;
            that.setData({
              detaildata:that.data.list[index],
              nuilist: res.data,
              showfixup:true,
              showfixdown: false
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
  
  closefix(){
    let that = this;
    that.setData({
      showfixup: false,
      showfixdown: true
    })
  },

 /**
  * 减数量
  */
  sub(e){
    let that = this;
    let index = e.currentTarget.dataset.id;
    let flag=false;
    if (that.data.nuilist[index].sl >0){
      that.data.nuilist[index].sl = that.data.nuilist[index].sl-1;
    }else{
      that.data.nuilist[index].sl=0;
    }
    for (let i = 0; i < that.data.nuilist.length;i++){
      if (that.data.nuilist[i].sl>0){
        flag=true;
      }
    }
    if (flag){
      that.data.canclick=true;
    }else{
      that.data.canclick = false;
    }
    that.setData({
      nuilist: that.data.nuilist,
      canclick: that.data.canclick
    })
  },

  /**
   * 加数量
   */
  add(e){
    let that = this;
    let index = e.currentTarget.dataset.id;
    if (that.data.nuilist[index].status > 2){
      getApp().wxToast({
        title: '该条码已经出售~~', //标题，不写默认正在加载
        duration: 1500, //延时关闭，默认2000
        show: function () { //显示函数

        },
        hide: function () { //关闭函数

        }
      });
    } else if (that.data.nuilist[index].storeid != that.data.storeid){
      getApp().wxToast({
        title: '非本店条码，禁止销售~~', //标题，不写默认正在加载
        duration: 1500, //延时关闭，默认2000
        show: function () { //显示函数

        },
        hide: function () { //关闭函数

        }
      });
    }else{
      if (that.data.nuilist[index].unicode.endsWith("E")) {
        that.data.nuilist[index].sl = 1;
      } else {
        if (that.data.nuilist[index].sl < that.data.nuilist[index].stocks) {
          that.data.nuilist[index].sl = that.data.nuilist[index].sl + 1;
        }
      }
    }
    let flag=false;
    for (let i = 0; i < that.data.nuilist.length; i++) {
      if (that.data.nuilist[i].sl > 0) {
        flag = true;
      }
    }
    if (flag) {
      that.data.canclick = true;
    } else {
      that.data.canclick = false;
    }
    that.setData({
      nuilist: that.data.nuilist,
      canclick: that.data.canclick
    })
  },


  /**
   * 添加
   */
  confirm(e) {
    let that = this;
    let flag = true;
    if (that.data.histortlist.length>0){
      let addlistitem=new Array();
      for (let i = 0; i < that.data.nuilist.length; i++) {
        for (let j = 0; j < that.data.histortlist.length; j++){
          if (Object.is(that.data.nuilist[i].unicode, that.data.histortlist[j].unicode)) {
            flag = false;
            if (that.data.nuilist[i].unicode.endsWith("E")) {
              that.data.histortlist[j].sl=1;
            }else{
              that.data.histortlist[j].sl = that.data.nuilist[i].sl + that.data.histortlist[j].sl;
              that.data.histortlist[j].fhsl = that.data.nuilist[i].sl ;
              that.data.histortlist[j].pdsl = that.data.nuilist[i].sl ;
              that.data.histortlist[j].returnsl = that.data.nuilist[i].sl ;
            }
          }
        }
        if (flag) {
          addlistitem.push({
            spid: that.data.nuilist[i].spid,
            mxid: that.data.nuilist[i].mxid,
            mxcode: that.data.nuilist[i].mxcode,
            cm: that.data.detaildata.cm,
            sl: that.data.nuilist[i].sl,
            fhsl: that.data.nuilist[i].sl,
            pdsl: that.data.nuilist[i].sl,
            returnsl: that.data.nuilist[i].sl,
            sellrate: 1,
            viprate: 1,
            mdrate: 1,
            originalprice: that.data.splistdata.sellprice,
            rateprice: that.data.splistdata.sellprice,
            realprice: that.data.splistdata.sellprice,
            sellprice: that.data.splistdata.sellprice,
            zhprice: that.data.splistdata.sellprice,
            zhprice: that.data.splistdata.sellprice,
            spcode: that.data.splistdata.spcode,
            spmc: that.data.splistdata.spmc,
            unicode: that.data.nuilist[i].unicode,
            ys: that.data.detaildata.ys
          })
        }
      }
      if (addlistitem.length>0){
        that.data.histortlist = that.data.histortlist.concat(addlistitem);
      }
    } else {
      for (let i = 0; i < that.data.nuilist.length;i++){
        if (that.data.nuilist[i].sl>0){
          let addlistitem = {
            spid: that.data.nuilist[i].spid,
            mxid: that.data.nuilist[i].mxid,
            mxcode: that.data.nuilist[i].mxcode,
            cm: that.data.detaildata.cm,
            sl: that.data.nuilist[i].sl,
            fhsl: that.data.nuilist[i].sl,
            pdsl: that.data.nuilist[i].sl,
            returnsl: that.data.nuilist[i].sl,
            sellrate: 1,
            viprate: 1,
            mdrate: 1,
            originalprice: that.data.splistdata.sellprice,
            rateprice: that.data.splistdata.sellprice,
            realprice: that.data.splistdata.sellprice,
            sellprice: that.data.splistdata.sellprice,
            zhprice: that.data.splistdata.sellprice,
            spcode: that.data.splistdata.spcode,
            spmc: that.data.splistdata.spmc,
            unicode: that.data.nuilist[0].unicode,
            ys: that.data.detaildata.ys
          }
          that.data.histortlist.push(addlistitem);
        }
      }
    }
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length-3];
    //直接调用上一个页面对象的setData()方法，把数据存到上上一个页面中去
    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      addlist: that.data.histortlist,
      hasnewdata:true 
    });
    wx.navigateBack({
      delta: 2
    })
  }
})