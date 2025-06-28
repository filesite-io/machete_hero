import common from './lib/common.mjs';

let configs = {
    //自动任务相关配置
    task_list_dir: 'todo/',       //待抓取任务文件保存目录
    data_save_dir: 'data/',       //抓取完成数据保存目录，文件格式：.url快捷方式，详细说明见：https://filesite.io
    task_log_dir: 'log/',         //新任务日志保存目录，方便跟踪和分析任务

    task_do_timeout: 180,         //任务处理超时时长，单位：秒
    max_fail_retry: 5,            //任务失败最多重试次数

    //HeroUnion英雄联盟对接配置
    herounion: {
        server_url: 'https://herounion.filesite.io',                //联盟服务地址
        name: 'machete_hero',                                       //爬虫名字
        description: '支持Machete的TaJian皮肤的hero爬虫',             //爬虫简介
        platforms: 'douyin,kuaishou,xigua,bilibili,website',        //爬虫支持的平台
        contracts: 'tajiantv',                              //爬虫支持的数据采集合约（可二次开发自定义）
        country: 'cn',                                      //爬虫所在国家
        lang: 'zh',                                         //爬虫支持的语言
        contact: 'https://filesite.io',                     //爬虫的联系方式
        data_mode: 'json',                                  //爬虫支持的数据格式

        notify_max_try: 5                                   //爬虫完成任务回传数据最多尝试次数
    },


    //bot相关配置
    cloud_server: 'ws://127.0.0.1:1818',
    default_mode: 'pc',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    viewport: {
        width: 1440,
        height: 900
    },

    minImageNaturalWidth: 150,      //从<img>标签抓取封面图时的图片原始尺寸最小宽度

    //可选项参考官方文档：https://ulixee.org/docs/hero/basic-client/hero
    botOptions: {
        showChrome: false,
        showChromeInteractions: false,
        showDevtools: false,
        showChromeAlive: false,
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
        timeoutMs: 60000,
        referrer: '',
    },

    //网页tab参数
    heroTabOptions: {
        timeoutMs: 60000
    },

    //常用浏览器user-agent
    userAgents: {
        iphone_safari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        iphone_wechat: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Mobile/15C202 MicroMessenger/6.6.1 NetType/4G Language/zh_CN',
        mac_chrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        android_wechat: 'Mozilla/5.0 (Linux; Android 7.1.1; OD103 Build/NMF26F; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043632 Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/4G Language/zh_CN',
    }

};

async function getConfig(configFile) {
    //自定义JSON格式配置文件支持
    if (typeof(configFile) != 'undefined' && configFile) {
        let myConfigs = await common.loadCustomizeConfig(configFile);
        if (myConfigs) {
            configs = common.mergeConfigs(myConfigs, configs);
        }
    }

    return configs;
}

export default getConfig;
