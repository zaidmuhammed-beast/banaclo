# BANACLO — The Everywhere Hoodie

A funky, scroll-driven lookbook and 3D hoodie configurator built with [Three.js](https://threejs.org/).

The page opens on five models standing in a row. Scrolling dollies the camera into
each one in turn — the others drop away as you go in, and scrolling back up rewinds
to the full line-up. Past the line-up sits the configurator, where the hoodie itself
is real 3D.

Every stitch of the garment is **generated procedurally in the browser** — there is no
`.glb`, no `.obj`, no texture download. The torso, shoulders, sleeves, hood, kangaroo
pocket, ribbed cuffs, waistband, drawstrings and aglets are all lofted from profile
curves and roughed up with fractal noise at load time (~88k triangles, built in
about 200 ms).

![The line-up](docs/lookbook.jpg)

![One look, zoomed](docs/look.jpg)

![The configurator](docs/hero.jpg)

![pattern shaders](docs/patterns.jpg)

## The hero

`src/hero/` is plain DOM — no WebGL — so the page is interactive before the 3D
engine has finished starting.

The five figures live in one flex row, and the entire row is a single transformed
element. "Zooming into a model" is therefore one `scale` + `translate` that puts that
model's centre at the centre of the frame, with `transform-origin: 0 0` and the
translation solved explicitly (`t = viewportCentre − focus × scale`) rather than left
to layout — a flex row wider than the viewport does not stay centred by CSS alone.

Scroll position maps onto a keyframe track of one screen per stage:

| progress | frame |
|---|---|
| `0.0` | all five, wide |
| `0.2` | look 01 fills the screen |
| `0.4` … `1.0` | looks 02 – 05 |

Everything on screen — scale, pan, per-figure opacity, caption, dots, backdrop tint —
is a pure function of that one number, so nothing is latched and scrolling back up
rewinds exactly. Between two close-ups the scale dips slightly, the way a camera
operator pulls back before swinging across.

### Swapping in real photography

The figures are placeholders drawn from a stick skeleton in `figures.js` (tapered limb
paths, five poses, parametric colourway). To replace them with real shots, drop files
into `public/models/` named `01.jpg` … `05.jpg` — each one fades in over its drawing on
load, and a missing file just leaves the drawing in place. No code change; edit
`src/hero/models.js` if you want different names, captions or colourways.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # -> dist/
npm run preview    # serve the production build
```

The build is a static bundle: drop `dist/` on any host. It needs to be *served*
(ES modules don't load over `file://`).

### Deploying

`netlify.toml` sets the build command (`npm run build`), the publish directory
(`dist`) and pins Node 22, since Vite 7 needs `^20.19 || >=22.12`. Point Netlify at the
repo and it builds the default branch with no further configuration.

`vite.config.js` uses `base: './'`, so asset paths are relative and the same bundle
works on the production URL, on deploy previews, and under a subpath — which also
makes GitHub Pages or any static host a drop-in alternative.

## What you can do with it

| | |
|---|---|
| **10 colourways** | each one repaints the garment, the lining, the text ring and the room it stands in |
| **8 pattern shaders** | solid, dip dye, tie dye, camo, checker, static, racer stripes, hologram |
| **Custom colours** | independent base + accent pickers; the lining always runs the colourway backwards |
| **Live screen print** | type your own two lines — the graphic is rasterised to a canvas and planar-projected onto the chest |
| **Hood up / down** | the hood pivots at the neck and collapses along its own axis, so "down" lies on the back as a flattened roll |
| **Fuzz / weirdness / glow** | sheen and knit contrast, chromatic aberration and grain, bloom strength |
| **X-ray** | wireframe the whole garment |
| **Snapshot** | downloads a PNG of the current configuration |

The wheel belongs to the page, so the canvas does not zoom on scroll — use the camera
view buttons (or `1`–`5`) to get closer. On touch, vertical swipes scroll the page and
horizontal drags spin the garment (`touch-action: pan-y`).

### Keyboard

`drag` spin · `scroll` zoom · `H` hood · `R` randomise · `X` x-ray · `space` auto-spin ·
`1`–`5` camera views · `S` snapshot · `double-click` hood

## How the hoodie is built

`src/scene/geometry.js` provides the toolbox — Catmull-Rom scalar splines, 3D value
noise / fBm, superellipse cross-sections, ring lofting and a variable-radius sweep
along a curve.

`src/scene/hoodie.js` uses it to grow the garment:

- **Torso** — a stack of 72 superelliptical rings. A superellipse (rather than a plain
  ellipse) is what gives a garment its flat-ish front and back panels. Each vertex is
  pushed along the cross-section normal by fBm noise, bunched towards the hem and
  pulled taut across the shoulders.
- **Yoke** — lofts the top body ring up into a smaller neck ring, with a cosine-shaped
  bulge over the shoulder caps for the sleeve heads to sit on.
- **Sleeves** — a variable-radius superelliptical tube swept along a Catmull-Rom curve
  using Frenet frames, starting *inside* the torso so there's no seam gap.
- **Hood** — an ellipsoid whose polar cut-off varies with azimuth
  (`θmax(φ) = 2.06 − 0.74·cos φ`), which is exactly a tilted plane slicing a sphere:
  the opening faces forward and the back skirt reaches down the shoulders. It renders
  twice, `FrontSide` in the shell colour and `BackSide` in the lining colour.
- **Pocket** — a patch sampled off the torso surface and pushed outwards by a feathered
  falloff, so it welds into the body with no free edges, with piping swept along the
  slanted hand openings.
- **Ribbing** — cuffs, waistband and collar modulate their radius with a cosine. Rib
  counts are kept well under the radial sample count and the scallop fades out at the
  raw edges, otherwise the ripple aliases into a fringe.

`src/scene/materials.js` patches `MeshPhysicalMaterial` through `onBeforeCompile`:
procedural pattern colour, a knit-loop field that darkens the loop valleys and
modulates roughness, a fresnel "loose fibre" halo, and the projected screen print —
all on top of three's real PBR lighting and cloth sheen.

## Layout

```
index.html              markup for the HUD, loader and customiser
src/
  main.js               renderer, camera, orbit + fly-to, app API
  styles.css            neon-brutalist chrome
  scene/
    geometry.js         splines, noise, superellipses, lofting, sweeping
    hoodie.js           the garment
    materials.js        fabric shader + pattern library
    stage.js            backdrop, floor, neon tubes, dust, text ring, lights
    post.js             bloom + chromatic aberration / grain / glitch pass
    textures.js         canvas-generated print, ring text, radial fade
  hero/
    hero.js             scroll -> keyframe track, the zoom itself
    figures.js          parametric SVG lookbook figures
    models.js           the five looks (and photo slots)
  ui/
    ui.js               control wiring
    presets.js          colourways, patterns, sizes, pricing
    confetti.js         add-to-cart burst
```

## Poking at it from the console

The app exposes itself as `window.BANACLO`:

```js
BANACLO.setPattern('holo');
BANACLO.setColor('#00ff88');
BANACLO.setHoodUp(true);
BANACLO.flyTo('hood');                                  // named view
BANACLO.flyTo({ pos: [1.2, 0.3, 0.6], target: [0, 0, 0] });  // or an inline one
```

## Notes

- Camera moves interpolate in **spherical** space around the orbit target. Lerping
  world positions fights `OrbitControls`, which re-derives its spherical state from the
  camera every frame and clamps the radius — a straight-line path near the target gets
  snapped to `minDistance`.
- The hero's easing is frame-rate independent (`1 - 0.0015^dt`), and faded-out figures
  are set to `visibility: hidden` rather than just `opacity: 0`, so the browser stops
  compositing five full-height SVG layers every frame.
- The WebGL loop does not run while the hero owns the screen.
- The shopping flow (price, sizes, add to cart) is a front-end demo. Nothing is sent
  anywhere and there is no backend.
- Requires WebGL 2. Without it the page shows a fallback message instead of failing silently.

## Licence

MIT.
