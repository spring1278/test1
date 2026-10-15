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

  const unitOptions = useMemo(() => {
    const rest = COMMON_UNITS.filter((u) => !analyte.units.includes(u));
    return { primary: analyte.units, rest };
  }, [analyte]);

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
      <label htmlFor={id}>{label}</label>
      <select id={id} value={v} onChange={(e) => { set(e.target.value); setCopied(false); }}>
        <optgroup label="이 분석물의 단위">
          {unitOptions.primary.map((u) => (
            <option key={u} value={u}>{displayUnit(u, analyte)}</option>
          ))}
        </optgroup>
        <optgroup label="기타 단위 (근거 없으면 거부됨)">
          {unitOptions.rest.map((u) => (
            <option key={u} value={u}>{displayUnit(u)}</option>
          ))}
        </optgroup>
      </select>
    </div>
  );

  return (
    <section>
      <div className="grid">
        <AnalytePicker value={analyteId} onChange={selectAnalyte} />
        <div>
          <div className="field">
            <label htmlFor="value">값</label>
            <input id="value" inputMode="decimal" value={valueText} onChange={(e) => { setValueText(e.target.value); setCopied(false); }} />
          </div>
          <div className="row">
            {unitSelect('from', '원본 단위', from, setFrom)}
            <button type="button" className="swap" onClick={swap} aria-label="단위 바꾸기" title="양방향 스왑">⇄</button>
            {unitSelect('to', '대상 단위', to, setTo)}
          </div>
        </div>
      </div>

      {result && (
        <div className={`result ${result.ok ? 'ok' : 'err'}`}>
          {result.ok ? (
            <>
              <div className="big">
                {fmtValue(result.value)} <span className="unit">{displayUnit(to, analyte)}</span>
              </div>
              <div className="muted">
                {valueText} {displayUnit(from, analyte)} · {analyte.nameKo}
              </div>
              <button type="button" onClick={copy}>{copied ? '복사됨 ✓' : '결과 복사'}</button>
              <div className="basis">
                <h3>계산 근거</h3>
                <dl>
                  <dt>방법</dt>
                  <dd>{result.rationale.method}</dd>
                  <dt>계수</dt>
                  <dd>{result.rationale.factor === null ? '선형 계수 없음 (절편 포함 공식)' : fmtFactor(result.rationale.factor)}</dd>
                  <dt>수식</dt>
                  <dd><code>{result.rationale.formula}</code></dd>
                  {result.rationale.steps.length > 0 && (
                    <>
                      <dt>계산 과정</dt>
                      <dd>
                        <ul>{result.rationale.steps.map((s) => <li key={s}><code>{s}</code></li>)}</ul>
                      </dd>
                    </>
                  )}
                  <dt>가정</dt>
                  <dd>
                    {result.rationale.assumptions.length === 0 ? '추가 가정 없음' : (
                      <ul>{result.rationale.assumptions.map((s) => <li key={s}>{s}</li>)}</ul>
                    )}
                  </dd>
                  <dt>출처</dt>
                  <dd><SourceLinks ids={result.rationale.sources} /></dd>
                </dl>
              </div>
            </>
          ) : (
            <>
              <div className="big err-title">변환 거부</div>
              <p>{result.reason}</p>
              <div className="basis">
                <h3>근거</h3>
                <SourceLinks ids={result.sources} />
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
