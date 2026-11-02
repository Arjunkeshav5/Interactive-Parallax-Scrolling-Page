// QA harness: serves dist/, drives headless Chrome via the DevTools protocol,
// scrolls through the whole journey and captures screenshots + console errors +
// per-layer transform samples (to verify independent parallax speeds).
// Usage: node scripts/qa.mjs [outDir]
import { preview } from 'vite';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(process.argv[2] || join(root, 'qa-shots'));
mkdirSync(outDir, { recursive: true });
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = await preview({ root, preview: { port: 4173, strictPort: false, host: '127.0.0.1' }, resolve: { preserveSymlinks: true } });
const url = server.resolvedUrls.local[0];
console.log('serving', url);

const port = 9333;
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', '--mute-audio',
  `--remote-debugging-port=${port}`, `--user-data-dir=${join(tmpdir(), 'bts-qa-' + Date.now())}`, 'about:blank',
], { stdio: 'ignore' });

let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  await sleep(200);
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    wsUrl = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {}
}
if (!wsUrl) throw new Error('chrome did not start');

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
const logs = [];
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
    logs.push(`[console.${msg.params.type}] ` + msg.params.args.map((a) => a.value ?? a.description).join(' '));
  }
  if (msg.method === 'Runtime.exceptionThrown') logs.push('[exception] ' + msg.params.exceptionDetails.exception?.description);
  if (msg.method === 'Network.loadingFailed') logs.push('[network-failed] ' + msg.params.errorText);
  if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) logs.push(`[http ${msg.params.response.status}] ${msg.params.response.url}`);
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;

await send('Runtime.enable');
await send('Network.enable');
await send('Page.enable');

async function shoot(name) {
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
  writeFileSync(join(outDir, name + '.jpg'), Buffer.from(r.result.data, 'base64'));
}

async function run(label, width, height, mobile, positions, opts = {}) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  if (opts.reduced) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  else await send('Emulation.setEmulatedMedia', { features: [] });
  await send('Page.navigate', { url });
  await sleep(2500);
  const total = await evaluate('document.documentElement.scrollHeight - innerHeight');
  const hScroll = await evaluate('document.documentElement.scrollWidth > innerWidth');
  console.log(`${label}: scrollable=${total}px horizontalOverflow=${hScroll}`);
  for (const p of positions) {
    const y = typeof p === 'number' ? Math.round(p * total) : p;
    // scroll in a few steps so the engine and reveals react like a real visitor
    await evaluate(`window.scrollTo(0, ${y}); new Promise(r => setTimeout(r, 60))`);
    await sleep(1400);
    await shoot(`${label}-${String(Math.round((y / total) * 1000)).padStart(4, '0')}`);
  }
}

// 1. desktop journey
const desk = [0, 0.04, 0.08, 0.11, 0.15, 0.2, 0.25, 0.3, 0.36, 0.42, 0.48, 0.53, 0.58, 0.64, 0.7, 0.76, 0.82, 0.88, 0.94, 1];
await run('desktop', 1440, 900, false, desk);

// 2. layer speed sampling inside the reef scene
const samples = await evaluate(`(async () => {
  const sec = document.getElementById('reef');
  const top = sec.getBoundingClientRect().top + scrollY;
  const out = [];
  for (const s of [0, 0.5, 1]) {
    scrollTo(0, top + s * innerHeight);
    await new Promise(r => setTimeout(r, 300));
    out.push({ s, layers: [...sec.querySelectorAll('[data-layer]')].map(l => ({ cls: l.className.replace('layer ', ''), depth: l.dataset.depth, transform: l.style.transform })) });
  }
  return out;
})()`);

// 3. interactions: nav click, explore again
await evaluate(`document.querySelector('.nav-desktop a[href="#abyss"]').click()`);
await sleep(3800);
const afterNav = await evaluate(`({ y: scrollY, abyssTop: document.getElementById('abyss').getBoundingClientRect().top, active: document.querySelector('.nav-desktop a.is-active')?.textContent })`);
await shoot('interact-nav-abyss');
await evaluate(`document.querySelector('.depth-gauge__dot:nth-of-type(1)') && document.querySelectorAll('.depth-gauge__dot')[2].click()`);
await sleep(3800);
const afterDot = await evaluate(`({ y: scrollY, active: document.querySelector('.nav-desktop a.is-active')?.textContent })`);
await evaluate(`scrollTo(0, document.documentElement.scrollHeight)`);
await sleep(1500);
await evaluate(`document.querySelector('.cta').click()`);
await sleep(4200);
const afterCta = await evaluate('scrollY');
await shoot('interact-after-explore-again');

// 4. mobile journey + menu
await run('mobile', 390, 844, true, [0, 0.1, 0.2, 0.3, 0.42, 0.55, 0.68, 0.8, 0.9, 1]);
await evaluate(`document.querySelector('.menu-btn').click()`);
await sleep(900);
await shoot('mobile-menu-open');
const menuState = await evaluate(`({ open: document.querySelector('.mobile-menu').classList.contains('is-open'), expanded: document.querySelector('.menu-btn').getAttribute('aria-expanded') })`);
await evaluate(`document.querySelectorAll('.mobile-menu a')[3].click()`);
await sleep(3800);
const mobileNav = await evaluate(`({ y: scrollY, glowTop: document.getElementById('glow').getBoundingClientRect().top, menuOpen: document.querySelector('.mobile-menu').classList.contains('is-open') })`);
await shoot('mobile-after-menu-nav');

// 5. tablet + reduced motion
await run('tablet', 820, 1180, true, [0, 0.3, 0.6, 1]);
await run('reduced', 1440, 900, false, [0, 0.35, 0.7, 1], { reduced: true });

const report = { url, samples, afterNav, afterDot, afterCta, menuState, mobileNav, logs };
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ afterNav, afterDot, afterCta, menuState, mobileNav, logs }, null, 2));

ws.close();
chrome.kill();
await server.close();
process.exit(0);
