import { useState } from 'react';
import { AnalytePicker } from './AnalytePicker';
import { SourceLinks } from './SourceLinks';
import { displayUnit, getAnalyte, type Analyte } from '../lib/analytes';
import { convert, fmtValue } from '../lib/convert';
import { ageLabel, analytesWithIntervals, classify, lookupIntervals, specimensFor, type Flag } from '../lib/interpret';
import { MISSING_INTERVALS, type ReferenceInterval } from '../data/referenceIntervals';

const FLAG_LABEL: Record<Flag, string> = { low: 'LOW', normal: 'NORMAL', high: 'HIGH' };
const FLAG_DESC: Record<Flag, string> = { low: '참고구간 미만', normal: '참고구간 내', high: '참고구간 초과' };
const WITH_INTERVALS = new Set(analytesWithIntervals());

export function ReferenceTab() {
  const [analyteId, setAnalyteId] = useState('potassium');
  const analyte = getAnalyte(analyteId)!;
  const [ageText, setAgeText] = useState('40');
  const [sex, setSex] = useState<'male' | 'female'>('female');
  const specimens = specimensFor(analyteId);
  const [specimen, setSpecimen] = useState('');
  const [valueText, setValueText] = useState('');
  const [valueUnit, setValueUnit] = useState(analyte.units[0]);

  const age = Number(ageText);
  const ageValid = ageText.trim() !== '' && Number.isFinite(age) && age >= 0;
  const activeSpecimen = specimens.includes(specimen) ? specimen : specimens[0] ?? '';
  const intervals = ageValid ? lookupIntervals({ analyteId, age, sex, specimen: activeSpecimen || undefined }) : [];

  function selectAnalyte(id: string) {
    setAnalyteId(id);
    setValueUnit(getAnalyte(id)!.units[0]);
    setSpecimen('');
  }

  return (
    <div className="layout">
      <aside className="card">
        <AnalytePicker value={analyteId} onChange={selectAnalyte} badge={(a) => (WITH_INTERVALS.has(a.id) ? 'RCPA' : null)} />
      </aside>

      <div className="stack">
        <section className="card">
          <div className="card-head">
            <h2>{analyte.nameKo}</h2>
            <span className="muted">{analyte.nameEn}</span>
          </div>
          <div className="grid-3">
            <div className="field">
              <label htmlFor="age" className="label">나이 (세)</label>
              <input id="age" inputMode="decimal" value={ageText} onChange={(e) => setAgeText(e.target.value)} />
            </div>
            <div className="field">
              <span className="label" id="sex-label">성별</span>
              <div className="segmented small" role="radiogroup" aria-labelledby="sex-label">
                {(['female', 'male'] as const).map((s) => (
                  <button key={s} type="button" role="radio" aria-checked={sex === s} className={sex === s ? 'active' : ''} onClick={() => setSex(s)}>
                    {s === 'female' ? '여성' : '남성'}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label htmlFor="specimen" className="label">검체</label>
              <select id="specimen" value={activeSpecimen} onChange={(e) => setSpecimen(e.target.value)} disabled={specimens.length === 0}>
                {specimens.length === 0 && <option value="">공표 구간 없음</option>}
                {specimens.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="ri-value" className="label">결과 값 <span className="muted">(선택 · 판정용)</span></label>
              <input id="ri-value" className="mono" inputMode="decimal" placeholder="예: 4.1" value={valueText} onChange={(e) => setValueText(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ri-unit" className="label">단위</label>
              <select id="ri-unit" value={valueUnit} onChange={(e) => setValueUnit(e.target.value)}>
                {analyte.units.map((u) => <option key={u} value={u}>{displayUnit(u, analyte)}</option>)}
              </select>
            </div>
          </div>
        </section>

        {!ageValid && (
          <section className="card result rejected"><p className="reason">나이를 0 이상의 숫자로 입력하세요.</p></section>
        )}

        {ageValid && specimens.length === 0 && (
          <section className="card result empty-state">
            <span className="tag">데이터 없음</span>
            <h3>공표된 참고구간이 수록되어 있지 않습니다</h3>
            <p>{analyte.nameKo}에 대해 확인된 RCPA 하모나이즈 참고구간이 없어 표시하지 않습니다(추정값으로 채우지 않음).</p>
            {MISSING_INTERVALS[analyteId] && <p className="muted small">사유: {MISSING_INTERVALS[analyteId]}</p>}
            <SourceLinks ids={['rcpaTable6']} />
          </section>
        )}

        {ageValid && specimens.length > 0 && intervals.length === 0 && (
          <section className="card result empty-state">
            <span className="tag">외삽 안 함</span>
            <h3>{age}세 {sex === 'male' ? '남성' : '여성'}에 해당하는 공표 구간이 없습니다</h3>
            <p>다른 나이 구간의 값으로 추정하지 않습니다.</p>
            {age < 18 && (
              <p>소아·청소년은 <a href="https://caliperproject.ca/" target="_blank" rel="noreferrer">CALIPER</a> 데이터베이스에서 나이·성별별 구간을 확인하세요 (앱에는 CALIPER 수치를 수록하지 않음).</p>
            )}
            <SourceLinks ids={age < 18 ? ['rcpaTable6', 'caliper'] : ['rcpaTable6']} />
          </section>
        )}

        {intervals.map((ri) => (
          <IntervalCard key={`${ri.sex}-${ri.ageMin}-${ri.specimen}`} ri={ri} analyte={analyte} valueText={valueText} valueUnit={valueUnit} />
        ))}
      </div>
    </div>
  );
}

function IntervalCard({ ri, analyte, valueText, valueUnit }: { ri: ReferenceInterval; analyte: Analyte; valueText: string; valueUnit: string }) {
  let judgement: JSX.Element | null = null;
  let marker: number | null = null;
  let flag: Flag | null = null;

  if (valueText.trim() !== '') {
    const c = convert(analyte.id, Number(valueText), valueUnit, ri.unit);
    if (!c.ok) {
      judgement = <p className="reason">판정 불가: {c.reason}</p>;
    } else {
      flag = classify(c.value, ri);
      // 막대: 구간 폭의 50%씩 양쪽 여유를 두고 위치를 0–100%로
      const span = ri.upper - ri.lower;
      const min = ri.lower - span * 0.5;
      const max = ri.upper + span * 0.5;
      marker = Math.min(100, Math.max(0, ((c.value - min) / (max - min)) * 100));
      judgement = (
        <div className="judgement">
          <span className={`flag ${flag}`}>{FLAG_LABEL[flag]}</span>
          <span>
            <strong className="mono">{fmtValue(c.value)} {displayUnit(ri.unit, analyte)}</strong> · {FLAG_DESC[flag]}
          </span>
          {valueUnit !== ri.unit && (
            <span className="muted small mono">
              입력 {valueText} {displayUnit(valueUnit, analyte)} → 변환 계수 {c.rationale.factor === null ? '-' : fmtValue(c.rationale.factor)}
            </span>
          )}
        </div>
      );
    }
  }

  return (
    <section className={`card result ${flag && flag !== 'normal' ? 'abnormal' : ''}`} aria-live="polite">
      <div className="hero">
        <div>
          <div className="label">참고구간</div>
          <div className="hero-value">
            {ri.lower}<span className="dash">–</span>{ri.upper}
            <span className="hero-unit">{displayUnit(ri.unit, analyte)}</span>
          </div>
        </div>
      </div>

      <div className="range" aria-hidden="true">
        <div className="range-track">
          <div className="range-normal" />
          {marker !== null && <div className={`range-marker ${flag}`} style={{ left: `${marker}%` }} />}
        </div>
        <div className="range-labels mono">
          <span style={{ left: '25%' }}>{ri.lower}</span>
          <span style={{ left: '75%' }}>{ri.upper}</span>
        </div>
      </div>

      {judgement}

      <dl className="kv">
        <dt>나이 구간</dt><dd>{ageLabel(ri)}</dd>
        <dt>성별</dt><dd>{ri.sex === 'any' ? '공통' : ri.sex === 'male' ? '남성' : '여성'}</dd>
        <dt>검체</dt><dd>{ri.specimen}</dd>
        {ri.note && (<><dt>비고</dt><dd>{ri.note}</dd></>)}
        {ri.verify && (<><dt>확인 필요</dt><dd><span className="tag warn">TODO(verify)</span> {ri.verify.replace('TODO(verify): ', '')}</dd></>)}
        <dt>출처</dt><dd><SourceLinks ids={[ri.source]} /></dd>
      </dl>
    </section>
  );
}
