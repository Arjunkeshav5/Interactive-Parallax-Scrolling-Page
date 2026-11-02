import { useEffect } from 'react';
import { startEngine } from './engine/parallax.js';
import Navigation from './components/Navigation.jsx';
import ParticleField from './components/ParticleField.jsx';
import OceanAbove from './sections/OceanAbove.jsx';
import CrossingSurface from './sections/CrossingSurface.jsx';
import LivingOcean from './sections/LivingOcean.jsx';
import Bioluminescent from './sections/Bioluminescent.jsx';
import Abyss from './sections/Abyss.jsx';
import JourneyContinues from './sections/JourneyContinues.jsx';

export default function App() {
  useEffect(() => {
    startEngine();
  }, []);

  return (
    <>
      <a className="skip-link" href="#beneath">Skip to the journey</a>
      <Navigation />
      <main className="journey">
        <OceanAbove />
        <CrossingSurface />
        <LivingOcean />
        <Bioluminescent />
        <Abyss />
        <JourneyContinues />
      </main>
      <ParticleField />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
