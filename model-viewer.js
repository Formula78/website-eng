// 3D-Ansicht des Odonata-Propellers.
// three.js liegt lokal unter /vendor (kein externes CDN).
import * as THREE from "three";
import { GLTFLoader } from "./vendor/three/examples/jsm/loaders/GLTFLoader.js";

const container = document.getElementById("model-container");
const statusEl = document.getElementById("model-status");

if (container) init();

function setStatus(de, en) {
  if (!statusEl) return;
  statusEl.innerHTML = de ? `<span data-l="de">${de}</span><span data-l="en">${en}</span>` : "";
}

function init() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8478, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5);
  rim.position.set(-4, -1, -3);
  scene.add(rim);

  // Farbe folgt dem Seitenthema: Carbon-Anthrazit auf hellem, helles Grau auf dunklem Grund
  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  const material = new THREE.MeshStandardMaterial({ metalness: 0.25, roughness: 0.38, side: THREE.DoubleSide });
  function applyTheme() {
    material.color.set(dark.matches ? 0xd8d4ca : 0x2a3036);
    kick();
  }
  dark.addEventListener("change", applyTheme);

  const pivot = new THREE.Group();
  scene.add(pivot);

  const HOME = { x: -0.32, y: 0.9 };
  let rotX = HOME.x, rotY = HOME.y, velY = reduce ? 0 : 0.0025;
  let dragging = false, lastX = 0, lastY = 0, idleSince = performance.now();
  let visible = true, raf = 0;

  function resize() {
    const w = container.clientWidth, h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    kick();
  }

  setStatus("Modell wird geladen …", "Loading model …");
  new GLTFLoader().load(
    "Prop.glb",
    (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      model.position.sub(sphere.center);
      const s = 1 / sphere.radius;
      model.scale.setScalar(s);
      model.position.multiplyScalar(s);

      model.traverse((o) => {
        if (!o.isMesh) return;
        o.material = material;
      });
      pivot.add(model);
      const dist = 1 / Math.sin((camera.fov * Math.PI) / 360) * 0.98;
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
      setStatus("");
      kick();
    },
    undefined,
    (err) => {
      console.error("Prop.glb konnte nicht geladen werden", err);
      setStatus("3D-Modell konnte nicht geladen werden.", "The 3D model could not be loaded.");
    }
  );

  // Ziehen zum Drehen (Maus und Touch, vertikales Scrollen bleibt möglich)
  const el = renderer.domElement;
  el.addEventListener("pointerdown", (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY; velY = 0;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    rotY += dx * 0.008;
    rotX = Math.max(-1.2, Math.min(1.2, rotX + dy * 0.006));
    velY = dx * 0.0008;
    kick();
  });
  const end = () => { dragging = false; idleSince = performance.now(); };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);

  function frame() {
    raf = 0;
    if (!dragging) {
      const idle = performance.now() - idleSince > 2500;
      const target = reduce ? 0 : 0.0025;
      velY += ((idle ? target : 0) - velY) * 0.03;
      rotY += velY;
    }
    pivot.rotation.set(rotX, rotY, 0);
    renderer.render(scene, camera);
    if (visible && (!reduce || dragging || Math.abs(velY) > 1e-5)) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  applyTheme();
  new ResizeObserver(resize).observe(container);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) kick(); }).observe(container);
  }
  resize();
}
