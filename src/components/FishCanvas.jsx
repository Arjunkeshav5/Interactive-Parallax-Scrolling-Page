import { useEffect, useRef } from 'react';
import { isReduced } from '../engine/parallax.js';

/**
 * Procedurally animated fish rendered on a canvas (tails beat, bodies bank).
 *  mode="school"  — a flowing, swirling stream of fish crossing the frame
 *  mode="scatter" — a few individual silhouettes cruising in both directions
 * Runs only while visible (IntersectionObserver) to save battery.
 */

function drawFish(ctx, x, y, len, dir, phase, tilt, fill) {
  const w = len * 0.26;
  const wag = Math.sin(phase) * len * 0.09;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(dir, 1);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(len * 0.5, 0);
  ctx.bezierCurveTo(len * 0.36, -w * 1.05, -len * 0.12, -w * 1.0, -len * 0.33, wag * 0.35);
  ctx.quadraticCurveTo(-len * 0.44, wag * 0.6 - w * 0.2, -len * 0.56, wag - w * 0.95);
  ctx.quadraticCurveTo(-len * 0.49, wag * 0.8, -len * 0.56, wag + w * 0.95);
  ctx.quadraticCurveTo(-len * 0.44, wag * 0.6 + w * 0.2, -len * 0.33, wag * 0.35);
  ctx.bezierCurveTo(-len * 0.12, w * 1.0, len * 0.36, w * 1.05, len * 0.5, 0);
  ctx.fill();
  // dorsal fin
  ctx.beginPath();
  ctx.moveTo(len * 0.1, -w * 0.9);
  ctx.quadraticCurveTo(-len * 0.02, -w * 1.7, -len * 0.14, -w * 0.85);
  ctx.fill();
  ctx.restore();
}

export default function FishCanvas({ mode = 'school', count = 60, color = [6, 30, 48], className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let last = performance.now();
    let fish = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = w < 640 ? Math.round(count * 0.5) : count;
      const unit = Math.min(w, 1600) / 1600;
      fish = Array.from({ length: n }, () => {
        const z = 0.35 + Math.random() * 0.65;
        if (mode === 'school') {
          // gaussian-ish spread around the ribbon
          const spread = (Math.random() + Math.random() + Math.random() - 1.5) * 1.4;
          return {
            z,
            x: Math.random() * (w + 400) - 200,
            off: spread * h * 0.09,
            len: (16 + 26 * z) * (0.7 + unit * 0.6),
            speed: 60 + 70 * z,
            ph: Math.random() * Math.PI * 2,
            beat: 9 + Math.random() * 5,
          };
        }
        const dir = Math.random() > 0.5 ? 1 : -1;
        return {
          z,
          dir,
          x: Math.random() * w,
          y: h * (0.25 + Math.random() * 0.6),
          len: (22 + 40 * z) * (0.7 + unit * 0.6),
          speed: (25 + 45 * z) * dir,
          ph: Math.random() * Math.PI * 2,
          beat: 6 + Math.random() * 4,
          bob: 6 + Math.random() * 10,
        };
      });
      fish.sort((a, b) => a.z - b.z);
    };

    const render = (t, dt) => {
      ctx.clearRect(0, 0, w, h);
      const [r, g, b] = color;
      for (const f of fish) {
        const alpha = 0.25 + f.z * 0.65;
        const fill = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        f.ph += f.beat * dt;
        if (mode === 'school') {
          f.x += f.speed * dt;
          if (f.x > w + 120) f.x = -120 - Math.random() * 200;
          const time = t * 0.00035;
          const base = h * 0.42 + Math.sin(f.x * 0.0032 + time) * h * 0.14 + Math.sin(f.x * 0.0011 - time * 0.7) * h * 0.06;
          const y = base + f.off * (0.8 + 0.4 * Math.sin(time * 1.3 + f.x * 0.002));
          const slope = Math.cos(f.x * 0.0032 + time) * h * 0.14 * 0.0032;
          drawFish(ctx, f.x, y, f.len, 1, f.ph, Math.atan(slope) * 0.9, fill);
        } else {
          f.x += f.speed * dt;
          if (f.dir > 0 && f.x > w + 80) f.x = -80;
          if (f.dir < 0 && f.x < -80) f.x = w + 80;
          const y = f.y + Math.sin(t * 0.0008 + f.ph * 0.1) * f.bob;
          drawFish(ctx, f.x, y, f.len, f.dir, f.ph, Math.cos(t * 0.0008 + f.ph * 0.1) * 0.06, fill);
        }
      }
    };

    const loop = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      render(t, dt);
      if (running) raf = requestAnimationFrame(loop);
    };

    resize();
    render(performance.now(), 0);

    const io = new IntersectionObserver(([e]) => {
      const shouldRun = e.isIntersecting && !isReduced();
      if (shouldRun && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (!shouldRun) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => { resize(); render(performance.now(), 0); });
    ro.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, count, color.join(',')]);

  return <canvas ref={ref} className={`fish-canvas ${className}`} aria-hidden="true" />;
}
