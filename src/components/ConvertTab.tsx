import { useMemo, useState } from 'react';
import { AnalytePicker } from './AnalytePicker';
import { SourceLinks } from './SourceLinks';
import { COMMON_UNITS, displayUnit, getAnalyte } from '../lib/analytes';
import { convert, fmtFactor, fmtValue } from '../lib/convert';

export function ConvertTab() {
  const [analyteId, setAnalyteId] = useState('glucose');
  const analyte = getAnalyte(analyteId)!;
  const [valueText, setValueText] = useState('100');
  const [from, setFrom] = useState(analyte.units[0]);
  const [to, setTo] = useState(analyte.units[1] ?? analyte.units[0]);
  const [copied, setCopied] = useState(false);

  const otherUnits = useMemo(() => COMMON_UNITS.filter((u) => !analyte.units.includes(u)), [analyte]);

  const value = Number(valueText);
  const result = valueText.trim() === '' ? null : convert(analyteId, value, from, to);

  function selectAnalyte(id: string) {
    const a = getAnalyte(id)!;
    setAnalyteId(id);
    setFrom(a.units[0]);
    setTo(a.units[1] ?? a.units[0]);
    setCopied(false);
  }

  function swap() {
    setFrom(to);
    setTo(from);
    if (result?.ok) setValueText(fmtValue(result.value));
    setCopied(false);
  }

  async function copy() {
    if (!result?.ok) return;
    const text = `${analyte.nameEn}: ${valueText} ${displayUnit(from, analyte)} = ${fmtValue(result.value)} ${displayUnit(to, analyte)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const unitSelect = (id: string, label: string, v: string, set: (u: string) => void) => (
    <div className="field">
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} value={v} onChange={(e) => { set(e.target.value); setCopied(false); }}>
        <optgroup label="이 분석물의 단위">
          {analyte.units.map((u) => <option key={u} value={u}>{displayUnit(u, analyte)}</option>)}
        </optgroup>
        <optgroup label="기타 단위 (근거 없으면 거부됨)">
          {otherUnits.map((u) => <option key={u} value={u}>{displayUnit(u)}</option>)}
        </optgroup>
      </select>
    </div>
  );

  return (
    <div className="layout">
      <aside className="card">
        <AnalytePicker value={analyteId} onChange={selectAnalyte} />
      </aside>

      <div className="stack">
        <section className="card">
          <div className="card-head">
            <h2>{analyte.nameKo}</h2>
            <span className="muted">{analyte.nameEn}</span>
          </div>
          <div className="field">
            <label htmlFor="value" className="label">값</label>
            <input id="value" className="num-input" inputMode="decimal" value={valueText}
              onChange={(e) => { setValueText(e.target.value); setCopied(false); }} />
          </div>
          <div className="unit-row">
            {unitSelect('from', '원본 단위', from, setFrom)}
            <button type="button" className="icon-btn" onClick={swap} aria-label="원본·대상 단위 바꾸기" title="양방향 스왑">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7h12l-3-3M16 13H4l3 3" /></svg>
            </button>
            {unitSelect('to', '대상 단위', to, setTo)}
          </div>
        </section>

        {result && result.ok && (
          <section className="card result" aria-live="polite">
            <div className="hero">
              <div>
                <div className="hero-value">
                  {fmtValue(result.value)}
                  <span className="hero-unit">{displayUnit(to, analyte)}</span>
                </div>
                <div className="muted mono">= {valueText} {displayUnit(from, analyte)}</div>
              </div>
              <button type="button" className={`btn ${copied ? 'done' : ''}`} onClick={copy}>
                {copied ? '복사됨 ✓' : '결과 복사'}
              </button>
            </div>

            <div className="basis">
              <h3>계산 근거</h3>
              <div className="formula mono">{result.rationale.formula}</div>
              <dl className="kv">
                <dt>방법</dt>
                <dd>{result.rationale.method}</dd>
                <dt>계수</dt>
                <dd>{result.rationale.factor === null ? '선형 계수 없음 (절편 포함 공식)' : <span className="mono">{fmtFactor(result.rationale.factor)}</span>}</dd>
                {result.rationale.steps.length > 0 && (
                  <>
                    <dt>계산 과정</dt>
                    <dd><ul className="plain">{result.rationale.steps.map((s) => <li key={s} className="mono small">{s}</li>)}</ul></dd>
                  </>
                )}
                <dt>가정</dt>
                <dd>
                  {result.rationale.assumptions.length === 0 ? <span className="muted">추가 가정 없음</span> : (
                    <ul className="plain">{result.rationale.assumptions.map((s) => <li key={s}>{s}</li>)}</ul>
                  )}
                </dd>
                <dt>출처</dt>
                <dd><SourceLinks ids={result.rationale.sources} /></dd>
              </dl>
            </div>
          </section>
        )}

        {result && !result.ok && (
          <section className="card result rejected" aria-live="polite">
            <div className="status-line">
              <span className="tag danger">변환 거부</span>
              <span className="muted mono">{displayUnit(from, analyte)} → {displayUnit(to, analyte)}</span>
            </div>
            <p className="reason">{result.reason}</p>
            <div className="basis">
              <h3>근거</h3>
              <SourceLinks ids={result.sources} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
