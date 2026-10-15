import { useMemo, useState } from 'react';
import { searchAnalytes, type Analyte } from '../lib/analytes';

interface Props {
  value: string;
  onChange: (id: string) => void;
  /** 선택 가능한 분석물 id 제한 (없으면 전체) */
  restrictTo?: string[];
  /** 항목 옆에 표시할 뱃지 (예: 참고구간 수록 여부) */
  badge?: (a: Analyte) => string | null;
}

export function AnalytePicker({ value, onChange, restrictTo, badge }: Props) {
  const [query, setQuery] = useState('');
  const list = useMemo<Analyte[]>(() => {
    const found = searchAnalytes(query);
    return restrictTo ? found.filter((a) => restrictTo.includes(a.id)) : found;
  }, [query, restrictTo]);

  return (
    <div className="picker">
      <label htmlFor="analyte-search" className="label">분석물</label>
      <div className="search">
        <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6" /><path d="m14 14 4 4" /></svg>
        <input
          id="analyte-search"
          type="search"
          placeholder="영문·한글·동의어 (예: 혈당, Cr, A1c, 칼륨)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ul className="analyte-list" role="listbox" aria-label="분석물 목록">
        {list.map((a) => {
          const b = badge?.(a);
          return (
            <li key={a.id}>
              <button
                type="button"
                role="option"
                aria-selected={a.id === value}
                className={a.id === value ? 'selected' : ''}
                onClick={() => onChange(a.id)}
              >
                <span className="ko">{a.nameKo}</span>
                <span className="en">{a.nameEn}</span>
                {b && <span className="chip">{b}</span>}
              </button>
            </li>
          );
        })}
        {list.length === 0 && <li className="empty">“{query}”에 해당하는 분석물이 없습니다.</li>}
      </ul>
    </div>
  );
}
