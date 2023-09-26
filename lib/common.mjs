//公用方法
import { rm as removeFile } from 'node:fs/promises';

export default {

    getTimeString: function(locales) {
        const today = new Date();
        if (typeof(locales) == 'undefined') {locales = 'zh-CN';}
        return today.toLocaleString(locales);
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
        let botName = '';

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

        if (/\.jpe?g/ig.test(url)) {
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

};
