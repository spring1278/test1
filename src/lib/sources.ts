/**
 * 앱에서 근거로 인용하는 출처 목록.
 * verified=false 인 항목은 개발 환경에서 원문 페이지에 직접 접근하지 못해
 * 내용 대조를 끝내지 못한 것(TODO(verify))이다.
 */
export interface Source {
  id: string;
  title: string;
  url: string;
  note?: string;
  verified: boolean;
}

export const SOURCES: Record<string, Source> = {
  ucum: {
    id: 'ucum',
    title: 'UCUM (Unified Code for Units of Measure) · @lhncbc/ucum-lhc',
    url: 'https://ucum.org/',
    note: '차원(dimension) 검사와 접두어 스케일 변환은 라이브러리 @lhncbc/ucum-lhc 8.0.0 이 수행 (https://github.com/lhncbc/ucum-lhc).',
    verified: true,
  },
  ciaaw: {
    id: 'ciaaw',
    title: 'IUPAC CIAAW 표준 원자량 (축약값)',
    url: 'https://www.ciaaw.org/atomic-weights.htm',
    note: 'TODO(verify): 개발 환경에서 ciaaw.org 접근이 차단되어 원자량 값을 원문과 직접 대조하지 못함.',
    verified: false,
  },
  ngsp: {
    id: 'ngsp',
    title: 'NGSP – IFCC Standardization of HbA1c (master equation)',
    url: 'https://ngsp.org/ifcc.asp',
    note: 'NGSP(%) = 0.09148 × IFCC(mmol/mol) + 2.152. 수식은 검색 결과(ngsp.org/ifccngsp.asp 발췌)로 확인, 원문 페이지 직접 열람은 TODO(verify).',
    verified: true,
  },
  kdigo2024: {
    id: 'kdigo2024',
    title: 'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD',
    url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/',
    note: 'KDIGO는 ACR 30 mg/g ≈ 3 mg/mmol 처럼 반올림한 대응값을 제시한다. 앱은 크레아티닌 분자량으로 정확한 계수를 계산한다. TODO(verify): kdigo.org 원문 직접 대조 못함.',
    verified: false,
  },
  rcpaTable6: {
    id: 'rcpaTable6',
    title: 'RCPA Manual – Table 6: Harmonised reference intervals for chemical pathology',
    url: 'https://www.rcpa.edu.au/Manuals/RCPA-Manual/General-Information/IG/Table-6-Harmonised-reference-intervals-for-chem',
    note: '개발 환경에서 rcpa.edu.au 직접 접근 불가. 수치는 웹 검색 발췌(RCPA Table 6 페이지, APUTS 문서, AACB 2014/2017 보고서)로 확인한 것만 수록.',
    verified: true,
  },
  rcpaAputs: {
    id: 'rcpaAputs',
    title: 'RCPA APUTS – Harmonised Reference Intervals, Chemical Pathology',
    url: 'https://www.rcpa.edu.au/getattachment/be79a12d-e4b2-4faf-be67-2186b14eea2b/APUTS-Harmonised-Reference-Intervals-Chemical-Path.aspx',
    verified: true,
  },
  caliper: {
    id: 'caliper',
    title: 'CALIPER – Canadian Laboratory Initiative on Paediatric Reference Intervals',
    url: 'https://caliperproject.ca/',
    note: '소아 참고구간은 CALIPER 데이터베이스를 직접 확인하도록 안내만 한다(앱에 수치 미수록).',
    verified: true,
  },
};
