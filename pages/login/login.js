var wxToast = require('../../toast/toast.js')
Page({
  data: {
    mdcode:"",
    username:"",
    password:"123",
    loading:false,
    cleardh:false,
    clearusername:false
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    wx.getStorage({
      key: 'mdcode',
      success: function (res) {
        that.setData({
          mdcode: res.data
        })
      }, fail: function () {
      }
    })
    wx.getStorage({
      key: 'username',
      success: function (res) {
        that.setData({
          username: res.data
        })
      }, fail: function () {
      }
    })
  },
  inputFocus(e) {
    let that=this;
    if (e.currentTarget.dataset.type == 0) {
      if (that.data.mdcode != ""){
        that.setData({
          dh_focus: true,
          cleardh: true
        })
     }else{
        that.setData({
          dh_focus: true
        })
     }
    } else if (e.currentTarget.dataset.type == 1){
      if (that.data.username != ""){
        that.setData({
          username_focus: true,
          clearusername: true
        })
      }else{
        that.setData({
          username_focus: true
        })
      }
    }else{
      that.setData({
        password_focus: true
      })
    }
  },
  inputBlur(e) {
    let that = this;
    if (e.currentTarget.dataset.type == 0) {
      that.setData({
        dh_focus: false,
        cleardh: false
      })
    } else if (e.currentTarget.dataset.type == 1) {
      that.setData({
        username_focus: false,
        clearusername: false
      })
    } else if (e.currentTarget.dataset.type == 2){
      that.setData({
        password_focus: false
      })
    }
  },
  dhInput(e) { 
    let that = this;
    if (e.detail.value!=""){
      that.setData({
        mdcode: e.detail.value,
        cleardh:true
      })
    }else{
      that.setData({
        mdcode: e.detail.value,
        cleardh: false
      })
    }
  },
  usernameInput(e) { 
    let that = this;
    if (e.detail.value != "") {
      that.setData({
        username: e.detail.value,
        clearusername: true
      })
    } else {
      that.setData({
        username: e.detail.value,
        clearusername: false
      })
    }
  },
  passwordInput(e){
    let that = this;
    that.setData({
      password: e.detail.value,
    })
  },
  cleardh(){
    let that = this;
    that.setData({
      mdcode:"",
      cleardh:false
    })
  },
  clearusername() { 
    let that = this;
    that.setData({
      username: "",
      clearusername:false
    })
  },
  seen() { 
    let that = this;
    that.setData({
      seen:true
    })
  },
  close() { 
    let that = this;
    that.setData({
      seen: false
    })
  },
  tologin: function () {
    let that = this;
    that.setData({
      loading:true
    })
    if (Object.is(that.data.mdcode , '')) {
      getApp().wxToast({
        title: '店号不能为空', //标题，不写默认正在加载
        duration: 1500, //延时关闭，默认2000
        show: function () { //显示函数

        },
        hide: function () { //关闭函数
        }
      });
      that.setData({
        loading: false
      })
    } 
    else if (Object.is(that.data.username, '')) {
      getApp().wxToast({
        title: '账号不能为空', //标题，不写默认正在加载
        duration: 1500, //延时关闭，默认2000
        show: function () { //显示函数
          
        },
        hide: function () { //关闭函数
        }
      });
      that.setData({
        loading: false
      })
    }
    else if (Object.is(that.data.password, '')){
      getApp().wxToast({
        title: '密码不能为空', //标题，不写默认正在加载
        duration: 1500, //延时关闭，默认2000
        show: function () { //显示函数
          
        },
        hide: function () { //关闭函数
        }
      });
      that.setData({
        loading: false
      })
    } else {
      wx.showLoading({
        title: '正在登陆...',
      })
      wx.request({
        url: getApp().globalData.url + '/authentication/store',
        data: { "mdcode": that.data.mdcode, username: that.data.username, "userpass": that.data.password, "machinecode": '' },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic emhpemhpMzYwX3BvczoxOWI4OGIwOC1lZjQ1LTRmZjQtOTZrNy1lZmZmODlmNmM3MWE=',
        },
        success: (res) =>{
          wx.hideLoading();
          if (Object.is(res.statusCode, 200)){
            if (res.data.success){
              getApp().globalData.access_token = res.data.content.access_token //全局保存
              getApp().globalData.username = res.data.content2.username //全局保存
              getApp().globalData.mdcode = res.data.content2.mdcode //全局保存
              getApp().globalData.storeid = res.data.content2.storeid //全局保存
              getApp().globalData.mdmc = res.data.content2.mdmc //全局保存
              getApp().globalData.delegated = false //全局保存
              ///跳转主页
              wx.reLaunch({ ///关闭所有页面，打开到应用内的某个页面
                url: '../index/index'
              })
            }else{
              if (Object.is(res.data.content , "Bad credentials")){
                getApp().wxToast({
                  title: "密码有误", //标题，不写默认正在加载
                  duration: 1500, //延时关闭，默认2000
                  show: function () { //显示函数
                    
                  },
                  hide: function () { //关闭函数

                  }
                });
              }else{
                getApp().wxToast({
                  title: res.data.content, //标题，不写默认正在加载
                  duration: 1500, //延时关闭，默认2000
                  show: function () { //显示函数
                    
                  },
                  hide: function () { //关闭函数

                  }
                });
              }
            }
          }else{
            getApp().wxToast({
              title: "密码有误", //标题，不写默认正在加载
              duration: 1500, //延时关闭，默认2000
              show: function () { //显示函数
                
              },
              hide: function () { //关闭函数

              }
            });
          }
          that.setData({
            loading: false
          })
        },fail:(err)=>{
          wx.hideLoading()
          that.setData({
            loading: false
          })
          getApp().wxToast({
            title: "网络错误", //标题，不写默认正在加载
            duration: 1500, //延时关闭，默认2000
            show: function () { //显示函数
              
            },
            hide: function () { //关闭函数

            }
          });
        }
      })
    }
  }
});
