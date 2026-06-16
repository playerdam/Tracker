const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../../app");
const dst = path.join(__dirname, "../www");

if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });

// mise.html → index.html (Capacitor entry point)
fs.copyFileSync(path.join(src, "mise.html"), path.join(dst, "index.html"));

// Other web assets
for (const f of ["manifest.json", "sw.js"]) {
  fs.copyFileSync(path.join(src, f), path.join(dst, f));
}

// icons/
const iconsDst = path.join(dst, "icons");
if (!fs.existsSync(iconsDst)) fs.mkdirSync(iconsDst, { recursive: true });
for (const f of fs.readdirSync(path.join(src, "icons"))) {
  fs.copyFileSync(path.join(src, "icons", f), path.join(iconsDst, f));
}

console.log("Build OK → www/index.html");
