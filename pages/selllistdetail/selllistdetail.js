const PrinterJobs = require('../../plug/printer/printerjobs')
const printerUtil = require('../../plug/printer/printerutil')

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i
    }
  }
  return -1
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join(',')
}

function str2ab(str) {
  // Convert str to ArrayBuff and write to printer
  let buffer = new ArrayBuffer(str.length)
  let dataView = new DataView(buffer)
  for (let i = 0; i < str.length; i++) {
    dataView.setUint8(i, str.charAt(i).charCodeAt(0))
  }
  return buffer;
}
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    csellid: '',
    ordercode: '',//单号
    createtime: '',//创建时间
    mdmc: "",
    mdcode: "",
    username: "",
    total: 0,//总数量（计算）
    totalPrice: 0,//总金额（计算）
    printlist: [],
    printtime: '',
    devices: [],
    findlist: [],
    connectedlist: [],
    _deviceId: '', //蓝牙设备 id
    _serviceId: '', //蓝牙特征值对应服务的 uuid
    _characteristicId: '' //蓝牙特征值的 uuid
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
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
    that.data.printtime = formatDateTime(new Date());
    let obj = JSON.parse(options.parameter);
    that.data.csellid = obj.cid;
    that.data.ordercode = obj.ordercode;
    that.data.createtime = obj.createtime;
    wx.getStorage({
      key: 'mdmc',
      success: function (res) {
        that.data.mdmc = res.data;
        that.setData({
          mdmc: res.data
        })
      },
    })
    wx.getStorage({
      key: 'mdcode',
      success: function (res) {
        that.data.mdcode = res.data;
        that.setData({
          mdcode: res.data
        })
      },
    })
    wx.getStorage({
      key: 'username',
      success: function (res) {
        that.data.username = res.data;
        that.setData({
          username: res.data
        })
      },
    })
    if (options.sign == 0) {
      wx.setNavigationBarTitle({
        title: '收银历史详情',
      })
    } else if (options.sign == 1) {
      wx.setNavigationBarTitle({
        title: '收银历史详情',
      })
    } else if (options.sign == 2) {
      wx.setNavigationBarTitle({
        title: '退货单详情',
      })
    }
    that.setData({
      ordercode: that.data.ordercode,
      createtime: that.data.createtime,
      printtime: that.data.printtime,
      sign: options.sign
    })
    that.getselldetails();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;
    if (that.data.sign == 0) {
      let value = wx.getStorageSync('last_connected_device')
      console.log(value)
      if (value) {
        that.openBluetoothAdapter();
      }
    }
  },

  /**
   * 初始化蓝牙模块 (1)
   */
  openBluetoothAdapter() {
    let that = this;
    if (!wx.openBluetoothAdapter) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
      return false;
    }
    wx.openBluetoothAdapter({
      success: (res) => {
        //开始搜寻附近的蓝牙外围设备
        that.startBluetoothDevicesDiscovery()
        console.log("startBluetoothDevicesDiscovery");
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.showModal({
            title: '错误',
            content: '未找到蓝牙设备, 请打开蓝牙后重试。',
            showCancel: false
          })
          that.setData({
            show: false
          })
          //监听蓝牙适配器状态变化事件
          wx.onBluetoothAdapterStateChange((res) => {
            console.log(res.available);
            if (res.available) {
              //开始搜寻附近的蓝牙外围设备
              that.startBluetoothDevicesDiscovery()
            }else{
              wx.showModal({
                title: '错误',
                content: '蓝牙设备已经关闭。',
                showCancel: false
              })
              that.setData({
                show: false
              })
            }
          })
        }
      }
    })
  },

  /**
   * 开始搜寻附近的蓝牙外围设备 (2)
   */
  startBluetoothDevicesDiscovery() {
    let that = this;
   
    if (that.discoveryStarted) {
      return;
    }
    that.discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      success: (res) => {
        //监听寻找到新设备的事件
        that.onBluetoothDeviceFound()
        console.log("onBluetoothDeviceFound");
      },
      fail: (res) => {
        console.log('startBluetoothDevicesDiscovery fail', res)
      }
    })
  },

  /**
   * 监听寻找到新设备的事件(3)
   */
  onBluetoothDeviceFound() {
    let that = this;
    console.log("show");
    that.setData({
      show: true
    })
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        console.log(device);
      })
    })
  },

  /**
 * 打印
 */
  print() {
    let that = this;
    let value = wx.getStorageSync('last_connected_device')
    if (value) {
      const device = value;
      const index = device.indexOf(':');
      const name = device.substring(0, index);
      const deviceId = device.substring(index + 1, device.length);
      let data = { deviceId, name }
      that.createBLEConnection(data);
    }
  },


  /**
 * 点击事件：连接蓝牙（a）
 */
  createBLEConnection(data) {
    let that = this;
    const deviceId = data.deviceId;//用于区分设备的 id
    const name = data.name;
    wx.createBLEConnection({
      deviceId,
      success: () => {
        //获取蓝牙设备所有服务
        that.getBLEDeviceServices(deviceId)
      },
      fail: (res) => {
        //已经连接过就直接打印
        that.writeBLECharacteristicValue();
      }
    })
    //停止搜寻附近的蓝牙外围设备
    that.stopBluetoothDevicesDiscovery()
  },

  /**
  * 停止搜寻附近的蓝牙外围设备
  */
  stopBluetoothDevicesDiscovery() {
    let that = this;
    wx.stopBluetoothDevicesDiscovery({
      complete: () => {
        that.discoveryStarted = false
      }
    })
  },

  /**
   * 获取蓝牙设备所有服务(b)
   */
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) { //设备服务列表
          if (res.services[i].isPrimary) {
            //获取蓝牙设备某个服务中所有特征值
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid);
            return false;
          }
        }
      }
    })
  },

  /**
   * 获取蓝牙设备某个服务中所有特征值 (c)
   */
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    let that = this;
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        // 这里会存在特征值是支持write，写入成功但是没有任何反应的情况
        // 只能一个个去试
        for (let i = 0; i < res.characteristics.length; i++) {
          if (res.characteristics[i].properties.write) {
            that.data._deviceId = deviceId //用于区分设备的 id
            that.data._serviceId = serviceId //某个服务中 id
            that.data._characteristicId = res.characteristics[i].uuid //某个服务特征值的 uuid
            break;
          }
        }
        //打印小票
        that.writeBLECharacteristicValue();
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
  },

  /**
   * 打印小票
   */
  writeBLECharacteristicValue(e) {
    let that = this;
    let printerJobs = new PrinterJobs();
    printerJobs
      .beep(1, 1)
      .setAlign('ct')
      .setSize(2, 2)
      .setBold(true)
      .setLineSpacing(200)
      .print('品质生活馆')

      .setLineSpacing(80)
      .setAlign('lt')
      .setSize(1, 1)
      .setBold(false)
      .print('门店：' + that.data.printlist.mdmc + "(" + that.data.printlist.mdcode + ")")
      .print('收银员：' + that.data.printlist.username)
      .print('订单号：' + that.data.printlist.ordercode)
      .print('业务时间：' + that.data.printlist.createtime)

      .setLineSpacing(100)
      .setAlign('ct')
      .print(printerUtil.fillLine())

      .setLineSpacing(80)
      .setAlign('ct')

      .print(printerUtil.inline_max('商品', "颜色", "尺码", "零售价", "折后价", "数量", "金额"))

      .print_max(JSON.stringify(that.data.printlist.list))

      .print(printerUtil.fillLine())
      .setAlign('rt')
      .print(printerUtil.inline_max('', "", "", "", "合计:", that.data.sl, that.data.zje))
      .print('打印时间：' + that.data.printlist.printtime)
      .setAlign('lt')
      .print(printerUtil.fillLine())
      .println()
      .println()
      .println()

    let buffer = printerJobs.buffer();
    // 1.并行调用多次会存在写失败的可能性
    // 2.建议每次写入不超过20字节
    // 分包处理，延时调用
    const maxChunk = 20;
    const delay = 20;
    for (let i = 0, j = 0, length = buffer.byteLength; i < length; i += maxChunk, j++) {
      let subPackage = buffer.slice(i, i + maxChunk <= length ? (i + maxChunk) : length);
      setTimeout(that._writeBLECharacteristicValue, j * delay, subPackage);
    }
  },

  /**
   * 向低功耗蓝牙设备特征值中写入二进制数据
   */
  _writeBLECharacteristicValue(buffer) {
    let that = this;
    wx.showLoading({
      title: '正在打印..',
    })
    wx.writeBLECharacteristicValue({
      deviceId: that.data._deviceId, //蓝牙设备 id
      serviceId: that.data._serviceId, //蓝牙特征值对应服务的 uuid
      characteristicId: that.data._characteristicId, //蓝牙特征值的 uuid
      value: buffer,
      success(res) {
        wx.hideLoading();
      },
      fail(res) {
        wx.showModal({
          title: '错误',
          content: '未找到蓝牙设备, 请连接蓝牙设备',
          showCancel: false
        })
      }
    })

  },

  /**
   * 小票单详情
   */
  getselldetails() {
    let that = this;
    wx.request({
      url: app.globalData.url + '/sell/getselldetails/id/' + that.data.csellid,
      data: "",
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer  ' + app.globalData.access_token,
      },
      success: (res) => {
        if (Object.is(res.statusCode, 200)) {
          let sl = 0;
          let zje = 0;
          for (let i = 0; i < res.data.length; i++) {
            sl = sl + res.data[i].sl;
            zje = zje + (res.data[i].sl * res.data[i].realprice)
          }
          that.data.printlist = ({
            mdcode: that.data.mdcode,
            username: that.data.username,
            mdmc: that.data.mdmc,
            ordercode: that.data.ordercode,
            createtime: that.data.createtime,
            printtime: that.data.printtime,
            sl: sl,
            zje: zje,
            printtime: that.data.printtime,
            list: res.data
          })
          that.setData({
            list: res.data,
            sl: sl,
            zje: zje
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

      }
    })
  },

  /**
   * 选择蓝牙
   */
  bluetooth() {
    let that = this;
    wx.navigateTo({
      url: '../print/print?printlist=' + JSON.stringify(that.data.printlist),
    })
  },

  /**
 * 断开与低功耗蓝牙设备的连接
 */
  onHide() {
    let that = this;
    wx.closeBLEConnection({
      deviceId: that.data._deviceId
    })
    wx.closeBluetoothAdapter();
  },

  /**
* 断开与低功耗蓝牙设备的连接
*/
  onUnload() {
    let that = this;
    wx.closeBLEConnection({
      deviceId: that.data._deviceId
    })
    wx.closeBluetoothAdapter();
  }
})