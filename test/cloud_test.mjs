import Hero from '@ulixee/hero';

(async () => {
  const hero = new Hero({ connectionToCore: 'ws://192.168.3.13:1818' });

  //const url = 'https://filesite.io';
  //const url = 'https://www.google.com';
  const url = 'https://v.douyin.com/iJr1NsJJ/';
  await hero.goto(url, {
    timeoutMs: 20000,
    referrer: '-'
  });

  const title = await hero.document.title;
  console.log("Page title:\n", title);

  await hero.close();
})().catch(error => {
  console.error("Error got:\n%s", error);
  process.exit(1);
});
