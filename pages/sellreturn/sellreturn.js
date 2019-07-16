Page({

  /**
   * 页面的初始数据
   */
  data: {
    ordercode: '-1',//单号
    list:[], //数据列表
    wantthsl:0,
    wantreload: false, //是否重新加载页面数据
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow(){
    let that = this;
    if (that.data.wantreload) {
      that.search();
    }
  },

  /**
   * 查找
   */
  search(){
    let that=this;
    wx.showLoading({
      title: '查找中..',
    })
    that.data.list=[];
    wx.request({
      url: getApp().globalData.url + '/yunst_user/getSellInfoByOrderCode/' + that.data.ordercode +'/0', 
      data: '',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        wx.hideLoading();
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success){
            for (let i = 0; i < res.data.content.sellDetailList.length; i++) {
              res.data.content.sellDetailList[i]["wantreturnsl"] = 0;
            }
            that.data.list.push(res.data.content);
            that.setData({
              list: that.data.list
            })
          }else{
            that.setData({
              list: [],
              nodataimg:'/images/base/im_no_content.png',
              message: res.data.message
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
        } else if (Object.is(res.data.status,404)){
          getApp().wxToast({
            title: res.data.status, //标题，不写默认正在加载
            duration: 1500, //延时关闭，默认2000
            show: function () { //显示函数

            },
            hide: function () { //关闭函数
            }
          });
        }
      }, fail: (err) => {
        that.setData({
          loading: false
        })
      }
    })
  },

  /**
   * 获取单号
   */
  getdh(e){
    let that=this;
    if (Object.is(e.detail.value,'')){
      that.data.ordercode =-1;
    }else{
      that.data.ordercode = e.detail.value;
    }
  },

  /**
   * 减减
   */
  sub(e){
    let that=this;
    let id = e.currentTarget.dataset.id;
    if (that.data.list[0].sellDetailList[id].wantreturnsl-1<1){
      that.data.list[0].sellDetailList[id].wantreturnsl=0;
    }else{
      that.data.list[0].sellDetailList[id].wantreturnsl = that.data.list[0].sellDetailList[id].wantreturnsl -1;
    }
    that.setData({
      list: that.data.list
    })
    that.wantthsl();
  },

  /**
   * 加加
   */
  add(e){
    let that = this;
    let id = e.currentTarget.dataset.id;
    if (that.data.list[0].sellDetailList[id].wantreturnsl + 1 <= that.data.list[0].sellDetailList[id].sl - that.data.list[0].sellDetailList[id].returnsl) {
      that.data.list[0].sellDetailList[id].wantreturnsl = that.data.list[0].sellDetailList[id].wantreturnsl + 1;
    } else {
      that.data.list[0].sellDetailList[id].wantreturnsl = that.data.list[0].sellDetailList[id].sl - that.data.list[0].sellDetailList[id].returnsl
    }
    that.setData({
      list: that.data.list,
    })
    that.wantthsl();
  },

  /**
   * 退货
   */
  salereturn(){
    let that = this;
    if (that.data.list[0].paystatus !=3){
      getApp().wxToast({
        title: "当前订单处于待支付状态，不可以申请退货", //标题，不写默认正在加载
        duration: 1500, //延时关闭，默认2000
        show: function () { //显示函数
          wx.hideLoading();
        },
        hide: function () { //关闭函数
        }
      });
    }else{
      let data = new Array();
      for (let i = 0; i < that.data.list[0].sellDetailList.length; i++) {
        if (that.data.list[0].sellDetailList[i].wantreturnsl > 0) {
          data.push({
            cselldetailid: that.data.list[0].sellDetailList[i].csdid,
            spid: that.data.list[0].sellDetailList[i].spid,
            spmc: that.data.list[0].sellDetailList[i].spmc,
            spcode: that.data.list[0].sellDetailList[i].spcode,
            mxcode: that.data.list[0].sellDetailList[i].mxcode,
            unicode: that.data.list[0].sellDetailList[i].unicode,
            mxid: that.data.list[0].sellDetailList[i].mxid,
            sellprice: that.data.list[0].sellDetailList[i].sellprice,
            realprice: that.data.list[0].sellDetailList[i].sellprice,
            rateprice: that.data.list[0].sellDetailList[i].rateprice,
            returnsl: that.data.list[0].sellDetailList[i].wantreturnsl,
            returnje: that.data.list[0].sellDetailList[i].sellprice * that.data.list[0].sellDetailList[i].wantreturnsl * that.data.list[0].sellDetailList[i].ccprate,
            storeid: that.data.list[0].sellDetailList[i].storeid
          })
        }
      }
      if(data.length==0){
        getApp().wxToast({
          title: "请选择退货数量", //标题，不写默认正在加载
          duration: 1500, //延时关闭，默认2000
          show: function () { //显示函数
            wx.hideLoading();
          },
          hide: function () { //关闭函数
          }
        });
        return false;
      }
      let array = {
        vipid: that.data.list[0].vipid,
        vipcard: that.data.list[0].vipcard,
        ordercode: that.data.list[0].ordercode,
        vipmrate: that.data.list[0].vipmrate,
        vipid: that.data.list[0].vipid,
        sellReturnList: data
      }
      wx.request({
        url: getApp().globalData.url + '/sell/sellreturn',
        data: array,
        method: 'POST',
        header: {
          'Authorization': 'bearer  ' + getApp().globalData.access_token,
        },
        success: (res) => {
          if (Object.is(res.statusCode, 200)) {
            if (res.data.success) {
              ///跳转主页
              wx.navigateTo({ ///关闭所有页面，打开到应用内的某个页面
                url: '../barcode/barcode?ordercode=' + that.data.list[0].ordercode + "&amount=" + res.data.content
              })
            } else {
              getApp().wxToast({
                title: res.data.message, //标题，不写默认正在加载
                img: '../../images/toast/error.png', //icon路径，不写不显示
                duration: 1500, //延时关闭，默认2000
                show: function () { //显示函数
                  wx.hideLoading();
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
  },

  /**
   * 退货数量
   */
  wantthsl(){
    let that =this;
    let wantthsl=0;
    for(let i =0;i<that.data.list.length;i++){
      for (let j = 0; j < that.data.list[i].sellDetailList.length;j++){
        wantthsl += that.data.list[i].sellDetailList[j].wantreturnsl;
      }
    }
    that.setData({
      wantthsl:wantthsl
    })
  },

  /**
   * 退货历史
   */
  returnhistory(){
    wx.navigateTo({
      url: '../returnhistory/returnhistory' 
    })
  },
})