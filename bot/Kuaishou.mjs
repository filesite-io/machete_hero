import Hero from '@ulixee/hero';
import HeroBot from './HeroBot.mjs';
import ClientLogPlugin from '../plugin/ClientLogPlugin.mjs';
import common from '../lib/common.mjs';

class Kuaishou extends HeroBot {

    async scrap(url) {
        let data = {url: url, done: false};

        let options = {
            userAgent: configs.userAgent,
            viewport: configs.viewport,
        };

        options = common.mergeConfigs(configs.botOptions, options);

        if (this.heroServer) {
            options.connectionToCore = this.heroServer;
        }

        try {
            const profile = await this.init('kuaishou');
            if (profile) {
                options.userProfile = profile;
            }
        }catch(err) {
            console.error("Error got when init Kuaishou bot", err);
        }

        const hero = new Hero(options);
        
        try {
            hero.use(ClientLogPlugin);          //开启log
            await hero.goto(url, configs.heroBotOptions);

            //等待所有内容加载完成
            const tab = await hero.activeTab;
            await tab.waitForLoad('DomContentLoaded', {timeoutMs: configs.heroTabOptions.timeoutMs});
            await hero.waitForPaintingStable({timeoutMs: configs.heroTabOptions.timeoutMs});

            let rnd_secods = 10 + parseInt(Math.random() * 10);
            console.log("Sleep %s seconds...", rnd_secods);
            await common.delay(rnd_secods);

            //解析网页HTML数据
            data.title = await hero.document.title;
            //data.url = await hero.url;

            let elem = await hero.querySelector('.video-container-player');
            if (elem) {
                data.cover = await elem.getAttribute('poster');
            }

            //增加直播页面的支持，抓取用户的头像做封面图
            if (typeof(data.cover) == 'undefined' || !data.cover) {
                elem = await hero.querySelector('.tran .flex img.rounded.ml-10');
                if (elem) {
                    data.cover = await elem.src;
                }
            }

            //get cover image's base64 data
            if (typeof(data.cover) != 'undefined' && data.cover) {
                data.cover = common.getAbsoluteUrl(data.cover);

                const response = await hero.goto(data.cover);
                const imgBuffer = await response.buffer;
                //console.log('Cover image fetch done', imgBuffer.toString('base64'));
                if (imgBuffer) {
                    data.cover_base64 = imgBuffer.toString('base64');
                    data.cover_type = common.getImageType(data.cover);
                }
            }

            await hero.close();

            data.bot = this.name;
            data.done = true;
        }catch(error) {
            console.error("Error got when request %s via hero: %s", url, error);
            await hero.close();
            //删除profile文件后重试
            await this.deleteProfile();
        };

        return data;
    }

}

export default Kuaishou;
