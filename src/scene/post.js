import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/* Final look-pass: chromatic aberration, scanlines, grain, vignette and a
 * glitch burst we fire whenever the configurator changes something. */
const LookShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uAberration: { value: 0.0016 },
    uGrain: { value: 0.055 },
    uVignette: { value: 0.9 },
    uScanline: { value: 0.045 },
    uGlitch: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(1, 1) }
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uTime, uAberration, uGrain, uVignette, uScanline, uGlitch;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

    void main(){
      vec2 uv = vUv;
      vec2 c = uv - 0.5;

      // Glitch: shove random horizontal slices sideways.
      if (uGlitch > 0.001) {
        float band = floor(uv.y * 28.0);
        float r = hash(vec2(band, floor(uTime * 22.0)));
        float shift = (r - 0.5) * 0.09 * uGlitch * step(0.62, r);
        uv.x = fract(uv.x + shift);
      }

      float r2 = dot(c, c);
      vec2 dir = c * (uAberration + uGlitch * 0.006) * (0.35 + r2 * 3.0);
      vec3 col;
      col.r = texture2D(tDiffuse, uv + dir).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - dir).b;

      col *= 1.0 - uScanline * (0.5 + 0.5 * sin(uv.y * uResolution.y * 1.6));
      col *= mix(1.0, smoothstep(0.95, 0.22, r2 * 1.7), uVignette);
      col += (hash(uv * uResolution + fract(uTime) * 91.7) - 0.5) * uGrain;

      gl_FragColor = vec4(col, 1.0);
    }
  `
};

export function createComposer(renderer, scene, camera) {
  const size = renderer.getSize(new THREE.Vector2());
  const pr = renderer.getPixelRatio();
  const target = new THREE.WebGLRenderTarget(size.x * pr, size.y * pr, {
    type: THREE.HalfFloatType,
    samples: renderer.capabilities.isWebGL2 ? 4 : 0
  });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.34, 0.55, 0.96);
  composer.addPass(bloom);

  const look = new ShaderPass(LookShader);
  composer.addPass(look);
  composer.addPass(new OutputPass());

  let glitch = 0;

  return {
    composer,
    bloom,
    look,
    setSize(w, h) {
      composer.setSize(w, h);
      bloom.setSize(w, h);
      look.uniforms.uResolution.value.set(w, h);
    },
    punch(amount = 1) {
      glitch = Math.max(glitch, amount);
    },
    update(dt, t) {
      glitch = Math.max(0, glitch - dt * 2.6);
      look.uniforms.uTime.value = t;
      look.uniforms.uGlitch.value = glitch;
    },
    render() {
      composer.render();
    }
  };
}
