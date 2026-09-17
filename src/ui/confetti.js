/* A cheap, cheerful 2D confetti burst for the add-to-cart moment. */
export function createConfetti(canvas) {
  const ctx = canvas.getContext('2d');
  let parts = [];
  let running = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function burst(x, y, colors) {
    for (let i = 0; i < 140; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 3 + Math.random() * 11;
      parts.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 5,
        w: 4 + Math.random() * 8,
        h: 3 + Math.random() * 12,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.5,
        life: 1,
        color: colors[(Math.random() * colors.length) | 0]
      });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts = parts.filter((p) => p.life > 0);
    for (const p of parts) {
      p.vy += 0.38;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.0092;
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (parts.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  return { burst };
}
