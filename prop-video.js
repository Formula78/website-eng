// Propeller-Animation: vorgerenderte, transparente Schleife (eine halbe Umdrehung, etwa 6 s).
// Es wird kein 3D-Modell ausgeliefert.
(function () {
  const box = document.getElementById("prop-anim");
  if (!box) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  // Safari und alle iOS-Browser zeigen WebM ohne Transparenz: dort animiertes WebP.
  const webkit = /^Apple/.test(navigator.vendor || "");
  let visible = true;

  const file = (suffix) => "/media/propeller-" + (dark.matches ? "dark" : "light") + suffix;

  function image(suffix) {
    const img = document.createElement("img");
    img.src = file(suffix);
    img.alt = "";
    img.width = 1440;
    img.height = 900;
    box.replaceChildren(img);
  }

  function video() {
    const v = document.createElement("video");
    v.muted = true;
    v.defaultMuted = true;
    v.loop = true;
    v.autoplay = true;
    v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.disableRemotePlayback = true;
    v.width = 1440;
    v.height = 900;
    v.addEventListener("error", () => image("-anim.webp"));
    v.src = file(".webm");
    box.replaceChildren(v);
    play(v);
  }

  function play(v) {
    if (!visible) { v.pause(); return; }
    const p = v.play();
    if (p) p.catch((e) => { if (e.name === "NotAllowedError" || e.name === "NotSupportedError") image("-anim.webp"); });
  }

  function show() {
    if (reduce.matches) image("-poster.webp");
    else if (webkit || !document.createElement("video").canPlayType('video/webm; codecs="vp9"')) image("-anim.webp");
    else video();
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
