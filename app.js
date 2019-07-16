//app.js
var wxToast = require('toast/toast.js')
App({
  wxToast,
  //生命周期函数--监听小程序初始化 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
  onLaunch: function () {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      if (res.hasUpdate) {
        updateManager.onUpdateReady(function () {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
  },
  
  globalData: {
    userInfo: null,
    access_token: '',   ///用于检测登陆时间是否过期，过期则返回登陆界面
    username: '',//全局保存
    mdcode: '',//全局保存
    storeid: '',//全局保存
    mdmc: '',//全局保存
    delegated:'',//全局保存
    //url:"http://192.168.10.205:8090"  //本地
  //url:"http://192.168.10.234:8060"  //本地
   //url:"http://192.168.10.189:8060"  //本地
    //url:"http://192.168.10.237:8090",  //本地
    //url:"http://192.168.10.231:8060",
    //url:"https://zztest.zhizhi360.com"  //本地
    //url:"http://120.79.78.245:8080"  //本地
    //url:"https://zz.zhizhi360.com",
   // url:"http://120.79.132.153:8081",
   //url:"http://192.168.10.205:8090"
     // url: "http://192.168.1.130:8090"
     url:"https://zzpos.zhizhi360.com",
    //url:"http://localhost:8080"
  }
})