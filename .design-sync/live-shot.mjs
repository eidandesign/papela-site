// Live-clock screenshot (no frozen time) for GSAP-animated previews.
import { chromium } from '../.ds-sync/node_modules/playwright/index.mjs';
const [url, out, w = '1280', h = '760', wait = '4000'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.DS_CHROMIUM_PATH });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
p.on('pageerror', e => console.log('ERR', String(e).split('\n')[0]));
p.on('requestfailed', r => console.log('FAIL', r.url()));
p.on('response', r => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); });
await p.goto(url, { waitUntil: 'networkidle' });
await p.waitForTimeout(+wait);
await p.screenshot({ path: out, fullPage: true });
await b.close();
