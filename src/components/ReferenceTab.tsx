import { useState } from 'react';
import { AnalytePicker } from './AnalytePicker';
import { SourceLinks } from './SourceLinks';
import { displayUnit, getAnalyte } from '../lib/analytes';
import { convert, fmtValue } from '../lib/convert';
import { ageLabel, classify, lookupIntervals, specimensFor } from '../lib/interpret';
import { MISSING_INTERVALS } from '../data/referenceIntervals';

const FLAG_LABEL = { low: 'LOW (참고구간 미만)', normal: 'NORMAL (참고구간 내)', high: 'HIGH (참고구간 초과)' } as const;

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
    <section>
      <div className="grid">
        <AnalytePicker value={analyteId} onChange={selectAnalyte} />
        <div>
          <div className="row">
            <div className="field">
              <label htmlFor="age">나이 (세)</label>
              <input id="age" inputMode="decimal" value={ageText} onChange={(e) => setAgeText(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="sex">성별</label>
              <select id="sex" value={sex} onChange={(e) => setSex(e.target.value as 'male' | 'female')}>
                <option value="female">여성</option>
                <option value="male">남성</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="specimen">검체</label>
              <select id="specimen" value={activeSpecimen} onChange={(e) => setSpecimen(e.target.value)} disabled={specimens.length === 0}>
                {specimens.length === 0 && <option value="">(공표 구간 없음)</option>}
                {specimens.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="ri-value">결과 값 (선택)</label>
              <input id="ri-value" inputMode="decimal" placeholder="판정할 값" value={valueText} onChange={(e) => setValueText(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ri-unit">단위</label>
              <select id="ri-unit" value={valueUnit} onChange={(e) => setValueUnit(e.target.value)}>
                {analyte.units.map((u) => <option key={u} value={u}>{displayUnit(u, analyte)}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {!ageValid && <div className="result err"><p>나이를 0 이상의 숫자로 입력하세요.</p></div>}

      {ageValid && specimens.length === 0 && (
        <div className="result err">
          <div className="big err-title">공표된 참고구간 없음</div>
          <p>{analyte.nameKo}: 이 앱에는 확인된 RCPA 하모나이즈 참고구간이 수록되어 있지 않습니다.</p>
          {MISSING_INTERVALS[analyteId] && <p className="muted">사유: {MISSING_INTERVALS[analyteId]}</p>}
          <SourceLinks ids={['rcpaTable6']} />
        </div>
      )}

      {ageValid && specimens.length > 0 && intervals.length === 0 && (
        <div className="result err">
          <div className="big err-title">해당 나이·성별의 공표 구간 없음</div>
          <p>
            {age}세 {sex === 'male' ? '남성' : '여성'}에 해당하는 공표 구간이 없습니다. 다른 나이 구간의 값으로 외삽하지 않습니다.
          </p>
          {age < 18 && (
            <p>소아·청소년은 <a href="https://caliperproject.ca/" target="_blank" rel="noreferrer">CALIPER</a> 데이터베이스에서 나이·성별별 구간을 확인하세요 (앱에는 CALIPER 수치를 수록하지 않음).</p>
          )}
          <SourceLinks ids={age < 18 ? ['rcpaTable6', 'caliper'] : ['rcpaTable6']} />
        </div>
      )}

      {intervals.map((ri) => {
        let judgement: JSX.Element | null = null;
        if (valueText.trim() !== '') {
          const v = Number(valueText);
          const c = convert(analyteId, v, valueUnit, ri.unit);
          if (!c.ok) {
            judgement = <p className="err-title">판정 불가: {c.reason}</p>;
          } else {
            const flag = classify(c.value, ri);
            judgement = (
              <div className={`flag ${flag}`}>
                {FLAG_LABEL[flag]}
                {valueUnit !== ri.unit && (
                  <div className="muted small">
                    {valueText} {displayUnit(valueUnit, analyte)} → {fmtValue(c.value)} {displayUnit(ri.unit, analyte)} (변환 계수 {c.rationale.factor === null ? '-' : fmtValue(c.rationale.factor)})
                  </div>
                )}
              </div>
            );
          }
        }
        return (
          <div className="result ok" key={`${ri.sex}-${ri.ageMin}-${ri.specimen}`}>
            <div className="big">
              {ri.lower} – {ri.upper} <span className="unit">{displayUnit(ri.unit, analyte)}</span>
            </div>
            {judgement}
            <dl>
              <dt>분석물</dt><dd>{analyte.nameKo} ({analyte.nameEn})</dd>
              <dt>나이 구간</dt><dd>{ageLabel(ri)}</dd>
              <dt>성별</dt><dd>{ri.sex === 'any' ? '공통' : ri.sex === 'male' ? '남성' : '여성'}</dd>
              <dt>검체</dt><dd>{ri.specimen}</dd>
              {ri.note && (<><dt>비고</dt><dd>{ri.note}</dd></>)}
              {ri.verify && (<><dt>확인 필요</dt><dd><span className="badge warn">TODO(verify)</span> {ri.verify.replace('TODO(verify): ', '')}</dd></>)}
              <dt>출처</dt><dd><SourceLinks ids={[ri.source]} /></dd>
            </dl>
          </div>
        );
      })}
    </section>
  );
}
