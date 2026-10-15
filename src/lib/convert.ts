import ucum from '@lhncbc/ucum-lhc';
import { getAnalyte, displayUnit, type Analyte } from './analytes';
import { molarMass, molarMassExplanation, ATOMIC_WEIGHTS, round } from './chem';

const utils = ucum.UcumLhcUtils.getInstance();

export interface Rationale {
  method: string;
  /** 선형 변환이면 곱하는 계수, 아니면 null */
  factor: number | null;
  formula: string;
  steps: string[];
  assumptions: string[];
  sources: string[];
}

export type ConvertResult =
  | { ok: true; value: number; rationale: Rationale }
  | { ok: false; reason: string; sources: string[] };

/** 단위가 어떤 물리량(차원)인지 분류: 근거 메시지용 */
const KINDS: { ref: string; label: string }[] = [
  { ref: 'g/L', label: '질량 농도' },
  { ref: 'eq/L', label: '당량 농도' },
  { ref: 'mol/L', label: '물질량(몰) 농도' },
  { ref: 'kat/L', label: '촉매활성 농도(효소 활성)' },
  { ref: 'g/mol', label: '질량/물질량 비' },
  { ref: '1', label: '무차원 비율' },
];

export function unitKind(code: string): string {
  for (const k of KINDS) {
    if (utils.convertUnitTo(code, 1, k.ref).status === 'succeeded') return k.label;
  }
  return '기타';
}

function isValidUnit(code: string): boolean {
  return utils.validateUnitString(code).status === 'valid';
}

function ucumConvert(from: string, value: number, to: string, mw?: number, charge?: number) {
  return utils.convertUnitTo(from, value, to, {
    molecularWeight: mw ?? null,
    charge: charge ?? null,
  });
}

const HBA1C_SLOPE = 0.09148;
const HBA1C_INTERCEPT = 2.152;

function fail(reason: string, sources: string[] = ['ucum']): ConvertResult {
  return { ok: false, reason, sources };
}

function convertHbA1c(value: number, from: string, to: string): ConvertResult {
  const src = ['ngsp'];
  const base = {
    method: 'NGSP–IFCC master equation (특수 변환, 비선형·절편 포함)',
    factor: null,
    assumptions: [
      '단순 배율(%×10)이 아님: UCUM 상 % → mmol/mol 은 무차원 배율로 계산되지만 NGSP%와 IFCC mmol/mol은 서로 다른 측정 체계라 사용하지 않음.',
      '역방향(NGSP→IFCC)은 master equation을 대수적으로 역산한 값.',
    ],
    sources: src,
  };
  if (from === 'mmol/mol' && to === '%') {
    return {
      ok: true,
      value: HBA1C_SLOPE * value + HBA1C_INTERCEPT,
      rationale: { ...base, formula: `NGSP(%) = ${HBA1C_SLOPE} × IFCC(mmol/mol) + ${HBA1C_INTERCEPT}`, steps: [`${HBA1C_SLOPE} × ${value} + ${HBA1C_INTERCEPT}`] },
    };
  }
  if (from === '%' && to === 'mmol/mol') {
    return {
      ok: true,
      value: (value - HBA1C_INTERCEPT) / HBA1C_SLOPE,
      rationale: { ...base, formula: `IFCC(mmol/mol) = (NGSP(%) − ${HBA1C_INTERCEPT}) / ${HBA1C_SLOPE}`, steps: [`(${value} − ${HBA1C_INTERCEPT}) / ${HBA1C_SLOPE}`] },
    };
  }
  return fail('HbA1c는 NGSP(%)와 IFCC(mmol/mol) 사이의 master equation 변환만 근거가 있습니다.', src);
}

/**
 * 분석물·값·원본 단위·대상 단위로 변환한다.
 * 근거가 없는 변환은 ok:false 와 사유를 돌려준다.
 */
