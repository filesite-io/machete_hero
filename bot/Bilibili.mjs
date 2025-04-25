import Hero from '@ulixee/hero';
import HeroBot from './HeroBot.mjs';
import ClientLogPlugin from '../plugin/ClientLogPlugin.mjs';
import common from '../lib/common.mjs';

class Bilibili extends HeroBot {

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
            const profile = await this.init('bilibili');
            if (profile) {
                options.userProfile = profile;
            }
        }catch(err) {
            console.error("Error got when init Bilibili bot", err);
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

            const elems = await hero.document.querySelectorAll('meta');
            let meta_name = '';
            for (const elem of elems) {
                meta_name = await elem.getAttribute('property');
                if (!meta_name) {continue;}
                meta_name = meta_name.toLowerCase();
                //console.log('meta', meta_name);
                if (meta_name.indexOf('og:image') > -1) {
                    data.cover = await elem.getAttribute('content');
                }else if (meta_name.indexOf('og:title') > -1) {
                    data.title = await elem.getAttribute('content');
                }
            }

            //支持正在直播页面
            if (typeof(data.cover) == 'undefined' || !data.cover) {
                console.log('Try to get video poster...');
                let videoElem = await hero.querySelector('.live-player-mounter video');
                let posterDiv = await videoElem.nextSibling;
                if (posterDiv) {
                    let styleDeclaration = await posterDiv.style;
                    if (styleDeclaration) {
                        let backgroundImage = await styleDeclaration.getPropertyValue("background-image");
                        //console.log('Poster element find', backgroundImage);
                        backgroundImage = backgroundImage.replace('url("', '').replace('")', '');
                        data.cover_type = common.getImageType(backgroundImage);
                        data.cover_base64 = backgroundImage.replace(/^data:image\/[a-z]+;base64,/i, '');
                    }
                }
            }

            //支持已结束直播
            if (
                (typeof(data.cover) == 'undefined' || !data.cover)
                &&
                (typeof(data.cover_base64) == 'undefined' || !data.cover_base64)
            ) {
                console.log('Try to get avatar...');
                let avatarElem = await hero.querySelector('.blive-avatar-face');
                if (avatarElem) {
                    let styleDeclaration = await avatarElem.style;
                    if (styleDeclaration) {
                        let backgroundImage = await styleDeclaration.getPropertyValue("background-image");
                        //console.log('Avatar element find', backgroundImage);
                        data.cover = backgroundImage.replace('url("', '').replace('")', '');
                    }
                }
            }

            //get cover image's base64 data
            //sample: //i1.hdslb.com/bfs/archive/ef6204c8788134064dc6b7e8cb20870f1341e604.jpg@100w_100h_1c.png
            //替换成：//i1.hdslb.com/bfs/archive/ef6204c8788134064dc6b7e8cb20870f1341e604.jpg@480w_270h_1c.png
            if (typeof(data.cover) != 'undefined' && data.cover && /^data:image\/[a-z]+;base64,/i.test(data.cover) == false) {
                data.cover = common.getAbsoluteUrl(data.cover);
                data.cover = data.cover.replace(/@[\w]+\./ig, '@480w_270h_1c.');    //获取480x270尺寸图片

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
        }

        return data;
    }

}

export default Bilibili;
