import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SECTIONS, depthForPhase, zoneFor } from '../data/sections.js';
import { subscribe, scrollToScene, smoothScrollTo, getScenes } from '../engine/parallax.js';

const fmt = new Intl.NumberFormat('en-US');

/**
 * Fixed header (desktop links + mobile overlay menu), the vertical depth gauge
 * with clickable section indicators, and a slim progress bar for small screens.
 * Per-frame values are written straight to the DOM; React state only changes
 * when the active section changes.
 */
export default function Navigation() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [marks, setMarks] = useState([]);
  const fillRef = useRef(null);
  const markerRef = useRef(null);
  const depthRef = useRef(null);
  const depthMobileRef = useRef(null);
  const zoneRef = useRef(null);
  const barRef = useRef(null);
  const menuBtnRef = useRef(null);
  const firstLinkRef = useRef(null);

  useEffect(() => {
    let lastActive = -1;
    let lastZone = '';
    const computeMarks = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setMarks(getScenes().map((s) => Math.min(1, s.top / max)));
    };
    const unsub = subscribe((st) => {
      const p = st.progress;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      if (markerRef.current) markerRef.current.style.top = `${p * 100}%`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      const d = Math.round(depthForPhase(st.phase));
      const txt = `${fmt.format(d)} m`;
      if (depthRef.current) depthRef.current.textContent = txt;
      if (depthMobileRef.current) depthMobileRef.current.textContent = txt;
      const z = zoneFor(d);
      if (z !== lastZone && zoneRef.current) { zoneRef.current.textContent = z; lastZone = z; }
      if (st.active !== lastActive) { lastActive = st.active; setActive(st.active); }
    });
    computeMarks();
    window.addEventListener('load', computeMarks);
    window.addEventListener('resize', computeMarks);
    return () => {
      unsub();
      window.removeEventListener('load', computeMarks);
      window.removeEventListener('resize', computeMarks);
    };
  }, []);

  // mobile menu: scroll lock, Esc to close, focus management
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    if (!open) return undefined;
    firstLinkRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); menuBtnRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    scrollToScene(id);
  };

  return (
    <>
      <div className="progress-bar" aria-hidden="true"><span ref={barRef} /></div>

      <header className={`site-header ${open ? 'is-open' : ''}`}>
        <a href="#surface" className="brand" onClick={(e) => { e.preventDefault(); setOpen(false); smoothScrollTo(0); }}>
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__text">Below the Surface</span>
        </a>

        <nav className="nav-desktop" aria-label="Sections">
          <ul>
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={go(s.id)} className={i === active ? 'is-active' : ''} aria-current={i === active ? 'true' : undefined}>
                  <span className="nav-desktop__num">{s.index}</span>
                  {s.short}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-depth" aria-hidden="true">
          <span ref={depthMobileRef}>0 m</span>
        </div>

        <button
          ref={menuBtnRef}
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </header>

      <div id="mobile-menu" className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={!open ? '' : undefined}>
        <nav aria-label="Sections (mobile)">
          <ol>
            {SECTIONS.map((s, i) => (
              <li key={s.id} style={{ '--i': i }}>
                <a ref={i === 0 ? firstLinkRef : undefined} href={`#${s.id}`} onClick={go(s.id)} className={i === active ? 'is-active' : ''}>
                  <span className="mobile-menu__num">{s.index}</span>
                  <span className="mobile-menu__label">{s.label}</span>
                  <span className="mobile-menu__depth">{fmt.format(s.depth)} m</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <p className="mobile-menu__foot">IIT Bombay Techfest · Design the Unknown</p>
      </div>

      <aside className="depth-gauge" aria-label="Journey progress">
        <div className="depth-gauge__readout" aria-live="off">
          <span className="depth-gauge__label">Depth</span>
          <span className="depth-gauge__value" ref={depthRef}>0 m</span>
          <span className="depth-gauge__zone" ref={zoneRef}>Sunlight Zone</span>
        </div>
        <div className="depth-gauge__track">
          <span className="depth-gauge__fill" ref={fillRef} />
          <span className="depth-gauge__marker" ref={markerRef} />
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              className={`depth-gauge__dot ${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}
              style={{ top: `${(marks[i] ?? i / (SECTIONS.length - 1)) * 100}%` }}
              onClick={() => scrollToScene(s.id)}
              aria-label={`Go to ${s.label}`}
            >
              <span className="depth-gauge__tip">
                <em>{s.index}</em> {s.label}
              </span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
