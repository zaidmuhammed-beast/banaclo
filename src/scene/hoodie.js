import * as THREE from 'three';
import {
  spline, lerp, clamp, smoothstep, fbm3, superellipse, loftRings, sweep, edgeFalloff
} from './geometry.js';
import { createFabricMaterial } from './materials.js';

/* ------------------------------------------------------------------ *
 *  A hoodie, grown from maths. No mesh files, no downloads — every
 *  panel here is lofted from a profile curve and then wrinkled with
 *  fractal noise so the cloth stops looking like a shampoo bottle.
 * ------------------------------------------------------------------ */

const HEM_Y = -0.36;
const SHOULDER_Y = 0.34;
const NECK_Y = 0.405;

// Body profile, sampled hem (0) -> shoulder (1).
const HALF_W = [0.262, 0.249, 0.243, 0.252, 0.271, 0.291, 0.300];
const HALF_D = [0.151, 0.143, 0.138, 0.146, 0.158, 0.166, 0.168];
const ROUND = [2.35, 2.35, 2.45, 2.55, 2.65, 2.75, 2.8];

const RADIAL = 96;
const ROWS = 72;

/** Outward normal of a superellipse at the given angle (2D, in XZ). */
function superellipseNormal(angle, a, b, n) {
  const { x, z } = superellipse(angle, a, b, n);
  const gx = (n / a) * Math.pow(Math.abs(x / a), n - 1) * Math.sign(x || 1);
  const gz = (n / b) * Math.pow(Math.abs(z / b), n - 1) * Math.sign(z || 1);
  const len = Math.hypot(gx, gz) || 1;
  return { nx: gx / len, nz: gz / len };
}

/** Sample the torso surface at (angle, v) with drape folds baked in. */
function torsoPoint(angle, v, seed = 0, wrinkle = 1) {
  const a = spline(HALF_W, v);
  const b = spline(HALF_D, v);
  const n = spline(ROUND, v);
  const { x, z } = superellipse(angle, a, b, n);
  const { nx, nz } = superellipseNormal(angle, a, b, n);
  const y = lerp(HEM_Y, SHOULDER_Y, v);

  // Folds hang vertically and bunch towards the hem.
  const bunch = smoothstep(clamp(1 - v * 1.5, 0, 1)) * 0.75 + 0.25;
  const fold = fbm3(Math.cos(angle) * 2.6 + seed, y * 6.5, Math.sin(angle) * 2.6, 4);
  const micro = fbm3(Math.cos(angle) * 9 + seed, y * 22, Math.sin(angle) * 9, 3);
  const cling = smoothstep(clamp((v - 0.72) / 0.28, 0, 1)); // shoulders pull taut
  const amp = (0.020 * bunch * (1 - cling * 0.7) + 0.005) * wrinkle;
  const d = fold * amp + micro * amp * 0.35;

  return new THREE.Vector3(x + nx * d, y, z + nz * d);
}

function ringAt(v, seed, wrinkle) {
  const ring = [];
  for (let i = 0; i < RADIAL; i++) {
    ring.push(torsoPoint((i / RADIAL) * Math.PI * 2, v, seed, wrinkle));
  }
  return ring;
}

function buildTorso(seed) {
  const rings = [];
  for (let r = 0; r < ROWS; r++) rings.push(ringAt(r / (ROWS - 1), seed, 1));
  return { geometry: loftRings(rings), topRing: rings[ROWS - 1] };
}

/** Neck opening — a small rounded ellipse the yoke lofts up into. */
function neckRing(scale = 1, y = NECK_Y) {
  const ring = [];
  for (let i = 0; i < RADIAL; i++) {
    const a = (i / RADIAL) * Math.PI * 2;
    const p = superellipse(a, 0.108 * scale, 0.095 * scale, 2.5);
    ring.push(new THREE.Vector3(p.x, y, p.z + 0.008));
  }
  return ring;
}

