/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PARALLAX ENGINE
 * ─────────────────────────────────────────────────────────────────────────────
 *  A tiny, dependency-free scroll engine driving every moving layer on the page.
 *
 *  • Each <Scene> is a tall <section> containing a sticky, viewport-sized stage.
 *  • For every scene we compute  s = (scrollY − sceneTop) / viewportHeight
 *      s < 0   → scene is entering from below
 *      0…sMax  → stage is pinned (sMax = (sceneHeight − vh) / vh)
 *      > sMax  → scene is leaving
 *  • Every [data-layer] inside a scene is moved with translate3d() according to
 *    its own attributes, so layers travel at independent speeds:
 *      data-depth   vertical speed  (translateY = −s · vh · depth)
 *      data-x       horizontal drift (translateX =  s · vw · x)
 *      data-scale   scale change per unit of s
 *      data-rot     rotation (deg) per unit of s
 *      data-mouse   pointer-parallax strength in px (desktop only)
 *      data-o       opacity keyframes "s:value, s:value" — "E" means sMax,
 *                   e.g.  "-0.6:0, 0:1, E-0.3:1, E+0.2:0"
 *      data-rest    opacity used in reduced-motion mode
 *  • Updates are batched into a single requestAnimationFrame. The loop only
 *    keeps running while the smoothed pointer is still settling.
 *  • Off-screen scenes are skipped entirely.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const scenes = [];
const listeners = new Set();

let vh = typeof window !== 'undefined' ? window.innerHeight : 800;
let vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
let intensity = 1;
let reduced = false;
let pointerEnabled = true;
let rafId = 0;
let lastWidth = 0;

const pointer = { tx: 0, ty: 0, x: 0, y: 0 };
const state = { y: 0, progress: 0, active: 0, phase: 0, velocity: 0, vh, vw };

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

function parseKeyframes(str, sMax) {
  if (!str) return null;
  return str.split(',').map((pair) => {
    const [pos, val] = pair.trim().split(':');
    let p = pos.trim();
    let s;
    if (p[0] === 'E') s = sMax + (p.length > 1 ? parseFloat(p.slice(1)) : 0);
    else s = parseFloat(p);
    return [s, parseFloat(val)];
  });
}

function sampleKeyframes(kf, s) {
  if (s <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    const [s1, v1] = kf[i];
    if (s <= s1) {
      const [s0, v0] = kf[i - 1];
      const t = (s - s0) / (s1 - s0 || 1);
      return v0 + (v1 - v0) * t;
    }
  }
  return kf[kf.length - 1][1];
}

function readLayer(el) {
  const d = el.dataset;
  return {
    el,
    depth: parseFloat(d.depth || 0),
    x: parseFloat(d.x || 0),
    scale: parseFloat(d.scale || 0),
    rot: parseFloat(d.rot || 0),
    mouse: parseFloat(d.mouse || 0),
    oRaw: d.o || '',
    rest: d.rest !== undefined ? parseFloat(d.rest) : 1,
    o: null,
    lastT: '',
    lastO: -1,
  };
}

function measure() {
  vh = window.innerHeight;
  vw = window.innerWidth;
  state.vh = vh;
  state.vw = vw;
  // CSS viewport unit that ignores mobile URL-bar height changes (only width changes re-set it)
  if (vw !== lastWidth) {
    document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    lastWidth = vw;
  }
  intensity = reduced ? 0 : vw < 640 ? 0.6 : vw < 1024 ? 0.8 : 1;
  pointerEnabled = !reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const sy = window.scrollY;
  for (const sc of scenes) {
    const r = sc.el.getBoundingClientRect();
    sc.top = r.top + sy;
    sc.height = sc.el.offsetHeight;
    sc.sMax = Math.max(0, (sc.height - vh) / vh);
    for (const l of sc.layers) {
      l.o = parseKeyframes(l.oRaw, sc.sMax);
      l.lastT = '';
      l.lastO = -1;
    }
  }
  scenes.sort((a, b) => a.top - b.top);
}

function applyScene(sc, y, px, py) {
  const s = (y - sc.top) / vh;
  const visible = s > -1.05 && s < sc.sMax + 1.05;
  if (!visible && !sc.visible) return;
  sc.visible = visible;

  sc.el.style.setProperty('--s', s.toFixed(4));
  sc.el.style.setProperty('--p', clamp(sc.sMax ? s / sc.sMax : 0, 0, 1).toFixed(4));

  for (const l of sc.layers) {
    let t;
    let o;
    if (reduced) {
      t = 'none';
      o = l.o ? l.rest : -1;
    } else {
      const ty = -s * vh * l.depth * intensity + py * l.mouse;
      const tx = s * vw * l.x * intensity + px * l.mouse;
      let tr = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      if (l.scale) tr += ` scale(${Math.max(0.05, 1 + s * l.scale * intensity).toFixed(4)})`;
      if (l.rot) tr += ` rotate(${(s * l.rot * intensity).toFixed(3)}deg)`;
      t = tr;
      o = l.o ? clamp(sampleKeyframes(l.o, s), 0, 1) : -1;
    }
    if (t !== l.lastT) {
      l.el.style.transform = t;
      l.lastT = t;
    }
    if (o !== -1) {
      const oq = Math.round(o * 1000) / 1000;
      if (oq !== l.lastO) {
        l.el.style.opacity = oq;
        l.el.style.visibility = oq <= 0.001 ? 'hidden' : '';
        l.lastO = oq;
      }
    }
  }
}

