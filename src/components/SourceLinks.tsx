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
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2h6v6M10 2 3 9" /></svg>
            </a>
            {!s.verified && <span className="tag warn">TODO(verify)</span>}
            {s.note && <p className="note">{s.note}</p>}
          </li>
        );
      })}
    </ul>
  );
}
