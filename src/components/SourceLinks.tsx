import { SOURCES } from '../lib/sources';

export function SourceLinks({ ids }: { ids: string[] }) {
  return (
    <ul className="sources">
      {ids.map((id) => {
        const s = SOURCES[id];
        if (!s) return null;
        return (
          <li key={id}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>
            {!s.verified && <span className="badge warn">TODO(verify)</span>}
            {s.note && <div className="muted small">{s.note}</div>}
          </li>
        );
      })}
    </ul>
  );
}
