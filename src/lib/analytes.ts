export type SpecialKind = 'hba1c' | 'bun' | 'creatinineRatio';

export interface Analyte {
  id: string;
  nameEn: string;
  nameKo: string;
  synonyms: string[];
  /** 몰 변환에 쓰는 분자식 (IUPAC 원자량으로 몰질량을 계산). 없으면 몰 변환 거부. */
  formula?: string;
  /** formula 가 무엇을 나타내는지 (가정) */
  formulaNote?: string;
  /** 이온 전하 (mEq 변환용). 없으면 당량 변환 거부. */
  charge?: number;
  /** 이 분석물에서 통상 쓰이는 UCUM 단위 코드 (드롭다운 우선 표시) */
  units: string[];
  special?: SpecialKind;
  /** 변환을 거부할 때 보여줄 분석물 고유 사유 (예: 인산의 당량) */
  noChargeReason?: string;
  noFormulaReason?: string;
  extraSources?: string[];
}

export const ANALYTES: Analyte[] = [
  {
    id: 'glucose', nameEn: 'Glucose', nameKo: '포도당(혈당)', synonyms: ['GLU', 'blood sugar', 'FBS', '공복혈당', '혈당'],
    formula: 'C6H12O6', units: ['mg/dL', 'mmol/L', 'g/L'],
  },
  {
    id: 'cholesterol', nameEn: 'Cholesterol (total/HDL/LDL)', nameKo: '콜레스테롤', synonyms: ['TC', 'HDL', 'LDL', 'HDL-C', 'LDL-C', '총콜레스테롤'],
    formula: 'C27H46O', units: ['mg/dL', 'mmol/L'],
  },
  {
    id: 'triglycerides', nameEn: 'Triglycerides', nameKo: '중성지방', synonyms: ['TG', 'triglyceride', '트리글리세리드'],
    formula: 'C57H104O6',
    formulaNote: '중성지방은 단일 물질이 아니므로 관례적으로 트리올레인(triolein, C57H104O6)을 대표 분자로 가정해 몰질량을 계산한다.',
    units: ['mg/dL', 'mmol/L'],
  },
  {
    id: 'creatinine', nameEn: 'Creatinine', nameKo: '크레아티닌', synonyms: ['Cr', 'SCr', 'Creat'],
    formula: 'C4H7N3O', units: ['mg/dL', 'umol/L', 'mmol/L'],
  },
  {
    id: 'urea', nameEn: 'Urea', nameKo: '요소', synonyms: ['urea'],
    formula: 'CH4N2O', units: ['mmol/L', 'mg/dL'],
  },
  {
    id: 'bun', nameEn: 'Blood urea nitrogen (BUN)', nameKo: '혈중요소질소', synonyms: ['BUN', 'urea nitrogen', 'SUN', '요소질소'],
    special: 'bun', units: ['mg/dL', 'mmol/L'],
  },
  {
    id: 'uricAcid', nameEn: 'Uric acid (urate)', nameKo: '요산', synonyms: ['UA', 'urate'],
    formula: 'C5H4N4O3', units: ['mg/dL', 'umol/L', 'mmol/L'],
  },
  {
    id: 'bilirubin', nameEn: 'Bilirubin (total)', nameKo: '총빌리루빈', synonyms: ['T-bil', 'TBIL', '빌리루빈'],
    formula: 'C33H36N4O6', units: ['mg/dL', 'umol/L'],
  },
  {
    id: 'sodium', nameEn: 'Sodium', nameKo: '나트륨', synonyms: ['Na', 'Na+', '소디움'],
    formula: 'Na', charge: 1, units: ['mmol/L', 'meq/L', 'mg/dL'],
  },
  {
    id: 'potassium', nameEn: 'Potassium', nameKo: '칼륨', synonyms: ['K', 'K+', '포타슘'],
    formula: 'K', charge: 1, units: ['mmol/L', 'meq/L', 'mg/dL'],
  },
  {
    id: 'chloride', nameEn: 'Chloride', nameKo: '염소', synonyms: ['Cl', 'Cl-', '클로라이드'],
    formula: 'Cl', charge: 1, formulaNote: '염화 이온 Cl⁻ (전하 크기 1)', units: ['mmol/L', 'meq/L', 'mg/dL'],
  },
  {
    id: 'bicarbonate', nameEn: 'Bicarbonate (total CO2)', nameKo: '중탄산염', synonyms: ['HCO3', 'HCO3-', 'tCO2', 'CO2'],
    formula: 'HCO3', charge: 1, formulaNote: '중탄산 이온 HCO₃⁻ (전하 크기 1)', units: ['mmol/L', 'meq/L'],
  },
  {
    id: 'calcium', nameEn: 'Calcium (total)', nameKo: '칼슘', synonyms: ['Ca', 'Ca2+', '총칼슘'],
    formula: 'Ca', charge: 2, units: ['mg/dL', 'mmol/L', 'meq/L'],
  },
  {
    id: 'magnesium', nameEn: 'Magnesium', nameKo: '마그네슘', synonyms: ['Mg', 'Mg2+'],
    formula: 'Mg', charge: 2, units: ['mg/dL', 'mmol/L', 'meq/L'],
  },
  {
    id: 'phosphate', nameEn: 'Phosphate (inorganic, as P)', nameKo: '인(무기인산)', synonyms: ['P', 'PO4', 'phosphorus', '인', '인산'],
    formula: 'P', formulaNote: '무기인은 인(P) 원자 질량으로 보고한다고 가정.',
    noChargeReason: '혈중 무기인산은 pH에 따라 HPO₄²⁻/H₂PO₄⁻ 비율이 변해 고정된 전하가 없으므로 mEq/L 변환에 근거가 없습니다.',
    units: ['mg/dL', 'mmol/L'],
  },
  {
    id: 'iron', nameEn: 'Iron', nameKo: '철', synonyms: ['Fe', '혈청철'],
    formula: 'Fe', units: ['ug/dL', 'umol/L'],
  },
  {
    id: 'ammonia', nameEn: 'Ammonia', nameKo: '암모니아', synonyms: ['NH3', 'NH4'],
    formula: 'NH3', formulaNote: 'NH₃ 질량 기준으로 보고한다고 가정 (검사실에 따라 NH₄⁺ 또는 N 질량 기준일 수 있음 — TODO(verify)).',
    units: ['ug/dL', 'umol/L'],
  },
  {
    id: 'lactate', nameEn: 'Lactate', nameKo: '젖산', synonyms: ['lactic acid', '락테이트'],
    formula: 'C3H6O3', formulaNote: '젖산(lactic acid, C₃H₆O₃) 분자 질량 기준으로 가정.',
    units: ['mg/dL', 'mmol/L'],
  },
  {
    id: 'albumin', nameEn: 'Albumin', nameKo: '알부민', synonyms: ['Alb'],
    noFormulaReason: '알부민은 단백질로, IUPAC 원자량으로 계산할 단일 분자식이 앱에 정의되어 있지 않아 몰 단위 변환을 하지 않습니다.',
    units: ['g/dL', 'g/L'],
  },
  {
    id: 'totalProtein', nameEn: 'Total protein', nameKo: '총단백', synonyms: ['TP', 'protein'],
    noFormulaReason: '총단백은 여러 단백질의 혼합물이라 분자량이 정의되지 않으므로 몰 단위 변환은 근거가 없습니다.',
    units: ['g/dL', 'g/L'],
  },
  ...(['ALT', 'AST', 'ALP', 'GGT', 'LD', 'Lipase', 'CK'] as const).map((code) => ({
    id: code.toLowerCase(),
    nameEn: {
      ALT: 'Alanine aminotransferase (ALT)', AST: 'Aspartate aminotransferase (AST)', ALP: 'Alkaline phosphatase (ALP)',
      GGT: 'Gamma-glutamyltransferase (GGT)', LD: 'Lactate dehydrogenase (LD/LDH)', Lipase: 'Lipase', CK: 'Creatine kinase (CK)',
    }[code],
    nameKo: { ALT: '알라닌아미노전이효소', AST: '아스파르테이트아미노전이효소', ALP: '알칼리인산분해효소', GGT: '감마글루타밀전이효소', LD: '젖산탈수소효소', Lipase: '리파아제', CK: '크레아틴키나아제' }[code],
    synonyms: {
      ALT: ['SGPT', 'GPT'], AST: ['SGOT', 'GOT'], ALP: ['alk phos'], GGT: ['γ-GT', 'GGTP'], LD: ['LDH'], Lipase: ['LPS'], CK: ['CPK'],
    }[code],
    noFormulaReason: '효소는 촉매활성(U/L)으로 측정되며, 질량·몰 농도와는 차원이 달라 변환 근거가 없습니다.',
    units: ['U/L', 'ukat/L', 'nkat/L'],
  })),
  {
    id: 'hba1c', nameEn: 'Hemoglobin A1c (HbA1c)', nameKo: '당화혈색소', synonyms: ['A1c', 'HbA1c', 'glycated hemoglobin', 'NGSP', 'IFCC'],
    special: 'hba1c', units: ['%', 'mmol/mol'], extraSources: ['ngsp'],
  },
  {
    id: 'uacr', nameEn: 'Urine albumin-to-creatinine ratio (uACR)', nameKo: '소변 알부민/크레아티닌 비', synonyms: ['ACR', 'UACR', 'microalbumin', '미세알부민'],
    special: 'creatinineRatio', units: ['mg/g', 'mg/mmol', 'g/g'], extraSources: ['kdigo2024'],
  },
  {
    id: 'upcr', nameEn: 'Urine protein-to-creatinine ratio (uPCR)', nameKo: '소변 단백/크레아티닌 비', synonyms: ['PCR', 'UPCR', '단백뇨'],
    special: 'creatinineRatio', units: ['mg/g', 'mg/mmol', 'g/g'], extraSources: ['kdigo2024'],
  },
];