/** Shoulders: loft from the top body ring into the neck ring. */
function buildYoke(topRing, seed) {
  const neck = neckRing(1);
  const steps = 16;
  const rings = [];
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const ease = t * t * (3 - 2 * t);
    const ring = [];
    for (let i = 0; i < RADIAL; i++) {
      const p0 = topRing[i];
      const p1 = neck[i];
      const angle = (i / RADIAL) * Math.PI * 2;
      // Shoulder caps bulge a touch so the sleeve head has something to sit on.
      const bulge = Math.pow(Math.abs(Math.cos(angle)), 2.2) * 0.030 * Math.sin(Math.PI * t);
      const x = lerp(p0.x, p1.x, ease) * (1 + bulge);
      const z = lerp(p0.z, p1.z, ease);
      const y = lerp(p0.y, p1.y, ease) + Math.sin(Math.PI * t) * 0.012;
      const w = fbm3(x * 9 + seed, y * 9, z * 9, 3) * 0.004 * (1 - t);
      ring.push(new THREE.Vector3(x + w, y, z + w * 0.5));
    }
    rings.push(ring);
  }
  return { geometry: loftRings(rings), neckRing: rings[steps] };
}

function sleeveCurve(side) {
  const s = side; // +1 right, -1 left
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(s * 0.17, 0.335, 0.004),
    new THREE.Vector3(s * 0.31, 0.296, 0.014),
    new THREE.Vector3(s * 0.425, 0.185, 0.032),
    new THREE.Vector3(s * 0.492, 0.020, 0.058),
    new THREE.Vector3(s * 0.515, -0.140, 0.080)
  ], false, 'catmullrom', 0.5);
}

const SLEEVE_R = [0.138, 0.130, 0.116, 0.100, 0.082, 0.066];

function buildSleeve(side, seed) {
  const curve = sleeveCurve(side);
  const geo = sweep(curve, {
    steps: 64,
    radial: 48,
    radius: (t) => spline(SLEEVE_R, t),
    squash: (t) => lerp(0.9, 1.0, t),
    roundness: () => 2.5,
    ripple: (a, t) => 1 + fbm3(Math.cos(a) * 3 + seed + side * 5, t * 9, Math.sin(a) * 3, 3)
      * 0.09 * (0.35 + 0.65 * Math.sin(Math.PI * t))
  });
  return { geometry: geo, curve };
}

/** Sub-curve helper so cuffs can ride the end of the sleeve spline. */
function subCurve(curve, t0, t1, n = 10) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(curve.getPointAt(lerp(t0, t1, i / n)));
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
}

// Rib counts stay well under the radial sample count; otherwise the
// ripple aliases into a spiky mess instead of a knitted band.
const BODY_RIBS = 26;
const CUFF_RIBS = 16;
const ribRipple = (a, ribs, fade = 1) => 1 + 0.016 * fade * Math.cos(a * ribs);

function buildCuff(curve) {
  return sweep(subCurve(curve, 0.845, 1.0), {
    steps: 16,
    radial: 64,
    radius: (t) => spline(SLEEVE_R, lerp(0.845, 1.0, t)) * lerp(1.1, 0.88, smoothstep(t)),
    squash: () => 0.98,
    roundness: () => 2.3,
    ripple: (a, t) => ribRipple(a, CUFF_RIBS, Math.sin(Math.PI * Math.min(t * 1.2, 1))),
    capEnd: true
  });
}

/** Ribbed waistband, grown off the real hem ring so the body can't poke out. */
function buildWaistband(seed) {
  const rows = 16;
  const rings = [];
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1);
    const shrink = lerp(1.03, 0.93, smoothstep(t));
    const y = lerp(HEM_Y + 0.010, HEM_Y - 0.082, t);
    const ring = [];
    for (let i = 0; i < RADIAL; i++) {
      const a = (i / RADIAL) * Math.PI * 2;
      const base = torsoPoint(a, 0, seed, 1);
      const m = ribRipple(a, BODY_RIBS, Math.sin(Math.PI * Math.min(t * 1.35, 1))) * shrink;
      ring.push(new THREE.Vector3(base.x * m, y, base.z * m));
    }
    rings.push(ring);
  }
  // Fold the band back inside so the bottom edge reads as hemmed, not cut.
  const last = rings[rings.length - 1];
  rings.push(last.map((p) => new THREE.Vector3(p.x * 0.95, p.y + 0.014, p.z * 0.95)));
  rings.push(last.map((p) => new THREE.Vector3(p.x * 0.90, p.y + 0.030, p.z * 0.90)));
  // Built top-down; loftRings expects ascending rings to face outward.
  rings.reverse();
  return loftRings(rings);
}

