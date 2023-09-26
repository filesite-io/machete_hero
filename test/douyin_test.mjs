import Hero from '@ulixee/hero';

(async () => {
  const hero = new Hero({
    connectionToCore: 'ws://192.168.3.13:1818',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
  });

  const url = 'https://v.douyin.com/iJr1NsJJ/';
  console.log("请求 %s 中。。。", url);
  await hero.goto(url, {
    timeoutMs: 10000,
    referrer: 'https://wechat.com',
  });

  //const title = await hero.document.title;
  //console.log("Page title:\n", title);

  //等待所有内容加载完成
  const tab = await hero.activeTab;
  await tab.waitForLoad('AllContentLoaded', {timeoutMs: 5000});
  console.log('加载完成', await hero.isPaintingStable, await hero.isDomContentLoaded, await hero.isAllContentLoaded);

  const elems = await hero.detach( hero.document.querySelectorAll('meta') );
  console.log('数量', elems.length);
  let meta_name = '';
  for (const elem of elems) {
    meta_name = elem.getAttribute('name');
    if (!meta_name) {continue;}
    meta_name = meta_name.toLowerCase();
    if (meta_name.indexOf('video_cover_image_url') > -1 || meta_name.indexOf('video_title') > -1) {
        console.log('meta name %s, content: %s', meta_name, elem.getAttribute('content'));
    }
  }

  await hero.close();
})().catch(error => {
  console.error("Error got:\n%s", error);
  process.exit(1);
});
