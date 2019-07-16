Page({

  /**
   * 页面的初始数据
   */
  data: {
    pdid:'', //盘点id
    ordercode:'',//盘点单号
    list:[], //数据列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.data.pdid = options.pdid;
    that.data.ordercode = options.ordercode;
    that.getbranchspddetail();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2];
    //直接调用上一个页面对象的setData()方法，把数据存到上一个页面中去
    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      status:2
    });
    clearInterval(that.data.timerTask);
  },

  /**
   * 盘点详情
   */
  getbranchspddetail() {
    let that = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: getApp().globalData.url + '/pd/getbranchspddetail/' + that.data.pdid,
      data: "",
      method: 'GET',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        wx.hideLoading();
        that.data.list = res.data;
        that.calculate();
      }, fail: (err) => {
        wx.hideLoading();
      }
    })
  },

  /**
   * 提交审核
   */
  submit(){
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/pd/confirmpdtoadjust/'+that.data.pdid ,
      data: "",
      method: 'POST',
      header: {
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
          if(res.data.success){
            getApp().wxToast({
              title: "提交成功",
              duration: 1000, //延时关闭，默认2000
              show: function () { //显示函数
                that.data.timerTask = setTimeout(function () {
                  that.data.wantreload = true
                  wx.navigateBack({
                    delta:2
                  })
                }, 1000)
              },
              hide: function () { //关闭函数
              }
            })
          }else{
            getApp().wxToast({
              title: res.data.message,
              img: '../../images/toast/error.png', //icon路径，不写不显示
              duration: 1000, //延时关闭，默认2000
              show: function () { //显示函数

              },
              hide: function () { //关闭函数
              }
            })
            }
      }, fail: (err) => {
        wx.hideLoading();
      }
    })
  },

  /**
   * 计算
   */
  calculate(){
    let that =this;
    let pdamount = 0;
    let stockamount = 0;
    let pdnumber = 0;
    let stocknumber = 0;
    let yknumber = 0;
    for (let i = 0; i < that.data.list.length; i++) {
      pdamount = pdamount + that.data.list[i].pdsl * that.data.list[i].sellprice;
      stockamount = stockamount + that.data.list[i].stock * that.data.list[i].sellprice;
      pdnumber = pdnumber + that.data.list[i].pdsl;
      stocknumber = stocknumber + that.data.list[i].stock;
      yknumber = yknumber + (that.data.list[i].stock - that.data.list[i].pdsl);
    }
    that.setData({
      list: that.data.list,
      pdamount: pdamount,
      stockamount: stockamount,
      pdnumber: pdnumber,
      stocknumber: stocknumber,
      yknumber: yknumber
    })
  }

})