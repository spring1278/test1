/**
 * IUPAC(CIAAW) 표준 원자량 – 축약(abridged) 값.
 * TODO(verify): 개발 환경에서 ciaaw.org 에 접근할 수 없어 원문 표와 직접 대조하지 못함.
 */
export const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  Na: 22.99,
  Mg: 24.305,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  K: 39.098,
  Ca: 40.078,
  Fe: 55.845,
};

/** "C6H12O6" 같은 단순 분자식을 원소별 개수로 분해 (괄호 미지원). */
export function parseFormula(formula: string): Record<string, number> {
  const counts: Record<string, number> = {};
  const re = /([A-Z][a-z]?)(\d*)/g;
  let consumed = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(formula)) !== null) {
    if (m[0] === '') break;
    const [, el, n] = m;
    if (!(el in ATOMIC_WEIGHTS)) throw new Error(`원자량 표에 없는 원소: ${el}`);
    counts[el] = (counts[el] ?? 0) + (n ? Number(n) : 1);
    consumed += m[0].length;
  }
  if (consumed !== formula.length) throw new Error(`분자식을 해석할 수 없음: ${formula}`);
  return counts;
}

/** 분자식으로부터 몰질량(g/mol)을 계산. */
export function molarMass(formula: string): number {
  const counts = parseFormula(formula);
  return Object.entries(counts).reduce((sum, [el, n]) => sum + ATOMIC_WEIGHTS[el] * n, 0);
}

/** 근거 표시용: "C6×12.011 + H12×1.008 + ..." */
export function molarMassExplanation(formula: string): string {
  const counts = parseFormula(formula);
  const terms = Object.entries(counts).map(([el, n]) => `${el}${n > 1 ? n : ''}: ${n}×${ATOMIC_WEIGHTS[el]}`);
  return `${terms.join(' + ')} = ${round(molarMass(formula), 4)} g/mol`;
}

export function round(x: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(x * f) / f;
}
