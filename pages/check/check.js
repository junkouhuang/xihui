Page({

  /**
   * 页面的初始数据
   */
  data: {
    pdid:"-1",//盘点ID
    pddh: '', //盘点单号
    pdorder:"",
    list:[],//分支盘点列表
    timerTask: '',//本页面的定时任务,要在这里声明定时器的变量名
    isopennewdh:"true", //true新开盘点单 false则相反
    wantreload:false, //是否重新加载页面
    del:false, //是否显示删除按钮
    status:'',//当前盘点单的状态
    bz:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    if (JSON.stringify(options) != "{}"){
      if (options.isopennewdh == 'false'){
        that.data.isopennewdh=false;
      }
      that.data.pddh=options.pddh;
      that.data.pdid=options.pdid
      that.data.status = parseInt(options.status)
      that.data.pdorder = options.pdorder
      that.data.bz = options.bz
    }
    if (that.data.isopennewdh == "true") {
      wx.request({
        url: getApp().globalData.url + '/serialnum/get/DH',
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
                pddh: res.data.content,
                isopennewdh: true,
                mdmc: getApp().globalData.mdmc
              })
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

        }
      })
    } else {
      let merge =""
      if (that.data.status == 2){
        merge = "盘点差异表"
      }
      that.setData({
        isopennewdh: that.data.isopennewdh,
        pddh: that.data.pddh,
        pdid: that.data.pdid,
        status: that.data.status,
        bz: that.data.bz,
        merge:merge,
        mdmc: getApp().globalData.mdmc,
        username: getApp().globalData.username,
      })
      //获取分支单列表
      that.listpdbranchs();
    }
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    if (that.data.wantreload) {
      //获取分支单列表
      that.listpdbranchs();
    }
  },

  /**
   * 获得备注
   */
  getbz(e){
    let that = this;
    that.data.bz = e.detail.value;
  },
  /**
   * 生成盘点记录
   */
  save(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/pd/add?ordercode=' + that.data.pddh + "&mdcode=" + getApp().globalData.mdcode + "&pdtype=0" +"&pdbz="+that.data.bz,
      data: "",
      method: 'POST',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success) {
            getApp().wxToast({
              title: '保存成功', //标题，不写默认正在加载
              duration: 1000, //延时关闭，默认2000
              show: function () { //显示函数
                that.data.timerTask = setTimeout(function () {
                  that.data.wantreload=true;
                  wx.navigateBack({
                    delta: 1
                  })
                },1000)
              },
              hide: function () { //关闭函数
              }
            });
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
        wx.hideLoading();
      }
    })
  },

  /**
   * 删除盘点单
   */
    deletepdd(){
      let that = this;
      wx.showModal({
        title: '提示',
        content: '您确定要删除该盘点单：' + that.data.pddh+'？',
        success: (res) => {
          if (res.confirm) {
            wx.request({
              url: getApp().globalData.url + '/pd/delete/' + that.data.pdid,
              data: "",
              method: 'DELETE',
              header: {
                'Authorization': 'bearer  ' + getApp().globalData.access_token,
              },
              success: (res) => {
                if (Object.is(res.statusCode, 200)) {
                  if(res.data.success){
                    getApp().wxToast({
                      title: '删除成功', //标题，不写默认正在加载
                      duration: 1000, //延时关闭，默认2000
                      show: function () { //显示函数
                        that.data.timerTask = setTimeout(function () {
                          that.data.wantreload = true
                          wx.navigateBack({
                            delta: 1
                          })
                        }, 1000)
                      },
                      hide: function () { //关闭函数
                      }
                    });
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
                wx.hideLoading();
              }
            })
          }
        }
      })
    },

  /**
   * 新增盘点单
   */
  addbranch() {
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/pd/addbranch/'+that.data.pdid,
      data: "",
      method: 'POST',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          if(res.data.success){
            that.data.wantreload = true
            that.data.list = that.data.list.concat(res.data.content);
            that.setData({
              list: that.data.list
            })
          }else{
            getApp().wxToast({
              title: res.data.message, //标题，不写默认正在加载
              img: '../../images/toast/error.png', //icon路径，不写不显示
              duration: 1500, //延时关闭，默认2000
              show: function () { //显示函数
                that.data.timerTask = setTimeout(function () {
                  that.data.wantreload = true
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
        wx.hideLoading();
      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that =this;
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2];
    if(that.data.wantreload){
      prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
        wantreload: true
      });
    }else{
      prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
        wantreload: false
      });
    }
    clearInterval(that.data.timerTask);
  },

  /**
   * 盘点汇总
   */
  mergebranch(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/pd/marge/' + that.data.pdid,
      data: "",
      method: 'POST',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success){
            getApp().wxToast({
              title: '提交成功', //标题，不写默认正在加载
              duration: 1500, //延时关闭，默认2000
              show: function () { //显示函数
                wx.navigateTo({
                  url: '../pdhistory/pdhistory?pdid=' + that.data.pdid + '&ordercode=' +  that.data.pdorder
                })
              },  
              hide: function () { //关闭函数
              }
            });
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
        wx.hideLoading();
      }
    })
  },

  /**
   * 获取盘点分支单列表
   */
  listpdbranchs(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/pd/listpdbranchs/' + that.data.pdid,
      data: "",
      method: 'GET',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          that.data.list=res.data
          if (that.data.list.length==0){
            that.setData({
              list: that.data.list,
              status: -1,
              merge: ''
            })
          }else{
            that.setData({
              list: that.data.list,
              status: 2,
              merge: '盘点差异表'
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
   * 编辑
   */
  editor(){
    let that = this;
    that.setData({
      del:!that.data.del
    })
  },

  /**
   * 开始盘点扫描
   */
  checkstart(e){
    let that = this;
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../checkstart/checkstart?pdid=' + that.data.pdid+'&pddh='+that.data.pddh + '&branchid=' + that.data.list[index].id + '&index=' + (index + 1) + '&branchcode=' + that.data.list[index].branchcode
    })
  },

  /**
   * 差异报表
   */
  pdhisoty(){
    let that = this;
    wx.navigateTo({
      url: '../pdhistory/pdhistory?pdid=' + that.data.pdid + '&ordercode=' + that.data.pdorder
    })
  }
})