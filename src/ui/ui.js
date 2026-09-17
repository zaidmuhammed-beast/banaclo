import { COLORWAYS, PATTERN_LABELS, SIZES, BASE_PRICE, PRICE_MODIFIERS } from './presets.js';
import { createConfetti } from './confetti.js';

const $ = (id) => document.getElementById(id);

export function mountUI(app) {
  const confetti = createConfetti($('confetti'));
  const ui = {
    size: 'M',
    colorway: COLORWAYS[0].id
  };

  /* ----------------------------- helpers ----------------------------- */
  let toastTimer;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
  }

  function updatePrice() {
    const p = BASE_PRICE
      + (PRICE_MODIFIERS.pattern[app.state.pattern] ?? 0)
      + (PRICE_MODIFIERS.size[ui.size] ?? 0)
      + (app.state.print ? 8 : 0);
    $('price').textContent = `$${p}`;
    $('price-note').textContent = app.state.pattern === 'solid'
      ? 'incl. free returns'
      : `incl. ${app.state.pattern} dye job`;
    return p;
  }

  /* ---------------------------- colourways --------------------------- */
  const swatchWrap = $('colorways');
  COLORWAYS.forEach((cw) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.title = cw.name;
    b.setAttribute('aria-label', cw.name);
    b.style.setProperty('--a', cw.color);
    b.style.setProperty('--b', cw.accent);
    b.innerHTML = `<span></span><em>${cw.name}</em>`;
    b.addEventListener('click', () => applyColorway(cw));
    swatchWrap.appendChild(b);
    cw._el = b;
  });

  function applyColorway(cw) {
    ui.colorway = cw.id;
    app.setColor(cw.color);
    app.setAccent(cw.accent);
    app.setPattern(cw.pattern);
    app.setBackdrop(cw.bg);
    $('color-base').value = cw.color;
    $('color-accent').value = cw.accent;
    syncPatternChips();
    for (const c of COLORWAYS) c._el.classList.toggle('is-on', c.id === cw.id);
    document.documentElement.style.setProperty('--hot', cw.color);
    document.documentElement.style.setProperty('--cool', cw.accent);
    updatePrice();
    toast(`${cw.name} loaded`);
  }

  /* ----------------------------- patterns ---------------------------- */
  const patternWrap = $('patterns');
  PATTERN_LABELS.forEach((p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = p.label;
    b.dataset.pattern = p.id;
    b.addEventListener('click', () => {
      app.setPattern(p.id);
      syncPatternChips();
      updatePrice();
    });
    patternWrap.appendChild(b);
  });
  function syncPatternChips() {
    for (const b of patternWrap.children) {
      b.classList.toggle('is-on', b.dataset.pattern === app.state.pattern);
    }
  }

  /* ------------------------------ sizes ------------------------------ */
  const sizeWrap = $('sizes');
  SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (s === ui.size ? ' is-on' : '');
    b.textContent = s;
    b.addEventListener('click', () => {
      ui.size = s;
      for (const c of sizeWrap.children) c.classList.toggle('is-on', c.textContent === s);
      updatePrice();
    });
    sizeWrap.appendChild(b);
  });

  /* ---------------------------- colour input -------------------------- */
  $('color-base').addEventListener('input', (e) => { app.setColor(e.target.value); updatePrice(); });
  $('color-accent').addEventListener('input', (e) => {
    app.setAccent(e.target.value);
    if (app.state.print) app.setPrint(true);
  });

  /* ------------------------------ sliders ----------------------------- */
  const sliders = [
    ['s-scale', 'v-scale', (v) => app.setPatternScale(v), 1],
    ['s-fuzz', 'v-fuzz', (v) => app.setFuzz(v), 2],
    ['s-weird', 'v-weird', (v) => app.setWeirdness(v), 2],
    ['s-bloom', 'v-bloom', (v) => app.setBloom(v), 2]
  ];
  for (const [id, out, fn, digits] of sliders) {
    const el = $(id);
    el.addEventListener('input', () => {
      const v = parseFloat(el.value);
      fn(v);
      $(out).textContent = v.toFixed(digits);
    });
  }

  /* ------------------------------ toggles ----------------------------- */
  const toggleDefs = [
    { id: 'hood', label: 'HOOD UP', get: () => app.state.hoodUp, set: (v) => app.setHoodUp(v) },
    { id: 'spin', label: 'AUTO SPIN', get: () => app.state.autoRotate, set: (v) => app.setAutoRotate(v) },
    { id: 'print', label: 'PRINT', get: () => app.state.print, set: (v) => app.setPrint(v) },
    { id: 'xray', label: 'X-RAY', get: () => app.state.wireframe, set: (v) => app.setWireframe(v) }
  ];
  const toggleWrap = $('toggles');
  const toggleEls = {};
  for (const t of toggleDefs) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'toggle';
    b.innerHTML = `<i></i><span>${t.label}</span>`;
    b.addEventListener('click', () => { t.set(!t.get()); syncToggles(); });
    toggleWrap.appendChild(b);
    toggleEls[t.id] = b;
  }
  function syncToggles() {
    for (const t of toggleDefs) toggleEls[t.id].classList.toggle('is-on', !!t.get());
  }

  /* ------------------------------- print ------------------------------ */
  let printTimer;
  const onPrintEdit = () => {
    clearTimeout(printTimer);
    printTimer = setTimeout(() => {
      app.setPrint(true, $('print-text').value.toUpperCase(), $('print-sub').value.toUpperCase());
      syncToggles();
      updatePrice();
    }, 220);
  };
  $('print-text').addEventListener('input', onPrintEdit);
  $('print-sub').addEventListener('input', onPrintEdit);

  /* ------------------------------ actions ----------------------------- */
  function randomize() {
    const cw = COLORWAYS[(Math.random() * COLORWAYS.length) | 0];
    applyColorway(cw);
    const p = PATTERN_LABELS[(Math.random() * PATTERN_LABELS.length) | 0];
    app.setPattern(p.id);
    const scale = 0.4 + Math.random() * 2.2;
    const weird = Math.random();
    app.setPatternScale(scale);
    app.setWeirdness(weird);
    app.setHoodUp(Math.random() > 0.5);
    $('s-scale').value = scale; $('v-scale').textContent = scale.toFixed(1);
    $('s-weird').value = weird; $('v-weird').textContent = weird.toFixed(2);
    syncPatternChips();
    syncToggles();
    updatePrice();
    app.punch(1.2);
    toast('feral mode: ' + p.label.toLowerCase());
  }

  $('randomize').addEventListener('click', randomize);

  $('snap').addEventListener('click', () => {
    try {
      const url = app.snapshot();
      const a = document.createElement('a');
      a.href = url;
      a.download = `banaclo-${ui.colorway}-${app.state.pattern}.png`;
      a.click();
      toast('snapshot saved');
    } catch (e) {
      toast('snapshot blocked by the browser');
      console.error(e);
    }
  });

  $('add-to-cart').addEventListener('click', (e) => {
    const price = updatePrice();
    const r = e.currentTarget.getBoundingClientRect();
    confetti.burst(r.left + r.width / 2, r.top + r.height / 2,
      [app.state.color, app.state.accent, '#ffffff', '#ffd400']);
    app.punch(1.4);
    toast(`${ui.size} / ${app.state.pattern} added — $${price}`);
  });

  /* ------------------------------- views ------------------------------ */
  const views = [
    ['HERO', 'hero'], ['FRONT', 'front'], ['BACK', 'back'], ['HOOD', 'hood'], ['DETAIL', 'detail']
  ];
  const viewbar = $('viewbar');
  views.forEach(([label, key], i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'viewbtn' + (i === 0 ? ' is-on' : '');
    b.innerHTML = `<b>${i + 1}</b>${label}`;
    b.addEventListener('click', () => {
      app.flyTo(key);
      for (const c of viewbar.children) c.classList.remove('is-on');
      b.classList.add('is-on');
    });
    viewbar.appendChild(b);
  });

  /* ------------------------------ panels ------------------------------ */
  const panel = $('customiser');
  $('panel-toggle').addEventListener('click', (e) => {
    const collapsed = panel.classList.toggle('is-collapsed');
    e.currentTarget.textContent = collapsed ? 'SHOW' : 'HIDE';
    e.currentTarget.setAttribute('aria-expanded', String(!collapsed));
  });
  if (window.innerWidth < 860) panel.classList.add('is-collapsed'), $('panel-toggle').textContent = 'SHOW';

  $('help-btn').addEventListener('click', () => { $('keysheet').hidden = false; });
  $('keysheet-close').addEventListener('click', () => { $('keysheet').hidden = true; });
  $('keysheet').addEventListener('click', (e) => { if (e.target.id === 'keysheet') $('keysheet').hidden = true; });

  $('brand').addEventListener('click', (e) => { e.preventDefault(); app.resetView(); app.punch(0.9); });

  /* ----------------------------- marquee ------------------------------ */
  const words = ['FREE SHIPPING OVER $100', 'HEAVYWEIGHT 480 GSM', 'MADE OF PURE MATHS',
    'DRAG TO SPIN ME', 'NO MESH FILES WERE USED', 'DROP 001 SELLS OUT FAST'];
  const track = $('marquee-track');
  const line = words.map((w) => `<span>${w}</span><i>✳</i>`).join('');
  track.innerHTML = line + line;

  /* ---------------------------- shortcuts ----------------------------- */
  window.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    const k = e.key.toLowerCase();
    if (k === 'h') { app.setHoodUp(!app.state.hoodUp); syncToggles(); }
    else if (k === 'r') randomize();
    else if (k === 'x') { app.setWireframe(!app.state.wireframe); syncToggles(); }
    else if (k === 's') $('snap').click();
    else if (k === ' ') { e.preventDefault(); app.setAutoRotate(!app.state.autoRotate); syncToggles(); }
    else if (k >= '1' && k <= '5') viewbar.children[Number(k) - 1]?.click();
  });

  /* ------------------------------ double-click hood ------------------- */
  $('scene').addEventListener('dblclick', () => { app.setHoodUp(!app.state.hoodUp); syncToggles(); });

  /* ------------------------------ init -------------------------------- */
  applyColorway(COLORWAYS[0]);
  syncPatternChips();
  syncToggles();
  updatePrice();
  setTimeout(() => toast('drag to spin · press KEYS for shortcuts'), 1200);
}
