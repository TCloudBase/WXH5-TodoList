const cloudbaseLogin = {
  Flag: false,
  Info: {
    appid: '',
    resourceAppid: '',
    resourceEnv: '',
    scope: 'snsapi_base',
    redirectUri: window.location.href
  },
  init: function (obj) {
    for (const i in cloudbaseLogin.Info) {
      if (obj[i] != null) {
        cloudbaseLogin.Info[i] = obj[i]
      }
    }

    if (window.wx) {
      window.cloud = window.wx.cloud
    }
    if (!window.cloud) {
      console.error('no found cloud-sdk')
      return false
    }
    cloudbaseLogin.urlSearch = new URLSearchParams(window.location.search)
    cloudbaseLogin.accessToken = cloudbaseLogin.urlSearch.get('access_token')
    cloudbaseLogin.refreshToken = cloudbaseLogin.urlSearch.get('refresh_token')
    cloudbaseLogin.Flag = true
    return true
  },
  doLogin: async () => {
    try {
      const checkLoginOptions = {
        provider: 'OfficialAccount',
        appid: cloudbaseLogin.Info.appid,
        accessToken : cloudbaseLogin.accessToken,
        refreshToken: cloudbaseLogin.refreshToken
      }
      const result = await window.cloud.checkLogin(checkLoginOptions)
      if (result.errCode === 0 && result.loggedIn) {
        console.log(result)
        console.log('checkLogin success')
        cloudbaseLogin.instance = new window.cloud.Cloud({
          appid: cloudbaseLogin.Info.appid,
          resourceAppid: cloudbaseLogin.Info.resourceAppid,
          resourceEnv: cloudbaseLogin.Info.resourceEnv
        })
        const initResult = await cloudbaseLogin.instance.init()
        if (initResult.errCode === 0) {
          return {
            info: cloudbaseLogin.instance,
            msg: initResult.errMsg,
            code: 0
          }
        } else {
          return {
            code: initResult.errCode,
            info: initResult.errMsg
          }
        }
      } else {
        window.cloud.startLogin({
          provider: 'OfficialAccount',
          appid: cloudbaseLogin.Info.appid,
          scope: cloudbaseLogin.Info.scope,
          redirectUri: cloudbaseLogin.Info.redirectUri
        })
      }
    } catch (e) {
      return {
        code: -1,
        info: e
      }
    }
  },
  useJSSDK: async (instance, jsApiList = [], debug = false) => {
    if (window.wx) {
      try {
        const res = await instance.getJSSDKSignature({
          url: window.location.href
        })
        const configOpt = {
          debug: debug,
          appId: cloudbaseLogin.Info.appid,
          timestamp: res.timestamp + '',
          nonceStr: res.nonceStr,
          signature: res.signature,
          jsApiList: jsApiList
        }
        window.wx.config(configOpt)
        return {
          code: 0
        }
      } catch (e) {
        return {
          code: -1,
          info: e
        }
      }
    } else {
      return {
        code: 1,
        info: 'not found jsweixin'
      }
    }
  }
}
window.cloudbaseLogin = cloudbaseLogin
