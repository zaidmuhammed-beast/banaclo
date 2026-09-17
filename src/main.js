import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { createHoodie } from './scene/hoodie.js';
import { createStage } from './scene/stage.js';
import { createComposer } from './scene/post.js';
import { setFabricUniform, tickFabrics, fabricMaterials, PATTERNS } from './scene/materials.js';
import { makePrintTexture } from './scene/textures.js';
import { mountUI } from './ui/ui.js';
import './styles.css';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const VIEWS = {
  hero:   { pos: [0.85, 0.42, 2.25], target: [0, 0.02, 0] },
  front:  { pos: [0, 0.10, 1.85],    target: [0, 0.03, 0] },
  back:   { pos: [0, 0.16, -1.95],   target: [0, 0.05, 0] },
  hood:   { pos: [0.35, 0.72, 1.15], target: [0, 0.34, 0] },
  detail: { pos: [0.28, -0.05, 0.95], target: [0.02, 0.02, 0.12] }
};

function frame() {
  return new Promise((r) => requestAnimationFrame(() => r()));
}

async function boot() {
  const canvas = document.getElementById('scene');
  const loader = document.getElementById('loader');
  const bar = document.getElementById('loader-bar');
  const loaderNote = document.getElementById('loader-note');

  const step = async (pct, note) => {
    bar.style.width = `${pct}%`;
    loaderNote.textContent = note;
    await frame();
    await frame();
  };

  /* ---------------------------- renderer ---------------------------- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true
    });
  } catch (err) {
    document.getElementById('nowebgl').hidden = false;
    loader.hidden = true;
    console.error(err);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  await step(12, 'booting the loom');

  /* ------------------------------ scene ------------------------------ */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(1.55, 1.25, 4.0);   // intro start; refitted in onResize

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.minDistance = 0.75;
  controls.maxDistance = 4.6;
  // Tall/narrow viewports see a much narrower slice of the world, so every
  // framing distance gets pushed out to keep the sleeves in shot.
  const fitFactor = () => THREE.MathUtils.clamp(1 / Math.min(camera.aspect, 1), 1, 2.0);
  let fit = fitFactor();
  controls.maxPolarAngle = Math.PI * 0.86;
  controls.target.set(0, 0.02, 0);
  controls.autoRotateSpeed = 1.1;
  controls.enablePan = false;

  await step(26, 'pouring the void');
  const stage = createStage(scene);

  await step(44, 'knitting 88,000 triangles');
  const hoodie = createHoodie({ seed: 3.17 });
  scene.add(hoodie.group);

  await step(66, 'mixing dye lots');
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.05);
  scene.environmentIntensity = 0.55;
  scene.environment = envRT.texture;

  await step(80, 'wiring the neon');
  const post = createComposer(renderer, scene, camera);
  post.setSize(window.innerWidth, window.innerHeight);

  let printTexture = makePrintTexture('BANACLO', 'WEAR THE GLITCH', '#ffffff');
  setFabricUniform('uPrintMap', printTexture);

  await step(94, 'pressing the graphic');

  /* --------------------------- camera tween -------------------------- *
   * OrbitControls re-derives its spherical state from the camera every
   * frame and clamps the radius, so a naive position lerp gets mangled the
   * moment the path passes near the target. We orbit in spherical space
   * instead: no clamping surprises, and the move reads as a camera move
   * rather than a teleport through the garment.
   * ------------------------------------------------------------------ */
  const sphericalOf = (pos, target) =>
    new THREE.Spherical().setFromVector3(new THREE.Vector3().subVectors(pos, target));

  const tween = {
    active: false,
    t: 0,
    dur: 1.0,
    from: new THREE.Spherical(),
    to: new THREE.Spherical(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3()
  };

  /** `view` is a key from VIEWS, or an inline { pos, target } pair. */
  function flyTo(view, dur = 1.2) {
    const v = (typeof view === 'object' && view) ? view : (VIEWS[view] || VIEWS.hero);
    const toTarget = new THREE.Vector3().fromArray(v.target);
    const toPos = new THREE.Vector3().fromArray(v.pos);

    tween.from.copy(sphericalOf(camera.position, controls.target));
    tween.to.copy(sphericalOf(toPos, toTarget));
    tween.to.radius *= fit;
    tween.fromTarget.copy(controls.target);
    tween.toTarget.copy(toTarget);

    // Always take the short way round.
    let d = tween.to.theta - tween.from.theta;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    tween.to.theta = tween.from.theta + d;

    tween.t = 0;
    tween.dur = prefersReducedMotion ? 0.01 : dur;
    tween.active = true;
    controls.autoRotate = false;
  }

  /* ------------------------------- app API ---------------------------- */
  const state = {
    color: '#ff2e88',
    accent: '#14f195',
    pattern: 'solid',
    patternScale: 1,
    fuzz: 0.75,
    weirdness: 0.5,
    bloom: 0.34,
    hoodUp: false,
    autoRotate: !prefersReducedMotion,
    wireframe: false,
    print: true,
    printText: 'BANACLO',
    printSub: 'WEAR THE GLITCH'
  };

  const app = {
    state,
    renderer,
    camera,
    controls,
    hoodie,
    stage,
    flyTo,
    isFlying: () => tween.active,
    punch: (n) => post.punch(n),

    setColor(hex) {
      state.color = hex;
      setFabricUniform('uColorA', hex, { roles: ['shell', 'rib'] });
      setFabricUniform('uColorB', hex, { roles: ['lining'] });
      hoodie.materials.shell.color.set(hex);
      hoodie.materials.ribbing.color.set(hex);
    },
    setAccent(hex) {
      state.accent = hex;
      setFabricUniform('uColorB', hex, { roles: ['shell', 'rib'] });
      setFabricUniform('uColorA', hex, { roles: ['lining'] });
      hoodie.materials.lining.color.set(hex);
      stage.setRingColor(hex);
    },
    setPattern(id) {
      state.pattern = id;
      const idx = Math.max(0, PATTERNS.indexOf(id));
      setFabricUniform('uPattern', idx, { roles: ['shell', 'rib', 'lining'] });
      // Holo needs a slicker, more reflective base to sell the effect.
      const holo = id === 'holo';
      for (const m of [hoodie.materials.shell, hoodie.materials.ribbing]) {
        m.iridescence = holo ? 1 : 0;
        m.iridescenceIOR = 1.35;
        m.iridescenceThicknessRange = [120, 620];
        m.metalness = holo ? 0.45 : 0.0;
        m.roughness = holo ? 0.26 : 0.88;
        m.needsUpdate = true;
      }
      post.punch(0.8);
    },
    setPatternScale(v) {
      state.patternScale = v;
      setFabricUniform('uPatternScale', v, { roles: ['shell', 'rib', 'lining'] });
    },
    setFuzz(v) {
      state.fuzz = v;
      setFabricUniform('uFuzz', v);
      for (const m of fabricMaterials()) {
        m.sheen = 0.35 + v * 0.9;
        m.sheenRoughness = 0.35 + v * 0.5;
      }
    },
    setWeirdness(v) {
      state.weirdness = v;
      setFabricUniform('uWeirdness', v);
      post.look.uniforms.uAberration.value = 0.0007 + v * 0.0045;
      post.look.uniforms.uGrain.value = 0.02 + v * 0.09;
    },
    setBloom(v) {
      state.bloom = v;
      post.bloom.strength = v;
    },
    setHoodUp(up) {
      state.hoodUp = up;
      hoodie.setHoodUp(up);
      post.punch(0.5);
    },
    setAutoRotate(on) {
      state.autoRotate = on;
      if (!tween.active) controls.autoRotate = on;
    },
    setWireframe(on) {
      state.wireframe = on;
      hoodie.setWireframe(on);
      post.punch(1);
    },
    setPrint(enabled, text, sub) {
      state.print = enabled;
      if (text !== undefined) state.printText = text;
      if (sub !== undefined) state.printSub = sub;
      if (enabled) {
        printTexture.dispose();
        printTexture = makePrintTexture(state.printText || ' ', state.printSub || ' ', state.accent);
        setFabricUniform('uPrintMap', printTexture);
      }
      setFabricUniform('uPrintOn', enabled ? 1 : 0);
      post.punch(0.6);
    },
    setBackdrop([top, bottom, glow]) {
      stage.setBackdrop(top, bottom, glow);
    },
    resetView() {
      flyTo('hero', 1.0);
    },
    snapshot() {
      post.render();
      return renderer.domElement.toDataURL('image/png');
    }
  };

  app.setColor(state.color);
  app.setAccent(state.accent);
  app.setPattern(state.pattern);
  app.setFuzz(state.fuzz);
  app.setWeirdness(state.weirdness);
  app.setPrint(true);
  app.setHoodUp(false);
  controls.autoRotate = state.autoRotate;
  flyTo('hero', 2.2);

  /* ------------------------------- resize ----------------------------- */
  const onResize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // Keep the current framing, just re-fitted to the new aspect.
    const next = fitFactor();
    if (Math.abs(next - fit) > 1e-4) {
      const offset = camera.position.clone().sub(controls.target).multiplyScalar(next / fit);
      camera.position.copy(controls.target).add(offset);
      if (tween.active) tween.to.radius *= next / fit;
      fit = next;
    }
    controls.minDistance = 0.75 * fit;
    controls.maxDistance = 4.6 * fit;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    post.setSize(w, h);
  };
  window.addEventListener('resize', onResize);
  onResize();

  /* -------------------------------- loop ------------------------------ */
  const spherical = new THREE.Spherical();
  let last = performance.now() / 1000;
  let elapsed = 0;
  let fpsAccum = 0, fpsFrames = 0, frameMark = last;
  const fpsEl = document.getElementById('fps');

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now() / 1000;
    const dt = Math.min(now - last, 0.05);
    last = now;
    elapsed += dt;
    const t = elapsed;

    if (tween.active) {
      tween.t += dt;
      const k = Math.min(tween.t / tween.dur, 1);
      const e = 1 - Math.pow(1 - k, 4);
      spherical.set(
        THREE.MathUtils.lerp(tween.from.radius, tween.to.radius, e),
        THREE.MathUtils.lerp(tween.from.phi, tween.to.phi, e),
        THREE.MathUtils.lerp(tween.from.theta, tween.to.theta, e)
      );
      controls.target.lerpVectors(tween.fromTarget, tween.toTarget, e);
      camera.position.setFromSpherical(spherical).add(controls.target);
      if (k >= 1) {
        tween.active = false;
        controls.autoRotate = state.autoRotate;
      }
    }

    hoodie.update(dt, t);
    stage.update(dt, t);
    tickFabrics(t);
    post.update(dt, t);
    controls.update();
    post.render();

    fpsAccum += Math.max(now - frameMark, 1e-4); frameMark = now; fpsFrames++;
    if (fpsAccum > 0.5 && fpsEl) {
      fpsEl.textContent = String(Math.round(fpsFrames / fpsAccum)).padStart(2, '0');
      fpsAccum = 0; fpsFrames = 0;
    }
  }

  await step(100, 'ready');
  animate();

  mountUI(app);

  // Handy in the console: BANACLO.flyTo('back'), BANACLO.setPattern('holo'), ...
  window.BANACLO = app;

  loader.classList.add('is-gone');
  setTimeout(() => { loader.hidden = true; }, 900);
  document.body.classList.add('is-live');
}

boot().catch((err) => {
  console.error(err);
  const loader = document.getElementById('loader');
  if (loader) {
    document.getElementById('loader-note').textContent = 'something snapped: ' + err.message;
  }
});
