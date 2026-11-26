// Seegang-Video auf der Startseite: je eine Schleife für hellen und dunklen Grund.
// Ohne Skript bzw. bei "Bewegung reduzieren" bleibt das Standbild aus dem HTML stehen.
(function () {
  const box = document.getElementById("foil-anim");
  if (!box) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Safari und alle iOS-Browser zeigen WebM ohne Transparenz: dort MP4 (deckend, Ränder per CSS
  // ausgeblendet). Animiertes WebP nur als Notlösung, etwa im Stromsparmodus (kein Autoplay).
  const webkit = /^Apple/.test(navigator.vendor || "");
  let visible = true;
  const SPEED = 2 / 3;   // um ein Drittel verlangsamt (animiertes WebP ist entsprechend angepasst)
  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  const file = (suffix) => "media/foil-seegang-" + (dark.matches ? "dark" : "light") + suffix;

  function image(suffix) {
    box.classList.remove("opaque");
    const img = document.createElement("img");
    img.src = file(suffix);
    img.alt = "";
    img.width = 1600;
    img.height = 960;
    box.replaceChildren(img);
  }

  function play(v) {
    if (!visible) { v.pause(); return; }
    const p = v.play();
    if (p) p.catch((e) => { if (e.name === "NotAllowedError" || e.name === "NotSupportedError") image("-anim.webp"); });
  }

  function video(ext) {
    const v = document.createElement("video");
    v.muted = v.defaultMuted = v.loop = v.autoplay = v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.disableRemotePlayback = true;
    v.defaultPlaybackRate = v.playbackRate = SPEED;
    v.width = 1600;
    v.height = 960;
    v.poster = file("-poster.webp");
    v.addEventListener("error", () => image("-anim.webp"));
    // Standbild erst entfernen, wenn das Video läuft (sonst doppelt, weil transparent)
    v.addEventListener("playing", () => { v.removeAttribute("poster"); }, { once: true });
    box.classList.toggle("opaque", ext === ".mp4");
    v.src = file(ext);
    v.playbackRate = SPEED;
    box.replaceChildren(v);
    play(v);
  }

  function show() {
    if (reduce.matches) image("-poster.webp");
    else if (webkit || !document.createElement("video").canPlayType('video/webm; codecs="vp9"')) video(".mp4");
    else video(".webm");
  }

  reduce.addEventListener("change", show);
  dark.addEventListener("change", show);
  show();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      const v = box.querySelector("video");
      if (v) play(v);
    }).observe(box);
  }
})();
