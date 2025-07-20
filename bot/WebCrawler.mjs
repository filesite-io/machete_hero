/**
 * 普通网站用爬虫
 * 抓取规则：
 * 1. 解析<title></title>标签
 * 2. 解析<meta>标签里的分享图片属性，任何property里包含og:image的标签属性content，参考：https://ogp.me/
 * 3. 如果上述步骤都没有解析道图片，则从<body></body>中解析所有的<img>标签，默认抓取第一张图片，并尝试抓取加载完成的图片宽度>=300px的
 */
import Hero from '@ulixee/hero';
import HeroBot from './HeroBot.mjs';
import ClientLogPlugin from '../plugin/ClientLogPlugin.mjs';
import common from '../lib/common.mjs';

class WebCrawler extends HeroBot {

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

        const hero = new Hero(options);

        try {
            hero.use(ClientLogPlugin);          //开启log
            await hero.goto(url, configs.heroBotOptions);

            //等待所有内容加载完成
            const tab = await hero.activeTab;
            await tab.waitForLoad('DomContentLoaded', {timeoutMs: configs.heroTabOptions.timeoutMs});

            let rnd_secods = 10 + parseInt(Math.random() * 10);
            console.log("Sleep %s seconds...", rnd_secods);
            await common.delay(rnd_secods);

            //解析网页HTML数据
            data.title = await hero.document.title;

            //封面图抓取

            //1. 解析meta
            const elems = await hero.document.querySelectorAll('meta');
            let meta_name = '';
            for (const elem of elems) {
                meta_name = await elem.getAttribute('property');
                if (!meta_name) {continue;}
                meta_name = meta_name.toLowerCase();
                if (!data.cover && meta_name.indexOf('og:image') > -1) {
                    data.cover = await elem.getAttribute('content');
                }else if (!data.cover && meta_name.indexOf('image') > -1) {
                    let contentStr = await elem.getAttribute('content');
                    if (common.isUrl(contentStr)) {
                        data.cover = contentStr;
                    }
                }else if (meta_name.indexOf('og:title') > -1) {
                    data.title = await elem.getAttribute('content');
                }
            }

            //2. <img>解析
            if (!data.cover) {
                let minNaturalWidth = configs.minImageNaturalWidth ? configs.minImageNaturalWidth : 200;
                let imgSrc = '', imgType = '';
                const imgElems = await hero.querySelectorAll('img');
                if (imgElems) {
                    for (const imgEl of imgElems) {
                        //check image type supported
                        imgSrc = await imgEl.src;
                        imgType = common.getImageType(imgSrc);

                        //console.log('Completed: %s, naturalWidth: %s, width: %s', await imgEl.complete, await imgEl.naturalWidth, await imgEl.width);
                        if (imgType && (imgType == 'jpeg' || imgType == 'png') && await imgEl.complete && await imgEl.naturalWidth >= minNaturalWidth) {
                            data.cover = await imgEl.src;
                            //console.log('Cover got: %s', data.cover);
                            break;
                        }
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
        }

        return data;
    }

}

export default WebCrawler;
