// Drive /signup to the handoff state, then measure the shell at every width in
// a sweep: the conversation column, the card grid, the heading, the composer,
// the two chrome columns — and whether the page scrolls. One row per width on
// stdout plus <outDir>/probe.json for diffing two runs, and a screenshot per
// width. Headless Chrome over the DevTools protocol, no dependencies beyond
// Node 22+ (global WebSocket and fetch), in the shape of
// scripts/dev/screenshot-pages.mjs.
//
//   node scripts/dev/probe-signup.mjs [outDir] [baseUrl]   (out/probe, http://localhost:3000)
//   WIDTHS=1920,1512,1280 node scripts/dev/probe-signup.mjs out/
//   HEIGHT=868 DPR=2 node scripts/dev/probe-signup.mjs out/
//   node scripts/dev/probe-signup.mjs out/ --sidebar-collapsed
//   node scripts/dev/probe-signup.mjs out/ --panel-closed
//   node scripts/dev/probe-signup.mjs out/ --theme=light
//   CHROME=/path/to/chrome … to point at another Chromium build
//
// Exits 1 if any of the plan's three criteria fails, so it can stand as a gate.
//
// THE MEASUREMENT TRAP, and the reason this file exists. `src/app/globals.css`
// sets `overflow-x: hidden` on `html` AND on `body`, and a used `overflow-x` of
// hidden forces the used `overflow-y` to `auto`. So both boxes are scroll
// containers, and a body scroll can be live while
// `document.documentElement.scrollTop` reads 0 forever. Reading only that hid a
// 206px body scroll for most of the 2026-09-10 diagnosis. So every row reports
// `window.scrollY`, `documentElement.scrollTop` AND `body.scrollTop`; and
// `scrollHeight` is not trusted on its own either — a REAL wheel is dispatched
// over the page (`Input.dispatchMouseEvent`, type "mouseWheel") and all three
// are read again. A page that does not move under a real wheel is the only
// proof that counts.
//
// THE SCOPING TRAP. All four signup screens are mounted at once and the
// app-handoff layer is in the DOM from the first frame, so a bare
// `document.querySelector('[aria-pressed]')` finds the thread bar's star
// button, not an agent card — that exact mistake cost a whole run of numbers.
// Every query below is scoped to one screen through its own mark seat
// (`[data-mark-slot="<step>"]`.parentElement), and "is this screen live?" is
// asked of the `inert` attribute the hidden screens carry.
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
const flags = argv.filter((a) => a.startsWith("--"));
const positional = argv.filter((a) => !a.startsWith("--"));
const outDir = positional[0] ?? "out/probe";
const base = positional[1] ?? "http://localhost:3000";
const theme = (flags.find((f) => f.startsWith("--theme="))?.split("=")[1] ?? "dark").toLowerCase();
const wantSidebarCollapsed = flags.includes("--sidebar-collapsed");
const wantPanelClosed = flags.includes("--panel-closed");
const unknown = flags.filter(
  (f) => !f.startsWith("--theme=") && f !== "--sidebar-collapsed" && f !== "--panel-closed",
);
if (unknown.length) {
  console.error(`probe-signup: unknown flag(s) ${unknown.join(", ")}`);
  process.exit(2);
}
if (theme !== "dark" && theme !== "light") {
  console.error(`probe-signup: --theme= takes "dark" or "light", got "${theme}"`);
  process.exit(2);
}

const WIDTHS = (process.env.WIDTHS ?? "1920,1512,1456,1440,1280,1180,1024,900,834,768,640,540,430,390")
  .split(",")
  .map((n) => Number(n.trim()))
  .filter((n) => Number.isFinite(n) && n > 0);
const HEIGHT = Number(process.env.HEIGHT ?? 902);
const DPR = Number(process.env.DPR ?? 1);
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// Wide enough that the shell is docked and both chrome columns exist while the
// flow is driven; the sweep resizes afterwards.
const DRIVE_WIDTH = Math.max(1280, ...WIDTHS);
// The plan's numbers: the column's floor, and the width below which the shell
// is a phone and nobody promises a two-column anything.
const COLUMN_FLOOR = 512;
const NO_SCROLL_ABOVE = 768;

