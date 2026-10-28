import { Fragment, createElement } from 'react';

/** Renders CMS titles: new lines become masked reveal lines, *text* becomes italic accent. */
export default function RichTitle({ text = '', as = 'h2', className = '', reveal = true }: { text?: string; as?: 'h1' | 'h2' | 'h3' | 'p'; className?: string; reveal?: boolean }) {
  const lines = text.split('\n').filter((l, i, arr) => l.trim() || arr.length === 1);
  return createElement(
    as,
    { className: `display rich-title ${className}`, 'data-reveal': reveal ? 'lines' : undefined },
    lines.map((line, i) => (
      <span className="reveal-line" key={i}>
        <span>{emphasis(line)}</span>
      </span>
    )),
  );
}

export function emphasis(line: string) {
  const parts = line.split(/(\*[^*]+\*)/g);
  return parts.map((p, j) => (p.startsWith('*') && p.endsWith('*') && p.length > 2 ? <em key={j}>{p.slice(1, -1)}</em> : <Fragment key={j}>{p}</Fragment>));
}
