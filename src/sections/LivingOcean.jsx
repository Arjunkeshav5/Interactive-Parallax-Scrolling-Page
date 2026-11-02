import Scene from '../components/Scene.jsx';
import Layer from '../components/Layer.jsx';
import FishCanvas from '../components/FishCanvas.jsx';
import SectionCopy from '../components/SectionCopy.jsx';
import reef from '../assets/reef-bg.webp';
import coral from '../assets/coral-fg.webp';
import turtle from '../assets/turtle.webp';
import rays from '../assets/rays.webp';

const SCHOOL = [8, 38, 58];

/** 03 — THE LIVING OCEAN */
export default function LivingOcean() {
  return (
    <Scene id="reef" height={280} mobileHeight={230} label="The Living Ocean">
      {/* L1 · distant reef wall */}
      <Layer depth={0.05} scale={0.05} className="bg bg--reef">
        <img src={reef} alt="" width="1376" height="768" loading="lazy" decoding="async" />
      </Layer>

      <Layer depth={0.1} className="rays rays--reef">
        <img src={rays} alt="" width="1376" height="768" loading="lazy" decoding="async" />
      </Layer>

      {/* L2 · a school of fish streaming across mid-water */}
      <Layer depth={0.2} x={0.05} className="fishlayer fishlayer--school">
        <FishCanvas mode="school" count={72} color={SCHOOL} />
      </Layer>

      {/* L3 · the sea turtle — main subject, glides left as you descend */}
      <Layer depth={0.38} x={-0.14} mouse={16} className="turtle">
        <div className="turtle__glide">
          <img src={turtle} alt="A green sea turtle gliding over the reef" width="1000" height="747" loading="lazy" decoding="async" />
        </div>
      </Layer>

      {/* L4 · foreground coral, two depths */}
      <Layer depth={0.6} mouse={22} className="coral coral--mid">
        <img src={coral} alt="" width="1376" height="768" loading="lazy" decoding="async" />
        <span className="coral__fill" />
      </Layer>
      <Layer depth={0.95} mouse={36} className="coral coral--near">
        <img src={coral} alt="" width="1376" height="768" loading="lazy" decoding="async" />
        <span className="coral__fill" />
      </Layer>

      {/* L5 · copy */}
      <Layer depth={0.3} o="E-1:1, E-0.55:0" className="content content--left">
        <SectionCopy
          index="03"
          title="The Living Ocean"
          depth="40 m"
          zone="Sunlight Zone"
          heading="Life in Every Direction"
          lines={['Life in', 'Every Direction']}
          align="left"
          text="Coral reefs cover less than one percent of the sea floor, yet shelter around a quarter of all known marine species."
        />
      </Layer>
    </Scene>
  );
}
