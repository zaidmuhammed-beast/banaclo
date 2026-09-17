import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 *  Fabric material: MeshPhysicalMaterial + a procedural pattern /
 *  knit-weave shader injected through onBeforeCompile.
 * ------------------------------------------------------------------ */

export const PATTERNS = [
  'solid', 'gradient', 'tiedye', 'camo', 'checker', 'static', 'stripes', 'holo'
];

const GLSL_NOISE = /* glsl */`
  float hash31(vec3 p){
    p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float vnoise(vec3 x){
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
          mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
          mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm3(vec3 p){
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 5; i++){ s += a * vnoise(p); p *= 2.03; a *= 0.5; }
    return s;
  }
  vec3 hue2rgb(float h){
    return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  }
`;

const VERT_HEAD = /* glsl */`
  varying vec3 vBWorldPos;
  varying vec3 vBObjPos;
  varying vec3 vBObjNrm;
  varying vec3 vBWorldNrm;
`;

const VERT_BODY = /* glsl */`
  #include <begin_vertex>
  vBObjPos = position;
  vBObjNrm = normalize(objectNormal);
  vBWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
  vBWorldNrm = normalize(mat3(modelMatrix) * objectNormal);
`;

const FRAG_HEAD = /* glsl */`
  varying vec3 vBWorldPos;
  varying vec3 vBObjPos;
  varying vec3 vBObjNrm;
  varying vec3 vBWorldNrm;

  uniform float uTime;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform int   uPattern;
  uniform float uPatternScale;
  uniform float uFuzz;
  uniform float uKnit;
  uniform float uWeirdness;
  uniform float uTint;
  uniform sampler2D uPrintMap;
  uniform float uPrintOn;
  uniform vec2  uPrintCenter;
  uniform vec2  uPrintSize;

  ${GLSL_NOISE}

  // Knit loops: two interlocking sine fields, offset row by row.
  float knitField(vec3 p){
    vec2 q = vec2(p.x * 0.85 + p.z * 0.45, p.y) * (140.0 * uKnit);
    float row = floor(q.y);
    float off = mod(row, 2.0) * 0.5;
    float a = sin((q.x + off) * 3.14159);
    float b = sin(q.y * 3.14159);
    return 0.5 + 0.5 * (a * b);
  }

  vec3 patternColor(vec3 base, vec3 accent){
    vec3 p = vBObjPos * uPatternScale;
    float t = uTime;

    if (uPattern == 1) {                                   // GRADIENT DIP
      float g = smoothstep(-0.45, 0.45, vBObjPos.y + fbm3(p * 1.6) * 0.12);
      return mix(accent, base, g);
    }
    if (uPattern == 2) {                                   // TIE DYE
      vec2 c = vBObjPos.xy * 3.0;
      float r = length(c);
      float ang = atan(c.y, c.x) + r * 2.6 + fbm3(p * 1.4 + t * 0.05) * 3.0;
      float band = 0.5 + 0.5 * sin(ang * 3.0 + r * 6.0);
      band = smoothstep(0.25, 0.75, band);
      vec3 rainbow = hue2rgb(fract(ang * 0.08 + 0.15));
      return mix(mix(base, accent, band), rainbow, 0.35 * uWeirdness);
    }
    if (uPattern == 3) {                                   // CAMO
      float n = fbm3(p * 1.1);
      vec3 c = base;
      c = mix(c, accent, step(0.52, n));
      c = mix(c, base * 0.45, step(0.63, n));
      c = mix(c, accent * 1.35, step(0.72, n));
      return c;
    }
    if (uPattern == 4) {                                   // CHECKER
      vec3 g = floor(vBObjPos * (uPatternScale * 7.0));
      float k = mod(g.x + g.y + g.z, 2.0);
      return mix(base, accent, k);
    }
    if (uPattern == 5) {                                   // STATIC
      float n = vnoise(vec3(vBObjPos.xy * 320.0, floor(t * 12.0)));
      float scan = 0.5 + 0.5 * sin(vBObjPos.y * 260.0 - t * 6.0);
      return mix(base, accent, smoothstep(0.45, 0.62, n * 0.7 + scan * 0.45));
    }
    if (uPattern == 6) {                                   // RACER STRIPES
      float d = (vBObjPos.x * 0.72 + vBObjPos.y * 0.72) * (uPatternScale * 6.0) - t * 0.35;
      float k = smoothstep(0.42, 0.5, abs(fract(d) - 0.5));
      return mix(base, accent, k);
    }
    if (uPattern == 7) {                                   // HOLOGRAM
      vec3 v = normalize(cameraPosition - vBWorldPos);
      float f = 1.0 - abs(dot(v, normalize(vBWorldNrm)));
      vec3 sheen = hue2rgb(fract(f * 1.35 + vBObjPos.y * 0.6 + t * 0.06));
      return mix(mix(base, accent, f), sheen, 0.55 + 0.35 * uWeirdness);
    }
    return base;                                           // SOLID
  }
`;

