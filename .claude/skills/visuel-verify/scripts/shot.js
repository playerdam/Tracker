#!/usr/bin/env node
// Skærmbillede af én view i Craft Tracker, kørt mod test/stub-server.js.
// Fejler (exit 1) hvis der var en uopfanget JS-fejl — et pænt billede med en
// død app er stadig en fejl.
//
//   node .claude/skills/visuel-verify/scripts/shot.js [view] [flag...]
//
//   view    vagt (default) | stats | vin | feed | profile | history | social | lab
//   --dark  mørkt tema          --en     engelsk UI
//   --full  hele siden          --out F  filsti til PNG
//   --state F   JSON-fil der bruges som mise_state_v2 i stedet for demo-data
//   --wait N    ekstra ventetid i ms efter navigation (default 400)

const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");
const { chromium } = require(path.join(__dirname, "..", "..", "..", "..", "node_modules", "playwright"));

const PORT = 3199;
const ROOT = path.join(__dirname, "..", "..", "..", "..");

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const view = (argv.find((a) => !a.startsWith("--") && argv[argv.indexOf(a) - 1] !== "--out"
  && argv[argv.indexOf(a) - 1] !== "--state" && argv[argv.indexOf(a) - 1] !== "--wait") || "vagt");

// Bund-nav har data-tab; resten ligger bag burger-menuen.
const BNAV = { vagt: "vagt", stats: "stats", vin: "vin", feed: "feed" };
const DRAWER = { profile: "#menuDrawerProfile", history: "#menuDrawerHistory", social: "#menuDrawerSocial", lab: "#menuDrawerLab" };

if (!BNAV[view] && !DRAWER[view]) {
  console.error(`Ukendt view "${view}". Vælg: ${[...Object.keys(BNAV), ...Object.keys(DRAWER)].join(", ")}`);
  process.exit(2);
}

const DEMO_STATE = {
  counters: [
    { id: "c1", label: "Østers åbnet", count: 240, unit: "stk", cat: "aabnet-mad", subs: [] },
    { id: "c2", label: "Løg snittet", count: 78, unit: "stk", cat: "snittet", subs: [] },
    { id: "c3", label: "Couverter", count: 512, unit: "stk", cat: "service", subs: [] },
  ],
  wines: [], log: [], customCats: [], shiftHistory: [], _updatedAt: Date.now(),
};

async function stubKlar() {
  try {
    const r = await fetch(`http://localhost:${PORT}/api/health`);
    return r.ok;
  } catch { return false; }
}

async function sikreStub() {
  if (await stubKlar()) return null;
  const p = spawn("node", [path.join(ROOT, "test", "stub-server.js")], { cwd: ROOT, stdio: "ignore", detached: false });
  // Stub-serveren er oppe på under et sekund; 10 s giver luft på en kold maskine.
  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 200));
    if (await stubKlar()) return p;
  }
  p.kill();
  throw new Error("stub-server startede ikke på port " + PORT);
}

