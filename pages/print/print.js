const PrinterJobs = require('../../plug/printer/printerjobs')
const printerUtil = require('../../plug/printer/printerutil')
const app = getApp();

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

Page({
  data: {
    deviceId:'',
    printlist:[],
    devices: [],
    findlist:[],
    connectedlist:[],
    _deviceId: '', //蓝牙设备 id
    _serviceId: '', //蓝牙特征值对应服务的 uuid
    _characteristicId: '',//蓝牙特征值的 uuid
    _connect:true
  },

  onLoad(options) {
    let that = this;
    that.data.printlist = JSON.parse(options.printlist);
    //初始化蓝牙模块
    that.openBluetoothAdapter();
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
              //开始搜寻附近的蓝牙外围设备
              that.startBluetoothDevicesDiscovery()
            } else {
              wx.showModal({
                title: '错误',
                content: '蓝牙设备已经关闭。',
                showCancel: false
              })
              that.setData({
                show: false
              })
              that.stopBluetoothDevicesDiscovery();
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
        wx.showLoading({
          title: '搜索中...',
        })
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
        console.log(device);
        if (!device.name && !device.localName) {
          return
        }
        const idx = inArray(that.data.devices, 'deviceId', device.deviceId)
        if (idx === -1) {
          wx.hideLoading();
          if (that.data.findlist.length!=0){
            that.data.findlist = that.data.findlist.concat(device);
          }else{
            that.data.findlist.push(device)
          }
        } else {
          data[`devices[${idx}]`] = device
        }
        let value = wx.getStorageSync('last_connected_device')
        if (value) {
          const device = value;
          const index = device.indexOf(':');
          const name = device.substring(0, index);
          const deviceId = device.substring(index + 1, device.length);
          for (let i = 0; i < that.data.findlist.length; i++) {
            if (deviceId == that.data.findlist[i].deviceId) {
              that.data.findlist.splice(i, 1)
              that.data.connectedlist.push({ 'name': name, 'deviceId': deviceId })
            }
          }
          that.setData({
            connectedlist: that.data.connectedlist,
            devices: that.data.findlist
          })
          //历史蓝牙设备连接
          if (that.data.connectedlist.length != 0) {
            that._createBLEConnection(deviceId, name, false)
          }
        }else{
          that.setData({
            connectedlist: [],
            devices: that.data.findlist
          })
        }
      })
    })
  },

  /**
   * 点击事件：---新发现蓝牙设备
   */
  createBLEConnection(e) {
    let that = this;
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceid
    const name = ds.name
    that._createBLEConnection(deviceId, name,true)
  },


  /**
   * 创建蓝牙连接(a)
   */
  _createBLEConnection(deviceId, name ,type) {
    let that = this;
    if(type){
      wx.showLoading({
        title: '正在连接..',
      })
    }
    wx.createBLEConnection({
      deviceId,
      success: () => {
        if (that.data.connectedlist.length!=0){
          that.data.findlist.push(that.data.connectedlist[0])
          that.data.connectedlist = []
        }
        for (let i = 0; i < that.data.findlist.length;i++){
          if (that.data.findlist[i].deviceId == deviceId){
            that.data.findlist[i].sign = true;
            that.data.connectedlist.push(that.data.findlist[i]);
            if (that.data.findlist.length == 1){
              that.data.findlist=[]
            }else{
              that.data.findlist.splice(i, 1)
            }
          }
        }
        that.setData({
          devices: that.data.findlist,
          connectedlist: that.data.connectedlist,
        })
        wx.setStorageSync('last_connected_device', name + ':' + deviceId)
        //获取蓝牙设备所有服务
        that.getBLEDeviceServices(deviceId,type)
      },
      complete() {
        wx.hideLoading()
      },
      fail: (res) => {
        that.data._connect =false;
        if (res.errCode == 10012){
          app.wxToast({
            img: '../../images/toast/error.png', //icon路径，不写不显示
            title: '请求超时', //标题，不写默认正在加载
            duration: 1500, //延时关闭，默认2000
            show: function () { //显示函数

            },
            hide: function () { //关闭函数
            }
          });
        }
      }
    })
    //停止搜寻附近的蓝牙外围设备
    if(type){
     // this.stopBluetoothDevicesDiscovery()
    }
  },


  /**
   * 停止搜寻附近的蓝牙外围设备
   */
  stopBluetoothDevicesDiscovery() {
    let that = this;
    wx.stopBluetoothDevicesDiscovery({
      complete: () => {
        console.log('stopBluetoothDevicesDiscovery')
        that.discoveryStarted = false
      }
    })
  },


  /**
   * 获取蓝牙设备所有服务(b)
   */
  getBLEDeviceServices(deviceId,type) {
    let that = this;
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            //获取蓝牙设备某个服务中所有特征值
            that.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid ,type)
            return
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
          const item = res.characteristics[i]
          if (item.properties.write) {
            that.data._deviceId = deviceId
            that.data._serviceId = serviceId
            that.data._characteristicId = item.uuid
            break;
          }
        }
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
    let that=this;
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
      .print('门店：' + that.data.printlist.mdmc + "(" + that.data.printlist.mdcode+")")
      .print('收银员：' + that.data.printlist.username)
      .print('订单号：' + that.data.printlist.ordercode)
      .print('业务时间：' + that.data.printlist.createtime)

      .setLineSpacing(100)
      .setAlign('ct')
      .print(printerUtil.fillLine())
      
      .setLineSpacing(80)
      .setAlign('ct')
      
      .print(printerUtil.inline_max('商品',"颜色","尺码","零售价","折后价","数量","金额"))
  
      .print_max(JSON.stringify(that.data.printlist.list))
      
      .print(printerUtil.fillLine())
      .setAlign('rt')
      .print(printerUtil.inline_max('', "", "", "", "合计:", that.data.printlist.sl, that.data.printlist.zje))
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
      deviceId: that.data._deviceId,
      serviceId: that.data._serviceId,
      characteristicId: that.data._characteristicId,
      value: buffer,
      success(res) {
        wx.hideLoading();
        console.log('writeBLECharacteristicValue success', res)
      },
      fail(res) {
        console.log('writeBLECharacteristicValue fail', res)
      }
    })
  },

  /**
   * 关闭蓝牙模块
   */
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this.discoveryStarted = false
  },
  
  onUnload(){
    let that = this;
    wx.closeBLEConnection({
      deviceId: that.data._deviceId
    })
    that.closeBluetoothAdapter()
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2];
    //直接调用上一个页面对象的setData()方法，把数据存到上上一个页面中去
    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      sign:0
    });
  }
})