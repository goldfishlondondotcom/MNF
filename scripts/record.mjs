// Renders the sequence to an MP4 for WhatsApp.
//
//   npm run record                 -> output/mnf-team-news.mp4
//   npm run record -- --fps 60     -> smoother, bigger file
//
// It steps through the animation one frame at a time and takes a screenshot
// of each, so the video is perfectly smooth however fast the computer is.
// If audio/music.mp3 exists it is added as a soundtrack (faded out at the end).
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf("--" + name);
  return i >= 0 ? args[i + 1] : fallback;
};
const fps = Number(opt("fps", 30));
const out = path.resolve(root, opt("out", "output/mnf-team-news.mp4"));
const music = path.join(root, "audio", "music.mp3");

mkdirSync(path.dirname(out), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on("console", (m) => m.type() === "warning" && console.warn("  page:", m.text()));
await page.goto(pathToFileURL(path.join(root, "index.html")).href + "?record");
await page.waitForFunction(() => window.MNF && window.MNF.ready);
const duration = await page.evaluate(() => window.MNF.timeline.duration());
const frames = Math.ceil(duration * fps);
console.log(`Rendering ${duration.toFixed(1)}s at ${fps}fps (${frames} frames)...`);

const ffArgs = ["-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(fps), "-i", "-"];
if (existsSync(music)) {
  ffArgs.push("-i", music, "-map", "0:v", "-map", "1:a", "-af", `afade=t=out:st=${Math.max(0, duration - 2)}:d=2`, "-c:a", "aac", "-b:a", "160k", "-shortest");
}
ffArgs.push("-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out);

const ff = spawn("ffmpeg", ffArgs, { stdio: ["pipe", "inherit", "inherit"] });
const ffDone = new Promise((resolve, reject) => ff.on("close", (code) => (code === 0 ? resolve() : reject(new Error("ffmpeg exited with " + code)))));

for (let f = 0; f < frames; f++) {
  await page.evaluate((t) => window.MNF.seek(t), f / fps);
  const shot = await page.screenshot({ type: "jpeg", quality: 92 });
  if (!ff.stdin.write(shot)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % fps === 0) process.stdout.write(`\r  ${Math.round((f / frames) * 100)}%`);
}
ff.stdin.end();
await ffDone;
await browser.close();
console.log(`\r  100%\nSaved ${path.relative(process.cwd(), out)}`);
