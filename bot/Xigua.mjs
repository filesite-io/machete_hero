import Hero from '@ulixee/hero';
import HeroBot from './HeroBot.mjs';
import ClientLogPlugin from '../plugin/ClientLogPlugin.mjs';
import common from '../lib/common.mjs';

class Xigua extends HeroBot {

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
            const profile = await this.init('xigua');
            if (profile) {
                options.userProfile = profile;
            }
        }catch(err) {
            console.error("Error got when init Xigua bot", err);
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

            const elems = await hero.document.querySelectorAll('meta');
            let meta_name = '';
            for (const elem of elems) {
                meta_name = await elem.getAttribute('name');
                if (!meta_name) {continue;}
                meta_name = meta_name.toLowerCase();
                //console.log('meta', meta_name);
                if (meta_name.indexOf('og:image') > -1) {
                    data.cover = await elem.getAttribute('content');
                }else if (meta_name.indexOf('og:title') > -1) {
                    data.title = await elem.getAttribute('content');
                }
            }

            //尝试从 <xg-poster class="xgplayer-poster hide"> 再获取一次
            if (typeof(data.cover) == 'undefined' || !data.cover)  {
                const imgTag = await tab.querySelector('xg-poster');
                let backgroundCss = await imgTag.style.backdgroundImage;
                if (backgroundCss && /url\(.+\)/i.test(backgroundCss)) {
                    data.cover = backgroundCss.replace('url(', '').replace(')', '').replace('"', '');
                }
            }

            //get cover image's base64 data
            if (typeof(data.cover) != 'undefined' && data.cover && /^data:image\/[a-z]+;base64,/i.test(data.cover) == false) {
                data.cover = common.getAbsoluteUrl(data.cover);

                const response = await hero.goto(data.cover);
                const imgBuffer = await response.buffer;
                //console.log('Cover image fetch done', imgBuffer.toString('base64'));
                if (imgBuffer) {
                    data.cover_base64 = imgBuffer.toString('base64');
                    data.cover_type = common.getImageType(data.cover);
                }
            }else if ( typeof(data.cover) != 'undefined' && data.cover && /^data:image\/[a-z]+;base64,/i.test(data.cover) ) {
                //support base64 image
                data.cover_type = common.getImageType(data.cover);
                data.cover_base64 = data.cover.replace(/^data:image\/[a-z]+;base64,/i, '');
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

export default Xigua;
