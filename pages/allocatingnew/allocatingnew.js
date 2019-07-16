Page({

  /**
   * 页面的初始数据
   */
  data: {
    seenallocating:false,
    dh:"",
    ordercode:'',
    list:[],
    addlist: [],
    tstoremc:'',//调入店名
    tstorecode:'',//调入店号
    bz:'',
    fstorecode:'',//调出店号
    dhsl: "",//调货数量
    shje: 0, //总金额
    wantreload:false,
    hasnewdata:false,
    timerTask:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

    /**
   * 获取门店店号
   */
  gettstorecode(e){
    let that = this;
    that.data.tstorecode = e.detail.value;
  },

  /**
   * 获取门店名称
   */
  gettstoremc(e) {
    let that = this;
    if (Object.is(that.data.tstorecode,"")){
     
    }else{
      wx.request({
        url: getApp().globalData.url + '/store/getmdmc/' + that.data.tstorecode,
        data: '',
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'bearer  ' + getApp().globalData.access_token,
        },
        success: (res) => {
          if (Object.is(res.statusCode, 200)) {
            if (res.data.success) {
              that.setData({
                tstoremc: res.data.content
              })
            } else {
              getApp().wxToast({
                title: res.data.message, //标题，不写默认正在加载
                img: '../../images/toast/error.png', //icon路径，不写不显示
                duration: 1500, //延时关闭，默认2000
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

        }
      })
    }
  },

  /**
   * 获取备注的内容
   */
  bz(e){
    let that = this;
    that.data.bz=e.detail.value;
    that.setData({
      pretext: that.data.bz
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    if(that.data.hasnewdata){
      that.setData({
        list: that.data.addlist
      })
    }
    //调货数量
    that.getTotal();
    //获得总金额
    that.getTotalPrice();
    //获得调货单号
    that.dh();
    wx.getStorage({
      key: 'mdcode',
      success: function (res) {
        that.data.dh = res.data
      },
    })
  },

  /**
   * 保存
   */
  save(){
    let that = this;
    if (Object.is(that.data.tstorecode,'')){
      getApp().wxToast({
        title: "请填写调入店号", //标题，不写默认正在加载
        img: '../../images/toast/error.png', //icon路径，不写不显示
        duration: 1500, //延时关闭，默认2000
        show: function () { //显示函数

        },
        hide: function () { //关闭函数
        }
      });
    }else{
      wx.request({
        url: getApp().globalData.url + '/storedh/adddh',
        data: { ordercode: that.data.ordercode, tstorecode: that.data.tstorecode, fstorecode: that.data.dh, bz: that.data.bz, dhrate: 1, dhDetails: that.data.list },
        method: 'POST',
        header: {
          'Authorization': 'bearer  ' + getApp().globalData.access_token,
        },
        success: (res) => {
          if (Object.is(res.statusCode, 200)) {
            if (res.data.success) {
              getApp().wxToast({
                title: "保存成功", //标题，不写默认正在加载
                duration: 1500, //延时关闭，默认2000
                show: function () { //显示函数
                  that.data.wantreload=true;
                  that.data.timerTask = setTimeout(
                    function () {
                      wx.navigateBack({
                        delta: 1
                      })
                    }, 1000)
                },
                hide: function () { //关闭函数
                }
              });
            } else {
              getApp().wxToast({
                title: res.data.message, //标题，不写默认正在加载
                img: '../../images/toast/error.png', //icon路径，不写不显示
                duration: 1500, //延时关闭，默认2000
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

        }
      })
    }
  },
  

  /**
 * 修改数量
 */
  inpsl(e){
    let that =this;
    let sl = e.detail.value;
    let id = e.currentTarget.dataset.id; 
    if (Object.is(sl,0)){
      that.data.list[id].sl = 1;
      that.setData({
        list: that.data.list
      })
    } else if (Object.is(sl, '')){
      that.data.list[id].sl = 1;
      that.setData({
        list: that.data.list
      })
    }else{
      that.data.list[id].sl = sl;
      that.setData({
        list: that.data.list
      })
    }
    wx.setStorage({
      key: 'addlist',
      data: that.data.list
    })
    //调货数量
    that.getTotal();
    //获得总金额
    that.getTotalPrice();
  },

  /**
   * 条码扫描
   */
  openqrcode() {
    let that = this;
    wx.scanCode({
      needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
      scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
      success: (res) => {
        wx.request({
          url: getApp().globalData.url + '/barcode/' + res.result, 
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
                  title: '无效条码', //标题，不写默认正在加载
                  img: '../../images/toast/error.png', //icon路径，不写不显示
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
                  title: '非本店条码，禁止调货~~', //标题，不写默认正在加载
                  duration: 1500, //延时关闭，默认2000
                  show: function () { //显示函数

                  },
                  hide: function () { //关闭函数

                  }
                });
              } else {
                if (that.data.list.length > 0) {
                  let flag = 1;
                  for (let i = 0; i < that.data.list.length; i++) {
                    if (Object.is(res.data.unicode, that.data.list[i].unicode) && res.data.unicode.endsWith("E")) {
                      flag = 2;
                    } else if (Object.is(res.data.unicode, that.data.list[i].unicode) && !res.data.unicode.endsWith("E")) {
                      that.data.list[i].sl = parseInt(that.data.list[i].sl) + 1;
                      flag = 3;
                    }
                  }
                  if (flag == 1){
                    res.data["originalprice"] = res.data.sellprice; //折前金额
                    res.data["rateprice"] = res.data.sellprice; //折后金额
                    res.data["realprice"] = res.data.sellprice; //折后单价
                    res.data["storerate"] = 1; //门店折扣
                    res.data["sl"] = 1; //购买数量
                    res.data["fhsl"] = 1; //发货数量
                    res.data["viprate"] = 1;//会员折扣
                    that.data.list.push(res.data)
                  } else if(flag == 2) {
                    getApp().wxToast({
                      title: '此条码不能重复添加', //标题，不写默认正在加载
                      img: '../../images/toast/error.png', //icon路径，不写不显示
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
                  res.data["fhsl"] = 1; //发货数量
                  res.data["viprate"] = 1;//会员折扣
                  that.data.list.push(res.data)
                }
                that.setData({
                  list: that.data.list
                })
                //调货数量
                that.getTotal();
                //获得总金额
                that.getTotalPrice();
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
            wx.setStorage({
              key: 'addlist',
              data: that.data.list
            })
          }, fail: (err) => {
            that.setData({
              loading: false
            })
          }
        })
      },
      fail: (res) => {
      }
    })
  },

  /**
   * 添加商品
   */
  splist(){
    let that = this;
    wx.setStorage({
      key: 'histortlist',
      data: that.data.list,
    })
    wx.navigateTo({
      url: '../splist/splist' 
    })
  },
  
  /**
   * 调货数量
   */
  getTotal() {
    let that = this;
    let dhsl = 0;
    for (let i = 0; i < that.data.list.length; i++) {
      dhsl = parseFloat(dhsl + parseInt(that.data.list[i].sl));
    }
    that.setData({
      dhsl: dhsl
    })
  },

  /**
   * 总金额
   */
  getTotalPrice() {
    let that = this;
    let totalPrice = 0;
    for (let i = 0; i < that.data.list.length; i++) {
      totalPrice = totalPrice + that.data.list[i].sellprice * that.data.list[i].sl;
    }
    that.data.totalPrice = parseFloat((totalPrice).toFixed(2));
    that.setData({
      totalPrice: that.data.totalPrice
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that = this;
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2];
    if (that.data.wantreload) {
      prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
        wantreload: true
      });
    } else {
      prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
        wantreload: false
      });
    }
    clearInterval(that.data.timerTask);
  },

  /**
   * 删除单款
   */
  del(e){
    let that = this;
    let id = e.currentTarget.dataset.id
    that.data.list.splice(id, 1);
    that.setData({
      list: that.data.list,
      idx: -1
    })
      that.data.hasnewdata=false;
    //计算数量
    that.getTotal();
    //总金额
    that.getTotalPrice();
    getApp().wxToast({
      title: '已删除~~', //标题，不写默认正在加载
      duration: 1500, //延时关闭，默认2000
      show: function () { //显示函数

      },
      hide: function () { //关闭函数

      }
    });
  },

  /**
   * 获取调货单号
   */
  dh(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/serialnum/get/dh',
      data: '',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success) {
            that.data.ordercode = res.data.content
            that.setData({
              ordercode: that.data.ordercode
            })
          } else {
            getApp().wxToast({
              title: res.data.message, //标题，不写默认正在加载
              img: '../../images/toast/error.png', //icon路径，不写不显示
              duration: 1500, //延时关闭，默认2000
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

      }
    })
  }
})