Page({

  /**
   * 页面的初始数据
   */
  data: {
    yyy:'',//营业员
    username:'',
    ordercode:'',
    price:0,
    moling:0,
    storeid:'',
    sellSpInfoList:[],//销售明细
    waitpay:0,
    tips:'',
    gray:'',
    timerTask:'',
    items: [
      { name: 'wechat', value: '微信', pay: 0, checked: false, disabled1: true, disabled2: false },
      { name: 'alipay', value: '支付宝', pay: 0, checked: false, disabled1: true, disabled2: false },
      { name: 'card', value: '银行卡', pay: 0, checked: false, disabled1: true, disabled2: false },
      { name: 'rmb', value: '现金', pay: 0, checked: false, disabled1: true, disabled2: false },
      { name: 'reduce', value: '减免', pay: 0, checked: false, disabled1: true, disabled2: false },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'username',
      success: function(res) {
        that.data.yyy = that.data.username=res.data;
      },
    })
    wx.getStorage({
      key: 'storeid',
      success: function (res) {
        that.data.storeid =  res.data;
      },
    })
    that.data.ordercode = options.ordercode;
    that.data.price = options.totalPrice;
    that.data.waitpay = options.totalPrice;
    that.data.ratemoney = options.ratemoney;
    that.data.moling = options.moling;
    that.data.sellSpInfoList = JSON.parse(options.sellSpInfoList);
    that.setData({
      gray: 'gray',
      price: parseFloat(that.data.price),
      waitpay: parseFloat(that.data.price)
    })
  },

  return(){
    wx.navigateBack({
      delta: 1
    })
  },

  hidepan(e){
    let that = this;
    let index =e.currentTarget.dataset.id;
    if (that.data.items[index].pay!=0){
      that.setData({
        indx: index
      })
    }
  },

  showpan(e){
    let that = this;
    let index = e.currentTarget.dataset.id;
    that.setData({
      indx: -1
    })
  },
  updwaitpay(e){
    let that = this;
    let index = e.currentTarget.dataset.id;
    if (Object.is(e.detail.value,'')){
      that.data.items[index].pay=0;
    }else{
      that.data.items[index].pay = parseInt(e.detail.value);
    }
    let sum=0;
    for(let i = 0;i<that.data.items.length;i++){
      sum += that.data.items[i].pay;
    }
    that.data.waitpay =that.data.price;
    if (that.data.waitpay - sum>=0){//代付不小于0
      for (let i = 0; i < that.data.items.length; i++) {
        if (that.data.items[i].pay!=0){
          that.data.items[i].checked = true;
          that.data.items[i].disabled1 = false;
          that.data.items[i].disabled2 = false;
        }else{
          //that.data.items[i].checked = false;
          that.data.items[i].disabled1 = true;
          that.data.items[i].disabled2 = false;
        }
      }
      that.data.waitpay = that.data.waitpay - sum;
      if (that.data.waitpay == 0) {
        that.data.gray = ''
      } else {
        that.data.gray = 'gray'
      }
      that.setData({
        items: that.data.items,
        waitpay: that.data.waitpay,
        indx: index,
        gray: that.data.gray
      })
    }else{
      let sum=0;
      for (let i = 0; i < that.data.items.length; i++){
        if(i!=index){
          sum += that.data.items[i].pay;
        }
      }
      that.data.items[index].pay = that.data.waitpay-sum
      that.data.waitpay =0
      for (let i = 0; i < that.data.items.length; i++) {
        if (that.data.items[i].pay != 0) {
          that.data.items[i].checked = true;
          that.data.items[i].disabled1 = false;
          that.data.items[i].disabled2 = false;
        } else {
          that.data.items[i].checked = false;
          that.data.items[i].disabled1 = true;
          that.data.items[i].disabled2 = true;
        }
      }
      if (that.data.waitpay==0) {
        that.data.gray = ''
      } else {
        that.data.gray = 'gray'
      }
      that.setData({
        items: that.data.items,
        waitpay: that.data.waitpay,
        tipslider:true,
        tips:'已超出支付金额',
        gray: that.data.gray
      })
      wx.showToast({
        title: '已超出支付金额',
      })
    }
   
  },

  checkboxChange(e) {
    let that = this;
    let index = e.currentTarget.dataset.id;
    if (that.data.items[index].checked){ 
      that.data.waitpay += that.data.items[index].pay;
      that.data.items[index].pay=0
      if (that.data.waitpay >0){
        for (let i = 0; i < that.data.items.length; i++) {
          if (that.data.items[i].pay<=0){
            that.data.items[i].checked = false;
            that.data.items[i].disabled1 = true;
          }else{
            that.data.items[i].checked = true;
            that.data.items[i].disabled1 = false;
          }
          that.data.items[i].disabled2 = false;
        }
        that.data.items[index].checked = false;
      }
    }else{
      let sum = 0;
      for (let i = 0; i < that.data.items.length; i++) {
        if (i != index) {
          sum += that.data.items[i].pay;
        }
      }
      if (that.data.waitpay>0){
        that.data.items[index].pay = that.data.price - sum;//将剩下的待支付金额全部赋予刚刚选中的行
        that.data.waitpay = 0
      }else{
        that.data.items[index].pay=0;
      }
      for (let i = 0; i < that.data.items.length; i++) {
        if (that.data.items[i].pay==0){
          that.data.items[i].checked = false;
          that.data.items[i].disabled1 = true;
          that.data.items[i].disabled2 = true;
        }else{
          that.data.items[i].checked = true;
          that.data.items[i].disabled1 = false;
          that.data.items[i].disabled2 = false;
        }
      }
    } 
    if (that.data.waitpay == 0){
      that.data.gray=''
    }else{
      that.data.gray = 'gray'
    }
    that.setData({
      waitpay: that.data.waitpay,
      items: that.data.items,
      gray: that.data.gray,
      index:-1
    })
  },

  sub(){
    let that = this;
    let data = {
      "yyy":that.data.username,
      "username":that.data.username,
      "ordercode": that.data.ordercode,
      "amount": that.data.price,
      "ratemoney":'',
      "rate": 1,
      "vipmrate": 1,
      "totalcash": that.data.items[3].pay, //现金
      "totalpos": that.data.items[2].pay,
      "totalmobi": that.data.items[0].pay, //微信
      "mobimemo": '', 
      "posmoney": that.data.items[2].pay, //刷卡
      "posmemo1":'',
      "posmoney2": that.data.items[4].pay, //优惠
      "posmemo2": '',
      "zfb": that.data.items[1].pay, //支付宝
      "zfbmemo": '',
      "posmoney3": '',//换货
      "posmemo3": '',
      "prints":1,
      "djqmoney":'',
      "moling": that.data.moling,//抹零
      "storeid": that.data.storeid,
      "id":0,
      "userid":0,
      "uploaded":true,
      "vipid":'',
      "vipcard": '',
      "vipmoney": '',
      "sellSpInfoList": that.data.sellSpInfoList
    };
    wx.showLoading({
      title: '正在提交...',
    })
    wx.request({
      url: getApp().globalData.url + '/sell/addsell', 
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(data),
      method: 'POST',
      header: {
        "Content-Type": "application/json;charset=UTF-8",
        'Authorization': 'bearer  ' + getApp().globalData.access_token
      },
      success: (res) => {
        wx.hideLoading();
        if (Object.is(res.statusCode, 200)) {
          if (res.data.success) {
            getApp().wxToast({
              title: '销售成功', //标题，不写默认正在加载
              duration: 1500, //延时关闭，默认2000
              show: function () { //显示函数
                wx.hideLoading();
                let formatDateTime = function (myDate) {
                  var y = myDate.getFullYear();
                  var m = myDate.getMonth() + 1;
                  m = m < 10 ? ('0' + m) : m;
                  var d = myDate.getDate();
                  d = d < 10 ? ('0' + d) : d;
                  var h = myDate.getHours();
                  h = h < 10 ? ('0' + h) : h;
                  var minute = myDate.getMinutes();
                  minute = minute < 10 ? ('0' + minute) : minute;
                  var second = myDate.getSeconds();
                  second = second < 10 ? ('0' + second) : second;
                  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
                };
                let parameter=new Array();
                parameter = { "ordercode": that.data.ordercode, createtime: formatDateTime(new Date())}
                that.data.timerTask =setTimeout(function(){
                  wx.navigateTo({
                    url: '../printdetail/printdetail?parameter=' + JSON.stringify(parameter) + "&sellSpInfoList=" + JSON.stringify(that.data.sellSpInfoList) +'&plies=3'
                  })
                }, 1500)
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
        that.setData({
          loading: false
        })
      }, fail: (err) => {
        that.setData({
          loading: false
        })
      }
    })
  },

  onUnload(){
    let that = this;
    clearInterval(that.data.timerTask);
  }
})