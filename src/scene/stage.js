import * as THREE from 'three';
import { makeRingTexture, makeRadialTexture } from './textures.js';

/* The room the hoodie lives in: gradient void, neon tubes, dust, a
 * spinning text ring and a fake contact shadow. */

const BACKDROP_FRAG = /* glsl */`
  varying vec3 vDir;
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform vec3 uGlow;
  uniform float uTime;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

  void main(){
    vec3 d = normalize(vDir);
    float h = d.y * 0.5 + 0.5;
    vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, h));
    // Two slow lobes of colour drifting behind the product.
    float lobe = pow(max(dot(d, normalize(vec3(0.6, 0.15, 0.78))), 0.0), 6.0);
    float lobe2 = pow(max(dot(d, normalize(vec3(-0.7, 0.05, 0.6))), 0.0), 9.0);
    col += uGlow * (lobe * 0.20 + lobe2 * 0.14) * (0.82 + 0.18 * sin(uTime * 0.5));
    col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.018;   // dither the banding away
    gl_FragColor = vec4(col, 1.0);
  }
`;

const BACKDROP_VERT = /* glsl */`
  varying vec3 vDir;
  void main(){
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function createStage(scene) {
  const group = new THREE.Group();
  scene.add(group);

  /* ---------------------------- backdrop ---------------------------- */
  const backdropMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTop: { value: new THREE.Color(0x0a0618) },
      uBottom: { value: new THREE.Color(0x02030a) },
      uGlow: { value: new THREE.Color(0x2a1550) },
      uTime: { value: 0 }
    },
    vertexShader: BACKDROP_VERT,
    fragmentShader: BACKDROP_FRAG
  });
  const backdrop = new THREE.Mesh(new THREE.SphereGeometry(28, 32, 24), backdropMat);
  backdrop.frustumCulled = false;
  group.add(backdrop);

  /* ------------------------------ floor ------------------------------ */
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x07060f, roughness: 0.28, metalness: 0.55,
      transparent: true, opacity: 0.92, envMapIntensity: 0.7
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.62;
  floor.receiveShadow = true;
  group.add(floor);

  const grid = new THREE.GridHelper(9, 36, 0x00f0ff, 0x2a1b5e);
  grid.position.y = -0.615;
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
  grid.material.depthWrite = false;
  group.add(grid);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 1.9),
    new THREE.MeshBasicMaterial({
      map: makeRadialTexture('rgba(0,0,0,0.92)'),
      color: 0x000000,
      transparent: true, depthWrite: false, opacity: 0.9
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.605;
  group.add(shadow);

  /* -------------------------- podium + ring -------------------------- */
  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(0.78, 0.86, 0.06, 72),
    new THREE.MeshPhysicalMaterial({ color: 0x14102a, roughness: 0.35, metalness: 0.8, envMapIntensity: 1.1 })
  );
  podium.position.y = -0.59;
  podium.receiveShadow = true;
  group.add(podium);

  const ringTex = makeRingTexture('BANACLO ° HEAVYWEIGHT 3D KNIT ° ');
  ringTex.repeat.set(4, 1);
  const textRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, 0.12, 128, 1, true),
    new THREE.MeshBasicMaterial({
      map: ringTex, transparent: true, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.32, toneMapped: false
    })
  );
  textRing.position.y = -0.50;
  group.add(textRing);

  /* --------------------------- neon tubes ---------------------------- */
  const tubeGeo = new THREE.CapsuleGeometry(0.012, 2.0, 6, 16);
  const neon = [];
  const tubeSpecs = [
    { color: 0xff2e88, pos: [-1.95, 0.30, -1.9], rot: [0, 0, 0.16] },
    { color: 0x00f0ff, pos: [2.0, 0.20, -2.0], rot: [0, 0, -0.2] },
    { color: 0xb14bff, pos: [0.1, 1.5, -2.6], rot: [0, 0, Math.PI / 2] }
  ];
  for (const spec of tubeSpecs) {
    const mat = new THREE.MeshBasicMaterial({ color: spec.color, toneMapped: false });
    const mesh = new THREE.Mesh(tubeGeo, mat);
    mesh.position.fromArray(spec.pos);
    mesh.rotation.fromArray(spec.rot);
    group.add(mesh);
    const light = new THREE.PointLight(spec.color, 3.2, 8, 2);
    light.position.fromArray(spec.pos);
    group.add(light);
    neon.push({ mesh, light, base: light.intensity });
  }

  /* ------------------------------ dust ------------------------------- */
  const COUNT = 420;
  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const r = 1.1 + Math.random() * 2.6;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3 + 0] = Math.cos(a) * r;
    pos[i * 3 + 1] = -0.6 + Math.random() * 2.6;
    pos[i * 3 + 2] = Math.sin(a) * r;
    seed[i] = Math.random() * 100;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const dustMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uSize: { value: 26 * (window.devicePixelRatio || 1) } },
    vertexShader: /* glsl */`
      attribute float aSeed;
      uniform float uTime;
      uniform float uSize;
      varying float vTwinkle;
      void main(){
        vec3 p = position;
        p.y += sin(uTime * 0.35 + aSeed) * 0.22;
        p.x += cos(uTime * 0.22 + aSeed * 1.7) * 0.10;
        vTwinkle = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * 1.6 + aSeed * 3.0), 2.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize / max(-mv.z, 0.1);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      varying float vTwinkle;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * vTwinkle;
        gl_FragColor = vec4(vec3(0.75, 0.88, 1.0) * a, a * 0.8);
      }
    `
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  group.add(dust);

  /* ------------------------------ lights ----------------------------- */
  const key = new THREE.DirectionalLight(0xfff4e8, 1.45);
  key.position.set(2.4, 3.4, 2.8);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 12;
  key.shadow.camera.left = -1.6;
  key.shadow.camera.right = 1.6;
  key.shadow.camera.top = 1.6;
  key.shadow.camera.bottom = -1.6;
  key.shadow.bias = -0.0012;
  key.shadow.normalBias = 0.02;
  group.add(key);

  const fill = new THREE.DirectionalLight(0x7cc8ff, 0.45);
  fill.position.set(-3, 1.4, 1.6);
  group.add(fill);

  const rim = new THREE.SpotLight(0xff3ea5, 9, 10, 0.6, 0.45, 1.6);
  rim.position.set(-1.6, 2.2, -2.4);
  group.add(rim);

  group.add(new THREE.AmbientLight(0x3a4270, 0.22));

  return {
    group, floor, grid, textRing, dust, key, rim,
    setBackdrop(top, bottom, glow) {
      backdropMat.uniforms.uTop.value.set(top);
      backdropMat.uniforms.uBottom.value.set(bottom);
      backdropMat.uniforms.uGlow.value.set(glow);
    },
    setGridColor(c) {
      grid.material.color.set(c);
    },
    setRingColor(c) {
      textRing.material.color.set(c);
    },
    update(dt, t) {
      backdropMat.uniforms.uTime.value = t;
      dustMat.uniforms.uTime.value = t;
      textRing.rotation.y = t * 0.24;
      for (let i = 0; i < neon.length; i++) {
        const n = neon[i];
        n.light.intensity = n.base * (0.82 + 0.18 * Math.sin(t * (1.3 + i * 0.4) + i));
      }
    }
  };
}
