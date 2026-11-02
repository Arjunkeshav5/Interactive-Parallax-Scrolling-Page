import { useEffect, useRef } from 'react';
import Scene from '../components/Scene.jsx';
import Layer from '../components/Layer.jsx';
import SectionCopy from '../components/SectionCopy.jsx';
import biolum from '../assets/biolum-bg.webp';
import jelly from '../assets/jellyfish.webp';

function Jelly({ className, alt = '' }) {
  return (
    <div className={`jelly__float ${className}`}>
      <img src={jelly} alt={alt} width="896" height="1200" loading="lazy" decoding="async" />
    </div>
  );
}

/** 04 — THE BIOLUMINESCENT WORLD */
export default function Bioluminescent() {
  const torchRef = useRef(null);

  // a soft light that follows the visitor's pointer through the dark water
  useEffect(() => {
    const el = torchRef.current;
    const stage = el?.parentElement;
    if (!stage) return undefined;
    let raf = 0;
    let tx = 0.62;
    let ty = 0.45;
    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty('--mx', `${(tx * 100).toFixed(2)}%`);
        el.style.setProperty('--my', `${(ty * 100).toFixed(2)}%`);
      });
    };
    stage.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      stage.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <Scene id="glow" height={300} mobileHeight={240} label="The Bioluminescent World">
      {/* L1 · midnight water and glowing seabed */}
      <Layer depth={0.04} scale={0.05} className="bg bg--glow">
        <img src={biolum} alt="" width="1376" height="768" loading="lazy" decoding="async" />
      </Layer>

      {/* L2 · a nearer drift of plankton (same plate, scaled, screen-blended) */}
      <Layer depth={0.26} scale={0.05} className="plankton plankton--near">
        <img src={biolum} alt="" width="1376" height="768" loading="lazy" decoding="async" />
      </Layer>

      {/* L3 · jellyfish at four depths, each pulsing on its own rhythm */}
      <Layer depth={0.12} mouse={-8} className="jelly jelly--far"><Jelly /></Layer>
      <Layer depth={0.3} mouse={-18} className="jelly jelly--main"><Jelly alt="A bioluminescent jellyfish glowing cyan and violet" /></Layer>
      <Layer depth={0.55} mouse={-28} className="jelly jelly--left"><Jelly /></Layer>
      {/* L4 · out-of-focus foreground jelly */}
      <Layer depth={1.0} mouse={-46} className="jelly jelly--near"><Jelly /></Layer>

      <div className="glow__torch" ref={torchRef} aria-hidden="true" />

      {/* L5 · copy */}
      <Layer depth={0.22} o="E-1:1, E-0.55:0" className="content content--center content--glow">
        <SectionCopy
          index="04"
          title="The Bioluminescent World"
          depth="1,000 m"
          zone="Midnight Zone"
          heading="Light in the Darkness"
          lines={['Light in the', 'Darkness']}
          text="Where sunlight never reaches, most creatures make their own."
        />
      </Layer>
    </Scene>
  );
}
