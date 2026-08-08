// Tæller CURRENT_PROJECT_VERSION (iOS build-nummer) op med 1 i Xcode-projektet.
// Hvert TestFlight/App Store-upload SKAL have et unikt build-nummer, ellers
// afviser Apple det. Køres automatisk af `npm run ios:release`.
const fs = require("fs");
const path = require("path");

const pbx = path.join(__dirname, "../ios/App/App.xcodeproj/project.pbxproj");
let src = fs.readFileSync(pbx, "utf8");

// Find nuværende build-nummer (kan optræde flere gange — de skal alle være ens)
const m = src.match(/CURRENT_PROJECT_VERSION = (\d+);/);
if (!m) { console.error("✗ CURRENT_PROJECT_VERSION ikke fundet i project.pbxproj"); process.exit(1); }

const current = parseInt(m[1], 10);
const next = current + 1;
src = src.replace(/CURRENT_PROJECT_VERSION = \d+;/g, `CURRENT_PROJECT_VERSION = ${next};`);
fs.writeFileSync(pbx, src);

console.log(`Build-nummer: ${current} → ${next}`);
