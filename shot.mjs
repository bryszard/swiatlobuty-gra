import { chromium } from "playwright-core";
const [,, hash, script, out] = process.argv;
const exe = "/Users/pedro/Private/Projects/music/video/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const b = await chromium.launch({ executablePath: exe, args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = [];
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(m.type() + ": " + m.text()); });
page.on("pageerror", (e) => errs.push("PAGEERR " + e.message));
await page.goto(hash.startsWith("file") ? hash : "http://127.0.0.1:5173/" + hash);
await page.waitForTimeout(1200);
for (const s of JSON.parse(script)) {
  if (s.w) await page.waitForTimeout(s.w * 1000);
  if (s.click) await page.mouse.click(s.click[0], s.click[1]);
  if (s.down) await page.keyboard.down(s.down);
  if (s.up) await page.keyboard.up(s.up);
  if (s.key) await page.keyboard.press(s.key);
  if (s.shot) await page.screenshot({ path: `${out}_${s.shot}.png` });
  if (s.eval) console.log("eval:", await page.evaluate(s.eval));
}
console.log("ERRORS:", JSON.stringify(errs.slice(0, 10)));
await b.close();
