import Hero from '@ulixee/hero';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import ClientLogPlugin from '../plugin/ClientLogPlugin.mjs';

class HeroBot {
    constructor(heroCloudServer) {
        this.heroServer = heroCloudServer ? heroCloudServer : '';

        this.supportedBots = {
            douyin: 'https://www.douyin.com',
            kuaishou: 'https://www.kuaishou.com',
            xigua: 'https://www.ixigua.com',
            bilibili: 'https://www.bilibili.com',
        };

        this.name = '';

        const __filename = fileURLToPath(import.meta.url);
        this.root = path.dirname(__filename);
    }

    //返回profile对象
    async init(botName) {
        if (typeof(this.supportedBots[botName]) == 'undefined') {
            return false;
        }

        const base_url = this.supportedBots[botName];

        this.name = botName;

        let options = {
            userAgent: configs.userAgent,
            viewport: configs.viewport
        };

        if (this.heroServer) {
            options.connectionToCore = this.heroServer;
        }

        const profilePath = path.resolve(this.root, '../tmp/', `profile_${botName}.json`);
        if (fs.existsSync(profilePath) != false) {
            const json = fs.readFileSync(profilePath, { encoding: 'utf8' });
            return JSON.parse(json);
        }

        //console.log('Hero init配置', configs);
        const hero = new Hero(options);

        try {
            hero.use(ClientLogPlugin);          //开启log
            await hero.goto(base_url, configs.heroBotOptions);

            //等待所有内容加载完成
            const tab = await hero.activeTab;
            await tab.waitForLoad('AllContentLoaded', {timeoutMs: configs.heroTabOptions.timeoutMs});

            //保存profile
            const latestUserProfile = await hero.exportUserProfile();
            this.saveProfile(latestUserProfile);

            await hero.close();

            return latestUserProfile;
        }catch(error) {
            console.error("Error got when bot init with %s via hero, error: %s", base_url, error);
            await hero.close();
        }

        return false;
    }

    //保存profile
    saveProfile(profile) {
        if (this.name == '') {return false;}

        const botName = this.name;

        try {
            //保存profile
            const profilePath = path.resolve(this.root, '../tmp/', `profile_${botName}.json`);
            profile = this.fixCookies(profile);
            fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));
        }catch(error) {
            console.error("Error got when save profile of %s, error detail:\n%s", botName, error);
            return false;
        }

        return true;
    }

    //处理name为空的cookie
    fixCookies(profile) {
        let fixedProfile = profile;
        if (typeof(profile.cookies) == 'undefined') {return profile;}

        const botName = this.name;
        for (const index in profile.cookies) {
            if (profile.cookies[index].name == '') {
                fixedProfile.cookies[index].name = botName;
            }
        }

        return fixedProfile;
    }

}

export default HeroBot;
