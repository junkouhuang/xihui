Page({
  /**
   * 页面的初始数据
   */
  data: {
    cousedis:-1,
    del:false,
    showConfirm:false,
    list:[],
    total:"",//数量
    totalPrice:0, //总金额
    moling:0,//抹零金额
    confirmmoling:0,//最终抹零金额
    isShowTextarea:true, //解决textarea穿透的灵活方法
    remark:"",
    ordercode:"",//订单号(用于出售使用)
    tel: "",//18617112468
    isShowClearTel:false,
    ratemoney: 0 ,//折扣前金额-折扣后金额
    username:'',
    addlist:[],
    delegated:true, //支付模式true为扫码支付，false为传统支付
    hasnewdata:false,
    cleartel:false,
    mdzk:0, //折扣范围
    storeid:''
  },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    let that = this;
    wx.request({
      url: getApp().globalData.url + '/sell/ordercode', //获取销售单号
      data: '',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + getApp().globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          that.data.ordercode = res.data;
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
    wx.getStorage({
      key: 'username',
      success: function (res) {
        that.data.username = res.data;
      }, fail: function () {

      }
    })
    wx.getStorage({
      key: 'delegated',
      success: function (res) {
        that.data.delegated = res.data
      },
    })
    wx.getStorage({
      key: 'storeid',
      success: function (res) {
        that.data.storeid = res.data;
      }, fail: function () {

      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    if(that.data.hasnewdata){
      that.data.list = that.data.addlist;
      if (that.data.cleartel) {
        that.setData({
          tel: ''
        })
      }
      //折后金额+折后价+折前金额
      that.getZh();
      //总金额+总数量
      that.getTotal();
    }
  },

  inputTextarea(e){
    let that=this;
    that.data.remark=e.detail.value;
  },
  blurTextarea(){
    let that=this;
    that.setData({
      remark: that.data.remark,
      isShowTextarea:false,
      onFacus: false
    })
  },
  onShowTextarea(){
    let that = this;
    that.setData({
      remark: that.data.remark,
      isShowTextarea: true,
      onFacus: true
    })
  },
  inputtel(e){
    let that=this;
    that.data.tel=e.detail.value;
    if (Object.is(that.data.tel, '')){
     that.setData({
       isShowClearTel: false
     })
   }else{
      that.setData({
        isShowClearTel: true
      })
   }
  },

  /**
   * 编辑
   */
  editor(){
    let that=this;
    that.setData({
      del: !that.data.del
    })
  },

  /**
   * 删除
   */
  del(e){
    let that=this;
    let index = e.currentTarget.dataset.index;
    that.data.list.splice(index, 1);
    if(that.data.list.length == 0){
      that.setData({
        del:false
      })
    }
    getApp().wxToast({
      title: '已删除~~', //标题，不写默认正在加载
      duration: 1500, //延时关闭，默认2000
      show: function () { //显示函数

      },
      hide: function () { //关闭函数

      }
    });
    //计算总金额+总数量
    that.getTotal();
  },
  arrowsdowm(e){
    let that=this;
    that.setData({
      cousedis: e.currentTarget.dataset.id
    })
  },
  updStroeRateblur(e){
    let that=this;
    let mdzk = e.detail.value;
    let index = e.currentTarget.dataset.index;
    if (Object.is(mdzk, '')) {
      that.data.list[index].mdrate = 1;
      //折后金额+折后价
      that.getZh();
      //计算总金额+总数量
      that.getTotal();
    } 
  }, 

  /**
   * 更改门店折扣
   */
  updStroeRate(e){
    let that=this;
    let mdzk = parseFloat(e.detail.value/100); 
    let index = e.currentTarget.dataset.index;
    if (mdzk> 0 && mdzk<=1){
      that.data.list[index].mdrate = mdzk;
    } else if (Object.is(mdrate, '')){
      that.data.list[index].mdrate=""
    }else {
      that.data.list[index].mdrate = 1;
    }
    //折后金额+折后价
    that.getZh();
    //计算总金额+总数量
    that.getTotal();
  },

  /**
   * 收起
   */
  arrowsup(e) {
    let that = this;
    that.setData({
      cousedis: -1
    })
  },

  /**
   *扫码 
   */
  openqrcode(){
    let that=this;
    that.data.hasnewdata=false;
    that.data.cleartel = false;
    wx.scanCode({
      success: (res) => {
        wx.request({
          url: getApp().globalData.url + '/barcode/' + res.result , //+ res.result 9BD000112L
          data: '',
          method: 'GET',
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'bearer  ' + getApp().globalData.access_token,
          },
          success: (res) => {
            if (Object.is(res.statusCode,200)){           
              if(Object.is(res.data,"")){
                getApp().wxToast({
                  title: '无效条码~~', //标题，不写默认正在加载
                  duration: 1500, //延时关闭，默认2000
                  show: function () { //显示函数
                    
                  },
                  hide: function () { //关闭函数

                  }
                });
              } else if (res.data.status>2){
                getApp().wxToast({
                  title: '该条码已经出售~~', //标题，不写默认正在加载
                  duration: 1500, //延时关闭，默认2000
                  show: function () { //显示函数

                  },
                  hide: function () { //关闭函数

                  }
                });
              } else if (res.data.storeid != getApp().globalData.storeid){
                getApp().wxToast({
                  title: '非本店条码，禁止销售~~', //标题，不写默认正在加载
                  duration: 1500, //延时关闭，默认2000
                  show: function () { //显示函数

                  },
                  hide: function () { //关闭函数

                  }
                });
              }else{
                if (that.data.list.length>0){
                  let flag =1;
                  for (let i = 0; i < that.data.list.length; i++) {
                    if (Object.is(res.data.unicode, that.data.list[i].unicode) && res.data.unicode.endsWith("E")){
                      flag =2;
                    } else if (Object.is(res.data.unicode, that.data.list[i].unicode) && !res.data.unicode.endsWith("E")){
                      that.data.list[i].sl = that.data.list[i].sl + 1;
                      flag = 3;
                    }
                  }
                  if(Object.is(flag,1)){
                    res.data["zqamount"] = res.data.sellprice; //折前金额
                    res.data["zhamount"] = res.data.sellprice; //折后金额
                    res.data["zhprice"] = res.data.sellprice; //折后单价
                    res.data["mdrate"] = 1; //门店折扣
                    res.data["sl"] = 1; //购买数量
                    res.data["viprate"] = 1;//会员折扣
                    that.data.list = that.data.list.concat(res.data)
                    getApp().wxToast({
                      title: '添加成功~~', //标题，不写默认正在加载
                      duration: 1500, //延时关闭，默认2000
                      show: function () { //显示函数
                        wx.hideLoading();
                      },
                      hide: function () { //关闭函数
                      }
                    });
                  } else if (Object.is(flag, 2)){
                    getApp().wxToast({
                      title: '此条码不能重复添加', //标题，不写默认正在加载
                      duration: 1500, //延时关闭，默认2000
                      show: function () { //显示函数
                        wx.hideLoading();
                      },
                      hide: function () { //关闭函数
                      }
                    });
                  } else if (Object.is(flag, 3)){
                    getApp().wxToast({
                      title: '数量已累加~~', //标题，不写默认正在加载
                      duration: 1500, //延时关闭，默认2000
                      show: function () { //显示函数

                      },
                      hide: function () { //关闭函数

                      }
                    });
                  }
                }else{
                  res.data["zqamount"] = res.data.sellprice; //折前金额
                  res.data["zhamount"] = res.data.sellprice; //折后金额
                  res.data["zhprice"] = res.data.sellprice; //折后单价
                  res.data["mdrate"] = 1; //门店折扣
                  res.data["sl"] = 1; //购买数量
                  res.data["viprate"] = 1;//会员折扣
                  that.data.list.push(res.data)
                  getApp().wxToast({
                    title: '添加成功~~', //标题，不写默认正在加载
                    duration: 1500, //延时关闭，默认2000
                    show: function () { //显示函数

                    },
                    hide: function () { //关闭函数

                    }
                  });
                }
                //折后金额+折后价+折前金额
                that.getZh();
                //总金额+总数量
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
           
          }
        })
      },
      fail: (res)=> {
      }
    })
  },

  /**
   * 打开抹零窗口
   * 
   */
  showmoling(){
    let that=this;
    let indexOf = (that.data.totalPrice.toString()) .indexOf("."); 
    if (indexOf !=-1){ //-1指总金额不存在小数点 2值总金额存在小数点
      that.data.moling = parseFloat((that.data.totalPrice.toString()).slice(indexOf));
      that.data.confirmmoling = that.data.moling;
    }
    that.setData({
      tip: "抹零",
      placeholderName: "请输入抹零金额",
      isShowConfirm: true,
      type:"digit",
      value: that.data.moling,
      method:"molingfun",
      bInput: "molingval"
    })
  },

  /**
   * 抹零数值
   */
  molingfun(){
    let that=this;
    if (that.data.moling < that.data.confirmmoling){
      getApp().wxToast({
        title: '当前最大抹零金额为：'+that.data.moling, //标题，不写默认正在加载
        duration: 1500, //延时关闭，默认2000
        show: function () { //显示函数
          wx.hideLoading();
        },
        hide: function () { //关闭函数
        }
      });
    }else{
      that.data.totalPrice = that.data.totalPrice - parseFloat(that.data.confirmmoling);
      that.data.moling = that.data.moling - that.data.confirmmoling;
      that.data.confirmmoling = that.data.moling;
      that.setData({
        totalPrice: parseFloat(that.data.totalPrice.toFixed(2)),
        isShowConfirm: false
      })
    }
  },

  /**
   * 抹零（input）
   */
  molingval(e) {
    let that = this;
    if (e.detail.value != "") {
      that.data.confirmmoling = e.detail.value;
    }
  },

  /**
   * 整单折扣
   */
  wholediscount(){
    let that = this;
    that.setData({
      tip: "整单折扣",
      placeholderName: "折扣范围（1~100）%",
      isShowConfirm: true,
      type:"number",
      value:"",
      method:"setAllRate",
      bInput:"bInputRate"
    })
  },

  /**
   * 折扣比
   */
  bInputRate(e){
    let that=this;
    that.data.mdzk = parseFloat(e.detail.value / 100);
  },


  /**
  * 折扣执行事件
  */
  setAllRate() {
    let that = this;
    if (that.data.mdzk > 0 && that.data.mdzk <= 1) {
      that.setData({
        isShowConfirm: false
      })
      for (let i = 0; i < that.data.list.length; i++) {
        that.data.list[i].mdrate = that.data.mdzk;
      }
      //折后金额+折后价+折前金额
      that.getZh();
      //总金额+总数量
      that.getTotal();
    } else {
      getApp().wxToast({
        title: '请输入有效的折扣范围', //标题，不写默认正在加载
        duration: 1500, //延时关闭，默认2000
        show: function () { //显示函数
          wx.hideLoading();
        },
        hide: function () { //关闭函数
        }
      });
    }
  },

  /**
   * 带有指定消息和 OK 及取消按钮的对话框
   */
  closeconfirm() {
    let that = this;
    that.data.confirmmoling = that.data.moling;
    that.setData({
      isShowConfirm: false
    })
  },

  /**
   * 折后金额+折后价
   */
  getZh(){
    let that = this;
    for (let i = 0; i < that.data.list.length; i++) {
      that.data.list[i].zhprice = parseFloat((that.data.list[i].sellprice * that.data.list[i].mdrate).toFixed(2));//折后价
      that.data.list[i].zqamount = parseFloat((that.data.list[i].sellprice * that.data.list[i].sl).toFixed(2)); //折前金额
      that.data.list[i].zhamount = parseFloat((that.data.list[i].zhprice * that.data.list[i].sl).toFixed(2)); //折后金额
    }
  },

  /**
   * 计算总金额+总数量
   */
  getTotal() {
    let that = this;
    let total = 0;
    let totalPrice = 0;
    for (let i = 0; i < that.data.list.length; i++) {
      total = total + that.data.list[i].sl;
      totalPrice = totalPrice + that.data.list[i].zhprice * that.data.list[i].sl;
    }
    that.data.total = total;
    that.data.totalPrice = parseFloat(totalPrice.toFixed(2));
    that.setData({
      list: that.data.list,
      total: that.data.total,
      totalPrice: that.data.totalPrice
    })
    wx.setStorage({
      key: 'addlist',
      data: that.data.list
    })
  },

  beforeRatePrice(){
    let that=this;
    let ratemoney=0;
    for(let i=0;i<that.data.list.length;i++){
      ratemoney += that.data.list[i].zhamount - that.data.list[i].sellprice;
    }
    that.data.ratemoney = ratemoney;
  },

  /**
   * 商品列表
   */
  splist(){
    let that=this;
    wx.setStorage({
      key: 'histortlist',
      data: that.data.list,
    })
    wx.navigateTo({
      url: '../splist/splist'
    })
  },

  /**
   * 出售
   */
  addsell(){
    let that=this;
    let sellSpInfoList = new Array();
    for (let i = 0; i < that.data.list.length; i++) {
      sellSpInfoList.push({
        "spid": that.data.list[i].spid,
        "mxid": that.data.list[i].mxid,
        "spmc": that.data.list[i].spmc,
        "spcode": that.data.list[i].spcode,
        "dw": that.data.list[i].dw,
        "brand": that.data.list[i].brand,
        "cz": that.data.list[i].cz,
        "mxcode": that.data.list[i].mxcode,
        "ys": that.data.list[i].ys,
        "cm": that.data.list[i].cm,
        "sellprice": that.data.list[i].sellprice,
        "sellrate": that.data.list[i].sellrate,
        "goodtype": that.data.list[i].goodtype,
        "sl": that.data.list[i].sl,
        "viprate": that.data.list[i].viprate,
        "baserate": that.data.list[i].mdrate, //门店折扣
        "rateamount": that.data.list[i].zhamount, //折后金额
        "realprice": that.data.list[i].zqamount, //折前金额
        "unicode": that.data.list[i].unicode
      })
    }
      if (that.data.totalPrice<=0){
        getApp().wxToast({
          title: '总金额不能为空', //标题，不写默认正在加载
          duration: 1500, //延时关闭，默认2000
          show: function () { //显示函数
            wx.hideLoading();
          },
          hide: function () { //关闭函数
          }
        });
      }else{
        that.setData({
          loading: true
        })
        //折扣前总金额
        that.beforeRatePrice();
        let mobilereg = /^(((13[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}|(19[0-9]{1})))+\d{8})$/;
        if (Object.is(that.data.tel, '')) {
          getApp().wxToast({
            title: '手机号码不能为空', //标题，不写默认正在加载
            duration: 1500, //延时关闭，默认2000
            show: function () { //显示函数
              wx.hideLoading();
            },
            hide: function () { //关闭函数
            }
          });
        } else if (!mobilereg.test(this.data.tel)){
          getApp().wxToast({
            title: '手机号码格式有误', //标题，不写默认正在加载
            duration: 1500, //延时关闭，默认2000
            show: function () { //显示函数
              wx.hideLoading();
            },
            hide: function () { //关闭函数
            }
          });
        }else {
          if (that.data.delegated) {
            let data = {
              "tel": that.data.tel,
              "ordercode": that.data.ordercode,
              "amount": that.data.totalPrice,
              "rate": 1,
              "ratemoney": Math.abs(that.data.ratemoney), //折前金额-折后金额
              "username": that.data.username,
              "moling": that.data.moling, //抹零
              "vipmrate": that.data.viprate,
              "uploaded": true,
              "yyy": that.data.username,
              "sellSpInfoList": sellSpInfoList
            };
            wx.request({
              url: getApp().globalData.url + '/yunst_user/addsell', //
              contentType: 'application/json;charset=UTF-8',
              data: data,
              method: 'POST',
              header: {
                "Content-Type": "application/json;charset=UTF-8",
                'Authorization': 'bearer  ' + getApp().globalData.access_token
              },
              success: (res) => {
                if (Object.is(res.statusCode, 200)) {
                  if (res.data.success) {
                    wx.navigateTo({
                      url: '../barcode/barcode?ordercode=' + res.data.content.ordercode + "&amount=" + res.data.content.amount
                    })
                    //清除出售界面的数据
                    wx.setStorage({
                      key: 'addlist',
                      data: ''
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
                that.setData({
                  loading: false
                })
              }, fail: (err) => {
                that.setData({
                  loading: false
                })
              }
            })
        } else {
          wx.navigateTo({
            url: '../choice/choice?ordercode=' + that.data.ordercode + "&totalPrice=" + that.data.totalPrice + '&ratemoney=' + Math.abs(that.data.ratemoney) + '&moling=' + that.data.moling + "&sellSpInfoList=" + JSON.stringify(sellSpInfoList)
          })
          wx.setStorage({
            key: 'addlist',
            data: ''
          })
        }
        }
      }
  }
})