const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../../app");
const dst = path.join(__dirname, "../www");

if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });

// mise.html → index.html (Capacitor entry point)
const html = fs.readFileSync(path.join(src, "mise.html"), "utf8");
fs.writeFileSync(path.join(dst, "index.html"), html);

// app.js: inject the Railway backend URL so the app works outside a browser
let js = fs.readFileSync(path.join(src, "app.js"), "utf8");
js = js.replace('const API_BASE="";', 'const API_BASE="https://tracker-production-1a62.up.railway.app";');
fs.writeFileSync(path.join(dst, "app.js"), js);

// Other web assets
for (const f of ["styles.css", "manifest.json", "sw.js", "privacy.html", "terms.html"]) {
  fs.copyFileSync(path.join(src, f), path.join(dst, f));
}

// icons/
const iconsDst = path.join(dst, "icons");
if (!fs.existsSync(iconsDst)) fs.mkdirSync(iconsDst, { recursive: true });
for (const f of fs.readdirSync(path.join(src, "icons"))) {
  fs.copyFileSync(path.join(src, "icons", f), path.join(iconsDst, f));
}

console.log("Build OK → www/index.html + app.js + styles.css");
