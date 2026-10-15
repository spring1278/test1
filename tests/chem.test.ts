import { molarMass, parseFormula } from '../src/lib/chem';

describe('IUPAC 원자량 기반 몰질량 계산', () => {
  it.each([
    ['C6H12O6', 180.156],
    ['C4H7N3O', 113.12],
    ['C27H46O', 386.664],
    ['C57H104O6', 885.453],
    ['C5H4N4O3', 168.112],
    ['C33H36N4O6', 584.673],
    ['CH4N2O', 60.056],
    ['HCO3', 61.016],
  ])('%s → %f g/mol', (formula, expected) => {
    expect(molarMass(formula)).toBeCloseTo(expected, 3);
  });

  it('잘못된 분자식은 거부', () => {
    expect(() => parseFormula('Xx2')).toThrow();
    expect(() => parseFormula('C6H12O6!')).toThrow();
  });
});
