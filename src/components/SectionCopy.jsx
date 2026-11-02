import { Reveal, SplitHeading } from './Reveal.jsx';

/** Editorial copy block used by every chapter: eyebrow · display heading · supporting line. */
export default function SectionCopy({ index, title, depth, zone, lines, heading, text, as = 'h2', align = 'center', children }) {
  return (
    <div className={`copy copy--${align}`}>
      <Reveal as="p" className="eyebrow">
        <span className="eyebrow__index">{index}</span>
        <span className="eyebrow__rule" aria-hidden="true" />
        <span>{title}</span>
        {depth !== undefined && (
          <span className="eyebrow__depth">
            {depth} · {zone}
          </span>
        )}
      </Reveal>
      <SplitHeading as={as} className={`display ${as === 'h1' ? 'display--hero' : ''}`} text={heading} lines={lines} delay={120} />
      {text && (
        <Reveal as="p" className="lede" delay={520}>
          {text}
        </Reveal>
      )}
      {children}
    </div>
  );
}
