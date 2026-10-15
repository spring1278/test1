/**
 * RCPA Harmonised Reference Intervals (Table 6) – 성인 화학병리.
 *
 * 개발 환경에서 rcpa.edu.au 원문에 직접 접근할 수 없었기 때문에,
 * 웹 검색으로 RCPA Table 6 페이지 / RCPA APUTS 문서 / AACB 보고서 발췌에서
 * 수치가 확인된 항목만 수록했다. 확인되지 않은 분석물은 넣지 않았다(외삽·추정 금지).
 *
 * verify 필드: 원문 표에서 직접 대조해야 할 세부 사항(TODO(verify)).
 */
export type Sex = 'any' | 'male' | 'female';

export interface ReferenceInterval {
  analyteId: string;
  sex: Sex;
  /** 포함 하한 나이 (세) */
  ageMin: number;
  /** 미포함 상한 나이 (세) — "<ageMax" */
  ageMax: number;
  specimen: string;
  lower: number;
  upper: number;
  unit: string;
  source: string;
  note?: string;
  verify?: string;
}

const T6 = 'rcpaTable6';
const SERUM_PLASMA = '혈청/혈장';

export const REFERENCE_INTERVALS: ReferenceInterval[] = [
  {
    analyteId: 'sodium', sex: 'any', ageMin: 18, ageMax: 120, specimen: SERUM_PLASMA, lower: 135, upper: 145, unit: 'mmol/L', source: T6,
    verify: 'TODO(verify): 성인 구간의 정확한 나이 하한(18세)과 검체 표기를 원문 표에서 확인 필요.',
  },
  {
    analyteId: 'potassium', sex: 'any', ageMin: 18, ageMax: 120, specimen: '혈청', lower: 3.5, upper: 5.2, unit: 'mmol/L', source: 'rcpaAputs',
    note: 'APUTS 문서: 18 y 이상 <120 y. 혈장 칼륨 구간은 별도이며 확인하지 못해 수록하지 않음.',
    verify: 'TODO(verify): 2017 업데이트 보고서의 칼륨 각주 내용 확인 필요.',
  },
  {
    analyteId: 'chloride', sex: 'any', ageMin: 18, ageMax: 120, specimen: SERUM_PLASMA, lower: 95, upper: 110, unit: 'mmol/L', source: T6,
    verify: 'TODO(verify): 성인 구간의 정확한 나이 하한을 원문에서 확인 필요.',
  },
  {
    analyteId: 'bicarbonate', sex: 'any', ageMin: 18, ageMax: 120, specimen: SERUM_PLASMA, lower: 22, upper: 32, unit: 'mmol/L', source: T6,
  },
  {
    analyteId: 'calcium', sex: 'any', ageMin: 18, ageMax: 120, specimen: SERUM_PLASMA, lower: 2.1, upper: 2.6, unit: 'mmol/L', source: T6,
    verify: 'TODO(verify): 성인 구간의 정확한 나이 하한을 원문에서 확인 필요.',
  },
  {
    analyteId: 'phosphate', sex: 'any', ageMin: 18, ageMax: 120, specimen: SERUM_PLASMA, lower: 0.75, upper: 1.5, unit: 'mmol/L', source: T6,
    verify: 'TODO(verify): 성인 구간의 정확한 나이 하한을 원문에서 확인 필요.',
  },
  {
    analyteId: 'magnesium', sex: 'any', ageMin: 18, ageMax: 120, specimen: SERUM_PLASMA, lower: 0.7, upper: 1.1, unit: 'mmol/L', source: T6,
    verify: 'TODO(verify): 성인 구간의 정확한 나이 하한을 원문에서 확인 필요.',
  },
  {
    analyteId: 'ld', sex: 'any', ageMin: 18, ageMax: 120, specimen: SERUM_PLASMA, lower: 120, upper: 250, unit: 'U/L', source: T6,
  },
  {
    analyteId: 'creatinine', sex: 'male', ageMin: 19, ageMax: 60, specimen: SERUM_PLASMA, lower: 60, upper: 110, unit: 'umol/L', source: T6,
    note: 'RCPA: 검사실은 60세 이후에도 이 구간을 유지할 수 있음(공표 구간은 <60 y까지).',
    verify: 'TODO(verify): 검색 발췌의 표 배치가 섞여 있어 남/녀 행 배정을 원문 PDF로 확인 필요.',
  },
  {
    analyteId: 'creatinine', sex: 'female', ageMin: 19, ageMax: 60, specimen: SERUM_PLASMA, lower: 45, upper: 90, unit: 'umol/L', source: T6,
    note: 'RCPA: 검사실은 60세 이후에도 이 구간을 유지할 수 있음(공표 구간은 <60 y까지).',
    verify: 'TODO(verify): 검색 발췌의 표 배치가 섞여 있어 남/녀 행 배정을 원문 PDF로 확인 필요.',
  },
];

/** 앱에 참고구간을 넣지 못한 분석물과 그 이유 (보고용) */
export const MISSING_INTERVALS: Record<string, string> = {
  alt: 'RCPA Table 6 원문 접근 불가, 검색 발췌에서 하모나이즈 구간 수치를 확인하지 못함.',
  ast: 'RCPA Table 6 원문 접근 불가, 검색 발췌에서 수치를 확인하지 못함.',
  alp: 'RCPA Table 6 원문 접근 불가. 30–110 U/L은 Monash 병리 목록(2차 자료)에서만 보여 미수록.',
  ggt: 'RCPA Table 6 원문 접근 불가, 검색 발췌에서 수치를 확인하지 못함.',
  lipase: 'RCPA 문서상 일부 분석기(Siemens Dimension, Ortho Vitros) 제외 조건이 있고 수치를 확인하지 못함.',
  totalProtein: 'RCPA Table 6 원문 접근 불가, 검색 발췌에서 수치를 확인하지 못함.',
  albumin: 'RCPA Table 6 원문 접근 불가, 검색 발췌에서 수치를 확인하지 못함.',
  bilirubin: 'RCPA Table 6 원문 접근 불가, 검색 발췌에서 수치를 확인하지 못함.',
  glucose: 'RCPA Table 6(하모나이즈 참고구간)에 포함 여부를 확인하지 못함. 혈당은 보통 임상 결정치(진단 기준)로 판정.',
  cholesterol: '지질은 참고구간이 아닌 임상 목표치/결정치로 판정하는 것이 일반적이며 Table 6 수록을 확인하지 못함.',
  triglycerides: '지질은 참고구간이 아닌 임상 목표치/결정치로 판정하는 것이 일반적이며 Table 6 수록을 확인하지 못함.',
  hba1c: '진단 결정치 기반 항목으로 RCPA Table 6 참고구간을 확인하지 못함.',
  uricAcid: 'RCPA Table 6 원문 접근 불가, 검색 발췌에서 수치를 확인하지 못함.',
  urea: 'RCPA Table 6 원문 접근 불가, 검색 발췌에서 수치를 확인하지 못함.',
  ck: 'RCPA Table 6 원문 접근 불가, 검색 발췌에서 수치를 확인하지 못함.',
};
