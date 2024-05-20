//公用方法
import { readdir, readFile, rm as removeFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';

export default {

    getTimeString: function(locales) {
        const today = new Date();
        if (typeof(locales) == 'undefined') {locales = 'zh-CN';}
        return today.toLocaleString(locales);
    },

    getTimestampInSeconds: function() {
        return Math.floor(Date.now() / 1000);
    },

    removeFile: async function(filepath) {
        let done = false;

        try {
            done = await removeFile(filepath, {force: true});
        }catch(error) {
            console.error('Remove task file failed: %s', error);
        }

        return done;
    },

    getBotName: function(url) {
        let botName = 'webcrawler';

        if (/douyin\.com/ig.test(url)) {
            botName = 'douyin';
        }else if (/kuaishou\.com/ig.test(url)) {
            botName = 'kuaishou';
        }else if (/ixigua\.com/ig.test(url)) {
            botName = 'xigua';
        }else if (/b23\.tv/ig.test(url) || /bilibili\.com/ig.test(url)) {
            botName = 'bilibili';
        }

        return botName;
    },

    getAbsoluteUrl: function(url) {
        if (/^\/\//.test(url)) {
            url = `https:${url}`;
        }

        return url;
    },

    getImageType: function(url) {
        let imgType = 'jpeg';

        if (/\.jp(e)?g/ig.test(url)) {
            imgType = 'jpeg';
        }else if (/\.png/ig.test(url)) {
            imgType = 'png';
        }else if (/\.webp?/ig.test(url)) {
            imgType = 'webp';
        }else if (/\.gif?/ig.test(url)) {
            imgType = 'gif';
        }

        return imgType;
    },

    isUrl: function(url) {
        return /^http(s)?:\/\/.+/ig.test(url);
    },

    loadCustomizeConfig: async function(configFileName) {
        let configs = {};

        try {
            let filepath = path.resolve(configFileName);
            let content = await readFile(filepath, { encoding: 'utf8' });
            if (content) {
                configs = JSON.parse(content);
            }
        }catch(error) {
            console.error('Get config from %s failed: %s', configFileName, error);
        }

        return configs;
    },

    mergeConfigs: function(myConfig, configs) {
        for (const key in myConfig) {
            configs[key] = myConfig[key];
        }

        return configs;
    },

    //保存log到指定文件
    saveLog: async function(filePath, content) {
        let saved = false;

        try {
            let saveRes = await appendFile(filePath, content);
            if (saveRes == undefined) {
                saved = true;
            }
        } catch (err) {
            console.error(`Log save to %s failed: %s`, filePath, err.message);
        }

        return saved;
    },

    delay: async function(seconds) {
        await setTimeout(seconds * 1000);
    }

};
