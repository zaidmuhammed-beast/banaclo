import { MODELS } from './models.js';
import { buildFigure } from './figures.js';

/* ------------------------------------------------------------------ *
 *  Scroll-driven hero.
 *
 *  Five figures stand in a row. The whole row is one transformed
 *  element, so "zooming into a model" is a single scale + translate
 *  that puts that model's centre at the centre of the viewport. Scroll
 *  maps to a keyframe track:
 *
 *      0.0  the full row
 *      0.2  model 1 fills the frame
 *      0.4  model 2 ...
 *
 *  Everything is a pure function of scroll position, so scrolling back
 *  up rewinds exactly — nothing is latched.
 * ------------------------------------------------------------------ */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountHero() {
  const section = document.getElementById('hero');
  const row = document.getElementById('hero-row');
  const lead = document.getElementById('hero-lead');
  const caption = document.getElementById('hero-caption');
  const dotsWrap = document.getElementById('hero-dots');
  const cue = document.getElementById('hero-cue');
  if (!section || !row) return null;

  /* ------------------------------ build ------------------------------ */
  const figs = MODELS.map((m, i) => {
    const el = document.createElement('figure');
    el.className = 'model';
    el.dataset.index = String(i);
    el.style.setProperty('--card', m.card);
    el.style.transform = `translateY(${m.offset}px) scale(${m.scale}) rotate(${m.rot}deg)`;
    el.innerHTML = `
      <span class="model-glow"></span>
      <span class="model-art">${buildFigure(m.figure)}</span>
      <span class="model-tag">${m.look}</span>`;

    // Optional real photography, layered over the drawing.
    if (m.photo) {
      const img = new Image();
      img.className = 'model-photo';
      img.alt = `${m.name} wearing the ${m.colourway} hoodie`;
      img.decoding = 'async';
      img.loading = i < 2 ? 'eager' : 'lazy';
      img.addEventListener('load', () => {
        el.classList.add('has-photo');
        el.querySelector('.model-art').setAttribute('aria-hidden', 'true');
      });
      img.addEventListener('error', () => img.remove());
      img.src = (import.meta.env.BASE_URL || '/') + m.photo;
      el.appendChild(img);
    }
    row.appendChild(el);
    return el;
  });

  caption.innerHTML = MODELS.map((m) => `
    <div class="cap" data-index="${m.id}">
      <p class="cap-look">${m.look}</p>
      <h2 class="cap-name">${m.name}</h2>
      <p class="cap-way"><i style="--c:${m.card}"></i>${m.colourway}</p>
      <p class="cap-note">${m.note}</p>
    </div>`).join('');
  const caps = [...caption.querySelectorAll('.cap')];

  const dots = ['ALL', ...MODELS.map((_, i) => String(i + 1))].map((label, k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot';
    b.textContent = label;
    b.setAttribute('aria-label', k === 0 ? 'Show all looks' : `Look ${k}`);
    b.addEventListener('click', () => scrollToStage(k));
    dotsWrap.appendChild(b);
    return b;
  });

  /* ----------------------------- measure ----------------------------- */
  const geo = { sAll: 1, sOne: 1, cx: 0, cy: 0, pts: [] };

  function measure() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    geo.vw = vw;
    geo.vh = vh;
    const rw = row.offsetWidth;
    const rh = row.offsetHeight;
    if (!rw || !rh) return;

    geo.cx = rw / 2;
    geo.cy = rh / 2;
    geo.pts = figs.map((el, i) => ({
      cx: el.offsetLeft + el.offsetWidth / 2,
      cy: el.offsetTop + el.offsetHeight / 2 + MODELS[i].offset
    }));

    const boxH = figs[0].offsetHeight;
    geo.sAll = Math.min((vw * 0.86) / rw, (vh * 0.38) / rh);

    // Each figure has its own height (they are not all the same build), so the
    // close-up scale is per model — otherwise the tall ones lose their heads.
    // On a phone the caption occupies the lower quarter, so the close-up has
    // less height to play with than on a wide screen.
    const closeFill = vw < 700 ? 0.76 : 0.95;
    for (let i = 0; i < geo.pts.length; i++) {
      const fit = (vh * closeFill) / (boxH * MODELS[i].scale);
      geo.pts[i].s = Math.max(fit, geo.sAll * 1.6);
    }
    geo.sOne = Math.max(...geo.pts.map((q) => q.s));

    // Wide: the line-up sits low, under the headline. Close: the figure
    // moves off-centre so the caption gets the other half of the screen.
    geo.wideDrop = vh * 0.15;
    geo.closeShift = vw >= 900 ? vw * 0.14 : 0;
    // On a phone the caption lives under the figure, so lift the figure clear.
    geo.closeLift = vw < 700 ? vh * 0.09 : vh * 0.02;
  }

  /* ----------------------------- progress ---------------------------- */
  const stages = MODELS.length;              // wide->1, 1->2, 2->3, 3->4, 4->5

  function progress() {
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-rect.top / total, 0, 1);
  }

  function scrollToStage(k) {
    const total = section.offsetHeight - window.innerHeight;
    const p = k === 0 ? 0 : k / stages;
    window.scrollTo({
      top: section.offsetTop + p * total,
      behavior: reduced ? 'auto' : 'smooth'
    });
  }

  /* ------------------------------ render ----------------------------- */
  let lastActive = -2;

  function apply(p) {
    if (!geo.pts.length) return;

    const x = p * stages;
    const i = clamp(Math.floor(x), 0, stages - 1);
    const t = clamp(x - i, 0, 1);
    const e = i === 0 ? easeInOut(t) : smoother(t);

    const from = i === 0
      ? { s: geo.sAll, cx: geo.cx, cy: geo.cy, focus: 0 }
      : { ...geo.pts[i - 1], focus: i - 1 };
    const to = { ...geo.pts[i], focus: i };

    let s = lerp(from.s, to.s, e);
    // Pull back a touch mid-pan, the way a camera operator would.
    if (i > 0) s *= 1 - 0.16 * Math.sin(Math.PI * t);

    // Normalise against *this* model's close-up scale, not the tallest one,
    // so every stage settles at a true zoom of 1 and the others clear out.
    const zoom = clamp((s - geo.sAll) / Math.max(to.s - geo.sAll, 1e-4), 0, 1);

    // transform-origin is 0 0, so a row point p lands at (t + p * s). Solve
    // for the translation that puts the focus point at the centre of frame.
    const fx = lerp(from.cx, to.cx, e);
    const fy = lerp(from.cy, to.cy, e);
    const tx = geo.vw / 2 + geo.closeShift * zoom - fx * s;
    const ty = geo.vh / 2 + geo.wideDrop * (1 - zoom) - geo.closeLift * zoom - fy * s;
    row.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
    const focus = lerp(from.focus, to.focus, e);

    // Once we're in close, the neighbours are gone.
    for (let j = 0; j < figs.length; j++) {
      const d = Math.min(Math.abs(j - focus), 1);
      const o = clamp(1 - zoom * d * 1.35, 0, 1);
      figs[j].style.opacity = o.toFixed(3);
      // Take faded figures out of painting entirely, rather than compositing
      // five full-height SVG layers on every frame.
      figs[j].style.visibility = o < 0.004 ? 'hidden' : 'visible';
    }

    const settle = i === 0 ? e : 1 - Math.sin(Math.PI * t);
    const active = Math.round(focus);
    const capOpacity = zoom * settle;
    for (let j = 0; j < caps.length; j++) {
      caps[j].style.opacity = j === active ? capOpacity.toFixed(3) : '0';
      caps[j].style.transform = `translateY(${((1 - capOpacity) * 26).toFixed(1)}px)`;
    }

    // The headline clears out early rather than ghosting over the models.
    const leadOut = clamp(p * stages * 2.1, 0, 1);
    lead.style.opacity = (1 - leadOut).toFixed(3);
    lead.style.transform = `translate(-50%, ${(-leadOut * 46).toFixed(1)}px)`;
    row.style.setProperty('--tag-opacity', (1 - zoom).toFixed(3));
    cue.style.opacity = (1 - clamp(p * 6, 0, 1)).toFixed(3);

    const dotActive = zoom > 0.55 ? active + 1 : 0;
    if (dotActive !== lastActive) {
      dots.forEach((d, k) => d.classList.toggle('is-on', k === dotActive));
      lastActive = dotActive;
    }
    section.style.setProperty('--look', MODELS[active].card);
  }

  /* ------------------------------- loop ------------------------------ */
  let shown = 0;
  let running = false;
  let visible = true;
  let last = 0;

  function frame(now) {
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016;
    last = now;
    const target = progress();
    // Frame-rate independent easing: a slow frame must not mean a slow tween.
    shown = reduced ? target : shown + (target - shown) * (1 - Math.pow(0.0015, dt));
    if (Math.abs(target - shown) < 0.0002) shown = target;
    apply(shown);
    if (running && visible) requestAnimationFrame(frame);
    else { running = false; last = 0; }
  }

  function kick() {
    if (!running && visible) { running = true; last = 0; requestAnimationFrame(frame); }
  }

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) kick();
  }, { rootMargin: '10% 0px' }).observe(section);

  const onResize = () => { measure(); shown = progress(); apply(shown); kick(); };
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', kick, { passive: true });

  measure();
  shown = progress();
  apply(shown);
  kick();

  return { measure, scrollToStage, apply: () => apply(progress()) };
}
