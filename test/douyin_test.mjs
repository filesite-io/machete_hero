import Hero from '@ulixee/hero';

(async () => {
  const hero = new Hero({
    connectionToCore: 'ws://127.0.0.1:1818',

    //iphone 12 Pro
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    viewport: {
        width: 390,
        height: 844
    },

    //mac mini
    //userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    //viewport: {
    //    width: 1440,
    //    height: 900
    //},

    showChrome: true,
    showChromeInteractions: true,
    showDevtools: true,
    showChromeAlive: true,
  });

  const url = 'https://v.douyin.com/i2PBaR5B/';
  console.log("请求 %s 中。。。", url);
  await hero.goto(url, {
    timeoutMs: 60000,
    referrer: '',
  });

  //const title = await hero.document.title;
  //console.log("Page title:\n", title);

  //等待所有内容加载完成
  const tab = await hero.activeTab;

  //mac mini
  //await hero.waitForPaintingStable();
  //await tab.waitForLoad('AllContentLoaded', {timeoutMs: 30000});
  await tab.waitForLoad('DomContentLoaded', {timeoutMs: 30000});

  //await hero.waitForState({
  //      all(assert) {
  //          assert(
  //            hero.detach( hero.document.querySelectorAll('img.poster') ),
  //            els => els && els.length > 0,
  //          );
  //      }
  //  }, {timeoutMs: 20000});
  //console.log('poster封面图标签已经准备好');

  console.log('加载完成', await hero.isPaintingStable, await hero.isDomContentLoaded, await hero.isAllContentLoaded);


    //解析网页HTML数据
    let doc_url = await hero.document.location.href;
  console.log('网址', doc_url);

    //let doc_html = await hero.document.body.innerHTML;
  //console.log('网页内容', doc_html);

    let title = await hero.document.title;
  console.log('网页标题', title);

  const elem = await hero.querySelector('.video-container img.poster');
  let imgUrl = '';
    imgUrl = await elem.src;
    console.log('post image url: %s', imgUrl);

  //const elems = await hero.detach( hero.document.querySelectorAll('meta') );
  //const elems = await hero.document.querySelectorAll('meta');
  ////console.log('数量', await elems.length);
  //let meta_name = '';
  //for (const elem in elems) {
  //  meta_name = await elem.getAttribute('name');
  //  if (!meta_name) {continue;}
  //  console.log('meta name %s, content: %s', meta_name, await elem.getAttribute('content'));

  //  meta_name = meta_name.toLowerCase();
  //  if (meta_name.indexOf('video_cover_image_url') > -1 || meta_name.indexOf('video_title') > -1) {
  //      console.log('meta name %s, content: %s', meta_name, await elem.getAttribute('content'));
  //  }
  //}

  await hero.close();
})().catch(error => {
  console.error("Error got:\n%s", error);
  process.exit(1);
});
