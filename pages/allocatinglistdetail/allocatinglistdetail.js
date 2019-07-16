Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    dh:'', //调货单号
    createtime:'', //创建时间
    dhid:'',//调货单号ID
    fstorecode: '',//调出店号
    tstorecode:'',//调入店号
    ishowtwobtn:true, //true:显示删整单和发货出库两个按钮，false:显示保存按钮
    isdisabled:true, //true:不可编辑 false:可编辑
    zt:'', //调货单状态3：为调出 4为调入
    wlgs:'',//物流公司
    wldh:'',//物流单号
    bz:'',//备注
    timerTask:'',
    wantreload:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let obj = JSON.parse(options.parameter);
    that.data.dhid=obj.id;
    that.setData({
      ordercode: obj.ordercode,
      createtime: obj.createtime,
      status: obj.status,
      fstorename: obj.fstorename,
      tstorename: obj.tstorename,
      bz: obj.bz,
      zt: options.zt //动态设置当前页面的标题
    })
    if (options.zt == 0) {
      wx.setNavigationBarTitle({
        title: '调出单明细'
      })
    } else if (options.zt == 1) {
      wx.setNavigationBarTitle({
        title: '调入单明细'
      })
    }
    //获取调货单详情
    that.listdhdetail();
  },

  /**
   * 商品修改
   */
  upd(e) {
    let that = this;
    that.setData({
      idx: e.currentTarget.dataset.id
    })
  },

  /**
   * 物流单号
   */
  openqrcode() {
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
    * 修改完成
    */
  fin(e) {
    let that = this;
    that.setData({
      idx: -1
    })
    //调货数量
    that.getTotal();
    //获得总金额
    that.getTotalPrice();
  },


  /**
   * 获取备注
   */
  bz(e){
    let bz=e.detail.value;
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
        wantreload: true,
        zt:that.data.zt
      });
    } else {
      prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
        wantreload: false,
        zt: that.data.zt
      });
    }
    clearInterval(that.data.timerTask);
  },


  /**
    * 调货数量
    */
  getTotal() {
    let that = this;
    let dhsl = 0;
    for (let i = 0; i < that.data.list.length; i++) {
      dhsl = parseFloat(dhsl + that.data.list[i].fhsl);
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
    let dhje = 0;
    for (let i = 0; i < that.data.list.length; i++) {
      dhje = dhje + that.data.list[i].fhje ;
    }
    that.data.dhje = parseFloat(dhje);
    that.setData({
      dhje: that.data.dhje
    })
  },
  

  /**
   * 发货出库
   */
  sent(){
    let that = this;
    if(Object.is(that.data.wlgs,'')){
      getApp().wxToast({
        title: "物流公司不能为空",
        duration: 1500, //延时关闭，默认2000
        show: function () { //显示函数
         
        },
        hide: function () { //关闭函数
        }
      })
    }else if(Object.is(that.data.wldh,'')){
      getApp().wxToast({
        title: "物流单号不能为空",
        duration: 1500, //延时关闭，默认2000
        show: function () { //显示函数
          
        },
        hide: function () { //关闭函数
        }
      })
    }else{
      wx.request({
        url: getApp().globalData.url + '/storedh/fhdh',
        data: {
          id: that.data.dhid,
          wlgs: that.data.wlgs,
          wldh: that.data.wldh,
          bz: that.data.bz
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'bearer  ' + getApp().globalData.access_token,
        },
        success: (res) => {
          if (Object.is(res.statusCode, 200)) {
            if (res.data.success) {
              wx.showToast({
                title: '发货成功',
              })
              that.data.timerTask = setTimeout(function () {
                that.data.wantreload = true;
                wx.navigateBack({
                  delta: 1
                })
              }, 1500)
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

  wlgs(e){
    let that = this;
    that.data.wlgs=e.detail.value;
  },

  wldh(e){
    let that = this;
    that.data.wldh = e.detail.value;
  },
  
  /**
   * 调货单修改(编辑)
   */
  editdh(){
    let that = this;
    that.data.ishowtwobtn = !that.data.ishowtwobtn
    that.data.isdisabled = !that.data.isdisabled
    that.setData({
      isdisabled: that.data.isdisabled,
      ishowtwobtn: that.data.ishowtwobtn
    })
  },

  /**
   * 调货单修改(保存)
   */
  save() {
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/storedh/editdh',
      data: { 
        ordercode: that.data.ordercode, 
        tstorecode: that.data.tstorecode, 
        bz: that.data.bz, 
        fstorecode: that.data.fstorecode, 
        dhrate: 1, 
        id: that.data.dhid, 
        dhDetails: that.data.list
      },
      method: 'POST',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success) {
            getApp().wxToast({
              title: res.data.message, //标题，不写默认正在加载
              duration: 1000, //延时关闭，默认2000
              show: function () { //显示函数
                wx.navigateBack({
                  delta: 1
                })
              },
              hide: function () { //关闭函数

              }
            });
          } else {
            getApp().wxToast({
              title: res.data.message, //标题，不写默认正在加载
              img: '../../images/toast/error.png', //icon路径，不写不显示
              duration: 1000, //延时关闭，默认2000
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
  },

  /**
   * 收货入库
   */
  sh() {
    let that = this;
    for (let i = 0; i < that.data.list.length;i++){
      if (that.data.list[i].fhsl>0){
        that.data.list[i].shsl = that.data.list[i].fhsl;
      }
    }
    wx.request({
      url: getApp().globalData.url + '/storedh/shdh',
      data: {
        id: that.data.dhid,
        dhDetails: that.data.list
      },
      method: 'POST',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success) {
            wx.showToast({
              title: '收货成功',
            })
            that.data.timerTask = setTimeout(function () {
              that.data.wantreload = true;
              wx.navigateBack({
                delta: 1
              })
            }, 1500)
          } else {
            getApp().wxToast({
              title: res.data.message, //标题，不写默认正在加载
              img: '../../images/toast/error.png', //icon路径，不写不显示
              duration: 1000, //延时关闭，默认2000
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
  },

  /**
   * 整单删除
   */
  deletedh(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/storedh/deletedh?id=' + that.data.dhid,
      data: '',
      method: 'DELETE',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success) {
            wx.showToast({
              title: '已删除',
            })
            that.data.timerTask = setTimeout(function () {
              that.data.wantreload = true;
              wx.navigateBack({
                delta: 1
              })
            }, 1500)
          } else {
            getApp().wxToast({
              title: res.data.message, //标题，不写默认正在加载
              img: '../../images/toast/error.png', //icon路径，不写不显示
              duration: 1000, //延时关闭，默认2000
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
  },

  /**
   * 调货单详情
   */
  listdhdetail(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/storedh/listdhdetail/' + that.data.dhid,
      data: "",
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          that.setData({
            list: res.data
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
        //调货数量
        that.getTotal();
        //获得总金额
        that.getTotalPrice();
      }, fail: (err) => {

      }
    })
  }
})