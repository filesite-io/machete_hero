import Hero from '@ulixee/hero';
import HeroBot from './HeroBot.mjs';
import ClientLogPlugin from '../plugin/ClientLogPlugin.mjs';
import common from '../lib/common.mjs';

class Kuaishou extends HeroBot {

    async scrap(url) {
        let data = {url: url, done: false};

        let options = {
            userAgent: configs.userAgent,
            viewport: configs.viewport
        };

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
            await tab.waitForLoad('AllContentLoaded', {timeoutMs: configs.heroTabOptions.timeoutMs});
            await hero.waitForPaintingStable();

            //解析网页HTML数据
            data.title = await hero.document.title;
            //data.url = await hero.url;

            const elem = hero.document.querySelector('.video-container-player');
            if (elem) {
                data.cover = await elem.getAttribute('poster');
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
        };

        return data;
    }

}

export default Kuaishou;
