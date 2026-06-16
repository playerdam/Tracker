// Generates a 1024x1024 PNG icon for @capacitor/assets
// Uses Canvas API via node-canvas, or falls back to a simple SVG→PNG via sips (macOS)
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const svgSrc = path.join(__dirname, "../../app/icons/icon.svg");
const pngDst = path.join(__dirname, "../assets/icon.png");
const splashDst = path.join(__dirname, "../assets/splash.png");

// macOS sips can convert SVG → PNG at a given size
function svgToPng(svgPath, outPath, size) {
  const tmp = outPath + ".tmp.svg";
  fs.copyFileSync(svgPath, tmp);
  execSync(`sips -s format png -z ${size} ${size} "${tmp}" --out "${outPath}"`, { stdio: "pipe" });
  fs.unlinkSync(tmp);
}

console.log("Generating icon.png (1024x1024)...");
svgToPng(svgSrc, pngDst, 1024);

// Splash: same icon on white background — @capacitor/assets handles the rest
console.log("Generating splash.png (2732x2732)...");
svgToPng(svgSrc, splashDst, 2732);

console.log("Icons generated in assets/");