export function convert(analyteId: string, value: number, from: string, to: string): ConvertResult {
  const analyte = getAnalyte(analyteId);
  if (!analyte) return fail(`알 수 없는 분석물: ${analyteId}`);
  if (!Number.isFinite(value)) return fail('숫자 값을 입력하세요.');
  for (const u of [from, to]) {
    if (!isValidUnit(u)) return fail(`"${u}" 은(는) 유효한 UCUM 단위 코드가 아닙니다.`);
  }

  if (analyte.special === 'hba1c') {
    if (from === to) return identity(value, from, analyte, ['ngsp']);
    return convertHbA1c(value, from, to);
  }

  const kindFrom = unitKind(from);
  const kindTo = unitKind(to);

  if (from === to) return identity(value, from, analyte, ['ucum']);

  // 무차원 비율 단위(%, mmol/mol, g/g 등)는 의미(질량분율/몰분율)가 분석물마다 달라 정의된 경우에만 허용
  if ((kindFrom === '무차원 비율' || kindTo === '무차원 비율') && !(analyte.units.includes(from) && analyte.units.includes(to))) {
    return fail(
      `${displayUnit(from)}(${kindFrom}) → ${displayUnit(to)}(${kindTo}): 이 분석물(${analyte.nameKo})에 대해 비율 단위의 의미가 정의되어 있지 않아 변환 근거가 없습니다.`,
    );
  }

  if (analyte.special === 'bun') return convertBun(value, from, to, analyte);

  let mw: number | undefined;
  let charge: number | undefined;
  let formulaFor: string | undefined;
  if (analyte.special === 'creatinineRatio') {
    formulaFor = 'C4H7N3O';
  } else {
    formulaFor = analyte.formula;
  }

  // 1단계: 순수 스케일 변환 (UCUM)
  let r = ucumConvert(from, value, to);
  const steps: string[] = [];
  const assumptions: string[] = [];
  const sources = ['ucum', ...(analyte.extraSources ?? [])];
  let method = 'UCUM 스케일 변환 (같은 차원, 접두어/부피 단위만 다름)';

  if (r.status !== 'succeeded' && r.code?.startsWith('missing-')) {
    const needsMw = (r.code?.includes('molecular-weight') ?? false) || kindFrom === '질량 농도' || kindTo === '질량 농도';
    const needsCharge = (r.code?.includes('charge') ?? false) || kindFrom === '당량 농도' || kindTo === '당량 농도';
    if (needsMw) {
      if (!formulaFor) {
        return fail(analyte.noFormulaReason ?? `${analyte.nameKo}에는 정의된 분자식이 없어 질량↔몰 변환 근거가 없습니다.`, sources);
      }
      mw = molarMass(formulaFor);
      steps.push(
        analyte.special === 'creatinineRatio'
          ? `분모(크레아티닌, C4H7N3O) 몰질량: ${molarMassExplanation(formulaFor)}`
          : `몰질량(${formulaFor}): ${molarMassExplanation(formulaFor)}`,
      );
      sources.push('ciaaw');
      if (analyte.formulaNote) assumptions.push(analyte.formulaNote);
    }
    if (needsCharge) {
      if (!analyte.charge) {
        return fail(analyte.noChargeReason ?? `${analyte.nameKo}에는 고정된 이온 전하가 정의되어 있지 않아 당량(mEq) 변환 근거가 없습니다.`, sources);
      }
      charge = analyte.charge;
      steps.push(`이온 전하 |z| = ${charge} (1 mol = ${charge} eq)`);
      if (analyte.formulaNote && !assumptions.includes(analyte.formulaNote)) assumptions.push(analyte.formulaNote);
    }
    r = ucumConvert(from, value, to, mw, charge);
    method = [
      'UCUM 변환',
      mw ? '+ 분자량(IUPAC 원자량으로 계산)' : '',
      charge ? '+ 이온 전하' : '',
    ].filter(Boolean).join(' ');
  }

  if (r.status !== 'succeeded' || r.toVal === null) {
    if (r.code === 'incommensurable') {
      return fail(
        `${displayUnit(from, analyte)}(${kindFrom}) → ${displayUnit(to, analyte)}(${kindTo}): 차원이 달라 변환할 수 없습니다. 측정 원리가 다른 양 사이에는 근거 있는 환산 계수가 없습니다.`,
        ['ucum'],
      );
    }
    return fail(`변환 실패: ${r.msg.join(' ')}`);
  }

  const one = ucumConvert(from, 1, to, mw, charge).toVal as number;
  return {
    ok: true,
    value: r.toVal,
    rationale: {
      method,
      factor: one,
      formula: `${displayUnit(to, analyte)} = ${displayUnit(from, analyte)} × ${fmtFactor(one)}`,
      steps,
      assumptions,
      sources: [...new Set(sources)],
    },
  };
}