/** Ribbed collar band sitting on the neck opening. */
function buildCollar() {
  const rows = 10;
  const rings = [];
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1);
    const y = lerp(NECK_Y - 0.012, NECK_Y + 0.042, t);
    const scale = lerp(1.02, 0.99, t);
    const ring = [];
    for (let i = 0; i < RADIAL; i++) {
      const a = (i / RADIAL) * Math.PI * 2;
      const p = superellipse(a, 0.108 * scale, 0.095 * scale, 2.5);
      const m = ribRipple(a, BODY_RIBS, Math.sin(Math.PI * Math.min(t * 1.3, 1)));
      ring.push(new THREE.Vector3(p.x * m, y, p.z * m + 0.008));
    }
    rings.push(ring);
  }
  rings.push(rings[rows - 1].map((p) => new THREE.Vector3(p.x * 0.94, p.y - 0.01, p.z * 0.94)));
  return loftRings(rings);
}

/* ------------------------------- pocket ------------------------------- */

const POCKET_V0 = 0.085;
const POCKET_V1 = 0.40;
const POCKET_SPAN = [0.70, 0.66, 0.60, 0.52];  // half-angle, bottom -> top

function pocketPoint(u, v, seed) {
  const vv = lerp(POCKET_V0, POCKET_V1, v);
  const span = spline(POCKET_SPAN, v);
  const angle = Math.PI / 2 + (u - 0.5) * 2 * span;
  const base = torsoPoint(angle, vv, seed, 1);
  const a = spline(HALF_W, vv), b = spline(HALF_D, vv), n = spline(ROUND, vv);
  const { nx, nz } = superellipseNormal(angle, a, b, n);
  const puff = 0.0018 + 0.019 * edgeFalloff(u, v, 0.16);
  return new THREE.Vector3(base.x + nx * puff, base.y, base.z + nz * puff);
}

function buildPocket(seed) {
  const cols = 48, rows = 26;
  const rings = [];
  for (let r = 0; r < rows; r++) {
    const ring = [];
    for (let c = 0; c < cols; c++) ring.push(pocketPoint(c / (cols - 1), r / (rows - 1), seed));
    rings.push(ring);
  }
  const geometry = loftRings(rings, { closedRing: false });
  const leftEdge = [], rightEdge = [];
  for (let r = 0; r < rows; r++) {
    leftEdge.push(pocketPoint(0.012, r / (rows - 1), seed));
    rightEdge.push(pocketPoint(0.988, r / (rows - 1), seed));
  }
  const piping = [leftEdge, rightEdge].map((pts) =>
    sweep(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5), {
      steps: 30, radial: 12, radius: () => 0.0085, roundness: () => 2.1
    })
  );
  return { geometry, piping };
}

/* -------------------------------- hood -------------------------------- */

const HOOD_R = new THREE.Vector3(0.176, 0.258, 0.212);
const HOOD_C = new THREE.Vector3(0, 0.392, -0.034);
const THETA_BASE = 2.06;
const THETA_AMP = 0.74;

function hoodPoint(phi, s, seed, jitter = 1) {
  const thetaMax = THETA_BASE - THETA_AMP * Math.cos(phi);
  const theta = s * thetaMax;
  const st = Math.sin(theta), ct = Math.cos(theta);
  let x = HOOD_R.x * st * Math.sin(phi);
  let y = HOOD_R.y * ct;
  let z = HOOD_R.z * st * Math.cos(phi);
  const w = fbm3(x * 7 + seed, y * 7, z * 7, 4) * 0.014 * s * jitter;
  const len = Math.hypot(x, y, z) || 1;
  x += (x / len) * w; y += (y / len) * w; z += (z / len) * w;
  return new THREE.Vector3(x + HOOD_C.x, y + HOOD_C.y, z + HOOD_C.z);
}

