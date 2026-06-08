import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('model-container');
if (!container) {
  console.warn('No model container found');
} else {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
  // move camera slightly back to avoid clipping when model rotates
  camera.position.set(0, 0.08, 1.9);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);

  const loader = new GLTFLoader();
  let model = null;
  loader.load('Prop.glb', (gltf) => {
    model = gltf.scene;
    // center and scale
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 0.9 / size;
    model.scale.setScalar(scale);
    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3()).multiplyScalar(1);
    model.position.x -= center.x;
    model.position.y -= center.y * 0.95;
    model.position.z -= center.z;
    // stronger default tilt so the propeller face is visible
    model.rotation.x = -0.35;
    model.rotation.y = 1.0; // more rotated in default view
    // recolor materials to ice-blue
    const iceColor = new THREE.Color(0xBBDDEB); // slightly darker ice-blue
    model.traverse((c) => {
      if (c.isMesh) {
        try {
          // clone material to avoid shared references
          c.material = Array.isArray(c.material)
            ? c.material.map(m => m.clone())
            : c.material.clone();
        } catch (e) {
          // fallback: ignore
        }
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        mats.forEach((m) => {
          if (m) {
            if (m.map) {
              m.map = null;
            }
            if (m.color) m.color.copy(iceColor);
            if ('emissive' in m) m.emissive.copy(new THREE.Color(0x083845));
            if ('metalness' in m) m.metalness = 0.15;
            if ('roughness' in m) m.roughness = 0.45;
            m.needsUpdate = true;
          }
        });
      }
    });
    scene.add(model);
  }, undefined, (err) => {
    console.error('Failed to load model', err);
  });

  // smooth scroll-driven rotation
  let targetY = 0;
  let currentY = 0;

  function onScroll() {
    const scroll = window.scrollY || window.pageYOffset;
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const t = scroll / max; // 0..1
    // map to rotation around Y: smaller range for slower perceived motion
    targetY = (t - 0.5) * 0.8;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    currentY += (targetY - currentY) * 0.03; // slower smoothing
    if (model) {
      model.rotation.y = currentY;
    }
    renderer.render(scene, camera);
  }

  // initial call
  onScroll();
  animate();
}
