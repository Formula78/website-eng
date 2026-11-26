// Seegang-Video auf der Startseite, als Rechteck beschnitten (Ausschnitt siehe style.css).
// Ohne Skript bzw. bei "Bewegung reduzieren" bleibt das Standbild aus dem HTML stehen.
(function () {
  const box = document.getElementById("foil-anim");
  if (!box) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Chrome, Edge, Firefox: transparentes WebM (helle Fassung, passt auf beide Gründe). Die ovale
  // Ausblendung steckt in dessen Transparenz; der SVG-Filter #wasser in index.html hebt sie auf.
  // Safari und alle iOS-Browser zeigen WebM ohne Transparenz: dort MP4 (deckend, je Farbschema).
  // Animiertes WebP nur als Notlösung, etwa im Stromsparmodus (kein Autoplay).
  const webkit = /^Apple/.test(navigator.vendor || "");
  const alpha = !webkit && !!document.createElement("video").canPlayType('video/webm; codecs="vp9"');
  let visible = true;
  const SPEED = 2 / 3;   // um ein Drittel verlangsamt (animiertes WebP ist entsprechend angepasst)
  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  const file = (suffix, theme) => "media/foil-seegang-" + (theme || (dark.matches ? "dark" : "light")) + suffix;
  // Standbild: mit Transparenz immer die helle Fassung, sonst passend zum Farbschema
  const poster = () => file("-poster.webp", alpha ? "light" : "");

  function image(src) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.width = 1600;
    img.height = 960;
    box.replaceChildren(img);
  }

  function play(v) {
    if (!visible) { v.pause(); return; }
    const p = v.play();
    if (p) p.catch((e) => { if (e.name === "NotAllowedError" || e.name === "NotSupportedError") image(file("-anim.webp")); });
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
    v.poster = poster();
    v.addEventListener("error", () => image(file("-anim.webp")));
    // Standbild erst entfernen, wenn das Video läuft (sonst doppelt, weil transparent)
    v.addEventListener("playing", () => { v.removeAttribute("poster"); }, { once: true });
    if (ext === ".webm") v.style.filter = "url(#wasser)";
    v.src = file(ext, ext === ".webm" ? "light" : "");
    v.playbackRate = SPEED;
    box.replaceChildren(v);
    play(v);
  }

  function show() {
    if (reduce.matches) image(poster());
    else video(alpha ? ".webm" : ".mp4");
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
