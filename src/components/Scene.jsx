import { useEffect, useRef } from 'react';
import { registerScene } from '../engine/parallax.js';

/**
 * A pinned parallax scene.
 * The <section> is `height` viewports tall; its stage sticks to the viewport
 * while the engine moves the layers inside it at independent speeds.
 * `overlap` pulls the scene up over the previous one so stages cross-fade.
 */
export default function Scene({ id, height = 200, mobileHeight, overlap = true, className = '', label, children, edge = 'fade' }) {
  const ref = useRef(null);

  useEffect(() => registerScene(ref.current, id), [id]);

  return (
    <section
      id={id}
      ref={ref}
      aria-label={label}
      className={`scene scene--${id} ${overlap ? 'scene--overlap' : ''} ${className}`}
      style={{ '--h': height, '--hm': mobileHeight ?? Math.round(height * 0.8) }}
    >
      <div className={`scene__stage scene__stage--edge-${edge}`}>{children}</div>
    </section>
  );
}
