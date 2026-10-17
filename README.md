# MNF Team News

A Sky Sports-style team news video for Monday Night Football. It shows an intro, then each team's players being revealed one by one onto a pitch, then a head-to-head "VS" screen. It's rendered as an MP4 to share on WhatsApp.

## Each week

1. **Edit `lineup.js`.** Update the date, the team names and colours, and the players. The file has instructions at the top. Works for 5, 6, 7 or 8 a side.
2. **Add photos (optional).** Put them in the `photos/` folder and set `photo: "photos/name.jpg"` for each player. Square headshots work best. Anyone without a photo gets a placeholder.
3. **Preview.** Double-click `index.html` to watch it in your browser. Press space or click to replay.
4. **Make the video.** Run `npm run record` and the video is saved to `output/mnf-team-news.mp4`.

### Music (optional)

Drop a track into `audio/music.mp3` and the video will include it, fading out at the end.

## First-time setup (only needed to make videos on your own computer)

1. Install [Node.js](https://nodejs.org) and [ffmpeg](https://ffmpeg.org/download.html).
2. In this folder, run `npm install`, then `npx playwright install chromium`.

Or just ask Claude to update the lineup and render the video for you.

## How it works

| File | What it does |
|---|---|
| `lineup.js` | This week's teams (the only file you normally edit) |
| `index.html`, `style.css` | The layout and look |
| `app.js` | Builds the scenes and the animation (using [GSAP](https://gsap.com)) |
| `scripts/record.mjs` | Steps through the animation frame by frame and turns it into an MP4 |
