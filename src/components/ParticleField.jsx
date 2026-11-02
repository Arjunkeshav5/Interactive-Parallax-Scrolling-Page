import { useEffect, useRef } from 'react';
import { subscribe, getState, isReduced } from '../engine/parallax.js';

/**
 * One fixed <canvas> renders every ambient particle on the page (≈110 on desktop,
 * ≈50 on mobile) — no DOM nodes per particle.
 * The particle "species" blends with the journey phase:
 *   surface → warm light motes · beneath → rising bubbles · reef → marine snow
 *   glow → bioluminescent sparks · abyss → sparse cold snow · beyond → bubbles
 * Particles also react to scroll velocity with depth-based parallax.
 */

const TYPES = ['mote', 'bubble', 'snow', 'glow', 'violet'];

// species weights per section phase (index = section)
const MIX = [
  { mote: 1, bubble: 0, snow: 0, glow: 0, violet: 0 },
  { mote: 0, bubble: 0.85, snow: 0.15, glow: 0, violet: 0 },
  { mote: 0, bubble: 0.25, snow: 0.75, glow: 0, violet: 0 },
  { mote: 0, bubble: 0, snow: 0.15, glow: 0.6, violet: 0.25 },
  { mote: 0, bubble: 0, snow: 0.7, glow: 0.3, violet: 0 },
  { mote: 0, bubble: 0.75, snow: 0.25, glow: 0, violet: 0 },
];
const DENSITY = [0.45, 1, 0.85, 1, 0.55, 0.8];

function makeSprite(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  return c;
}

