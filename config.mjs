export default {
  //自动任务相关配置
  task_list_dir: 'todo/',       //待抓取任务文件保存目录
  data_save_dir: 'data/',       //抓取完成数据保存目录，文件格式：.url快捷方式，详细说明见：https://filesite.io


  //bot相关配置
  //userAgent: '~ chrome >= 114 && mac',        //指定操作系统和浏览器版本
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  viewport: {
    width: 1440,
    height: 900
  },

  viewports: {
    mob: {
        width: 375,
        height: 667
    },
    pc: {
        width: 1440,
        height: 900
    },
  },

  //请求参数
  heroBotOptions: {
    timeoutMs: 20000,
    referrer: '',
  },

  //网页tab参数
  heroTabOptions: {
    timeoutMs: 30000
  },

  //常用浏览器user-agent
  userAgents: {
    iphone_chrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    iphone_wechat: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Mobile/15C202 MicroMessenger/6.6.1 NetType/4G Language/zh_CN',
    mac_chrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    android_wechat: 'Mozilla/5.0 (Linux; Android 7.1.1; OD103 Build/NMF26F; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043632 Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/4G Language/zh_CN',
  }

};
