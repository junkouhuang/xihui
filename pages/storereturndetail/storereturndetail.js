Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum: 1,//当前页
    pageSize: 20,//每页条数
    pages: 0,//总页数,
    returnid:'',
    wlgs:'', //物流公司
    wldh:'', //物流单号
    bz:'', //备注
    list:[],
    itemlist:[],
    addlist:[],
    timerTask:''
  },
  bz(e){
    let that=this;
    that.data.bz=e.detail.value;
  },
  qrcode(){
    let that = this;
    wx.scanCode({
      success: (res) => {
        that.data.wldh = res.result;
        that.setData({
          wldh: that.data.wldh
        })
      },
      fail: (res) => {
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.data.list = JSON.parse(options.list);
    that.data.returnid = that.data.list.id;
    that.setData({
      list: that.data.list
    })
    if (that.data.list.status <2){
      wx.setNavigationBarTitle({
        title: '待发货'
      })
    } else if (that.data.list.status == 2){
      wx.setNavigationBarTitle({
        title: '已发货'
      })
    } else if (that.data.list.status > 2) {
      wx.setNavigationBarTitle({
        title: '已处理'
      })
    }
  },

  /**
   * 明细
   */
  getstorereturndetailcustom(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/storereturn/getstorereturndetailcustom/' + getApp().globalData.storeid + "/" + that.data.returnid, 
      data: {pageNum: that.data.pageNum, pageSize: that.data.pageSize},
      method: 'GET',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          let amount = 0;
          for (let i = 0; i < res.data.length;i++ ){
            amount = amount + res.data[i].sellprice
          }
          that.data.itemlist = res.data
          that.setData({
            itemlist: that.data.itemlist,
            amount: amount
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that=this;
    if (that.data.hasnewdata){
      that.data.itemlist=that.data.addlist;
      that.setData({
        itemlist: that.data.itemlist
      })
      that.uploadcustomscan();
    }else{
      that.getstorereturndetailcustom();
    }
  },

  fhstorereturn(){
    let that = this;
    if (Object.is(that.data.wlgs,"")){
      getApp().wxToast({
        title: "物流公司不能为空", //标题，不写默认正在加载
        img: '../../images/toast/error.png', //icon路径，不写不显示
        duration: 500, //延时关闭，默认2000
        show: function () { //显示函数

        },
        hide: function () { //关闭函数
        }
      });
    } else if (Object.is(that.data.wldh, "")){
      getApp().wxToast({
        title: "物流单号不能为空", //标题，不写默认正在加载
        img: '../../images/toast/error.png', //icon路径，不写不显示
        duration: 500, //延时关闭，默认2000
        show: function () { //显示函数

        },
        hide: function () { //关闭函数
        }
      });
    }else{
      wx.request({
        url: getApp().globalData.url + '/storereturn/fhstorereturn',
        data: { id: that.data.returnid, storeid: getApp().globalData.storeid, wlgs: that.data.wlgs, wldh: that.data.wldh,bz:that.data.bz},
        method: 'POST',
        header: {
          'Authorization': 'bearer  ' + getApp().globalData.access_token,
        },
        success: (res) => {
          if (Object.is(res.statusCode, 200)) {
            if (res.data.success) {
              getApp().wxToast({
                title: "发货成功", //标题，不写默认正在加载
                img: '../../images/toast/error.png', //icon路径，不写不显示
                duration: 1000, //延时关闭，默认2000
                show: function () { //显示函数
                  that.data.timerTask = setTimeout(function () {
                    wx.navigateBack({
                      delta: 1
                    })
                    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
                    let prevPage = pages[pages.length - 2];
                    //直接调用上一个页面对象的setData()方法，把数据存到上一个页面中去
                    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
                      wantreload: true
                    });
                  }, 1000)
                },
                hide: function () { //关闭函数
                }
                
              });

            } else {
              getApp().wxToast({
                title: res.data.message, //标题，不写默认正在加载
                img: '../../images/toast/error.png', //icon路径，不写不显示
                duration: 500, //延时关闭，默认2000
                show: function () { //显示函数

                },
                hide: function () { //关闭函数
                }
              });
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
    }
  },

  wlgs(e){
    let that=this;
    that.data.wlgs=e.detail.value;
  },

  wldh(e){
    let that = this;
    that.data.wldh = e.detail.value;
  },


  openqrcode() {
    let that = this;
    that.data.hasnewdata = false;
    that.data.cleartel = false;
    wx.scanCode({
      needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
      scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
      success: (res) => {
        wx.request({
          url: getApp().globalData.url + '/barcode/' + res.result, //+ res.result 9BD000112L
          data: '',
          method: 'GET',
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'bearer  ' + getApp().globalData.access_token,
          },
          success: (res) => {
            if (Object.is(res.statusCode, 200)) {
              if (Object.is(res.data, "")) {
                getApp().wxToast({
                  title: '无效条码~~', //标题，不写默认正在加载
                  duration: 1500, //延时关闭，默认2000
                  show: function () { //显示函数

                  },
                  hide: function () { //关闭函数

                  }
                });
              } else if (res.data.status > 2) {
                getApp().wxToast({
                  title: '该条码已经出售~~', //标题，不写默认正在加载
                  duration: 1500, //延时关闭，默认2000
                  show: function () { //显示函数

                  },
                  hide: function () { //关闭函数

                  }
                });
              } else if (res.data.storeid != getApp().globalData.storeid) {
                getApp().wxToast({
                  title: '非本店条码，禁止销售~~', //标题，不写默认正在加载
                  duration: 1500, //延时关闭，默认2000
                  show: function () { //显示函数

                  },
                  hide: function () { //关闭函数

                  }
                });
              } else {
                if (that.data.itemlist.length > 0) {
                  let flag = 1;
                  for (let i = 0; i < that.data.itemlist.length; i++) {
                    if (Object.is(res.data.unicode, that.data.itemlist[i].unicode) && res.data.unicode.endsWith("E")) {
                      flag = 2;
                    } else if (Object.is(res.data.unicode, that.data.itemlist[i].unicode) && !res.data.unicode.endsWith("E")) {
                      that.data.itemlist[i].sl = that.data.itemlist[i].sl + 1;
                      that.data.itemlist[i].returnsl = that.data.itemlist[i].sl;
                      flag = 3;
                    }
                  }
                  if (Object.is(flag, 1)) {
                    res.data["originalprice"] = res.data.sellprice; //折前金额
                    res.data["rateprice"] = res.data.sellprice; //折后金额
                    res.data["realprice"] = res.data.sellprice; //折后单价
                    res.data["storerate"] = 1; //门店折扣
                    res.data["sl"] = 1; //购买数量
                    res.data["returnsl"] =1;
                    res.data["viprate"] = 1;//会员折扣
                    that.data.itemlist = that.data.itemlist.concat(res.data)
                    getApp().wxToast({
                      title: '添加成功~~', //标题，不写默认正在加载
                      duration: 1500, //延时关闭，默认2000
                      show: function () { //显示函数
                        wx.hideLoading();
                      },
                      hide: function () { //关闭函数
                      }
                    });
                  } else if (Object.is(flag, 2)) {
                    getApp().wxToast({
                      title: '此条码不能重复添加', //标题，不写默认正在加载
                      duration: 1500, //延时关闭，默认2000
                      show: function () { //显示函数
                        wx.hideLoading();
                      },
                      hide: function () { //关闭函数
                      }
                    });
                  } else if (Object.is(flag, 3)) {
                    getApp().wxToast({
                      title: '数量已累加~~', //标题，不写默认正在加载
                      duration: 1500, //延时关闭，默认2000
                      show: function () { //显示函数

                      },
                      hide: function () { //关闭函数

                      }
                    });
                  }
                } else {
                  res.data["originalprice"] = res.data.sellprice; //折前金额
                  res.data["rateprice"] = res.data.sellprice; //折后金额
                  res.data["realprice"] = res.data.sellprice; //折后单价
                  res.data["storerate"] = 1; //门店折扣
                  res.data["sl"] = 1; //购买数量
                  res.data["returnsl"] = 1;
                  res.data["viprate"] = 1;//会员折扣
                  that.data.itemlist.push(res.data)
                  getApp().wxToast({
                    title: '添加成功~~', //标题，不写默认正在加载
                    duration: 1500, //延时关闭，默认2000
                    show: function () { //显示函数

                    },
                    hide: function () { //关闭函数

                    }
                  });
                }
                that.setData({
                  itemlist: that.data.itemlist,
                })
                that.uploadcustomscan();
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

          }
        })
      },
      fail: (res) => {
      }
    })
  },

  /**
 * 商品列表
 */
  splist() {
    let that = this;
    wx.setStorage({
      key: 'histortlist',
      data: that.data.itemlist,
    })
    wx.navigateTo({
      url: '../splist/splist'
    })
  },

  uploadcustomscan(){
    let that = this;
    let data = new Array()
    data = {
      id: that.data.returnid,
      storeid: getApp().globalData.storeid,
      returnDetailList: that.data.itemlist
      }
    wx.request({
      url: getApp().globalData.url + '/storereturn/uploadcustomscan',
      data: data,
      method: 'POST',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
         if(res.data.success){
          
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

      }
    })
  },

  onUnload(){
    let that = this;
    clearInterval(that.data.timerTask);
  },
  
})