function buildHood(seed) {
  const cols = 72, rows = 40;
  const rings = [];
  for (let r = 0; r < rows; r++) {
    const s = r / (rows - 1);
    const ring = [];
    for (let c = 0; c < cols; c++) ring.push(hoodPoint((c / cols) * Math.PI * 2, s, seed));
    rings.push(ring);
  }
  const rim = [];
  for (let c = 0; c <= cols; c++) rim.push(hoodPoint(((c % cols) / cols) * Math.PI * 2, 1, seed));
  const rimGeo = sweep(new THREE.CatmullRomCurve3(rim, true, 'catmullrom', 0.5), {
    steps: 140, radial: 16, radius: () => 0.023, roundness: () => 2.2,
    ripple: (a, t) => 1 + 0.05 * Math.cos(t * 260)
  });
  return { geometry: loftRings(rings), rimGeo, rimAt: (phi) => hoodPoint(phi, 1, seed) };
}

/* ------------------------------ drawstrings ---------------------------- */

function buildCord(side, start) {
  const s = side;
  const pts = [
    start.clone(),
    new THREE.Vector3(s * 0.072, start.y - 0.09, start.z + 0.055),
    new THREE.Vector3(s * 0.085, start.y - 0.22, start.z + 0.085),
    new THREE.Vector3(s * 0.070, start.y - 0.34, start.z + 0.070),
    new THREE.Vector3(s * 0.082, start.y - 0.45, start.z + 0.048)
  ];
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
  const geo = sweep(curve, {
    steps: 60, radial: 10, radius: () => 0.0072, roundness: () => 2.0,
    ripple: (a, t) => 1 + 0.12 * Math.cos(a * 4 + t * 90),
    capStart: true
  });
  return { geo, end: curve.getPointAt(1), tangent: curve.getTangentAt(1) };
}

/* ------------------------------- assembly ------------------------------ */

