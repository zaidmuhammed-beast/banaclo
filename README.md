# BANACLO — The Everywhere Hoodie

A scroll-driven lookbook for Drop 001.

The page opens on five models standing in a row. Scrolling dollies the camera into each
one in turn — the others drop away as you go in — and scrolling back up rewinds to the
full line-up.

![The line-up](docs/lookbook.jpg)

![One look, zoomed](docs/look.jpg)

No framework, no 3D, no image downloads: the whole thing is ~14 kB of JavaScript
(5.8 kB gzipped) and the figures are generated as SVG at runtime.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # -> dist/
npm run preview    # serve the production build
```

The build is a static bundle. It needs to be *served* (ES modules don't load over
`file://`).

### Deploying

`netlify.toml` sets the build command (`npm run build`), the publish directory (`dist`)
and pins Node 22, since Vite 7 needs `^20.19 || >=22.12`. Point Netlify at the repo and
it builds the default branch with no further configuration.

`vite.config.js` uses `base: './'`, so asset paths are relative and the same bundle works
on the production URL, on deploy previews, and under a subpath — which also makes GitHub
Pages or any static host a drop-in alternative.

## How the scroll works

The five figures live in one flex row, and the entire row is a single transformed
element. "Zooming into a model" is therefore one `scale` + `translate` that puts that
model's centre at the centre of the frame, with `transform-origin: 0 0` and the
translation solved explicitly (`t = viewportCentre − focus × scale`) rather than left to
layout — a flex row wider than the viewport is not reliably centred by CSS alone.

Scroll position maps onto a keyframe track of one screen per stage:

| progress | frame |
|---|---|
| `0.0` | all five, wide |
| `0.2` | look 01 fills the screen |
| `0.4` … `1.0` | looks 02 – 05 |

Everything on screen — scale, pan, per-figure opacity, caption, dots, backdrop tint — is
a pure function of that one number, so nothing is latched and scrolling back up rewinds
exactly. Between two close-ups the scale dips slightly, the way a camera operator pulls
back before swinging across.

The close-up scale is computed per model (they are not all the same build, so a single
shared scale would decapitate the tall ones), and the wide shot drops the row below the
headline while the close-up shifts it off-centre to make room for the caption.

## Swapping in real photography

The figures are placeholders, drawn from a stick skeleton in `figures.js`: tapered limb
paths, five poses, parametric colourway, hood up or down.

To replace them with real shots, drop files into `public/models/` named `01.jpg` …
`05.jpg`. Each fades in over its drawing on load, and a missing file just leaves the
drawing in place — no code change. See `public/models/README.md` for the shape and
background the photos want. Edit `src/hero/models.js` to change names, captions,
colourways or which pose a placeholder uses.

## Layout

```
index.html              markup for the hero, loader and header
src/
  main.js               mounts the hero and the marquee
  styles.css            neon-brutalist chrome
  hero/
    hero.js             scroll -> keyframe track, the zoom itself
    figures.js          parametric SVG lookbook figures
    models.js           the five looks (and their photo slots)
public/
  models/               drop real photography here
```

## Notes

- Easing is frame-rate independent (`1 - 0.0015^dt`), so a slow frame doesn't mean a
  slow tween.
- Faded-out figures are set to `visibility: hidden`, not just `opacity: 0`, so the
  browser stops compositing five full-height SVG layers on every frame.
- There is no global `scroll-behavior: smooth` — it animates every programmatic jump,
  including ones that should be instant. The look picker opts in explicitly.
- The scroll work is gated behind an `IntersectionObserver`, so nothing runs when the
  hero is off screen.

## History

This started as a 3D hoodie configurator built with Three.js — a fully procedural
garment (torso, sleeves, hood, pocket, ribbing lofted from profile curves) with eight
pattern shaders and a live screen print. That section was removed in favour of the
lookbook; it's still in the git history if you want it back.

## Licence

MIT.
