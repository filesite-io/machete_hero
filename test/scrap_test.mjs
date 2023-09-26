import Douyin from '../bot/Douyin.mjs';
import Kuaishou from '../bot/Kuaishou.mjs';
import Xigua from '../bot/Xigua.mjs';
import Bilibili from '../bot/Bilibili.mjs';
import configs from '../config.mjs';

(async () => {
    let test_bot = 'douyin';
    if (process.argv.length == 3) {
        test_bot = process.argv[2];
    }
    console.log('当前测试Bot：%s', test_bot);

    const heroCloudServer = 'ws://192.168.3.13:1818';
    let url = '', data = {};

    switch(test_bot) {

        case 'douyin':
            //抖音测试
            url = 'https://v.douyin.com/ieUpFCva/';     //mob and pc
            url = 'https://v.douyin.com/i8sEyb6/';     //mob and pc

            configs.heroTabOptions.timeoutMs = 20000;   //所有内容加载完成超时

            configs.userAgent = configs.userAgents.mac_chrome;
            configs.viewport = configs.viewports.pc;

            console.log('Hero配置', configs);

            const douyin = new Douyin(heroCloudServer);
            console.log('请求中: %s ...', url);
            data = await douyin.scrap(url);
            console.log("解析结果:\n%s", JSON.stringify(data));

            break;


        case 'kuaishou':
            //快手测试
            url = 'https://www.kuaishou.com/f/X8FTguiIjZQVwE7';     //pc
            //url = 'https://v.kuaishou.com/7zwqe6';      //mob

            configs.heroTabOptions.timeoutMs = 20000;   //所有内容加载完成超时

            configs.userAgent = configs.userAgents.mac_chrome;
            configs.viewport = configs.viewports.pc;
            console.log('Hero配置', configs);

            const kuaishou = new Kuaishou(heroCloudServer);

            console.log('请求中: %s ...', url);
            data = await kuaishou.scrap(url);
            console.log("解析结果:\n%s", JSON.stringify(data));

            break;


        case 'xigua':
            //西瓜测试
            url = 'https://v.ixigua.com/ieUaqrFN/';       //mobile
            url = 'https://www.ixigua.com/7248225527335813636';     //pc

            configs.heroBotOptions.referrer = url;
            configs.userAgent = configs.userAgents.mac_chrome;
            configs.viewport = configs.viewports.pc;

            configs.heroTabOptions.timeoutMs = 20000;   //所有内容加载完成超时

            console.log('Hero配置', configs);

            const xigua = new Xigua(heroCloudServer);
            console.log('请求中: %s ...', url);
            //data = await xigua.scrap(`${url}?wid_try=1`);
            data = await xigua.scrap(url);
            console.log("解析结果:\n%s", JSON.stringify(data));

            break;


        case 'bilibili':
            //B站测试
            url = 'https://www.bilibili.com/video/BV1ep4y1J75y/?share_source=copy_web&vd_source=00bead49a4c2df31bbf3e609d7d95899'; //pc
            url = 'https://b23.tv/Lo0jIEt';       //mob

            configs.heroTabOptions.timeoutMs = 20000;   //所有内容加载完成超时

            configs.userAgent = configs.userAgents.mac_chrome;
            configs.viewport = configs.viewports.pc;

            console.log('Hero配置', configs);

            const bilibili = new Bilibili(heroCloudServer);
            console.log('请求中: %s ...', url);
            data = await bilibili.scrap(url);
            console.log("解析结果:\n%s", JSON.stringify(data));

            break;

    }

    process.exit(0);
})();
