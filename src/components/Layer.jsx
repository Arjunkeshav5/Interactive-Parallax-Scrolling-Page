/**
 * A single parallax layer. The engine reads the data-* attributes and moves the
 * element with translate3d(). Blend modes live on this element (not its children)
 * so they composite against the layers beneath it inside the stage.
 */
export default function Layer({
  depth = 0,
  x,
  scale,
  rot,
  mouse,
  o,
  rest,
  className = '',
  style,
  as: Tag = 'div',
  children,
  ...rest_
}) {
  return (
    <Tag
      data-layer=""
      data-depth={depth}
      data-x={x}
      data-scale={scale}
      data-rot={rot}
      data-mouse={mouse}
      data-o={o}
      data-rest={rest}
      className={`layer ${className}`}
      style={style}
      {...rest_}
    >
      {children}
    </Tag>
  );
}
