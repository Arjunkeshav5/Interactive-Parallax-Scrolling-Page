import Scene from '../components/Scene.jsx';
import Layer from '../components/Layer.jsx';
import SectionCopy from '../components/SectionCopy.jsx';
import abyss from '../assets/abyss-bg.webp';
import rocks from '../assets/rocks-fg.webp';
import leviathan from '../assets/leviathan.webp';
import rays from '../assets/rays.webp';

/** 05 — THE ABYSS */
export default function Abyss() {
  return (
    <Scene id="abyss" height={280} mobileHeight={230} label="The Abyss">
      {/* L1 · basalt spires fading into the dark */}
      <Layer depth={0.04} scale={0.06} className="bg bg--abyss">
        <img src={abyss} alt="" width="1376" height="768" loading="lazy" decoding="async" />
      </Layer>

      <Layer depth={0.08} className="rays rays--abyss">
        <img src={rays} alt="" width="1376" height="768" loading="lazy" decoding="async" />
      </Layer>

      {/* L2 · the distant leviathan, barely there */}
      <Layer depth={0.16} x={0.16} className="leviathan">
        <div className="leviathan__drift">
          <img src={leviathan} alt="The faint silhouette of a colossal unknown creature in the distance" width="1376" height="768" loading="lazy" decoding="async" />
        </div>
      </Layer>

      {/* L3–L4 · black rock formations at two depths */}
      <Layer depth={0.4} mouse={18} className="rocks rocks--mid">
        <img src={rocks} alt="" width="1376" height="768" loading="lazy" decoding="async" />
        <span className="rocks__fill" />
      </Layer>
      <Layer depth={0.85} mouse={34} className="rocks rocks--near">
        <img src={rocks} alt="" width="1376" height="768" loading="lazy" decoding="async" />
        <span className="rocks__fill" />
      </Layer>

      <div className="vignette" aria-hidden="true" />

      {/* L5 · copy */}
      <Layer depth={0.22} o="E-1:1, E-0.55:0" className="content content--center content--abyss">
        <SectionCopy
          index="05"
          title="The Abyss"
          depth="6,000 m"
          zone="Abyssal Zone"
          heading="The Unknown Is Deeper Than We Imagine"
          lines={['The Unknown Is Deeper', 'Than We Imagine']}
          text="Even today, much of the deep ocean remains unexplored."
        />
      </Layer>
    </Scene>
  );
}
