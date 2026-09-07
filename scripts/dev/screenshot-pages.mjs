// Screenshot every app route of a running dev server in light and dark, at
// 1456x868 (DPR 2), driving Chrome over the DevTools protocol. Light is the
// page as served; dark toggles the `dark` class on <html> (what next-themes
// sets). No dependencies beyond Node 22+ (global WebSocket and fetch).
//
//   node scripts/dev/screenshot-pages.mjs <outDir> [baseUrl]   (default http://localhost:3000)
//   ONLY=home,thread node scripts/dev/screenshot-pages.mjs <outDir>
//   CHROME=/path/to/chrome … to point at another Chromium build
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const outDir = process.argv[2];
const base = process.argv[3] ?? "http://localhost:3000";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9333 + Math.floor(Math.random() * 500);
const profile = join(outDir, ".chrome-profile");
mkdirSync(join(outDir, "light"), { recursive: true });
mkdirSync(join(outDir, "dark"), { recursive: true });

const ROUTES = [
  ["threads/new", "home"],
  ["threads", "threads"],
  ["thread/cmtlsm8nk0sn207ad13p8bpou", "thread"],
  ["inbox", "inbox"],
  ["teams", "teams"],
  ["skills", "skills"],
  ["memories", "memories"],
  ["learning", "learning"],
  ["projects", "projects"],
  ["library", "library"],
  ["marketplace", "marketplace"],
  ["agents", "agents"],
  ["settings", "settings"],
  ["settings/integrations", "settings-integrations"],
  ["settings/profile", "settings-profile"],
  ["import/openclaw", "import-openclaw"],
  ["design/brand", "design-brand"],
];
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--window-size=1456,868",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) {
  try {
    targets = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json());
    if (targets.length) break;
  } catch {}
  await sleep(200);
}
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
const events = [];
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    events.push(msg);
    for (const w of waiters) w(msg);
  }
};
const waiters = new Set();
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
const waitEvent = (method, timeout) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      waiters.delete(w);
      reject(new Error(`timeout waiting for ${method}`));
    }, timeout);
    const w = (msg) => {
      if (msg.method === method) {
        clearTimeout(t);
        waiters.delete(w);
        resolve(msg.params);
      }
    };
    waiters.add(w);
  });
const evaluate = async (expression, awaitPromise = false) =>
  (await send("Runtime.evaluate", { expression, awaitPromise, returnByValue: true })).result?.value;

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1456, height: 868, deviceScaleFactor: 2, mobile: false });

for (const [route, name] of ROUTES) {
  if (only && !only.includes(name)) continue;
  const url = `${base}/${route}`;
  const t0 = Date.now();
  const loaded = waitEvent("Page.loadEventFired", 120000);
  await send("Page.navigate", { url });
  await loaded;
  await evaluate("document.fonts.ready.then(() => true)", true);
  await sleep(1200);
  for (const theme of ["light", "dark"]) {
    await evaluate(`document.documentElement.classList.toggle('dark', ${theme === "dark"}); true`);
    await sleep(350);
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(outDir, theme, `${name}.png`), Buffer.from(data, "base64"));
  }
  console.log(`${name} ${Date.now() - t0}ms`);
}
ws.close();
chrome.kill();
process.exit(0);
