/**
 * 基于Bot跟Machete的TaJian对接
 * 按filestie.io标准把Bot爬虫返回的数据格式化保存为.url及其说明文件
 */
import common from './common.mjs';
import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

class TaJian {

    constructor(data_save_dir) {
        this.save_dir = data_save_dir;
    }

    /*
       * Example:
        [InternetShortcut]
        URL=https://microsoft.com/
    */
    async saveUrlShortcut(filename, data) {
        try {

            const dirPath = path.resolve(this.save_dir);
            const filepath = `${dirPath}/${filename}.url`;

            const shortUrlContent = `\[InternetShortcut\]
            URL=${data.url}
            `;
            await writeFile(filepath, shortUrlContent, { encoding: 'utf8' });
        }catch(error) {
            console.error('Save short url file failed: %s', error);
            return false;
        }

        return true;
    }

    async saveDescriptionFiles(filename, data) {
        try {
            const dirPath = path.resolve(this.save_dir);

            //save title
            let filepath = `${dirPath}/${filename}_title.txt`;
            let content = data.title;
            await writeFile(filepath, content, { encoding: 'utf8' });

            //save cover image
            if (typeof(data.cover_base64) != 'undefined' && data.cover_base64) {
                filepath = `${dirPath}/${filename}.${data.cover_type}`;
                content = Buffer.from(data.cover_base64, "base64");                         //保存图片文件
                await writeFile(filepath, content, { encoding: 'utf8' });

                filepath = `${dirPath}/${filename}_cover.txt`;
                content = `${filename}.${data.cover_type}`;                                 //保存图片路径
                await writeFile(filepath, content, { encoding: 'utf8' });
            }else if (typeof(data.cover) != 'undefined' && data.cover) {
                filepath = `${dirPath}/${filename}_cover.txt`;
                content = data.cover;                                                       //保存图片网址
                await writeFile(filepath, content, { encoding: 'utf8' });
            }
        }catch(error) {
            console.error('Save description files failed: %s', error);
            return false;
        }

        return true;
    }

}

export default TaJian;
