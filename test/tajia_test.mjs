import TaJian from '../lib/tajian.mjs';

(async () => {

    const data = {
        url: 'https://v.douyin.com/i8sEyb6/',
        done: true,
        bot: 'douyin',
        title: '自由与成功 - 抖音',
        cover: '//p6-pc-sign.douyinpic.com/image-cut-tos-priv/d1b1e96513a755b2d6ff4cf8d8260f9b~tplv-dy-resize-origshort-autoq-75:330.jpeg?biz_tag=pcweb_cover&from=3213915784&s=PackSourceEnum_AWEME_DETAIL&sc=cover&se=false&x-expires=2010128400&x-signature=VuJiezXPv7y13fu63Krn9tIbLvQ%3D'
    };
    const filename = 'douyintest';

    const tajian = new TaJian('../data/');

    const saveUrlDone = await tajian.saveUrlShortcut(filename, data);
    console.log('shortcut save done', saveUrlDone);

    const saveDescDone = await tajian.saveDescriptionFiles(filename, data);
    console.log('descriptions save done', saveDescDone);

})().catch(error => {
    console.error("Error got:\n%s", error);
    process.exit(1);
});