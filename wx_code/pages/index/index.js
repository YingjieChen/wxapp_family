//index.js
//获取应用实例
const app = getApp();
Page({
  data: {
    permission_denied :"你没有相应的权限",
    pleaselogin       :"请先登录",
    wxloginbutton     :"通过微信登录",
    args              :{},
  }, 
  gotoAlbum: function () {
    wx.navigateTo({
      url: '../album/album',
    })
  },
  //这里开始是登录相关的函数
  wxlogin:function(){
    wx.openSetting({
      success: function(res) {
        this.loginrequire();
      }.bind(this)
    });
  },
  userlogin: function (data){
      var code = wx.getStorageSync('code');
      wx.request({
        url: this.config.domain + '/family/index.php?method=user.login&code=' + code,
        data: app.globalData.userInfo,
        dataType:"json",
        success:function(res){
          this.setData({
            userInfo: res.data,
            hasUserInfo: true
          });
          wx.setStorageSync('userInfo', this.data.userInfo);
          wx.setStorageSync('hasUserInfo', true);
        }.bind(this)
      });
  },
  loginrequire:function(){
    // 在没有 open-type=getUserInfo 版本的兼容处理
    wx.getUserInfo({
      success: res => {
        app.globalData.userInfo = res.userInfo
        this.userlogin(this.data.userInfo);
      }
    })
  },
  setdeadline:function(){
    var deadline = this.config.deadline;
    var secondnow = Date.parse(deadline);
    secondnow = secondnow / 1000;
    var timestamp = (new Date()).valueOf() / 1000;
    var secondleft = Math.floor(secondnow - timestamp);
    var day = Math.floor(secondleft / 86400);
    var hour = Math.floor(secondleft / 3600) % 24;
    var minute = Math.floor(secondleft / 60) % 60;
    var second = secondleft % 60;
    this.setData({
      "secondleft": secondleft,
      "day": day,
      "hour": hour,
      "minute": minute,
      "second": second,
      "userinfo": JSON.stringify(this.data.userInfo),
    });
  },
  onLoad: function (options) {
    this.config = wx.getStorageSync('config') || [];
    if (app.globalData.userInfo) {
      this.userlogin(this.data.userInfo);
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.userlogin(this.data.userInfo);
      }
    } else {
      this.loginrequire();
    }
    setInterval(function(){
      this.setdeadline();
    }.bind(this),1000);
  },
  onHide:function(){
    app.pagevisited(this);
  }
}); 