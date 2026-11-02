import { ArrowUp } from 'lucide-react';
import Scene from '../components/Scene.jsx';
import Layer from '../components/Layer.jsx';
import FishCanvas from '../components/FishCanvas.jsx';
import SectionCopy from '../components/SectionCopy.jsx';
import { Reveal } from '../components/Reveal.jsx';
import { smoothScrollTo } from '../engine/parallax.js';
import underwater from '../assets/underwater-surface.webp';
import rays from '../assets/rays.webp';

const FISH = [2, 12, 24];

/** 06 — THE JOURNEY CONTINUES */
export default function JourneyContinues() {
  return (
    <Scene id="beyond" height={190} mobileHeight={170} label="The Journey Continues">
      {/* L1 · looking up towards the light, slowly pulling back */}
      <Layer depth={0.04} scale={-0.06} className="bg bg--beyond">
        <img src={underwater} alt="" width="1376" height="768" loading="lazy" decoding="async" />
      </Layer>

      <Layer depth={0.1} className="rays rays--beyond">
        <img src={rays} alt="" width="1376" height="768" loading="lazy" decoding="async" />
      </Layer>

      <Layer depth={0.24} x={0.03} className="fishlayer fishlayer--beyond">
        <FishCanvas mode="scatter" count={8} color={FISH} />
      </Layer>

      <div className="beyond__glow" aria-hidden="true" />

      {/* L5 · copy + call to action */}
      <Layer depth={0.12} className="content content--center content--final">
        <SectionCopy
          index="06"
          title="The Journey Continues"
          heading="There Is Always More to Discover."
          lines={['There Is Always', 'More to Discover.']}
          text="The greatest discoveries begin beyond what we already know."
        >
          <Reveal className="cta-wrap" delay={800}>
            <button type="button" className="cta" onClick={() => smoothScrollTo(0, { duration: 3400 })}>
              <span className="cta__ring" aria-hidden="true" />
              <span className="cta__label">Explore Again</span>
              <span className="cta__icon" aria-hidden="true"><ArrowUp size={16} strokeWidth={1.6} /></span>
            </button>
          </Reveal>
        </SectionCopy>
      </Layer>

      <footer className="site-footer">
        <span className="site-footer__org">IIT Bombay Techfest</span>
        <span className="site-footer__rule" aria-hidden="true" />
        <span className="site-footer__theme">Design the Unknown</span>
      </footer>
    </Scene>
  );
}