export function createHoodie({ seed = 3.17 } = {}) {
  const group = new THREE.Group();
  group.name = 'hoodie';

  const shell = createFabricMaterial({ color: 0xff2e88, accent: 0x14f195, role: 'shell' });
  // The lining runs the colourway backwards, so peeking inside is a reward.
  const lining = createFabricMaterial({
    color: 0x14f195, accent: 0xff2e88, side: THREE.BackSide,
    roughness: 0.95, knit: 1.8, role: 'lining'
  });
  const ribbing = createFabricMaterial({
    color: 0xff2e88, accent: 0x14f195, knit: 0.35, roughness: 0.92, role: 'rib'
  });
  const cordMat = createFabricMaterial({
    color: 0xfefefe, accent: 0xfefefe, knit: 4.0, tint: 0.25, role: 'cord'
  });
  const metal = new THREE.MeshPhysicalMaterial({
    color: 0xd8d8e0, metalness: 1.0, roughness: 0.22, envMapIntensity: 1.4
  });

  const meshes = [];
  const add = (geometry, material, parent = group, name = '') => {
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = true;
    m.receiveShadow = true;
    m.name = name;
    parent.add(m);
    meshes.push(m);
    return m;
  };

  /* body */
  const torso = buildTorso(seed);
  add(torso.geometry, shell, group, 'torso');

  // Inner lining so the neck opening reads as a lined garment, not a hole.
  const inner = torso.geometry.clone();
  inner.scale(0.978, 0.998, 0.978);
  add(inner, lining, group, 'lining');

  const yoke = buildYoke(torso.topRing, seed);
  add(yoke.geometry, shell, group, 'yoke');
  const yokeInner = yoke.geometry.clone();
  yokeInner.scale(0.975, 0.997, 0.975);
  add(yokeInner, lining, group, 'yokeLining');

  add(buildCollar(), ribbing, group, 'collar');
  add(buildWaistband(seed), ribbing, group, 'waistband');

  /* arms */
  for (const side of [1, -1]) {
    const sleeve = buildSleeve(side, seed);
    add(sleeve.geometry, shell, group, side > 0 ? 'sleeveR' : 'sleeveL');
    add(buildCuff(sleeve.curve), ribbing, group, 'cuff');
  }

  /* pocket */
  const pocket = buildPocket(seed);
  add(pocket.geometry, shell, group, 'pocket');
  for (const p of pocket.piping) add(p, ribbing, group, 'piping');

  /* hood — on its own pivot so it can flop up and down */
  const hoodPivot = new THREE.Group();
  hoodPivot.position.set(0, 0.355, 0.03);
  group.add(hoodPivot);
  const hoodMesh = new THREE.Group();
  hoodMesh.position.set(0, -0.355, -0.03);
  hoodPivot.add(hoodMesh);

  const hood = buildHood(seed);
  add(hood.geometry, shell, hoodMesh, 'hood');
  const hoodLining = hood.geometry.clone();
  hoodLining.scale(0.965, 0.965, 0.965);
  hoodLining.translate(0, HOOD_C.y * 0.035, HOOD_C.z * -0.035);
  add(hoodLining, lining, hoodMesh, 'hoodLining');
  add(hood.rimGeo, ribbing, hoodMesh, 'hoodRim');

  /* drawstrings + hardware */
  for (const side of [1, -1]) {
    const eyelet = hood.rimAt(side * 0.30);
    const start = new THREE.Vector3(side * 0.062, eyelet.y - 0.005, eyelet.z * 0.55 + 0.10);
    const cord = buildCord(side, start);
    add(cord.geo, cordMat, group, 'cord');

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.004, 10, 24), metal);
    ring.position.copy(start);
    ring.rotation.x = 0.35;
    group.add(ring);
    meshes.push(ring);

    const aglet = new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.0085, 0.036, 16), metal);
    aglet.position.copy(cord.end);
    aglet.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cord.tangent.clone().normalize());
    aglet.translateY(0.014);
    group.add(aglet);
    meshes.push(aglet);
  }

  /* woven hem tag */
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.052, 0.03), lining);
  tag.position.set(0.238, HEM_Y - 0.03, 0.055);
  tag.rotation.set(0, 0.9, 0.12);
  group.add(tag);
  meshes.push(tag);

  /* ---------------------------- behaviour ---------------------------- */

  // Up: stands off the shoulders. Down: rotates back and collapses along its
  // own axis, so it lies on the upper back as a flattened roll of cloth.
  const HOOD_UP = { rx: -0.10, y: 0.0, z: 0.0, sx: 1.0, sy: 1.0 };
  const HOOD_DOWN = { rx: -1.32, y: -0.045, z: 0.0, sx: 1.08, sy: 0.46 };
  let hoodTarget = HOOD_DOWN;
  const hoodState = { ...HOOD_DOWN };

  const api = {
    group,
    meshes,
    materials: { shell, lining, ribbing, cordMat, metal },
    setHoodUp(up) {
      hoodTarget = up ? HOOD_UP : HOOD_DOWN;
    },
    setWireframe(on) {
      for (const m of [shell, lining, ribbing, cordMat]) m.wireframe = on;
      metal.wireframe = on;
    },
    update(dt, t) {
      const k = 1 - Math.pow(0.0008, dt);
      for (const key of ['rx', 'y', 'z', 'sx', 'sy']) {
        hoodState[key] = lerp(hoodState[key], hoodTarget[key], k);
      }
      hoodPivot.rotation.x = hoodState.rx + Math.sin(t * 0.9) * 0.012;
      hoodPivot.position.y = 0.355 + hoodState.y;
      hoodPivot.position.z = 0.03 + hoodState.z;
      hoodPivot.scale.set(hoodState.sx, hoodState.sy, hoodState.sx);
      // Idle float, because a hoodie on an invisible mannequin should breathe.
      group.position.y = Math.sin(t * 0.8) * 0.012;
      group.rotation.z = Math.sin(t * 0.55) * 0.008;
    }
  };
  return api;
}
