import Scene from '../components/Scene.jsx';
import Layer from '../components/Layer.jsx';
import FishCanvas from '../components/FishCanvas.jsx';
import SectionCopy from '../components/SectionCopy.jsx';
import underwater from '../assets/underwater-surface.webp';
import rays from '../assets/rays.webp';

const FISH = [3, 24, 40];

/** 02 — CROSSING THE SURFACE */
export default function CrossingSurface() {
  return (
    <Scene id="beneath" height={260} mobileHeight={220} edge="fade" label="Crossing the Surface">
      {/* L1 · open water below the surface (surface itself cropped out) */}
      <Layer depth={0.05} scale={0.04} className="bg bg--beneath">
        <img src={underwater} alt="" width="1376" height="768" loading="lazy" decoding="async" />
      </Layer>

      {/* L2 · sun rays, slowly swaying */}
      <Layer depth={0.12} className="rays rays--beneath">
        <img src={rays} alt="" width="1376" height="768" loading="lazy" decoding="async" />
      </Layer>

      {/* L3 · the underside of the ocean surface — travels independently, faster */}
      <Layer depth={0.55} className="beneath__surface">
        <img src={underwater} alt="" width="1376" height="768" loading="lazy" decoding="async" />
      </Layer>

      {/* L4 · fish silhouettes cruising horizontally */}
      <Layer depth={0.3} x={-0.04} className="fishlayer fishlayer--beneath">
        <FishCanvas mode="scatter" count={11} color={FISH} />
      </Layer>

      {/* gradual shift to deeper blue */}
      <Layer depth={0} o="0:0, E-1:0.75, E:0.9" rest={0.35} className="deepen deepen--beneath" aria-hidden="true" />

      {/* L5 · copy */}
      <Layer depth={0.28} o="E-1:1, E-0.55:0" className="content content--center">
        <SectionCopy
          index="02"
          title="Crossing the Surface"
          depth="12 m"
          zone="Sunlight Zone"
          heading="The World Beneath"
          text="An entirely different universe exists beneath the surface."
        />
      </Layer>
    </Scene>
  );
}
