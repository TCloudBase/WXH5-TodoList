var cloudbase_login = {
  Flag: false,
  Info: {
    appid: '',
    resourceAppid: '',
    resourceEnv: '',
    scope: 'snsapi_base',
    redirectUri: location.href
  },
  init: function (obj) {
    for (const i in cloudbase_login.Info) {
      if (obj[i] != null) {
        cloudbase_login.Info[i] = obj[i]
      }
    }

    if (window.wx) {
      window.cloud = window.wx.cloud
    }
    if (!window.cloud) {
      console.error('no found cloud-sdk')
      return false
    }
    cloudbase_login.urlSearch = new URLSearchParams(location.search)
    cloudbase_login.accessToken = cloudbase_login.urlSearch.get('access_token')
    cloudbase_login.refreshToken = cloudbase_login.urlSearch.get('refresh_token')
    cloudbase_login.Flag = true
    return true
  },
  doLogin: async () => {
    try {
      const checkLoginOptions = {
        provider: 'OfficialAccount',
        appid: cloudbase_login.Info.appid
      }
      if (cloudbase_login.urlSearch.get('oauthredirect') === '1') {
        checkLoginOptions.accessToken = cloudbase_login.accessToken
        checkLoginOptions.refreshToken = cloudbase_login.refreshToken
      }
      const result = await window.cloud.checkLogin(checkLoginOptions)
      if (result.errCode === 0 && result.loggedIn) {
        console.log(result)
        console.log('checkLogin success')
        cloudbase_login.instance = new window.cloud.Cloud({
          appid: cloudbase_login.Info.appid,
          resourceAppid: cloudbase_login.Info.resourceAppid,
          resourceEnv: cloudbase_login.Info.resourceEnv
        })
        const initResult = await cloudbase_login.instance.init()
        if (initResult.errCode === 0) {
          return {
            info: cloudbase_login.instance,
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
          appid: cloudbase_login.Info.appid,
          scope: cloudbase_login.Info.scope,
          redirectUri: cloudbase_login.Info.redirectUri
        })
      }
    } catch (e) {
      return {
        code: -1,
        info: e
      }
    }
  },
  useJSSDK: async (instance, jsApiList = [], debug = false, openTagList = []) => {
    if (window.wx) {
      try {
        const res = await instance.getJSSDKSignature({
          url: location.href
        })
        const configOpt = {
          debug: debug,
          appId: cloudbase_login.Info.appid,
          timestamp: res.timestamp + '',
          nonceStr: res.nonceStr,
          signature: res.signature,
          jsApiList: jsApiList,
          openTagList: openTagList
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
