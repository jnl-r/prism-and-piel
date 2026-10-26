const { chromium } = require('playwright');
const [,, src, out] = process.argv;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('file://' + src); await p.waitForLoadState('networkidle'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  console.log('fonts', await p.evaluate(() => document.fonts.check('500 40px "Cormorant Garamond"') && document.fonts.check('300 15px Jost')));
  const map = { banner:'banner', 'h-why':'h-why','h-how':'h-how','h-1':'step-1','h-2':'step-2','h-3':'step-3','h-more':'h-browse','h-db':'h-database',
    'f-profiles':'profiles','f-matches':'matches','f-catalog':'catalog','f-home':'home', tiktok:'tiktok-shop', footer:'footer' };
  for (const [id, name] of Object.entries(map)) await p.locator('#' + id).screenshot({ path: out + '/' + name + '.png', omitBackground: true });
  await b.close();
})();
