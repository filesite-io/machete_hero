import Hero from '@ulixee/hero';
import configs from '../config.mjs';
import HeroBot from './HeroBot.mjs';
import ClientLogPlugin from '../plugin/ClientLogPlugin.mjs';
import common from '../lib/common.mjs';

class Douyin extends HeroBot {

  async scrap(url) {
    let data = {url: url, done: false};

    try {
        let options = {
            userAgent: configs.userAgent,
            viewport: configs.viewport
        };

        if (this.heroServer) {
            options.connectionToCore = this.heroServer;
        }

        const profile = await this.init('douyin');
        data.bot = this.name;
        if (profile) {
            options.userProfile = profile;
        }

        const hero = new Hero(options);
        hero.use(ClientLogPlugin);          //开启log
        await hero.goto(url, configs.heroBotOptions);

        //等待所有内容加载完成
        const tab = await hero.activeTab;
        await tab.waitForLoad('AllContentLoaded', {timeoutMs: configs.heroTabOptions.timeoutMs});
        await hero.waitForState({
            all(assert) {
                assert(
                  hero.document.title,
                  text => text != '',
                );
            }
        });

        //解析网页HTML数据
        data.title = await hero.document.title;
        //data.url = await hero.url;

        const elems = await hero.document.querySelectorAll('meta');
        let meta_name = '';
        for (const elem of elems) {
          meta_name = await elem.getAttribute('name');
          if (!meta_name) {continue;}
          meta_name = meta_name.toLowerCase();
          //console.log('meta', meta_name);
          if (meta_name.indexOf('video_cover_image_url') > -1) {
            data.cover = await elem.getAttribute('content');
          }else if (meta_name.indexOf('video_title') > -1) {
            data.title = await elem.getAttribute('content');
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

        data.done = true;
    }catch(error) {
        console.error("Error got when request %s via hero: %s", url, error);
    }

    return data;
  }

}

export default Douyin;
