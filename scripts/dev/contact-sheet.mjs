// Build a contact sheet (an HTML grid of the PNGs in a directory) and capture
// it full-page via the DevTools protocol, for reviewing a screenshot set at a
// glance.
//
//   node scripts/dev/contact-sheet.mjs <imgDir> <out.png> "<title>" [cols]
import { spawn } from "node:child_process";
import { writeFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
const [imgDir, outPng, title, colsArg] = process.argv.slice(2);
const cols = Number(colsArg ?? 3);
const files = readdirSync(imgDir).filter((f) => f.endsWith(".png")).sort();
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#111;color:#eee;font:14px system-ui;padding:16px}
h1{font-size:18px;margin:0 0 12px}
.g{display:grid;grid-template-columns:repeat(${cols},1fr);gap:14px}
figure{margin:0}img{width:100%;display:block;border:1px solid #444;border-radius:4px}
figcaption{margin-top:4px;font-size:12px;color:#bbb}</style>
<h1>${title}</h1><div class="g">${files.map((f) => `<figure><img src="file://${resolve(imgDir, f)}"><figcaption>${f.replace(".png", "")}</figcaption></figure>`).join("")}</div>`;
const htmlPath = join(imgDir, "_sheet.html");
writeFileSync(htmlPath, html);
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9800 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${join(imgDir, ".profile")}`, "--window-size=1800,1000", "--no-first-run", "--allow-file-access-from-files", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) { try { targets = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json()); if (targets.length) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map(); const waiters = new Set();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result); } else if (msg.method) for (const w of waiters) w(msg); };
const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });
const waitEvent = (method) => new Promise((resolve) => { const w = (msg) => { if (msg.method === method) { waiters.delete(w); resolve(msg.params); } }; waiters.add(w); });
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1800, height: 1000, deviceScaleFactor: 1, mobile: false });
const loaded = waitEvent("Page.loadEventFired");
await send("Page.navigate", { url: `file://${htmlPath}` });
await loaded; await sleep(800);
const { contentSize } = await send("Page.getLayoutMetrics");
await send("Emulation.setDeviceMetricsOverride", { width: 1800, height: Math.ceil(contentSize.height), deviceScaleFactor: 1, mobile: false });
await sleep(300);
const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
writeFileSync(outPng, Buffer.from(data, "base64"));
console.log(outPng, Math.ceil(contentSize.height));
ws.close(); chrome.kill(); process.exit(0);
