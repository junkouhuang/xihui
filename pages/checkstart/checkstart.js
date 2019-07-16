Page({
  /**
   * 页面的初始数据
   */
  data: {
    del: false,
    list: [],
    toatal: "",//数量
    username: '',
    addlist: [],
    timerTask: '',//本页面的定时任务,要在这里声明定时器的变量名
    pdid:'',//盘点id
    pddh:'',//盘点单号
    branchid:0,//子单id
    branchcode:'',//子单code
    wantreload: false,//是否重新加载页面
    del: false, //是否显示删除按钮
    index:'',
    hasnewdata:false
  },

  editor() {
    let that = this;
    that.setData({
      del: !that.data.del
    })
  },

  del(e) {
    let that = this;
    let id = e.currentTarget.dataset.id
    that.data.list.splice(id, 1);
    that.setData({
      list: that.data.list
    })
    if (that.data.list.length == 0) {
      that.setData({
        del: false
      })
    }
    //计算数量
    that.getTotal();
  },


  /**
   *扫码 
   */
  openqrcode() {
    let that = this;
    wx.scanCode({
      success: (res) => {
        wx.request({
          url: getApp().globalData.url + '/barcode/' + res.result,//+ res.result
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
                  duration: 1000, //延时关闭，默认2000
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
                if (that.data.list.length > 0) {
                  let flag = 0;
                  for (let i = 0; i < that.data.list.length; i++) {
                    if (Object.is(res.data.unicode, that.data.list[i].unicode) && res.data.unicode.endsWith("E")) {
                      flag = 1;
                    } else if (Object.is(res.data.unicode, that.data.list[i].unicode) && !res.data.unicode.endsWith("E")) {
                      that.data.list[i].pdsl = that.data.list[i].pdsl + 1;
                      flag = 2;
                    }
                  }
                  if (Object.is(flag, 0)) {
                    res.data["pdsl"] = 1; //购买数量
                    that.data.list = that.data.list.concat(res.data)
                  } else if (Object.is(flag, 1)) {

                  }
                } else {
                  res.data["pdsl"] = 1; //购买数量
                  that.data.list.push(res.data)
                }
                let data = new Array();
                data = {
                  branchid: that.data.branchid,
                  mxid: res.data.mxid,
                  unicode: res.data.unicode,
                  pdsl: 1,
                }
                //扫描上传
                that.submit(data);
                //计算数量
                that.getTotal();
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    that.data.pdid = options.pdid;
    that.data.pddh = options.pddh;
    that.data.branchid = options.branchid;
    that.data.branchcode = options.branchcode;
    that.data.index = options.index;
    let content='';
    if (that.data.index==1){
      content = "-盘点明细"
    }else{
      content = "(子单" + that.data.index + ")-盘点明细"
    }
    //获取指定盘点单号下的指定分支单号的信息
    that.getbranchdetail(); 
    //获取盘点分支单扫描数据
    that.listpdbranchdetails(); 
    //计算数量
    that.getTotal();
    wx.getStorage({
      key: 'username',
      success: function(res) {
        wx.setNavigationBarTitle({
          title: res.data + content,
        })
      }
    })

  },


  /**
     * 生命周期函数--监听页面显示
     */
  onShow: function () {
    let that = this;
    if (that.data.hasnewdata) {
      let data = new Array();
      for (let i = 0; i < that.data.addlist.length; i++) {
        data = {
          branchid: that.data.branchid,
          mxid: that.data.addlist[i].mxid,
          unicode: that.data.addlist[i].unicode,
          pdsl: that.data.addlist[i].sl,
        }
      }
      that.setData({
        list: that.data.addlist
      })
      //自动上传
      that.submit(data);
      //计算数量
      that.getTotal();
    }
  },

  /**
   * 扫描上传
   */
  submit(data) {
    let that=this;
    wx.request({
      url: getApp().globalData.url + '/pd/addbranchdetail', 
      data: data,
      method: 'POST',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
         if(res.data.success){
          that.setData({
            list: that.data.list
          })
         }else{
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
        that.setData({
          loading: false
        })
      }
    })

  },

  /**
   * 计算总数量
   */
  getTotal() {
    let that = this;
    let total = 0;
    for (let i = 0; i < that.data.list.length; i++) {
      total = total + that.data.list[i].pdsl;
    }
    that.data.total = total;
    that.setData({
      total: total
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that = this;
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2];
    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      wantreload: true
    });
    clearInterval(that.data.timerTask);
  },

  /**
   * 删除盘点分支
   */
  deletebranch(){
    let that = this;
    let content = '';
    if (that.data.index == 1) {
      content = "此子单"
    } else {
      content = "子单" + that.data.index 
    }
    wx.showModal({
      title: '提示',
      content: '确定删除' + content +'？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: getApp().globalData.url + '/pd/branch/' + that.data.branchid,
            data: "",
            method: 'DELETE',
            header: {
              'Authorization': 'bearer  ' + getApp().globalData.access_token,
            },
            success: (res) => {
              if (Object.is(res.statusCode, 200)) {
                if (res.data.success) {
                  getApp().wxToast({
                    title: '删除成功', //标题，不写默认正在加载
                    duration: 1500, //延时关闭，默认2000
                    show: function () { //显示函数
                      that.data.timerTask = setTimeout(function () {
                        that.data.wantreload=true;
                        wx.navigateBack({
                          delta: 1
                        })
                      }, 1500)
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
              that.setData({
                loading: false
              })
            }
          })
        }
      }
    })
  },


  /**
  * 将指定盘点单号下的指定分支单标识完成扫描
  */
  getbranchdetail() {
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/pd/branch/' + that.data.pddh + '/' + that.data.branchcode,
      data: "",
      method: 'GET',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          that.setData({
            status:res.data.status
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
        that.setData({
          loading: false
        })
      }
    })
  },

  /**
  * 获取盘点分支单扫描数据
  */
  listpdbranchdetails() {
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/pd/listpdbranchdetails/' + that.data.branchid,
      data: "",
      method: 'GET',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          that.data.list=res.data
          that.setData({
            list:that.data.list
          })
          that.getTotal();
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
        that.setData({
          loading: false
        })
      }
    })
  },

  completepdbranch(){
    wx.navigateBack({
      delta:1
    })
  },

  /**
 * 商品列表
 */
  splist() {
    let that = this;
    wx.setStorage({
      key: 'histortlist',
      data: that.data.list,
    })
    wx.navigateTo({
      url: '../splist/splist'
    })
  },
})