(async () => {
  const stub = await sikreStub();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  const state = flag("--state") ? JSON.parse(fs.readFileSync(val("--state"), "utf8")) : DEMO_STATE;
  await page.addInitScript(([st, theme, lang]) => {
    const now = Date.now();
    localStorage.setItem("mise_session", JSON.stringify({ access_token: "demo", refresh_token: "demo", expires_at: now + 86400000 }));
    localStorage.setItem("mise_onboarded", "1");
    localStorage.setItem("mise_state_v2", JSON.stringify(st));
    localStorage.setItem("mise_theme", theme);
    localStorage.setItem("mise_lang", lang);
    localStorage.removeItem("mise_shift");
  }, [state, flag("--dark") ? "dark" : "light", flag("--en") ? "en" : "da"]);

  const jsFejl = [], konsolFejl = [];
  page.on("pageerror", (e) => jsFejl.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") konsolFejl.push(m.text()); });

  await page.goto(`http://localhost:${PORT}/`);
  await page.locator("#vagtDash .vd2-hero").waitFor({ state: "visible", timeout: 15000 });

  if (view !== "vagt") {
    if (BNAV[view]) {
      await page.locator(`.bnav-btn[data-tab="${view}"]`).click();
    } else {
      await page.locator("#burgerBtn").click();
      await page.waitForTimeout(250);
      await page.locator(DRAWER[view]).click();
    }
  }
  await page.waitForTimeout(Number(val("--wait", "400")));

  const ud = val("--out", path.join(os.tmpdir(), "craft-shots", `${view}${flag("--dark") ? "-dark" : ""}${flag("--en") ? "-en" : ""}.png`));
  fs.mkdirSync(path.dirname(ud), { recursive: true });
  await page.screenshot({ path: ud, fullPage: flag("--full") });

  // Sandheden om layout — ikke gætværk ud fra pixels.
  // Sandheden om layout — aflæst, ikke gættet ud fra pixels.
  // Kun synlige elementer i den aktive view tæller; skjulte views ligger uden for
  // skærmen med vilje og er ikke overflow.
  const maal = await page.evaluate(() => {
    const doc = document.documentElement;
    // Skjulte paneler (profil-overlay, drawers) ligger til højre uden for skærmen
    // med transform — de er "synlige" for offsetParent, men starter uden for kanten.
    const synlig = (e) => {
      const r = e.getBoundingClientRect();
      return e.offsetParent !== null && r.width > 0 && r.left < doc.clientWidth
        && r.bottom > 0 && r.top < window.innerHeight;
    };
    const iAktivView = (e) => { const v = e.closest(".view"); return !v || v.classList.contains("active"); };
    // Et element der bevidst ikke tager imod tryk (skjult toast, dekoration) er
    // ikke et tryk-mål og skal ikke måles som et.
    const trykbar = (e) => getComputedStyle(e).pointerEvents !== "none";
    return {
      scrollW: doc.scrollWidth,
      clientW: doc.clientWidth,
      overflow: [...document.querySelectorAll("body *")]
        .filter((e) => synlig(e) && iAktivView(e) && e.getBoundingClientRect().right > doc.clientWidth + 1)
        .slice(0, 5).map((e) => `${e.tagName.toLowerCase()}.${(e.className || "").toString().split(" ")[0]}`),
      // Det faktiske tryk-areal, ikke knappens boks: et hit-areal udvidet med et
      // pseudo-element tæller med. Vi spørger browseren hvad der rammes i de fire
      // hjørner af et 44x44-felt om knappens midte (Apple HIG).
      smaaMaal: [...document.querySelectorAll("button, a, [role=button]")]
        .filter((e) => synlig(e) && iAktivView(e) && trykbar(e))
        .map((e) => {
          const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const rammer = (x, y) => {
            const t = document.elementFromPoint(Math.max(1, Math.min(doc.clientWidth - 1, x)), Math.max(1, Math.min(window.innerHeight - 1, y)));
            return !!t && (t === e || e.contains(t) || t.contains(e));
          };
          // Kantmidter, ikke hjørner: en rund knap har ikke hjørner, og et
          // hjørnepunkt ville melde falsk alarm på hver cirkel i UI'et.
          const ok = rammer(cx - 21, cy) && rammer(cx + 21, cy) && rammer(cx, cy - 21) && rammer(cx, cy + 21);
          return ok ? null : `${(e.id || e.className || e.tagName).toString().split(" ")[0]} ${Math.round(r.width)}x${Math.round(r.height)}`;
        })
        .filter(Boolean).slice(0, 8),
      udenNavn: [...document.querySelectorAll("button, [role=button]")]
        .filter((e) => synlig(e) && iAktivView(e) && !e.textContent.trim() && !e.getAttribute("aria-label"))
        .slice(0, 5).map((e) => (e.id || e.className || e.tagName).toString().split(" ")[0]),
    };
  });

  await browser.close();
  if (stub) stub.kill();

  console.log(`PNG:        ${ud}`);
  console.log(`Vandret:    scrollWidth=${maal.scrollW} clientWidth=${maal.clientW}${maal.scrollW > maal.clientW ? "  ⚠ VANDRET OVERFLOW" : "  ok"}`);
  if (maal.overflow.length) console.log(`Stikker ud: ${maal.overflow.join(", ")}`);
  if (maal.smaaMaal.length) console.log(`Tryk-areal under 44x44 (Apple HIG):\n  - ${maal.smaaMaal.join("\n  - ")}`);
  if (maal.udenNavn.length) console.log(`Knap uden navn (ingen tekst/aria-label): ${maal.udenNavn.join(", ")}`);
  if (konsolFejl.length) console.log(`Konsolfejl: ${konsolFejl.length}\n  - ${konsolFejl.slice(0, 5).join("\n  - ")}`);
  if (jsFejl.length) { console.log(`JS-FEJL:    ${jsFejl.length}\n  - ${jsFejl.join("\n  - ")}`); process.exit(1); }
  console.log("JS-fejl:    ingen");
})().catch((e) => { console.error("shot.js fejlede:", e.message); process.exit(1); });
