import { useMemo, useState } from 'react';
import { searchAnalytes, type Analyte } from '../lib/analytes';

interface Props {
  value: string;
  onChange: (id: string) => void;
  /** 선택 가능한 분석물 id 제한 (없으면 전체) */
  restrictTo?: string[];
}

export function AnalytePicker({ value, onChange, restrictTo }: Props) {
  const [query, setQuery] = useState('');
  const list = useMemo<Analyte[]>(() => {
    const found = searchAnalytes(query);
    return restrictTo ? found.filter((a) => restrictTo.includes(a.id)) : found;
  }, [query, restrictTo]);

  return (
    <div className="field">
      <label htmlFor="analyte-search">분석물 검색 (영문·한글·동의어)</label>
      <input
        id="analyte-search"
        type="search"
        placeholder="예: 혈당, Cr, BUN, A1c, ACR, 칼륨"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          const next = searchAnalytes(e.target.value).filter((a) => !restrictTo || restrictTo.includes(a.id));
          if (next.length > 0 && !next.some((a) => a.id === value)) onChange(next[0].id);
        }}
      />
      <select aria-label="분석물" value={value} onChange={(e) => onChange(e.target.value)} size={Math.min(6, Math.max(2, list.length))}>
        {list.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nameKo} · {a.nameEn}
          </option>
        ))}
      </select>
      {list.length === 0 && <p className="muted">검색 결과가 없습니다.</p>}
    </div>
  );
}
