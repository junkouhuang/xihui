const LAST_CONNECTED_DEVICE = 'last_connected_device'
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
    ordercode: '',//单号
    createtime: '',//创建时间
    mdmc: "",
    mdcode: "",
    username: "",
    total: 0,//总数量（计算）
    totalPrice: 0,//总金额（计算）
    zl:0,
    zje:0,
    printtime: '',
    devices: [],
    findlist: [],
    connectedlist: [],
    sellSpInfoList:[],
    _deviceId: '',
    _serviceId: '',
    _characteristicId: '',
    plies:0
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
    that.data.sellSpInfoList = JSON.parse(options.sellSpInfoList);
    that.data.ordercode = JSON.parse(options.parameter).ordercode;
    that.data.createtime = JSON.parse(options.parameter).createtime;
    that.data.plies = options.plies
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
    console.log(that.data.sellSpInfoList);
    for (let i = 0; i < that.data.sellSpInfoList.length; i++) {
      that.data.zl = that.data.zl + that.data.sellSpInfoList[i].sl;
      that.data.zje = that.data.zje + (that.data.sellSpInfoList[i].sl * that.data.sellSpInfoList[i].realprice)
    }
    that.setData({
      sl: that.data.zl,
      zje: that.data.zje,
      ordercode: that.data.ordercode,
      createtime: that.data.createtime,
      printtime: that.data.printtime,
      sellSpInfoList: that.data.sellSpInfoList
    })
    wx.getStorage({
      key: 'addlist',
      success: function (res) {
        let data = res.data;
        for (let i = 0; i < data.length; i++) {
          for (let j = 0; j < that.data.sellSpInfoList.length; j++) {
            if (Object.is(data[i].spid,that.data.sellSpInfoList[j].spid)) {
              data.splice(i,1);
            }
          }
        }
        wx.setStorage({
          key: 'addlist',
          data: data
        })
      }
    })
  },

  onShow() {
    let that = this;
    wx.getStorage({
      key: LAST_CONNECTED_DEVICE,
      success: function (res) {
        that.openBluetoothAdapter();
      },
    })
  },

  onUnload() {
    let that = this;
    wx.navigateBack({
      delta: parseInt(that.data.plies)
    })
  },

  /**
   * 打印
   */
  print() {
    let that = this;
    wx.getStorage({
      key: LAST_CONNECTED_DEVICE,
      success: function (res) {
        const device = res.data;
        const index = device.indexOf(':');
        const name = device.substring(0, index);
        const deviceId = device.substring(index + 1, device.length);
        let data = { deviceId, name }
        that.createBLEConnection(data);
      },
    })
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
        console.log('openBluetoothAdapter success', res);
        wx.getBluetoothAdapterState({
          success: function (res) {
            if (res.available && !res.discovering) {
              //开始搜寻附近的蓝牙外围设备
              that.startBluetoothDevicesDiscovery()
            }
          },
          fail: (res) => {
            if (res.errCode === 10001) {
              app.wxToast({
                title: '当前蓝牙适配器不可用', //标题，不写默认正在加载
                img: '../../images/toast/error.png', //icon路径，不写不显示
                duration: 1500, //延时关闭，默认2000
                show: function () { //显示函数

                },
                hide: function () { //关闭函数
                }
              });
            }
          }
        })
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.showModal({
            title: '错误',
            content: '未找到蓝牙设备, 请打开蓝牙后重试。',
            showCancel: false
          })
          //监听蓝牙适配器状态变化事件
          wx.onBluetoothAdapterStateChange((res) => {
            if (res.available) {
              wx.onBluetoothAdapterStateChange(() => {
              });
              //开始搜寻附近的蓝牙外围设备
              this.startBluetoothDevicesDiscovery()
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
    if (this._discoveryStarted) {
      return;
    }
    that._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        //监听寻找到新设备的事件
        that.onBluetoothDeviceFound()
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
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        // if (!device.name && !device.localName) {
        //  return false;
        //}
        console.log('onBluetoothDeviceFound success');
        that.setData({
          lastDevice: true
        })
      })
    })
  },

  /**
 * 点击事件：连接蓝牙（a）
 */
  createBLEConnection(data) {
    const deviceId = data.deviceId
    const name = data.name
    this._createBLEConnection(deviceId, name)
  },

  /**
   * 创建蓝牙连接(a)
   */
  _createBLEConnection(deviceId, name) {
    let that = this;
    wx.showLoading({
      title: '打印机连接中...',
    })
    wx.createBLEConnection({
      deviceId,
      success: () => {
        console.log('createBLEConnection success');
        wx.hideLoading();
        //获取蓝牙设备所有服务
        this.getBLEDeviceServices(deviceId)
      },
      fail: (res) => {
        wx.hideLoading();
        if (res.errCode == '10012'){
          app.wxToast({
            title: '请开启打印机', //标题，不写默认正在加载
            img: '../../images/toast/error.png', //icon路径，不写不显示
            duration: 1500, //延时关闭，默认2000
            show: function () { //显示函数

            },
            hide: function () { //关闭函数
            }
          });
        } else if (res.errCode == '-1') {//已经连接过就直接打印
          that.writeBLECharacteristicValue();
        }
      }
    })
    //停止搜寻附近的蓝牙外围设备
    this.stopBluetoothDevicesDiscovery()
  },

  /**
   * 停止搜寻附近的蓝牙外围设备
   */
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery({
      complete: () => {
        console.log('stopBluetoothDevicesDiscovery')
        this._discoveryStarted = false
      }
    })
  },

  /**
   * 断开与低功耗蓝牙设备的连接
   */
  closeBLEConnection() {
    let that = this;
    wx.closeBLEConnection({
      deviceId: that.data.deviceId
    })
  },

  /**
   * 获取蓝牙设备所有服务(b)
   */
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log('getBLEDeviceServices', res)
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            //获取蓝牙设备某个服务中所有特征值
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
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
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        // 这里会存在特征值是支持write，写入成功但是没有任何反应的情况
        // 只能一个个去试
        for (let i = 0; i < res.characteristics.length; i++) {
          const item = res.characteristics[i]
          if (item.properties.write) {
            that.data._deviceId = deviceId
            that.data._serviceId = serviceId
            that.data._characteristicId = item.uuid
            break;
          }
        }
        wx.showLoading({
          title: '已连接',
        })
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
      .print('门店：' + that.data.mdmc + "(" + that.data.mdcode + ")")
      .print('收银员：' + that.data.username)
      .print('订单号：' + that.data.ordercode)
      .print('业务时间：' + that.data.createtime)

      .setLineSpacing(100)
      .setAlign('ct')
      .print(printerUtil.fillLine())

      .setLineSpacing(80)
      .setAlign('ct')

      .print(printerUtil.inline_max('商品', "颜色", "尺码", "零售价", "折后价", "数量", "金额"))

      .print_max(JSON.stringify(that.data.sellSpInfoList))

      .print(printerUtil.fillLine())
      .setAlign('rt')
      .print(printerUtil.inline_max('', "", "", "", "合计:", that.data.sl, that.data.zje))
      .print('打印时间：' + that.data.printtime)
      .setAlign('lt')
      .print(printerUtil.fillLine())
      .println()
      .println()
      .println()

    let buffer = printerJobs.buffer();
    console.log('ArrayBuffer', 'length: ' + buffer.byteLength, ' hex: ' + ab2hex(buffer));
    // 1.并行调用多次会存在写失败的可能性
    // 2.建议每次写入不超过20字节
    // 分包处理，延时调用
    const maxChunk = 20;
    const delay = 20;
    for (let i = 0, j = 0, length = buffer.byteLength; i < length; i += maxChunk, j++) {
      let subPackage = buffer.slice(i, i + maxChunk <= length ? (i + maxChunk) : length);
      setTimeout(this._writeBLECharacteristicValue, j * delay, subPackage);
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
      deviceId: that.data._deviceId,
      serviceId: that.data._serviceId,
      characteristicId: that.data._characteristicId,
      value: buffer,
      success(res) {
        wx.hideLoading();
      },
      fail(res) {
        console.log('writeBLECharacteristicValue fail', res)
      }
    })

  },


  /**
   * 选择蓝牙
   */
  bluetooth() {
    let that = this;
    let printlist = ({
      mdcode: that.data.mdcode,
      username: that.data.username,
      mdmc: that.data.mdmc,
      ordercode: that.data.ordercode,
      createtime: that.data.createtime,
      printtime: that.data.printtime,
      sl: that.data.sl,
      zje: that.data.zje,
      printtime: that.data.printtime,
      list: that.data.sellSpInfoList
    })
    wx.navigateTo({
      url: '../print/print?printlist=' + JSON.stringify(printlist),
    })
  },
})