mkdirSync(join(outDir, theme), { recursive: true });

// ------------------------------------------------------------ chrome + CDP
const port = 9333 + Math.floor(Math.random() * 500);
const profile = join(outDir, ".chrome-profile");
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${DRIVE_WIDTH},${HEIGHT}`,
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
if (!targets?.length) {
  console.error(`probe-signup: no Chrome at 127.0.0.1:${port} — is CHROME= right? (${CHROME})`);
  chrome.kill();
  process.exit(2);
}
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
const waiters = new Set();
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  } else if (msg.method) {
    for (const w of waiters) w(msg);
  }
};
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
// Run one of the page functions below in the page. They are stringified, so
// they close over nothing here and take their arguments as one JSON value.
const run = async (fn, arg = null) => {
  const res = await send("Runtime.evaluate", {
    expression: `(${fn.toString()})(${JSON.stringify(arg)})`,
    returnByValue: true,
  });
  if (res.exceptionDetails) {
    const d = res.exceptionDetails;
    throw new Error(`${fn.name} threw in the page: ${d.exception?.description ?? d.text}`);
  }
  return res.result?.value;
};
const die = async (message) => {
  console.error(`\nprobe-signup: ${message}`);
  ws.close();
  chrome.kill();
  process.exit(2);
};
const warn = (message) => console.error(`  ! ${message}`);

// ------------------------------------------------------- functions in page
/* global document, window, getComputedStyle */

/** The live root of one screen: its mark seat's parent, or null if not live. */
function pageScreen(slot) {
  const seat = document.querySelector(`[data-mark-slot="${slot}"]`);
  const root = seat?.parentElement ?? null;
  return { found: !!root, live: !!root && !root.closest("[inert]") };
}

/** Click one control inside one screen. Never a bare document query. */
function pageClick(args) {
  const seat = document.querySelector(`[data-mark-slot="${args.slot}"]`);
  const root = seat?.parentElement;
  if (!root) return { ok: false, why: `no mark seat "${args.slot}" in the DOM` };
  if (root.closest("[inert]")) return { ok: false, why: `the "${args.slot}" screen is inert, so it is not the live step` };
  const candidates = [...root.querySelectorAll("button")];
  const match = (b) => {
    const label = (b.getAttribute("aria-label") ?? "").trim();
    if (args.aria) return label === args.aria;
    return (b.textContent ?? "").trim().toLowerCase().includes(args.text.toLowerCase());
  };
  const el = candidates.find(match);
  if (!el) {
    const seen = candidates.map((b) => (b.getAttribute("aria-label") ?? (b.textContent ?? "").trim()).slice(0, 24));
    return { ok: false, why: `nothing matching ${JSON.stringify(args.aria ?? args.text)} inside "${args.slot}" — saw [${seen.join(" | ")}]` };
  }
  if (el.disabled) return { ok: false, why: `${JSON.stringify(args.aria ?? args.text)} is disabled` };
  if (el.getBoundingClientRect().width === 0) return { ok: false, why: `${JSON.stringify(args.aria ?? args.text)} has no box` };
  el.click();
  return { ok: true, label: (el.getAttribute("aria-label") ?? (el.textContent ?? "").trim()).slice(0, 40) };
}

/** The agent cards, scoped to the chat screen so the thread bar's star is out of reach. */
function pageCards() {
  const root = document.querySelector('[data-mark-slot="personalize"]')?.parentElement;
  if (!root) return { found: 0, ready: 0, picked: 0 };
  const cards = [...root.querySelectorAll("button[aria-pressed]")].filter(
    (b) => !/dictate/i.test(b.getAttribute("aria-label") ?? "") && b.getBoundingClientRect().height > 40,
  );
  return {
    found: cards.length,
    ready: cards.filter((b) => !b.disabled).length,
    picked: cards.filter((b) => b.getAttribute("aria-pressed") === "true").length,
  };
}

/** Pick the first ready card. */
function pagePickCard() {
  const root = document.querySelector('[data-mark-slot="personalize"]')?.parentElement;
  if (!root) return { ok: false, why: "the chat screen has no mark seat" };
  const cards = [...root.querySelectorAll("button[aria-pressed]")].filter(
    (b) => !/dictate/i.test(b.getAttribute("aria-label") ?? "") && b.getBoundingClientRect().height > 40,
  );
  if (!cards.length) return { ok: false, why: "no agent cards inside the chat screen (the research pass may not have landed)" };
  const card = cards.find((b) => !b.disabled);
  if (!card) return { ok: false, why: `all ${cards.length} agent cards are still disabled` };
  card.click();
  return { ok: true, label: (card.textContent ?? "").trim().split("\n")[0].slice(0, 40), of: cards.length };
}

/** True once the app shell has arrived: the sidebar is on screen. */
function pageHandedOff() {
  const home = document.querySelector('a[aria-label="Hyperagent home"]');
  if (!home) return { handedOff: false, why: "no sidebar in the DOM" };
  const rect = home.getBoundingClientRect();
  return { handedOff: rect.right > 0 && rect.width >= 0 && rect.left > -400, left: Math.round(rect.left) };
}

/** Toggle the sidebar's collapse control, or say why it could not. */
function pageCollapseSidebar() {
  // "Hide sidebar" today; loose enough to survive a rename, tight enough not
  // to catch "Pin sidebar" / "Open sidebar", which do the opposite.
  const btn = [...document.querySelectorAll("button[aria-label]")].find((b) =>
    /\b(hide|collapse)\b[\w\s]*\bsidebar\b/i.test(b.getAttribute("aria-label") ?? ""),
  );
  if (!btn) return { ok: false, why: 'no button labelled "Hide sidebar" — the collapse control is not there yet' };
  btn.click();
  return { ok: true };
}

/** Toggle the thread bar's panel control, or say why it could not. */
function pageTogglePanel() {
  // "Open panel" unwired, "Hide agent panel" / "Show agent panel" wired — so
  // match the verb and the noun rather than a whole label, and prefer the one
  // carrying `aria-expanded`, which is the wired one. The panel's own drag
  // handle also says "panel" and is a div with role=separator, not a button.
  const candidates = [...document.querySelectorAll("button[aria-label]")].filter((b) => {
    const label = b.getAttribute("aria-label") ?? "";
    return /\b(open|close|hide|show)\b[\w\s]*\bpanel\b/i.test(label) && !/resize/i.test(label);
  });
  const btn = candidates.find((b) => b.hasAttribute("aria-expanded")) ?? candidates[0];
  if (!btn) return { ok: false, why: "no panel toggle in the thread bar yet" };
  const before = btn.getAttribute("aria-expanded");
  btn.click();
  return { ok: true, label: btn.getAttribute("aria-label"), ariaExpandedBefore: before };
}

/** All three scrollers, every time. See the trap at the top of this file. */
function pageScrollers() {
  return {
    y: Math.round(window.scrollY),
    doc: Math.round(document.documentElement.scrollTop),
    body: Math.round(document.body.scrollTop),
    docScrollH: document.documentElement.scrollHeight,
    bodyScrollH: document.body.scrollHeight,
    innerH: window.innerHeight,
  };
}

function pageResetScroll() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  return true;
}

function pageTheme(want) {
  document.documentElement.classList.toggle("dark", want === "dark");
  return document.documentElement.className;
}

/** Everything the plan's table asks for, taken in one pass. */
function pageMeasure() {
  const px = (n) => Math.round(n * 10) / 10;
  const out = { warnings: [] };
  const chat = document.querySelector('[data-mark-slot="personalize"]')?.parentElement ?? null;
  const main = document.querySelector("main");
  const stage = main?.querySelector(":scope > div.relative.grid") ?? chat?.closest("main > *") ?? null;
  if (!chat) out.warnings.push("no chat screen root");
  if (!main) out.warnings.push("no <main>");
  if (!stage) out.warnings.push("no stage (main > div.relative.grid)");

  out.viewport = { w: window.innerWidth, h: window.innerHeight };

  if (stage) {
    const r = stage.getBoundingClientRect();
    out.stage = { w: px(r.width), x: px(r.left), right: px(r.right) };
  }
  if (main) {
    const cs = getComputedStyle(main);
    out.main = { padL: px(parseFloat(cs.paddingLeft)), padR: px(parseFloat(cs.paddingRight)) };
  }

  // The card grid. Scoped to the chat screen, and the composer's dictate
  // button (also aria-pressed) is filtered out by its label and its height.
  if (chat) {
    const cards = [...chat.querySelectorAll("button[aria-pressed]")].filter(
      (b) => !/dictate/i.test(b.getAttribute("aria-label") ?? "") && b.getBoundingClientRect().height > 40,
    );
    let grid = cards[0]?.parentElement ?? null;
    while (grid && grid !== chat && getComputedStyle(grid).display !== "grid") grid = grid.parentElement;
    out.grid = {
      templateColumns: grid ? getComputedStyle(grid).gridTemplateColumns : null,
      cards: cards.map((b) => {
        const r = b.getBoundingClientRect();
        return { w: px(r.width), h: px(r.height), picked: b.getAttribute("aria-pressed") === "true" };
      }),
    };

    const h1 = chat.querySelector("h1");
    if (h1) {
      const cs = getComputedStyle(h1);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      const h = h1.getBoundingClientRect().height;
      out.h1 = { h: px(h), lineHeight: px(lh), lines: Math.max(1, Math.round(h / lh)) };
    } else out.warnings.push("no h1 in the chat screen");

    // The composer: found through its send button, since it exposes no handle.
    const sendBtn = chat.querySelector('button[aria-label="Send message"]');
    let composer = sendBtn?.closest(".rounded-5xl") ?? null;
    if (!composer && sendBtn) {
      let el = sendBtn;
      while (el.parentElement && el.parentElement !== chat) el = el.parentElement;
      composer = el.firstElementChild ?? el;
    }
    // Both heights: the composer's own box, and the growing field inside it
    // (the figure the plan's diagnosis table carries, 52px lower).
    const field = chat.querySelector('textarea[aria-label="Message the agent"]');
    out.composer = composer
      ? { h: px(composer.getBoundingClientRect().height), fieldH: field ? px(field.getBoundingClientRect().height) : null }
      : null;
    if (!composer) out.warnings.push("no composer (no Send message button in the chat screen)");

    // Content escaping its box, anywhere in the live column. Two things are
    // NOT escapes and both report a wider scroll area than client area, so
    // both are filtered out or the check cries wolf at every width: a
    // deliberate scroller (overflow auto/scroll), and a deliberate truncation
    // (`truncate` — overflow hidden plus an ellipsis — which is a label
    // choosing to clip, not a box being overrun).
    const escaped = [];
    const walk = (el) => {
      for (const child of el.children) {
        if (child.hasAttribute("inert")) continue;
        const over = child.scrollWidth - child.clientWidth;
        if (over > 1 && child.clientWidth > 0) {
          const cs = getComputedStyle(child);
          const ox = cs.overflowX;
          const truncating = ox === "hidden" && cs.textOverflow === "ellipsis";
          if (ox !== "auto" && ox !== "scroll" && !truncating) {
            const cls = (child.getAttribute("class") ?? "").split(/\s+/).filter(Boolean).slice(0, 3).join(".");
            const text = (child.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 28);
            escaped.push({
              what: `${child.tagName.toLowerCase()}${cls ? "." + cls : ""}${text ? ` "${text}"` : ""}`,
              client: child.clientWidth,
              scroll: child.scrollWidth,
              over: Math.round(over),
            });
          }
        }
        walk(child);
      }
    };
    walk(chat);
    out.escaped = escaped;
  }

  // The two chrome columns. The sidebar reports no width, so it is measured:
  // its column carries an inline width, and its wrapper sits at left: 0.
  const home = document.querySelector('a[aria-label="Hyperagent home"]');
  let sideEl = home?.closest("div[style*='width']") ?? null;
  if (!sideEl && home) {
    let el = home;
    while (el.parentElement && !(getComputedStyle(el).position === "absolute" && el.getBoundingClientRect().left <= 1)) {
      el = el.parentElement;
    }
    sideEl = el;
  }
  if (sideEl) {
    const r = sideEl.getBoundingClientRect();
    out.sidebar = { w: px(r.width), x: px(r.left), right: px(r.right), onScreen: r.right > 0 };
    // Is the shell still IN the handoff state? A dev-server recompile resets
    // React state and puts the page back on the sign-in step, and every number
    // measured after that is a lie about a screen nobody asked for. No box at
    // all is the media query below `md`; a full box parked at or past the left
    // edge is the sidebar slid out, which after the handoff means it is gone.
    out.shell = r.width === 0 ? "hidden-below-md" : r.right > 0 ? "entered" : "gone";
  } else {
    out.sidebar = null;
    out.shell = "absent";
  }

  const panelEl = document.querySelector('aside[aria-label="Agent configuration"]');
  if (panelEl) {
    const r = panelEl.getBoundingClientRect();
    // width 0 means `hidden md:flex` has it out of the layout entirely; a full
    // width parked at the right edge means it is slid shut.
    const boxed = r.width > 0;
    const visible = boxed && r.left < window.innerWidth - 1;
    // Docked means <main> reserves the panel's column; floating means the
    // panel is over the conversation instead of beside it.
    const padR = out.main?.padR ?? 0;
    out.panel = {
      x: px(r.left),
      w: px(r.width),
      visible,
      overlapsColumn: !!out.stage && r.left < out.stage.right - 1,
      mode: !boxed ? "hidden" : !visible ? "closed" : padR + 1 >= r.width ? "docked" : "floating",
    };
  } else {
    out.panel = { visible: false, mode: "absent" };
    out.warnings.push("no agent panel in the DOM");
  }

  const seat = document.querySelector('[data-mark-slot="personalize"]');
  out.markTop = seat ? px(seat.getBoundingClientRect().top) : null;

  out.scroll = {
    y: Math.round(window.scrollY),
    doc: Math.round(document.documentElement.scrollTop),
    body: Math.round(document.body.scrollTop),
    docScrollH: document.documentElement.scrollHeight,
    bodyScrollH: document.body.scrollHeight,
    innerH: window.innerHeight,
  };
  return out;
}

// -------------------------------------------------------------- driving it
const waitFor = async (label, predicate, timeout = 25000, step = 150) => {
  const t0 = Date.now();
  for (;;) {
    const value = await predicate();
    if (value) return { value, ms: Date.now() - t0 };
    if (Date.now() - t0 > timeout) await die(`timed out after ${timeout}ms waiting for ${label}`);
    await sleep(step);
  }
};
const clickOrDie = async (args, what) => {
  const res = await run(pageClick, args);
  if (!res.ok) await die(`could not click ${what}: ${res.why}`);
  console.error(`  · clicked ${what} (${res.label})`);
};
const applyTheme = () => run(pageTheme, theme);
const settle = async (ms) => {
  await evaluate("document.fonts.ready.then(() => true)", true);
  await sleep(ms);
};

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: DRIVE_WIDTH, height: HEIGHT, deviceScaleFactor: DPR, mobile: false });

console.error(`probe-signup: ${base}/signup · ${theme} · ${HEIGHT}px tall · driving at ${DRIVE_WIDTH}`);
const loaded = waitEvent("Page.loadEventFired", 120000);
await send("Page.navigate", { url: `${base}/signup` });
await loaded;
await applyTheme();
await settle(900);

// 1. Sign in with Google → the loading screen (~4.6s) → the profile screen.
await clickOrDie({ slot: "signin", text: "Sign in with Google" }, '"Sign in with Google"');
const profileReady = await waitFor("the profile screen to become the live step", async () => {
  const s = await run(pageScreen, "profile");
  return s.live;
});
console.error(`  · profile screen live after ${profileReady.ms}ms`);
await sleep(400);

// 2. The profile step's CTA → the research pass (~10.5s) → four cards that answer.
await clickOrDie({ slot: "profile", text: "Find agents for me" }, '"Find agents for me"');
const chatReady = await waitFor("the chat screen to become the live step", async () => {
  const s = await run(pageScreen, "personalize");
  return s.live;
});
console.error(`  · chat screen live after ${chatReady.ms}ms`);
let cards = null;
const t0Cards = Date.now();
while (Date.now() - t0Cards < 30000) {
  cards = await run(pageCards);
  if (cards.found > 0 && cards.ready === cards.found) break;
  await sleep(150);
}
if (!cards?.ready) await die("the research pass landed no clickable agent card in 30s");
if (cards.ready < cards.found) warn(`only ${cards.ready} of ${cards.found} cards came ready`);
console.error(`  · ${cards.ready}/${cards.found} cards ready after ${Date.now() - t0Cards}ms`);
await sleep(400);

// 3. Pick a card — it fills the composer — then send, which brings the shell in.
const picked = await run(pagePickCard);
if (!picked.ok) await die(`could not pick an agent card: ${picked.why}`);
console.error(`  · picked card 1 of ${picked.of} (${picked.label})`);
await waitFor("a card to report aria-pressed=true", async () => (await run(pageCards)).picked > 0, 5000);
await sleep(300);
await clickOrDie({ slot: "personalize", aria: "Send message" }, "the composer's send button");
const handoff = await waitFor("the app shell to arrive", async () => (await run(pageHandedOff)).handedOff, 10000);
console.error(`  · shell arrived after ${handoff.ms}ms`);
await settle(900);

// 4. The optional shell states. Both controls belong to work that is landing
//    right now, so a missing one is a warning and the sweep goes on without it.
const applied = { sidebarCollapsed: false, panelClosed: false };
if (wantSidebarCollapsed) {
  const before = (await run(pageMeasure)).sidebar?.w ?? null;
  if (before !== null && before <= 80) {
    applied.sidebarCollapsed = true;
    console.error(`  · sidebar is already the ${before}px rail`);
  }
}
if (wantSidebarCollapsed && !applied.sidebarCollapsed) {
  const before = (await run(pageMeasure)).sidebar?.w ?? null;
  const res = await run(pageCollapseSidebar);
  if (!res.ok) warn(`--sidebar-collapsed: ${res.why}; sweeping with the sidebar as it is`);
  else {
    await sleep(600);
    const after = (await run(pageMeasure)).sidebar?.w ?? null;
    if (after !== null && before !== null && after < before) {
      applied.sidebarCollapsed = true;
      console.error(`  · sidebar collapsed ${before} → ${after}`);
    } else warn(`--sidebar-collapsed: clicked the control and the sidebar stayed at ${after}px — not wired yet?`);
  }
}
if (wantPanelClosed) {
  const shut = await run(pageMeasure);
  if (shut.panel && !shut.panel.visible) {
    applied.panelClosed = true;
    console.error(`  · panel is already ${shut.panel.mode} at the drive width`);
  }
}
if (wantPanelClosed && !applied.panelClosed) {
  const before = await run(pageMeasure);
  const res = await run(pageTogglePanel);
  if (!res.ok) warn(`--panel-closed: ${res.why}; sweeping with the panel open`);
  else {
    await sleep(700);
    const after = await run(pageMeasure);
    if (before.panel?.visible && !after.panel?.visible) {
      applied.panelClosed = true;
      console.error(`  · panel closed (${res.label})`);
    } else warn(`--panel-closed: clicked ${JSON.stringify(res.label)} and the panel did not move — the toggle is not wired yet`);
  }
}

// ------------------------------------------------------------- the sweep
const wheelAt = (x, y, deltaY) =>
  send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: Math.max(1, Math.round(x)),
    y: Math.max(1, Math.round(y)),
    deltaX: 0,
    deltaY,
    button: "none",
    modifiers: 0,
    pointerType: "mouse",
  });
const worst = (s) => Math.max(s.y, s.doc, s.body);
/** A real wheel, over two points, on all three scrollers. The only proof. */
const wheelTest = async (m, height) => {
  const cx = m.stage ? m.stage.x + m.stage.w / 2 : m.viewport.w / 2;
  const gutter = m.stage ? m.stage.x - 6 : 6;
  let moved = { y: 0, doc: 0, body: 0 };
  for (const x of [cx, gutter]) {
    await wheelAt(x, height / 2, 420);
    await sleep(320);
    const after = await run(pageScrollers);
    if (worst(after) > worst(moved)) moved = { y: after.y, doc: after.doc, body: after.body };
    await wheelAt(x, height / 2, -1200);
    await sleep(200);
    await run(pageResetScroll);
  }
  return moved;
};

const rows = [];
for (const width of WIDTHS) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: HEIGHT, deviceScaleFactor: DPR, mobile: false });
  await applyTheme();
  await settle(550);
  await run(pageResetScroll);
  await sleep(120);
  const m = await run(pageMeasure);
  const wheel = await wheelTest(m, HEIGHT);
  await run(pageResetScroll);
  await sleep(150);
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(outDir, theme, `w${width}.png`), Buffer.from(data, "base64"));
  rows.push({ width, ...m, wheel });
  console.error(`  · ${width} measured${m.shell === "entered" ? "" : ` (shell: ${m.shell})`}`);
  for (const w of m.warnings) warn(`${width}: ${w}`);
}

// ------------------------------------------------------------------ output
const n = (v, d = 0) => (v === null || v === undefined ? "—" : Number(v).toFixed(d));
const cols = (t) => {
  if (!t || t === "none") return "—";
  const parts = t.split(/\s+/).map((p) => (Number.isFinite(parseFloat(p)) ? Math.round(parseFloat(p)) : p));
  return parts.join("+");
};
const HEAD = [
  "vw", "stage", "x", "padL", "padR", "grid-template-cols", "card w×h", "h1", "ln",
  "comp", "side", "panel x/w", "mode", "y/doc/body", "wheel", "esc", "mark",
];
const body = rows.map((r) => {
  const card = r.grid?.cards?.[0];
  const moved = worst(r.wheel);
  return [
    String(r.width),
    n(r.stage?.w),
    n(r.stage?.x),
    n(r.main?.padL),
    n(r.main?.padR),
    cols(r.grid?.templateColumns),
    card ? `${n(card.w)}×${n(card.h)}${r.grid.cards.length > 2 ? ` ×${r.grid.cards.length}` : ""}` : "—",
    n(r.h1?.h),
    r.h1 ? String(r.h1.lines) : "—",
    n(r.composer?.h),
    r.sidebar?.onScreen ? n(r.sidebar.w) : "—",
    r.panel?.visible ? `${n(r.panel.x)}/${n(r.panel.w)}` : "—",
    r.panel?.mode ?? "—",
    `${r.scroll.y}/${r.scroll.doc}/${r.scroll.body}`,
    moved ? `+${moved}` : "no",
    String(r.escaped?.length ?? 0),
    n(r.markTop),
  ];
});
const widths = HEAD.map((h, i) => Math.max(h.length, ...body.map((r) => r[i].length)));
const LEFT = new Set([5, 6, 11, 12, 13, 14]);
const line = (cells) => cells.map((c, i) => (LEFT.has(i) ? c.padEnd(widths[i]) : c.padStart(widths[i]))).join("  ").trimEnd();

console.log("");
console.log(`/signup, handoff state · ${base} · ${theme} · ${HEIGHT}px tall · DPR ${DPR}`);
console.log(
  `sidebar ${wantSidebarCollapsed ? (applied.sidebarCollapsed ? "collapsed" : "collapse REQUESTED but not applied") : "as it comes"}` +
    ` · panel ${wantPanelClosed ? (applied.panelClosed ? "closed" : "close REQUESTED but not applied") : "as it comes"}`,
);
console.log("");
console.log(line(HEAD));
console.log(widths.map((w) => "─".repeat(w)).join("  "));
for (const r of body) console.log(line(r));
console.log("");
console.log("y/doc/body = window.scrollY / documentElement.scrollTop / body.scrollTop at rest; wheel = the worst of the three after a real wheel.");

const escapes = rows.filter((r) => r.escaped?.length);
if (escapes.length) {
  console.log("");
  console.log("Content escaping its box:");
  for (const r of escapes) {
    for (const e of r.escaped.slice(0, 4)) {
      console.log(`  ${String(r.width).padStart(4)}  +${String(e.over).padStart(4)}px  ${e.client}→${e.scroll}  ${e.what}`);
    }
    if (r.escaped.length > 4) console.log(`  ${String(r.width).padStart(4)}  … and ${r.escaped.length - 4} more, all of them in probe.json`);
  }
}

// A row taken after the shell fell out of the handoff state describes a
// different screen, so the whole run is unsound rather than failing.
const lostShell = rows.filter((r) => r.shell === "gone" || r.shell === "absent");
if (lostShell.length) {
  console.log("");
  console.log(`UNSOUND: the app shell was not in the handoff state at ${lostShell.map((r) => r.width).join(", ")}.`);
  console.log("A dev-server recompile resets React state and puts /signup back on the sign-in step —");
  console.log("every number above from those widths describes the wrong screen. Re-run the probe.");
  console.log(`RESULT: UNSOUND — ${lostShell.length} of ${rows.length} widths lost the handoff state`);
  writeJson([], false, lostShell.map((r) => r.width));
  ws.close();
  chrome.kill();
  process.exit(2);
}

// The plan's three criteria, each named with the widths that break it.
const dockedThin = rows.filter((r) => r.panel?.mode === "docked" && (r.stage?.w ?? 0) < COLUMN_FLOOR);
const scrolls = rows.filter(
  (r) => r.width >= NO_SCROLL_ABOVE && (r.scroll.y || r.scroll.doc || r.scroll.body || worst(r.wheel)),
);
const leaks = rows.filter((r) => r.escaped?.length);
const dockedRows = rows.filter((r) => r.panel?.mode === "docked");
const minDocked = dockedRows.length ? Math.min(...dockedRows.map((r) => r.stage?.w ?? 0)) : null;
const verdicts = [
  [
    !dockedThin.length,
    `column ≥ ${COLUMN_FLOOR} while docked`,
    dockedThin.length
      ? `${dockedThin.map((r) => `${r.width}→${n(r.stage?.w)}`).join(", ")}`
      : dockedRows.length
        ? `min ${n(minDocked)} across ${dockedRows.length} docked width${dockedRows.length === 1 ? "" : "s"}`
        : "no docked width in this sweep",
  ],
  [
    !scrolls.length,
    `no scroll at any width ≥ ${NO_SCROLL_ABOVE}`,
    scrolls.length
      ? scrolls.map((r) => `${r.width} moves ${Math.max(r.scroll.y, r.scroll.doc, r.scroll.body, worst(r.wheel))}px`).join(", ")
      : `${rows.filter((r) => r.width >= NO_SCROLL_ABOVE).length} widths still under a real wheel`,
  ],
  [
    !leaks.length,
    "nothing escapes its box",
    leaks.length ? leaks.map((r) => `${r.width}×${r.escaped.length}`).join(", ") : "checked every element in the live column",
  ],
];
console.log("");
for (const [ok, what, detail] of verdicts) console.log(`${ok ? "PASS" : "FAIL"}  ${what.padEnd(34)} ${detail}`);
const failed = verdicts.filter(([ok]) => !ok).length;
console.log(`RESULT: ${failed ? `FAIL — ${failed} of ${verdicts.length} criteria` : `PASS — ${verdicts.length} of ${verdicts.length} criteria`}`);

function writeJson(verdicts, pass, unsound) {
  writeFileSync(
  join(outDir, "probe.json"),
  JSON.stringify(
    {
      base,
      theme,
      height: HEIGHT,
      dpr: DPR,
      driveWidth: DRIVE_WIDTH,
      widths: WIDTHS,
      requested: { sidebarCollapsed: wantSidebarCollapsed, panelClosed: wantPanelClosed },
      applied,
      criteria: { columnFloor: COLUMN_FLOOR, noScrollAtOrAbove: NO_SCROLL_ABOVE },
      verdicts: verdicts.map(([ok, what, detail]) => ({ ok, what, detail })),
      pass,
      unsound,
      takenAt: new Date().toISOString(),
      rows,
    },
    null,
    2,
  ) + "\n",
  );
  console.log(`\n${join(outDir, "probe.json")} · ${WIDTHS.length} screenshots in ${join(outDir, theme)}/`);
}
writeJson(verdicts, !failed, false);

ws.close();
chrome.kill();
process.exit(failed ? 1 : 0);
