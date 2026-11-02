/**
 * Photographic wave band: four tiles of the ocean photograph (alternately
 * mirrored so the seams are invisible) slide horizontally on the compositor,
 * clipped by a periodic SVG wave crest mask. Several bands stacked at
 * different speeds/depths create the layered swell of the opening scene.
 */
export default function WaveBand({ img, position = '50% 88%', duration = 40, reverse = false, className = '' }) {
  return (
    <div className={`waveband ${className}`} style={{ '--dur': `${duration}s` }} aria-hidden="true">
      <div className={`waveband__track ${reverse ? 'is-reverse' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`waveband__tile ${i % 2 ? 'is-flip' : ''}`}
            style={{ backgroundImage: `url(${img})`, backgroundPosition: position }}
          />
        ))}
      </div>
    </div>
  );
}
