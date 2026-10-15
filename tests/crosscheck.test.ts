/**
 * 교차 검증 전용 데이터 — 앱에는 포함하지 않고 테스트에서만 대조한다.
 * 앱의 계수는 UCUM + IUPAC 원자량으로 "계산"되며, 아래 공표 표의 값과 반올림 오차 범위 내에서 일치하는지만 확인한다.
 *
 * 개발 환경에서 해당 문서에 직접 접근할 수 없어 웹 검색 발췌로 확인한 값만 출처를 붙였다.
 * 출처 문서에서 직접 확인하지 못한 값은 TODO(verify) 로 표시했다.
 */
import { convert } from '../src/lib/convert';

function factor(analyte: string, from: string, to: string): number {
  const r = convert(analyte, 1, from, to);
  if (!r.ok) throw new Error(r.reason);
  return r.value;
}
function value(analyte: string, v: number, from: string, to: string): number {
  const r = convert(analyte, v, from, to);
  if (!r.ok) throw new Error(r.reason);
  return r.value;
}
/** 상대오차 */
const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

describe('Labcorp SI Unit Conversion Table (https://www.labcorp.com/resource/si-unit-conversion-table)', () => {
  it('콜레스테롤 mg/dL → mmol/L: 0.0259', () => {
    expect(rel(factor('cholesterol', 'mg/dL', 'mmol/L'), 0.0259)).toBeLessThan(0.005);
  });
  it('칼슘 mg/dL → mmol/L: 0.25', () => {
    expect(rel(factor('calcium', 'mg/dL', 'mmol/L'), 0.25)).toBeLessThan(0.005);
  });
});

describe('NBME Laboratory Reference Values (https://www.nbme.org/sites/default/files/2024-12/Laboratory_Reference_Values.pdf)', () => {
  it('크레아티닌 0.6–1.2 mg/dL = 53–106 µmol/L', () => {
    expect(value('creatinine', 0.6, 'mg/dL', 'umol/L')).toBeCloseTo(53, 0);
    expect(value('creatinine', 1.2, 'mg/dL', 'umol/L')).toBeCloseTo(106, 0);
  });
  it('포도당 공복 70–100 mg/dL = 3.8–5.6 mmol/L (NBME 반올림 표기 ±0.1)', () => {
    expect(Math.abs(value('glucose', 70, 'mg/dL', 'mmol/L') - 3.8)).toBeLessThanOrEqual(0.1);
    expect(Math.abs(value('glucose', 100, 'mg/dL', 'mmol/L') - 5.6)).toBeLessThanOrEqual(0.1);
  });
  it('포도당 random <140 mg/dL = <7.77 mmol/L', () => {
    expect(value('glucose', 140, 'mg/dL', 'mmol/L')).toBeCloseTo(7.77, 2);
  });
  it('나트륨 136–146 mEq/L = 136–146 mmol/L', () => {
    expect(value('sodium', 136, 'meq/L', 'mmol/L')).toBeCloseTo(136, 9);
    expect(value('sodium', 146, 'meq/L', 'mmol/L')).toBeCloseTo(146, 9);
  });
});

describe('NGSP 공표 대응값', () => {
  it('ADEA/NGSP 역식 IFCC = 10.93 × NGSP − 23.5 와 ±0.2 mmol/mol 이내', () => {
    for (const ngsp of [5, 6, 6.5, 7, 8, 10]) {
      expect(Math.abs(value('hba1c', ngsp, '%', 'mmol/mol') - (10.93 * ngsp - 23.5))).toBeLessThan(0.2);
    }
  });
});

describe('KDIGO 2024 반올림 대응값', () => {
  // TODO(verify): kdigo.org 원문 직접 대조 못함. KDIGO는 30 mg/g ≈ 3 mg/mmol, 300 mg/g ≈ 30 mg/mmol 로 반올림 표기.
  it('30 mg/g ≈ 3 mg/mmol, 300 mg/g ≈ 30 mg/mmol (반올림 15% 이내)', () => {
    expect(rel(value('uacr', 30, 'mg/g', 'mg/mmol'), 3)).toBeLessThan(0.15);
    expect(rel(value('uacr', 300, 'mg/g', 'mg/mmol'), 30)).toBeLessThan(0.15);
  });
});

describe('TODO(verify): CMEinfo 변환표 및 Labcorp 미확인 행 — 문서 원문에서 확인하지 못한 관용 계수', () => {
  // 아래 값은 널리 쓰이는 관용 SI 변환 계수지만, 개발 환경에서 CMEinfo PDF / Labcorp 표의 해당 행을
  // 직접 확인하지 못했으므로 특정 문서의 값이라고 주장하지 않는다.
  it.each([
    ['glucose', 'mg/dL', 'mmol/L', 0.0555],
    ['triglycerides', 'mg/dL', 'mmol/L', 0.0113],
    ['uricAcid', 'mg/dL', 'umol/L', 59.48],
    ['bilirubin', 'mg/dL', 'umol/L', 17.1],
    ['magnesium', 'mg/dL', 'mmol/L', 0.4114],
    ['phosphate', 'mg/dL', 'mmol/L', 0.3229],
    ['iron', 'ug/dL', 'umol/L', 0.179],
    ['bun', 'mg/dL', 'mmol/L', 0.357],
    ['creatinine', 'mg/dL', 'umol/L', 88.4],
  ])('%s %s → %s ≈ %f', (a, from, to, f) => {
    expect(rel(factor(a, from, to), f)).toBeLessThan(0.005);
  });
});
