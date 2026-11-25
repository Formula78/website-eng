// 3D-Ansicht der Rechengeometrie: feste Ansicht, nur der Propeller dreht sich um seine Achse.
// three.js liegt lokal unter /vendor (kein externes CDN).
import * as THREE from "three";
import { GLTFLoader } from "./vendor/three/examples/jsm/loaders/GLTFLoader.js";

// Aus Prop.glb ermittelt (Modellkoordinaten): Nabenmitte und Drehachse der Blätter
const HUB = new THREE.Vector3(-1.138, 1.9648, 1.5055);
const AXIS = new THREE.Vector3(-0.6428, 0, 0.766).normalize();
const SPEED = -0.5;            // rad/s, Zeitlupe: etwa eine Umdrehung in 12 s; Vorzeichen = Drehsinn
// Blickrichtung: schräg von vorne oben (vorne = Flugrichtung = AXIS, Propeller sitzt vor dem Rumpf, oben = +y)
const VIEW_DIR = new THREE.Vector3().copy(AXIS).multiplyScalar(1.0)
  .add(new THREE.Vector3(0, 0.35, 0))
  .add(new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), AXIS).multiplyScalar(0.9))
  .normalize();

const container = document.getElementById("model-container");
const statusEl = document.getElementById("model-status");
if (container) init();

function setStatus(de, en) {
  if (!statusEl) return;
  statusEl.innerHTML = de ? `<span data-l="de">${de}</span><span data-l="en">${en}</span>` : "";
}

function init() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dark = window.matchMedia("(prefers-color-scheme: dark)");

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
  const material = new THREE.MeshStandardMaterial({ metalness: 0.25, roughness: 0.38, side: THREE.DoubleSide });
  const applyTheme = () => { material.color.set(dark.matches ? 0xd8d4ca : 0x2a3036); kick(); };
  dark.addEventListener("change", applyTheme);

  const pivot = new THREE.Group();
  scene.add(pivot);

  let rotor = null, angle = 0, last = 0, raf = 0, visible = true;

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
      model.traverse((o) => { if (o.isMesh) o.material = material; });

      // Blätter in eine eigene Gruppe, deren Ursprung auf der Nabe liegt
      rotor = new THREE.Group();
      rotor.position.copy(HUB);
      const blades = model.children.filter((n) => n.name.startsWith("10_Geometry"));
      blades.forEach((b) => { b.position.sub(HUB); rotor.add(b); });
      model.add(rotor);

      // zentrieren und skalieren
      const sphere = new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere());
      const s = 1 / sphere.radius;
      model.scale.setScalar(s);
      model.position.copy(sphere.center).multiplyScalar(-s);
      pivot.add(model);

      camera.position.copy(VIEW_DIR).multiplyScalar((1 / Math.sin((camera.fov * Math.PI) / 360)) * 0.82);
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

  function frame(now) {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    if (rotor && !reduce.matches) {
      angle = (angle + SPEED * dt) % (Math.PI * 2);
      rotor.quaternion.setFromAxisAngle(AXIS, angle);
    }
    renderer.render(scene, camera);
    if (visible && !reduce.matches) raf = requestAnimationFrame(frame);
    else last = 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  reduce.addEventListener("change", kick);
  applyTheme();
  new ResizeObserver(resize).observe(container);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) kick(); }).observe(container);
  }
  resize();
}
