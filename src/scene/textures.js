import * as THREE from 'three';

/* Canvas-generated textures — keeps the whole build asset-free. */

function canvas(size = 1024, h = size) {
  const c = document.createElement('canvas');
  c.width = size; c.height = h;
  return c;
}

/** Chest screen print. Returns a transparent RGBA texture. */
export function makePrintTexture(text = 'BANACLO', sub = 'WEAR THE GLITCH', color = '#ffffff') {
  const c = canvas(1024, 682);
  const g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);

  const grd = g.createLinearGradient(0, 0, c.width, c.height);
  grd.addColorStop(0, color);
  grd.addColorStop(0.5, '#ffffff');
  grd.addColorStop(1, color);

  g.save();
  g.translate(c.width / 2, c.height / 2);

  // Chunky outlined wordmark with an offset shadow layer.
  const main = Math.min(190, (c.width * 1.35) / Math.max(text.length, 1));
  g.font = `900 ${main}px "Arial Black", Impact, system-ui, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';

  g.globalAlpha = 0.85;
  g.fillStyle = '#000000';
  g.fillText(text, 10, -38);
  g.globalAlpha = 1;
  g.fillStyle = grd;
  g.fillText(text, 0, -48);
  g.lineWidth = 6;
  g.strokeStyle = '#000000';
  g.strokeText(text, 0, -48);

  g.font = '700 54px "Courier New", monospace';
  g.fillStyle = color;
  g.fillText(sub, 0, 70);

  // Dashed rule under the sub-line.
  g.strokeStyle = color;
  g.lineWidth = 6;
  g.setLineDash([26, 18]);
  g.beginPath();
  g.moveTo(-300, 128);
  g.lineTo(300, 128);
  g.stroke();
  g.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Repeating strip of text for the rotating ring around the product. */
export function makeRingTexture(text = 'BANACLO • 3D KNIT • ', color = '#00f0ff') {
  const c = canvas(2048, 256);
  const g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  g.font = '900 150px "Arial Black", Impact, system-ui, sans-serif';
  g.textBaseline = 'middle';
  g.fillStyle = color;
  const phrase = text.toUpperCase();
  const w = g.measureText(phrase).width;
  const reps = Math.ceil(c.width / w) + 1;
  for (let i = 0; i < reps; i++) g.fillText(phrase, i * w, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

/** Soft radial blob used for the fake contact shadow and the floor fade. */
export function makeRadialTexture(inner = 'rgba(0,0,0,0.85)', outer = 'rgba(0,0,0,0)') {
  const c = canvas(512);
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  grd.addColorStop(0, inner);
  grd.addColorStop(0.45, inner.replace(/[\d.]+\)$/, '0.35)'));
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