function convertBun(value: number, from: string, to: string, analyte: Analyte): ConvertResult {
  const sources = ['ucum', 'ciaaw'];
  if (from === 'mg/dL' && to === 'mmol/L') {
    // BUN(mg/dL)은 요소 속 질소의 질량. 요소 1 mol = 질소 2 mol → 질소 질량/mol 요소 = 2×N
    const mwN2 = 2 * ATOMIC_WEIGHTS.N;
    const r = ucumConvert(from, value, to, mwN2);
    const one = ucumConvert(from, 1, to, mwN2).toVal as number;
    return {
      ok: true,
      value: r.toVal as number,
      rationale: {
        method: 'UCUM 변환 + 요소 1분자당 질소 2원자 (특수 변환: BUN→요소)',
        factor: one,
        formula: `요소(mmol/L) = BUN(mg/dL) × 10 / (2 × ${ATOMIC_WEIGHTS.N}) = BUN × ${fmtFactor(one)}`,
        steps: [`요소 1 mol당 질소 질량 = 2 × ${ATOMIC_WEIGHTS.N} = ${round(mwN2, 3)} g/mol`],
        assumptions: ['BUN은 요소 분자 중 질소(N) 질량만을 mg/dL로 표기한 값이라고 가정 (미국식 보고).'],
        sources,
      },
    };
  }
  if (from === 'mmol/L' && to === 'mg/dL') {
    const back = convertBun(1, 'mg/dL', 'mmol/L', analyte);
    if (!back.ok) return back;
    const f = 1 / (back.rationale.factor as number);
    return {
      ok: true,
      value: value * f,
      rationale: {
        ...back.rationale,
        method: 'UCUM 변환 + 요소 1분자당 질소 2원자 (특수 변환: 요소→BUN)',
        factor: f,
        formula: `BUN(mg/dL) = 요소(mmol/L) × (2 × ${ATOMIC_WEIGHTS.N}) / 10 = 요소 × ${fmtFactor(f)}`,
      },
    };
  }
  if (analyte.units.includes(from) && analyte.units.includes(to)) return identity(value, from, analyte, sources);
  return fail(`BUN은 mg/dL(질소 기준) ↔ mmol/L(요소) 변환만 정의되어 있습니다. 요소 질량(mg/dL)이 필요하면 '요소(Urea)'를 선택하세요.`, sources);
}

function identity(value: number, unit: string, analyte: Analyte, sources: string[]): ConvertResult {
  return {
    ok: true,
    value,
    rationale: {
      method: '동일 단위',
      factor: 1,
      formula: `${displayUnit(unit, analyte)} = ${displayUnit(unit, analyte)} × 1`,
      steps: [],
      assumptions: [],
      sources,
    },
  };
}

export function fmtFactor(x: number): string {
  if (x === 0) return '0';
  const abs = Math.abs(x);
  if (abs >= 1e-3 && abs < 1e6) return String(Number(x.toPrecision(6)));
  return x.toExponential(5);
}

export function fmtValue(x: number): string {
  return String(Number(x.toPrecision(4)));
}

export { molarMass };