/** 드롭다운에 공통으로 노출하는 단위 (분석물과 맞지 않으면 변환이 거부되는 것을 보여주기 위함) */
export const COMMON_UNITS = [
  'mg/dL', 'g/dL', 'g/L', 'ug/dL', 'mmol/L', 'umol/L', 'meq/L', 'U/L', 'ukat/L', 'nkat/L', '%', 'mmol/mol', 'mg/g', 'mg/mmol', 'g/g',
];

const DISPLAY: Record<string, string> = {
  'umol/L': 'µmol/L', 'ug/dL': 'µg/dL', 'meq/L': 'mEq/L', 'ukat/L': 'µkat/L',
};
export function displayUnit(code: string, analyte?: Analyte): string {
  if (analyte?.id === 'hba1c') {
    if (code === '%') return '% (NGSP)';
    if (code === 'mmol/mol') return 'mmol/mol (IFCC)';
  }
  if (analyte?.id === 'bun') {
    if (code === 'mg/dL') return 'mg/dL (BUN, 질소 기준)';
    if (code === 'mmol/L') return 'mmol/L (요소)';
  }
  return DISPLAY[code] ?? code;
}

export function getAnalyte(id: string): Analyte | undefined {
  return ANALYTES.find((a) => a.id === id);
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[\s\-_()/+]/g, '');
}

/** 영문·한글·동의어 검색 */
export function searchAnalytes(query: string): Analyte[] {
  const q = norm(query);
  if (!q) return ANALYTES;
  return ANALYTES.filter((a) =>
    [a.nameEn, a.nameKo, a.id, ...a.synonyms].some((s) => norm(s).includes(q)),
  );
}
