import Scene from '../components/Scene.jsx';
import Layer from '../components/Layer.jsx';
import WaveBand from '../components/WaveBand.jsx';
import SectionCopy from '../components/SectionCopy.jsx';
import { scrollToScene } from '../engine/parallax.js';
import hero from '../assets/hero.webp';

/** 01 — THE OCEAN ABOVE */
export default function OceanAbove() {
  return (
    <Scene id="surface" height={240} mobileHeight={210} overlap={false} label="The Ocean Above">
      {/* L1 · distant sky + sea, slow drift and gentle push-in */}
      <Layer depth={0.06} scale={0.08} className="bg bg--hero">
        <img src={hero} alt="" width="1376" height="768" fetchpriority="high" decoding="async" />
      </Layer>

      {/* L2 · atmospheric sun bloom */}
      <Layer depth={0.14} mouse={-10} className="hero__sun" aria-hidden="true" />
      <Layer depth={0.2} className="hero__haze" aria-hidden="true" />

      {/* L3–L4 · photographic swell layers rising at increasing speeds */}
      <Layer depth={0.32} mouse={4} className="wave wave--far">
        <WaveBand img={hero} position="50% 88%" duration={70} />
      </Layer>
      <Layer depth={0.58} mouse={8} className="wave wave--mid">
        <WaveBand img={hero} position="40% 94%" duration={46} reverse />
      </Layer>
      <Layer depth={0.92} mouse={14} className="wave wave--near">
        <WaveBand img={hero} position="60% 98%" duration={30} />
      </Layer>

      {/* L5 · typography */}
      <Layer depth={0.42} scale={-0.06} o="0:1, 0.85:0" rest={1} className="content content--hero">
        <SectionCopy
          as="h1"
          index="01"
          title="The Ocean Above"
          lines={['Below the', 'Surface']}
          heading="Below the Surface"
          text="Somewhere beneath the waves lies a world we have barely begun to understand."
        />
      </Layer>

      <Layer depth={-0.2} o="0:1, 0.3:0" rest={1} className="scroll-cue">
        <a
          href="#beneath"
          className="scroll-cue__link"
          aria-label="Scroll to explore"
          onClick={(e) => { e.preventDefault(); scrollToScene('beneath'); }}
        >
          <span className="scroll-cue__text">Scroll to explore</span>
          <span className="scroll-cue__line" aria-hidden="true"><span /></span>
        </a>
      </Layer>
    </Scene>
  );
}