const FRAG_BODY = /* glsl */`
  #include <color_fragment>
  {
    vec3 pat = patternColor(uColorA, uColorB);

    // Screen print, planar-projected onto the chest.
    if (uPrintOn > 0.5) {
      vec2 puv = (vBObjPos.xy - uPrintCenter) / uPrintSize + 0.5;
      float facing = smoothstep(0.25, 0.75, vBObjNrm.z);
      if (puv.x > 0.0 && puv.x < 1.0 && puv.y > 0.0 && puv.y < 1.0 && facing > 0.0) {
        vec4 ink = texture2D(uPrintMap, puv);
        pat = mix(pat, ink.rgb, ink.a * facing * uPrintOn);
      }
    }

    // Knit grain — darkens the loop valleys so the cloth reads as knitted.
    float k = knitField(vBObjPos);
    pat *= mix(1.0, 0.82 + 0.28 * k, uFuzz * 0.9);
    pat *= 1.0 + 0.05 * fbm3(vBObjPos * 40.0);

    // Halo of loose fibres around the silhouette.
    vec3 vdir = normalize(cameraPosition - vBWorldPos);
    float fres = pow(1.0 - clamp(dot(vdir, normalize(vBWorldNrm)), 0.0, 1.0), 3.0);
    pat += fres * uFuzz * 0.16 * (uColorA * 0.5 + 0.5);

    diffuseColor.rgb = mix(diffuseColor.rgb, pat, uTint);
  }
`;

const FRAG_ROUGH = /* glsl */`
  #include <roughnessmap_fragment>
  roughnessFactor *= 1.0 - 0.28 * knitField(vBObjPos) * uFuzz;
  roughnessFactor = clamp(roughnessFactor, 0.04, 1.0);
`;

let materialId = 0;
const registry = [];

/** A patched MeshPhysicalMaterial that behaves like knitted cotton fleece. */
export function createFabricMaterial({
  color = 0xff2e88,
  accent = 0x00e5ff,
  roughness = 0.88,
  metalness = 0.0,
  sheen = 1.0,
  sheenRoughness = 0.7,
  sheenColor = 0xffffff,
  side = THREE.FrontSide,
  tint = 1.0,
  knit = 1.0,
  role = 'shell'
} = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    color, roughness, metalness, sheen, sheenRoughness,
    sheenColor: new THREE.Color(sheenColor),
    side,
    envMapIntensity: 0.75
  });

  const uniforms = {
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color(color) },
    uColorB: { value: new THREE.Color(accent) },
    uPattern: { value: 0 },
    uPatternScale: { value: 1.0 },
    uFuzz: { value: 0.75 },
    uKnit: { value: knit },
    uWeirdness: { value: 0.5 },
    uTint: { value: tint },
    uPrintMap: { value: null },
    uPrintOn: { value: 0 },
    uPrintCenter: { value: new THREE.Vector2(0, 0.06) },
    uPrintSize: { value: new THREE.Vector2(0.42, 0.28) }
  };

  const key = `fabric-${materialId++}`;
  mat.userData.uniforms = uniforms;
  mat.userData.role = role;

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = VERT_HEAD + shader.vertexShader
      .replace('#include <begin_vertex>', VERT_BODY);
    shader.fragmentShader = FRAG_HEAD + shader.fragmentShader
      .replace('#include <color_fragment>', FRAG_BODY)
      .replace('#include <roughnessmap_fragment>', FRAG_ROUGH);
    mat.userData.shader = shader;
  };
  mat.customProgramCacheKey = () => key;

  registry.push(mat);
  return mat;
}

/**
 * Push a uniform to every fabric material, or just the ones in `roles`
 * ('shell' | 'rib' | 'lining' | 'cord').
 */
export function setFabricUniform(name, value, { roles = null } = {}) {
  for (const mat of registry) {
    if (roles && !roles.includes(mat.userData.role)) continue;
    const u = mat.userData.uniforms[name];
    if (!u) continue;
    if (u.value && u.value.isColor) u.value.set(value);
    else if (u.value && u.value.isVector2) u.value.copy(value);
    else u.value = value;
  }
}

export function fabricMaterials() {
  return registry;
}

export function tickFabrics(t) {
  for (const mat of registry) mat.userData.uniforms.uTime.value = t;
}
