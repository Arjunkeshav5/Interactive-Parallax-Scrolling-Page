import { useEffect, useRef } from 'react';

/* One shared IntersectionObserver for every reveal on the page. */
let io;
function getObserver() {
  if (io) return io;
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        e.target.classList.toggle('is-in', e.isIntersecting);
      }
    },
    { threshold: 0.35, rootMargin: '0px 0px -8% 0px' }
  );
  return io;
}

export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = getObserver();
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  return ref;
}

/** Block-level reveal (fade + rise). */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...props }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--d': `${delay}ms` }} {...props}>
      {children}
    </Tag>
  );
}

/** Word-by-word masked reveal for display headings. Screen readers get the plain text. */
export function SplitHeading({ as: Tag = 'h2', text, className = '', delay = 0, lines }) {
  const ref = useReveal();
  const rows = lines || [text];
  let i = 0;
  return (
    <Tag ref={ref} className={`split ${className}`} aria-label={rows.join(' ')} style={{ '--d': `${delay}ms` }}>
      {rows.map((row, r) => (
        <span className="split__line" key={r} aria-hidden="true">
          {row.split(' ').map((word, w) => (
            <span className="split__mask" key={w}>
              <span className="split__word" style={{ '--i': i++ }}>
                {word}
              </span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
