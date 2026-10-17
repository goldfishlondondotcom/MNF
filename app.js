// Builds the team news sequence from lineup.js and animates it with GSAP.
// Everything runs on one GSAP timeline, so the recorder can step through
// it frame by frame to make a smooth video.
(function () {
  const L = window.LINEUP;
  const stage = document.getElementById("stage");
  const RECORD = new URLSearchParams(location.search).has("record");
  if (RECORD) document.body.classList.add("recording");

  const DEFAULT_FORMATIONS = { 5: "2-2", 6: "2-1-2", 7: "2-3-1", 8: "3-3-1" };
  const COUNT_WORDS = { 5: "Five", 6: "Six", 7: "Seven", 8: "Eight" };
  const STEP = 1.5; // seconds each player gets in the spotlight

  // Pitch geometry (must match the CSS perspective/rotation we set below)
  const PITCH = { w: 700, h: 1000, angle: 45, persp: 2200, cx: 1390, cy: 500 };

  const SILHOUETTE =
    '<svg viewBox="0 0 100 120"><circle cx="50" cy="36" r="22"/><path d="M6 120c0-32 19-48 44-48s44 16 44 48z"/></svg>';

  // ---------- helpers ----------
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = (name) => name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  // "Joe C" stays together as the big name rather than showing just "C"
  const splitName = (name) => {
    const parts = name.trim().split(/\s+/);
    const last = parts[parts.length - 1];
    if (parts.length === 1 || last.replace(".", "").length <= 2) return { first: "", last: name.trim() };
    return { first: parts.slice(0, -1).join(" "), last };
  };
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.setProperty("--s", s);
  }

  // Works out where each player stands. v = 0 is our goal line, 1 is theirs.
  function formationSpots(team) {
    const count = team.players.length;
    let formation = team.formation || DEFAULT_FORMATIONS[count];
    let rows = (formation || "").split("-").map(Number);
    if (rows.reduce((a, b) => a + b, 0) !== count - 1) {
      console.warn(`Formation "${formation}" doesn't fit ${count} players for ${team.name}; using a default.`);
      formation = DEFAULT_FORMATIONS[count] || String(count - 1);
      rows = formation.split("-").map(Number);
    }
    team.formation = formation;

    const spreads = [0, 0, 0.5, 0.68, 0.8, 0.86];
    const spots = [{ u: 0.5, v: 0.06, role: "GK" }];
    rows.forEach((n, i) => {
      const v = rows.length === 1 ? 0.45 : 0.3 + (i * 0.5) / (rows.length - 1);
      const role = i === 0 ? "DEF" : i === rows.length - 1 ? "FWD" : "MID";
      const spread = spreads[n] ?? 0.9;
      for (let j = 0; j < n; j++) {
        const u = n === 1 ? 0.5 : 0.5 + (j / (n - 1) - 0.5) * spread;
        spots.push({ u, v, role });
      }
    });
    return spots;
  }

  // Maps a spot on the tilted pitch to screen coordinates (same maths as CSS 3D).
  function project(u, v) {
    const a = (PITCH.angle * Math.PI) / 180;
    const x = (u - 0.5) * PITCH.w;
    const y = (0.5 - v) * PITCH.h;
    const z = y * Math.sin(a);
    const k = PITCH.persp / (PITCH.persp - z);
    return { x: PITCH.cx + x * k, y: PITCH.cy + y * Math.cos(a) * k, k };
  }

  // Checks each photo loads; if not, falls back to the placeholder.
  function preloadPhotos() {
    const people = L.teams.flatMap((t) => [...t.players, ...(t.subs || [])]);
    return Promise.all(
      people.map(
        (p) =>
          new Promise((resolve) => {
            if (!p.photo) return resolve();
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => {
              console.warn(`Couldn't load photo "${p.photo}" for ${p.name}`);
              p.photo = "";
              resolve();
            };
            img.src = p.photo;
          })
      )
    );
  }

  // ---------- building the scenes ----------
  function buildStreaks() {
    const box = stage.querySelector(".streaks");
    for (let i = 0; i < 9; i++) {
      const s = el("i");
      s.style.top = 80 + ((i * 117) % 920) + "px";
      s.style.width = 400 + ((i * 173) % 600) + "px";
      box.appendChild(s);
    }
  }

  function buildIntro() {
    stage.querySelector("#intro .strip").textContent = [L.date, L.kickoff, L.venue].filter(Boolean).join("  •  ");
  }

  function buildTeamScene(team, idx) {
    const sc = el("section", "scene team-scene");
    sc.id = "team" + idx;
    sc.style.setProperty("--team", team.colour);
    const spots = formationSpots(team);
    const n = team.players.length;

    sc.appendChild(el("div", "accent"));
    sc.appendChild(el("div", "bug", `<b>MNF</b><span>${esc(L.date)}</span>`));
    sc.appendChild(
      el(
        "div",
        "header",
        `<div class="pill">Team News</div>
         <div class="name-mask"><div class="name">${esc(team.name)}</div></div>
         <div class="meta">${n}-a-side  •  ${esc(team.formation)}</div>`
      )
    );

    // Pitch
    const group = el("div", "pitch-group");
    const wrap = el("div", "pitch-wrap", '<div class="pitch"><i class="half"></i><i class="circle"></i><i class="box-top"></i><i class="box-bot"></i></div>');
    Object.assign(wrap.style, {
      left: PITCH.cx - PITCH.w / 2 + "px",
      top: PITCH.cy - PITCH.h / 2 + "px",
      width: PITCH.w + "px",
      height: PITCH.h + "px",
    });
    wrap.style.setProperty("--p", PITCH.persp + "px");
    wrap.style.setProperty("--a", PITCH.angle + "deg");
    group.appendChild(wrap);
    const tokens = el("div", "tokens");
    group.appendChild(tokens);
    sc.appendChild(group);

    team.players.forEach((p, i) => {
      const spot = spots[i];
      p.position = p.position || spot.role;
      const { x, y, k } = project(spot.u, spot.v);
      const t = el(
        "div",
        "token",
        `<div class="in" style="--k:${k.toFixed(3)}">
           <div class="disc">${p.photo ? `<img src="${esc(p.photo)}">` : esc(initials(p.name))}
             <div class="badge">${esc(p.number)}</div></div>
           <div class="label">${esc(splitName(p.name).last)}</div>
           <div class="ring" style="margin:-60px 0 0 -60px; left:50%; top:60px"></div>
         </div>`
      );
      Object.assign(t.style, { left: x + "px", top: y + "px", zIndex: Math.round(y) });
      tokens.appendChild(t);

      // Player card
      const { first, last } = splitName(p.name);
      const lastSize = Math.min(130, Math.floor(400 / (last.length * 0.5)));
      sc.appendChild(
        el(
          "div",
          "card",
          `<div class="panel"></div>
           <div class="num">${esc(p.number)}</div>
           <div class="photo">${p.photo ? `<img src="${esc(p.photo)}">` : SILHOUETTE}</div>
           <div class="text">
             <div class="pos">${esc(p.position)}</div>
             <div class="first">${esc(first)}</div>
             <div class="last" style="font-size:${lastSize}px">${esc(last)}</div>
           </div>`
        )
      );
    });

    // Full lineup list
    const subs = team.subs || [];
    sc.appendChild(
      el(
        "div",
        "list",
        `<div class="title">Starting ${COUNT_WORDS[n] || n}</div>
         ${team.players
           .map((p) => `<div class="row"><div class="n">${esc(p.number)}</div><div class="nm">${esc(p.name)}</div><div class="ps">${esc(p.position)}</div></div>`)
           .join("")}
         ${subs.length ? `<div class="subs"><b>Subs</b>${subs.map((s) => esc(s.name)).join(", ")}</div>` : ""}`
      )
    );

    stage.insertBefore(sc, stage.querySelector("#vs"));
    return sc;
  }

  function buildVs() {
    const vs = stage.querySelector("#vs");
    ["left", "right"].forEach((side, i) => {
      const team = L.teams[i];
      const box = vs.querySelector(".vs-" + side);
      box.style.background = `linear-gradient(135deg, ${team.colour}, color-mix(in srgb, ${team.colour} 40%, #000))`;
      box.querySelector(".vs-name").textContent = team.name;
      box.querySelector(".vs-list").innerHTML = team.players.map((p) => `<div><b>${esc(p.number)}</b>${esc(p.name)}</div>`).join("");
    });
    vs.querySelector(".vs-strip").innerHTML =
      `Kick-off ${esc(L.kickoff)}` + (L.venue ? `<em>/</em>${esc(L.venue)}` : "");
  }

  // ---------- animation ----------
  function streaks(tl, at, dur) {
    stage.querySelectorAll(".streaks i").forEach((s, i) => {
      tl.fromTo(
        s,
        { x: -900, opacity: 0.9 },
        { x: 2400, opacity: 0.9, duration: 1.1 + (i % 3) * 0.35, ease: "power2.inOut", immediateRender: false },
        at + ((i * 0.37) % dur)
      );
    });
  }

  // Coloured bars sweep across the screen; callers swap scenes while it's covered.
  function wipe(tl, colour) {
    const bars = stage.querySelectorAll(".wipe i");
    const at = tl.duration();
    tl.set(bars[0], { backgroundColor: colour }, at);
    tl.fromTo(bars, { xPercent: -120 }, { xPercent: 0, duration: 0.45, stagger: 0.07, ease: "power3.in", immediateRender: false }, at);
    tl.to(bars, { xPercent: 120, duration: 0.45, stagger: -0.07, ease: "power3.out" }, at + 0.62);
    return at + 0.75; // when the new scene is visible enough to start animating
  }

  function animateIntro(tl) {
    const q = (s) => stage.querySelector("#intro " + s);
    tl.set("#intro", { autoAlpha: 1 }, 0);
    streaks(tl, 0, 3.5);
    tl.from(q(".line1 span"), { yPercent: 110, duration: 0.6, ease: "power4.out" }, 0.4)
      .from(q(".bar"), { scaleX: 0, duration: 0.6, ease: "power3.inOut" }, 0.5)
      .from(q(".line2 span"), { yPercent: 110, duration: 0.7, ease: "power4.out" }, 0.7)
      .from(q(".strip"), { y: 40, autoAlpha: 0, duration: 0.5, ease: "power3.out" }, 1.3)
      .from(q(".tag"), { scale: 1.8, autoAlpha: 0, duration: 0.45, ease: "back.out(2)" }, 1.8)
      .to(q(".intro-title"), { scale: 1.04, duration: 2.6, ease: "none" }, 1.4);
  }

  function animateTeam(tl, sc, team, prev) {
    const q = (s) => sc.querySelector(s);
    const qa = (s) => sc.querySelectorAll(s);
    const t0 = wipe(tl, team.colour);
    tl.set(prev, { autoAlpha: 0 }, t0 - 0.15).set(sc, { autoAlpha: 1 }, t0 - 0.15);

    tl.from(q(".accent"), { xPercent: -100, duration: 0.8, ease: "power3.out" }, t0)
      .from(q(".header .pill"), { x: -60, autoAlpha: 0, duration: 0.4, ease: "power3.out" }, t0 + 0.1)
      .from(q(".header .name"), { yPercent: 105, duration: 0.6, ease: "power4.out" }, t0 + 0.2)
      .from(q(".header .meta"), { autoAlpha: 0, x: -30, duration: 0.4 }, t0 + 0.5)
      .from(q(".bug"), { autoAlpha: 0, y: -30, duration: 0.4 }, t0 + 0.3)
      .from(q(".pitch-group"), { y: 160, autoAlpha: 0, duration: 0.9, ease: "power3.out" }, t0 + 0.2);

    const cards = qa(".card");
    const tokens = qa(".token");
    let t = t0 + 1.1;
    cards.forEach((card, i) => {
      const tok = tokens[i];
      tl.fromTo(card, { autoAlpha: 0, x: -140 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, t)
        .from(card.querySelector(".num"), { scale: 1.5, autoAlpha: 0, duration: 0.5, ease: "power3.out" }, t + 0.05)
        .from(card.querySelector(".photo"), { y: 60, autoAlpha: 0, duration: 0.45, ease: "power3.out" }, t + 0.1)
        .from(card.querySelectorAll(".text > *"), { x: 50, autoAlpha: 0, duration: 0.4, stagger: 0.08, ease: "power3.out" }, t + 0.15)
        .fromTo(tok, { autoAlpha: 0, y: -180, scale: 1.8 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.4)", immediateRender: false }, t + 0.3)
        .fromTo(tok.querySelector(".ring"), { scale: 0.6, opacity: 0.9 }, { scale: 2.2, opacity: 0, duration: 0.7, ease: "power2.out", immediateRender: false }, t + 0.8)
        .to(card, { autoAlpha: 0, x: 90, duration: 0.3, ease: "power2.in" }, t + STEP - 0.3);
      t += STEP;
    });

    tl.from(q(".list .title"), { autoAlpha: 0, x: -40, duration: 0.4 }, t)
      .from(qa(".list .row"), { autoAlpha: 0, x: -80, duration: 0.4, stagger: 0.08, ease: "power3.out" }, t + 0.1);
    if (q(".list .subs")) tl.from(q(".list .subs"), { autoAlpha: 0, duration: 0.4 }, t + 0.2 + cards.length * 0.08);
    tl.to({}, { duration: 2.6 }, t); // hold on the full lineup
  }

  function animateVs(tl, prev) {
    const q = (s) => stage.querySelector("#vs " + s);
    const t0 = wipe(tl, "#e10600");
    tl.set(prev, { autoAlpha: 0 }, t0 - 0.15).set("#vs", { autoAlpha: 1 }, t0 - 0.15);
    streaks(tl, t0 + 0.3, 2.5);
    tl.from(q(".vs-left"), { xPercent: -100, duration: 0.7, ease: "power4.out" }, t0)
      .from(q(".vs-right"), { xPercent: 100, duration: 0.7, ease: "power4.out" }, t0)
      .from(q(".vs-mid"), { scale: 0, rotation: -90, duration: 0.6, ease: "back.out(1.8)" }, t0 + 0.5)
      .from(q(".vs-strip"), { yPercent: 100, duration: 0.5, ease: "power3.out" }, t0 + 0.7)
      .from(stage.querySelectorAll("#vs .vs-list"), { autoAlpha: 0, y: 20, duration: 0.5 }, t0 + 0.9)
      .to(".blackout", { opacity: 1, duration: 0.8 }, t0 + 4.2);
  }

  function buildTimeline(scenes) {
    const tl = gsap.timeline({ paused: true });
    gsap.set(".wipe i", { xPercent: -120, visibility: "visible" });
    animateIntro(tl);
    tl.to({}, { duration: 0.1 }, 3.6);
    let prev = "#intro";
    scenes.forEach((sc, i) => {
      animateTeam(tl, sc, L.teams[i], prev);
      prev = sc;
    });
    animateVs(tl, prev);
    return tl;
  }

  // ---------- start ----------
  async function start() {
    fit();
    addEventListener("resize", fit);
    await preloadPhotos();
    buildStreaks();
    buildIntro();
    const scenes = L.teams.map(buildTeamScene);
    buildVs();
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => (img.complete ? null : img.decode().catch(() => {}))));
    const tl = buildTimeline(scenes);

    window.MNF = { timeline: tl, ready: true, seek: (t) => { tl.seek(t, false); } };

    if (!RECORD) {
      tl.play(0);
      addEventListener("keydown", (e) => {
        if (e.code === "Space") { e.preventDefault(); tl.restart(); }
      });
      stage.addEventListener("click", () => tl.restart());
    }
  }

  start();
})();
