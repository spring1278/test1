import { classify, lookupIntervals } from '../src/lib/interpret';
import { searchAnalytes } from '../src/lib/analytes';

describe('참고구간 조회', () => {
  it('성인 칼륨 (혈청) 3.5–5.2', () => {
    const r = lookupIntervals({ analyteId: 'potassium', age: 40, sex: 'female', specimen: '혈청' });
    expect(r).toHaveLength(1);
    expect([r[0].lower, r[0].upper]).toEqual([3.5, 5.2]);
  });
  it('크레아티닌은 성별로 구분', () => {
    expect(lookupIntervals({ analyteId: 'creatinine', age: 30, sex: 'male' })[0].upper).toBe(110);
    expect(lookupIntervals({ analyteId: 'creatinine', age: 30, sex: 'female' })[0].upper).toBe(90);
  });
  it('공표되지 않은 나이 구간은 외삽하지 않음', () => {
    expect(lookupIntervals({ analyteId: 'creatinine', age: 65, sex: 'male' })).toHaveLength(0);
    expect(lookupIntervals({ analyteId: 'sodium', age: 5, sex: 'male' })).toHaveLength(0);
  });
  it('데이터 없는 분석물은 빈 결과', () => {
    expect(lookupIntervals({ analyteId: 'alt', age: 40, sex: 'male' })).toHaveLength(0);
  });
  it('low/normal/high 판정 (경계 포함 normal)', () => {
    const ri = { lower: 3.5, upper: 5.2 };
    expect(classify(3.4, ri)).toBe('low');
    expect(classify(3.5, ri)).toBe('normal');
    expect(classify(5.2, ri)).toBe('normal');
    expect(classify(5.3, ri)).toBe('high');
  });
});

describe('분석물 검색', () => {
  it.each([
    ['혈당', 'glucose'], ['Cr', 'creatinine'], ['bun', 'bun'], ['a1c', 'hba1c'], ['칼륨', 'potassium'], ['SGPT', 'alt'], ['미세알부민', 'uacr'],
  ])('%s → %s', (q, id) => {
    expect(searchAnalytes(q).map((a) => a.id)).toContain(id);
  });
});