function buildSprites() {
  return {
    mote: makeSprite(32, (g, s) => {
      const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      r.addColorStop(0, 'rgba(255,236,200,0.9)');
      r.addColorStop(0.35, 'rgba(255,214,160,0.35)');
      r.addColorStop(1, 'rgba(255,214,160,0)');
      g.fillStyle = r;
      g.fillRect(0, 0, s, s);
    }),
    bubble: makeSprite(48, (g, s) => {
      const c = s / 2;
      const r = s * 0.42;
      const grad = g.createRadialGradient(c - r * 0.3, c - r * 0.3, r * 0.1, c, c, r);
      grad.addColorStop(0, 'rgba(242,247,248,0.10)');
      grad.addColorStop(0.75, 'rgba(160,230,240,0.06)');
      grad.addColorStop(1, 'rgba(220,250,255,0.55)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(c, c, r, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(230,252,255,0.55)';
      g.lineWidth = s * 0.03;
      g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.beginPath();
      g.ellipse(c - r * 0.38, c - r * 0.42, r * 0.18, r * 0.11, -0.7, 0, Math.PI * 2);
      g.fill();
    }),
    snow: makeSprite(24, (g, s) => {
      const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      r.addColorStop(0, 'rgba(220,235,240,0.85)');
      r.addColorStop(0.4, 'rgba(200,225,235,0.25)');
      r.addColorStop(1, 'rgba(200,225,235,0)');
      g.fillStyle = r;
      g.fillRect(0, 0, s, s);
    }),
    glow: makeSprite(64, (g, s) => {
      const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      r.addColorStop(0, 'rgba(230,255,252,1)');
      r.addColorStop(0.12, 'rgba(101,245,232,0.85)');
      r.addColorStop(0.4, 'rgba(101,245,232,0.18)');
      r.addColorStop(1, 'rgba(101,245,232,0)');
      g.fillStyle = r;
      g.fillRect(0, 0, s, s);
    }),
    violet: makeSprite(64, (g, s) => {
      const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      r.addColorStop(0, 'rgba(245,235,255,1)');
      r.addColorStop(0.12, 'rgba(160,130,255,0.8)');
      r.addColorStop(0.4, 'rgba(140,110,255,0.16)');
      r.addColorStop(1, 'rgba(140,110,255,0)');
      g.fillStyle = r;
      g.fillRect(0, 0, s, s);
    }),
  };
}

function mixAt(phase) {
  const i = Math.max(0, Math.min(MIX.length - 1, Math.floor(phase)));
  const j = Math.min(MIX.length - 1, i + 1);
  const f = Math.max(0, Math.min(1, phase - i));
  const out = {};
  for (const t of TYPES) out[t] = MIX[i][t] * (1 - f) + MIX[j][t] * f;
  const density = DENSITY[i] * (1 - f) + DENSITY[j] * f;
  return { w: out, density };
}

export default function ParticleField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const sprites = buildSprites();
    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles = [];
    let raf = 0;
    let lastT = performance.now();
    let lastScroll = window.scrollY;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = w < 640 ? 50 : w < 1024 ? 80 : 110;
      if (particles.length !== count) {
        particles = Array.from({ length: count }, (_, i) => ({
          x: Math.random() * w,
          y: Math.random() * h,
          z: 0.25 + Math.random() * 0.75,
          seed: Math.random(),
          visibleSeed: i / count,
          ph: Math.random() * Math.PI * 2,
          sz: 0.6 + Math.random() * 0.8,
        }));
      }
    };

    const pickType = (seed, wts) => {
      let total = 0;
      for (const t of TYPES) total += wts[t];
      let acc = 0;
      const r = seed * total;
      for (const t of TYPES) {
        acc += wts[t];
        if (r <= acc) return t;
      }
      return 'snow';
    };

    const draw = (dt, time) => {
      const st = getState();
      const { w: wts, density } = mixAt(st.phase);
      const scrollY = window.scrollY;
      const dScroll = Math.max(-120, Math.min(120, scrollY - lastScroll));
      lastScroll = scrollY;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) {
        if (p.visibleSeed > density) continue;
        const type = pickType(p.seed, wts);
        let vx = 0;
        let vy = 0;
        let size = 4;
        let alpha = 0.6;
        switch (type) {
          case 'mote':
            vx = Math.sin(time * 0.0003 + p.ph) * 6;
            vy = -8 * p.z;
            size = 6 + 10 * p.z * p.sz;
            alpha = 0.18 + 0.3 * p.z;
            break;
          case 'bubble':
            vx = Math.sin(time * 0.002 + p.ph) * 14 * p.z;
            vy = -(40 + 70 * p.z);
            size = 3 + 12 * p.z * p.sz;
            alpha = 0.35 + 0.45 * p.z;
            break;
          case 'snow':
            vx = Math.sin(time * 0.0005 + p.ph) * 6;
            vy = 8 + 10 * p.z;
            size = 2 + 5 * p.z * p.sz;
            alpha = 0.2 + 0.45 * p.z;
            break;
          case 'glow':
          case 'violet':
            vx = Math.sin(time * 0.0006 + p.ph) * 10;
            vy = Math.cos(time * 0.0004 + p.ph) * 6 - 3;
            size = 8 + 22 * p.z * p.sz;
            alpha = (0.35 + 0.65 * p.z) * (0.55 + 0.45 * Math.sin(time * 0.002 + p.ph * 3));
            break;
          default:
        }
        p.x += vx * dt;
        p.y += vy * dt - dScroll * p.z * 0.35;
        // wrap
        if (p.y < -40) { p.y = h + 30; p.x = Math.random() * w; }
        else if (p.y > h + 40) { p.y = -30; p.x = Math.random() * w; }
        if (p.x < -40) p.x = w + 30;
        else if (p.x > w + 40) p.x = -30;

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.drawImage(sprites[type], p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const loop = (t) => {
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;
      draw(dt, t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);

    let unsub = () => {};
    if (isReduced()) {
      // static, calm frame that refreshes only when the visitor scrolls
      unsub = subscribe(() => draw(0, 0));
    } else {
      raf = requestAnimationFrame(loop);
    }
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!isReduced()) { lastT = performance.now(); raf = requestAnimationFrame(loop); }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      unsub();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={ref} className="particles" aria-hidden="true" />;
}
