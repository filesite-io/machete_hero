import Hero from '@ulixee/hero';
import HeroBot from './HeroBot.mjs';
import ClientLogPlugin from '../plugin/ClientLogPlugin.mjs';
import common from '../lib/common.mjs';

class Douyin extends HeroBot {

    async scrap(url) {
        let data = {url: url, done: false};

        //use iphone
        if (this.ua == 'mob') {
            configs.userAgent = configs.userAgents.iphone_safari;
            configs.viewport = configs.viewports.mob;
        }

        let options = {
            userAgent: configs.userAgent,     //default mac os
            viewport: configs.viewport,
        };

        options = common.mergeConfigs(configs.botOptions, options);

        if (this.heroServer) {
            options.connectionToCore = this.heroServer;
        }

        try {
            const profile = await this.init('douyin');
            if (profile) {
                options.userProfile = profile;
            }
        }catch(err) {
            console.error("Error got when init Douyin bot", err);
        }

        const hero = new Hero(options);

        try {
            hero.use(ClientLogPlugin);          //开启log
            await hero.goto(url, configs.heroBotOptions);

            //等待所有内容加载完成
            const tab = await hero.activeTab;

            //for mob
            if (this.ua == 'mob') {
                await tab.waitForLoad('DomContentLoaded', {timeoutMs: configs.heroTabOptions.timeoutMs});
            }else {
                //for pc
                await tab.waitForLoad('DomContentLoaded', {timeoutMs: configs.heroTabOptions.timeoutMs});   //AllContentLoaded, DomContentLoaded
                await hero.waitForState({
                    all(assert) {
                        assert(
                          hero.document.title,
                          text => text != '',
                        );
                    }
                }, {timeoutMs: configs.heroTabOptions.timeoutMs});
            }

            let rnd_secods = 10 + parseInt(Math.random() * 10);
            console.log("Sleep %s seconds...", rnd_secods);
            await common.delay(rnd_secods);

            //解析网页HTML数据
            data.title = await hero.document.title;

            if (this.ua == 'mob') {
                //手机版网页解析
                let imgElem = await hero.querySelector('.video-container img.poster');
                let elType = 'image';
                if (!imgElem) {
                    //尝试去抓取video的poster属性
                    imgElem = await hero.querySelector('.xgplayer video');
                    elType = 'video';

                    if (!imgElem) {
                        //尝试获取用户头像作为封面图，兼容直播已结束页面
                        imgElem = await hero.querySelector('.reflow-content img');
                        elType = 'image';

                        if (!imgElem) {
                            console.error('HTML解析出错，找不到封面图', data);
                            await hero.close();
                            //删除profile文件后重试
                            await this.deleteProfile();
                            return false;
                        }
                    }
                }

                data.cover = elType == 'image' ? await imgElem.src : await imgElem.poster;
            }else {
                //pc版网页解析
                const elems = await hero.document.querySelectorAll('meta');
                let meta_name = '';
                for (const elem of elems) {
                    meta_name = await elem.getAttribute('name');
                    if (!meta_name) {continue;}
                    meta_name = meta_name.toLowerCase();
                    if (meta_name.indexOf('video_cover_image_url') > -1) {
                        data.cover = await elem.getAttribute('content');
                    }else if (meta_name.indexOf('video_title') > -1) {
                        data.title = await elem.getAttribute('content');
                    }
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
        }

        return data;
    }

}

export default Douyin;