function frame() {
  rafId = 0;
  const y = window.scrollY;

  // smooth pointer
  pointer.x += (pointer.tx - pointer.x) * 0.08;
  pointer.y += (pointer.ty - pointer.y) * 0.08;
  const settling = Math.abs(pointer.tx - pointer.x) > 0.001 || Math.abs(pointer.ty - pointer.y) > 0.001;
  const px = pointerEnabled ? pointer.x : 0;
  const py = pointerEnabled ? pointer.y : 0;

  for (const sc of scenes) applyScene(sc, y, px, py);

  // global state for UI + particles
  const max = Math.max(1, document.documentElement.scrollHeight - vh);
  state.velocity = y - state.y;
  state.y = y;
  state.progress = clamp(y / max, 0, 1);
  let active = 0;
  let phase = 0;
  const probe = y + vh * 0.5;
  for (let i = 0; i < scenes.length; i++) {
    if (probe >= scenes[i].top) active = i;
  }
  const cur = scenes[active];
  const next = scenes[active + 1];
  if (cur) {
    const end = next ? next.top : cur.top + cur.height;
    phase = active + clamp((probe - cur.top) / Math.max(1, end - cur.top), 0, 1);
  }
  state.active = active;
  state.phase = phase;
  listeners.forEach((fn) => fn(state));

  if (settling) request();
}

function request() {
  if (!rafId) rafId = requestAnimationFrame(frame);
}

function onPointer(e) {
  pointer.tx = (e.clientX / vw) * 2 - 1;
  pointer.ty = (e.clientY / vh) * 2 - 1;
  if (pointerEnabled) request();
}

let resizeTimer = 0;
function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    measure();
    request();
  }, 80);
}

let started = false;
export function startEngine() {
  if (started) return;
  started = true;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduced = mq.matches;
  document.documentElement.classList.toggle('reduce-motion', reduced);
  mq.addEventListener?.('change', (e) => {
    reduced = e.matches;
    document.documentElement.classList.toggle('reduce-motion', reduced);
    measure();
    request();
  });
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('load', () => { measure(); request(); });
  // fonts / images can shift layout once loaded
  document.fonts?.ready.then(() => { measure(); request(); });
  measure();
  request();
}

export function registerScene(el, id) {
  const sc = { el, id, layers: [...el.querySelectorAll('[data-layer]')].map(readLayer), top: 0, height: 0, sMax: 0, visible: true };
  scenes.push(sc);
  if (started) { measure(); request(); }
  return () => {
    const i = scenes.indexOf(sc);
    if (i >= 0) scenes.splice(i, 1);
  };
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

export function getScenes() {
  return scenes;
}

export function getState() {
  return state;
}

export function isReduced() {
  return reduced;
}

export function refresh() {
  measure();
  request();
}

/* ── Cinematic smooth scrolling (eased, cancellable) ─────────────────────── */
let scrollAnim = 0;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function cancelScroll() {
  if (scrollAnim) cancelAnimationFrame(scrollAnim);
  scrollAnim = 0;
  window.removeEventListener('wheel', cancelScroll);
  window.removeEventListener('touchstart', cancelScroll);
  window.removeEventListener('keydown', cancelScroll);
}

export function smoothScrollTo(target, opts = {}) {
  cancelScroll();
  const start = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const end = clamp(target, 0, max);
  const dist = end - start;
  if (reduced || Math.abs(dist) < 2) {
    window.scrollTo(0, end);
    return;
  }
  const duration = opts.duration ?? clamp(700 + (Math.abs(dist) / vh) * 160, 900, 3200);
  const t0 = performance.now();
  window.addEventListener('wheel', cancelScroll, { passive: true });
  window.addEventListener('touchstart', cancelScroll, { passive: true });
  window.addEventListener('keydown', cancelScroll);
  const step = (now) => {
    const t = clamp((now - t0) / duration, 0, 1);
    window.scrollTo(0, start + dist * easeInOutCubic(t));
    if (t < 1) scrollAnim = requestAnimationFrame(step);
    else { cancelScroll(); opts.onDone?.(); }
  };
  scrollAnim = requestAnimationFrame(step);
}

export function scrollToScene(id) {
  const sc = scenes.find((s) => s.id === id);
  if (!sc) return;
  // land just after the stage becomes fully pinned so the copy is revealed
  const offset = sc.sMax > 0.3 ? vh * 0.08 : 0;
  smoothScrollTo(sc.top + offset);
}
