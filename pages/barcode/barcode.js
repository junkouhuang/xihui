const wxbarcode = require('../../plug/code/index')
Page({
    data: {
      code: '',
      needpay:"",
      username:''
    },
    onLoad: function(query) {
      let that=this;
      wxbarcode.barcode('barcode', query.ordercode, 600, 200);
      wxbarcode.qrcode('qrcode', query.ordercode, 420, 420);
      that.setData({
        code: query.ordercode.replace(/(.{4})/g, "$1 "),
        needpay: query.amount
      })
      wx.getStorage({
        key: 'mdcode',
        data: that.data.mdcode,
        success: function (res) {
          that.data.username=res.data
        }
      });
    },
    onShow() {
      this.connectWebsocket();
    },
    connectWebsocket: function () {
      wx.connectSocket({
        url: 'ws://192.168.10.205:8090/wechatsocket/tt',
        data: {
        },
        header: {
          'content-type': 'application/json'
        },
        method: "GET"
      })
      wx.onSocketOpen(function (res) {
        console.log('WebSocket连接已打开！')
      })
      wx.onSocketError(function (res) {
        console.log(res)
        console.log('WebSocket连接打开失败，请检查！')
      })
      wx.onSocketMessage(function (res) {
        wx.showLoading({
          title: '支付中...',
        })
        if(res.data.flag){
          wx.navigateTo({
            url: '../paysuccess/paysuccess?sendtime=' + res.data.sendtime + "&ordercode=" + res.data.ordercode + "&amount=" + res.data.amount + "&username=" + that.data.username,
          })
        }
      })
    },

    onUnload(){
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let prevPage = pages[pages.length - 2];
      //直接调用上一个页面对象的setData()方法，把数据存到上上一个页面中去
      prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
        addlist: [],
        hasnewdata: true,
        cleartel:true,
        wantreload:true //收银退货使用
      });
    }
})
