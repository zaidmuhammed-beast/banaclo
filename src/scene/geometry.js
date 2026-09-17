import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 *  Small maths toolbox used by the procedural garment builder.
 * ------------------------------------------------------------------ */

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (t) => t * t * (3 - 2 * t);
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/** Catmull-Rom through a list of scalars, t in [0,1] across the whole list. */
export function spline(values, t) {
  const n = values.length;
  if (n === 1) return values[0];
  const x = clamp(t, 0, 1) * (n - 1);
  const i = Math.min(Math.floor(x), n - 2);
  const f = x - i;
  const p0 = values[Math.max(i - 1, 0)];
  const p1 = values[i];
  const p2 = values[i + 1];
  const p3 = values[Math.min(i + 2, n - 1)];
  const f2 = f * f;
  const f3 = f2 * f;
  return 0.5 * ((2 * p1) + (-p0 + p2) * f +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * f3);
}

/* ---------------------------- value noise ---------------------------- */

function hash3(x, y, z) {
  let h = x * 374761393 + y * 668265263 + z * 2147483647;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

export function noise3(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = smoothstep(x - ix), fy = smoothstep(y - iy), fz = smoothstep(z - iz);
  const c = (dx, dy, dz) => hash3(ix + dx, iy + dy, iz + dz);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), fx);
  const x10 = lerp(c(0, 1, 0), c(1, 1, 0), fx);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), fx);
  const x11 = lerp(c(0, 1, 1), c(1, 1, 1), fx);
  return lerp(lerp(x00, x10, fy), lerp(x01, x11, fy), fz) * 2 - 1;
}

export function fbm3(x, y, z, octaves = 4) {
  let amp = 0.5, sum = 0, f = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise3(x * f, y * f, z * f);
    f *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

/* --------------------------- cross sections --------------------------- */

/**
 * Superellipse cross-section: n = 2 is an ellipse, higher n squares it off,
 * which is what gives a garment its flat-ish front and back panels.
 */
export function superellipse(angle, halfWidth, halfDepth, n = 2) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const p = 2 / n;
  const x = Math.sign(c) * Math.pow(Math.abs(c), p) * halfWidth;
  const z = Math.sign(s) * Math.pow(Math.abs(s), p) * halfDepth;
  return { x, z };
}

/* ------------------------------ lofting ------------------------------ */

/**
 * Builds a quad mesh from an ordered list of rings of equal length.
 * Rings run bottom -> top, points inside a ring run counter-clockwise.
 */
export function loftRings(rings, { closedRing = true, flipFaces = false } = {}) {
  const rows = rings.length;
  const cols = rings[0].length;
  const cCount = closedRing ? cols + 1 : cols; // duplicate seam column for clean UVs
  const position = new Float32Array(rows * cCount * 3);
  const uv = new Float32Array(rows * cCount * 2);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cCount; c++) {
      const p = rings[r][c % cols];
      const i = r * cCount + c;
      position[i * 3 + 0] = p.x;
      position[i * 3 + 1] = p.y;
      position[i * 3 + 2] = p.z;
      uv[i * 2 + 0] = c / (cCount - 1);
      uv[i * 2 + 1] = r / (rows - 1);
    }
  }

  const index = [];
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cCount - 1; c++) {
      const a = r * cCount + c;
      const b = a + 1;
      const d = a + cCount;
      const e = d + 1;
      if (flipFaces) index.push(a, b, d, b, e, d);
      else index.push(a, d, b, b, d, e);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Sweeps a variable-radius, superelliptical cross-section along a curve.
 * Used for sleeves, ribbed cuffs, drawstrings and piping.
 */
export function sweep(curve, {
  steps = 48,
  radial = 32,
  radius = () => 0.1,
  squash = () => 1,
  roundness = () => 2,
  ripple = null,
  capStart = false,
  capEnd = false
} = {}) {
  const frames = curve.computeFrenetFrames(steps, false);
  const rings = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const center = curve.getPointAt(t);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = radius(t);
    const sq = squash(t);
    const n = roundness(t);
    const ring = [];
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const { x, z } = superellipse(a, r, r * sq, n);
      let mul = 1;
      if (ripple) mul = ripple(a, t);
      ring.push(new THREE.Vector3(
        center.x + N.x * x * mul + B.x * z * mul,
        center.y + N.y * x * mul + B.y * z * mul,
        center.z + N.z * x * mul + B.z * z * mul
      ));
    }
    rings.push(ring);
  }

  if (capStart) rings.unshift(collapseRing(rings[0], curve.getPointAt(0)));
  if (capEnd) rings.push(collapseRing(rings[rings.length - 1], curve.getPointAt(1)));

  // Frenet frames wind the cross-section the opposite way to loftRings'
  // default, so the tube would otherwise render inside out.
  return loftRings(rings, { flipFaces: true });
}

function collapseRing(ring, center) {
  return ring.map((p) => p.clone().lerp(center, 0.97));
}

/** Rounded-rectangle-ish mask in [0,1]^2, 1 inside, fading to 0 at the border. */
export function edgeFalloff(u, v, feather = 0.18) {
  const fu = smoothstep(clamp(Math.min(u, 1 - u) / feather, 0, 1));
  const fv = smoothstep(clamp(Math.min(v, 1 - v) / feather, 0, 1));
  return fu * fv;
}

/** Merges geometries that share the same attribute layout (position/uv/index). */
export function mergeGeometries(geometries) {
  let vCount = 0, iCount = 0;
  for (const g of geometries) {
    vCount += g.attributes.position.count;
    iCount += g.index.count;
  }
  const position = new Float32Array(vCount * 3);
  const normal = new Float32Array(vCount * 3);
  const uv = new Float32Array(vCount * 2);
  const index = new Uint32Array(iCount);
  let vo = 0, io = 0;
  for (const g of geometries) {
    position.set(g.attributes.position.array, vo * 3);
    normal.set(g.attributes.normal.array, vo * 3);
    uv.set(g.attributes.uv.array, vo * 2);
    const gi = g.index.array;
    for (let i = 0; i < gi.length; i++) index[io + i] = gi[i] + vo;
    vo += g.attributes.position.count;
    io += gi.length;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(position, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(index, 1));
  return out;
}
