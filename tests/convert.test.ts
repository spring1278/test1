import { convert } from '../src/lib/convert';

function ok(analyte: string, v: number, from: string, to: string): number {
  const r = convert(analyte, v, from, to);
  if (!r.ok) throw new Error(`expected success: ${r.reason}`);
  return r.value;
}

describe('UCUM + 분자량 변환', () => {
  it('포도당 100 mg/dL → 5.5507 mmol/L (180.156 g/mol)', () => {
    expect(ok('glucose', 100, 'mg/dL', 'mmol/L')).toBeCloseTo(1000 / 180.156, 6);
  });
  it('크레아티닌 1 mg/dL → 88.40 µmol/L', () => {
    expect(ok('creatinine', 1, 'mg/dL', 'umol/L')).toBeCloseTo(10000 / 113.12, 6);
  });
  it('왕복 변환은 원래 값', () => {
    const mmol = ok('cholesterol', 200, 'mg/dL', 'mmol/L');
    expect(ok('cholesterol', mmol, 'mmol/L', 'mg/dL')).toBeCloseTo(200, 9);
  });
  it('순수 스케일 변환 g/dL → g/L', () => {
    expect(ok('albumin', 4, 'g/dL', 'g/L')).toBeCloseTo(40, 9);
  });
  it('효소 U/L → µkat/L (1 U = 1 µmol/min)', () => {
    expect(ok('alt', 60, 'U/L', 'ukat/L')).toBeCloseTo(1, 9);
  });
  it('근거에 방법·계수·수식·출처가 포함', () => {
    const r = convert('glucose', 90, 'mg/dL', 'mmol/L');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.rationale.factor).toBeCloseTo(10 / 180.156, 8);
      expect(r.rationale.sources).toEqual(expect.arrayContaining(['ucum', 'ciaaw']));
      expect(r.rationale.steps.join(' ')).toContain('C6H12O6');
    }
  });
});

describe('이온 전하 (mEq/L)', () => {
  it('Ca 2.5 mmol/L → 5 mEq/L (z=2)', () => {
    expect(ok('calcium', 2.5, 'mmol/L', 'meq/L')).toBeCloseTo(5, 9);
  });
  it('Ca 10 mg/dL → 4.990 mEq/L', () => {
    expect(ok('calcium', 10, 'mg/dL', 'meq/L')).toBeCloseTo((100 / 40.078) * 2, 6);
  });
  it('Na 140 mEq/L = 140 mmol/L (z=1)', () => {
    expect(ok('sodium', 140, 'meq/L', 'mmol/L')).toBeCloseTo(140, 9);
  });
  it('Mg 2 mEq/L → 1 mmol/L', () => {
    expect(ok('magnesium', 2, 'meq/L', 'mmol/L')).toBeCloseTo(1, 9);
  });
});

describe('특수 변환', () => {
  it('HbA1c 6.5% → 47.5 mmol/mol (NGSP master equation 역산)', () => {
    expect(ok('hba1c', 6.5, '%', 'mmol/mol')).toBeCloseTo((6.5 - 2.152) / 0.09148, 9);
    expect(ok('hba1c', 6.5, '%', 'mmol/mol')).toBeCloseTo(47.5, 1);
  });
  it('HbA1c 48 mmol/mol → 6.54%', () => {
    expect(ok('hba1c', 48, 'mmol/mol', '%')).toBeCloseTo(0.09148 * 48 + 2.152, 9);
  });
  it('HbA1c 왕복', () => {
    expect(ok('hba1c', ok('hba1c', 7, '%', 'mmol/mol'), 'mmol/mol', '%')).toBeCloseTo(7, 9);
  });
  it('HbA1c는 UCUM 단순 배율(6.5% → 65)로 계산하지 않음', () => {
    expect(ok('hba1c', 6.5, '%', 'mmol/mol')).not.toBeCloseTo(65, 0);
  });
  it('uACR 30 mg/g → 3.394 mg/mmol (크레아티닌 몰질량)', () => {
    expect(ok('uacr', 30, 'mg/g', 'mg/mmol')).toBeCloseTo(30 * 113.12 / 1000, 6);
  });
  it('uPCR 50 mg/mmol → 442 mg/g', () => {
    expect(ok('upcr', 50, 'mg/mmol', 'mg/g')).toBeCloseTo(50 * 1000 / 113.12, 6);
  });
  it('BUN 14 mg/dL → 요소 4.998 mmol/L', () => {
    expect(ok('bun', 14, 'mg/dL', 'mmol/L')).toBeCloseTo(140 / 28.014, 6);
  });
  it('요소 5 mmol/L → BUN 14.007 mg/dL', () => {
    expect(ok('bun', 5, 'mmol/L', 'mg/dL')).toBeCloseTo(5 * 2.8014, 6);
  });
  it('중성지방: 트리올레인 가정이 근거에 명시', () => {
    const r = convert('triglycerides', 150, 'mg/dL', 'mmol/L');
    expect(r.ok && r.rationale.assumptions.join(' ')).toContain('트리올레인');
  });
});

describe('근거 없는 변환은 거부', () => {
  it('mg/dL → U/L (차원 불일치)', () => {
    const r = convert('glucose', 100, 'mg/dL', 'U/L');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('차원');
  });
  it('효소 U/L → mg/dL', () => {
    expect(convert('alt', 30, 'U/L', 'mg/dL').ok).toBe(false);
  });
  it('총단백 g/dL → mmol/L (분자량 없음)', () => {
    const r = convert('totalProtein', 7, 'g/dL', 'mmol/L');
    expect(r.ok).toBe(false);
  });
  it('인산 mmol/L → mEq/L (고정 전하 없음)', () => {
    const r = convert('phosphate', 1, 'mmol/L', 'meq/L');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('전하');
  });
  it('포도당 mmol/L → mEq/L (전하 없음)', () => {
    expect(convert('glucose', 5, 'mmol/L', 'meq/L').ok).toBe(false);
  });
  it('포도당 % → mmol/mol (비율 단위 정의 없음)', () => {
    expect(convert('glucose', 5, '%', 'mmol/mol').ok).toBe(false);
  });
  it('잘못된 단위 코드', () => {
    expect(convert('glucose', 5, 'mg/dL', 'foo').ok).toBe(false);
  });
  it('HbA1c % → mg/dL', () => {
    expect(convert('hba1c', 6, '%', 'mg/dL').ok).toBe(false);
  });
});
