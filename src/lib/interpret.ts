import { REFERENCE_INTERVALS, type ReferenceInterval, type Sex } from '../data/referenceIntervals';

export interface LookupQuery {
  analyteId: string;
  age: number;
  sex: Exclude<Sex, 'any'>;
  specimen?: string;
}

/**
 * 공표된 구간 중 나이·성별·검체가 정확히 포함되는 것만 반환한다.
 * 해당 나이 구간이 없으면 빈 배열 (외삽하지 않음).
 */
export function lookupIntervals(q: LookupQuery): ReferenceInterval[] {
  return REFERENCE_INTERVALS.filter(
    (r) =>
      r.analyteId === q.analyteId &&
      (r.sex === 'any' || r.sex === q.sex) &&
      q.age >= r.ageMin &&
      q.age < r.ageMax &&
      (!q.specimen || r.specimen === q.specimen),
  );
}

export function specimensFor(analyteId: string): string[] {
  return [...new Set(REFERENCE_INTERVALS.filter((r) => r.analyteId === analyteId).map((r) => r.specimen))];
}

export function analytesWithIntervals(): string[] {
  return [...new Set(REFERENCE_INTERVALS.map((r) => r.analyteId))];
}

export type Flag = 'low' | 'normal' | 'high';

/** 참고구간 경계값은 정상(normal)으로 포함 */
export function classify(value: number, ri: Pick<ReferenceInterval, 'lower' | 'upper'>): Flag {
  if (value < ri.lower) return 'low';
  if (value > ri.upper) return 'high';
  return 'normal';
}

export function ageLabel(r: ReferenceInterval): string {
  return `${r.ageMin} y 이상 – ${r.ageMax} y 미만`;
}
