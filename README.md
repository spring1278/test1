# 임상검사 단위 변환 · 참고구간 (test1)

**Pages URL:** https://spring1278.github.io/test1/

React + TypeScript + Vite 정적 사이트. GitHub Actions(`.github/workflows/deploy.yml`)가 `main` 푸시마다 테스트 → 빌드 → GitHub Pages 배포를 수행합니다.

## 기능
- **변환 탭**: 분석물 검색(영문·한글·동의어) → 값/원본 단위/대상 단위 → 결과 + 계산 근거(방법, 계수, 수식, 가정, 출처 링크). 양방향 스왑, 결과 복사. 근거 없는 변환(예: mg/dL → U/L)은 사유와 함께 거부.
- **참고구간 탭**: 분석물·나이·성별·검체 → 공표된 구간만 표시(외삽 없음). 결과 값 입력 시 low/normal/high 판정(다른 단위로 입력하면 변환 후 판정).

## 데이터 출처와 역할
| 역할 | 출처 | 구현 |
|---|---|---|
| 단위 변환 엔진 | UCUM / `@lhncbc/ucum-lhc` 8.0.0 | 차원 검사·스케일 변환. 질량↔몰은 IUPAC 원자량으로 계산한 몰질량, mEq는 이온 전하를 UCUM 옵션으로 전달 (`src/lib/convert.ts`, `src/lib/chem.ts`) |
| 특수 변환 | NGSP master equation, KDIGO 2024, BUN↔요소, 중성지방(트리올레인 가정) | `src/lib/convert.ts` |
| 참고구간 | RCPA Harmonised Reference Intervals Table 6 (성인), 소아는 CALIPER 안내 | `src/data/referenceIntervals.ts` |
| 교차 검증(테스트 전용) | Labcorp SI 변환표, NBME Lab Reference Values, CMEinfo | `tests/crosscheck.test.ts` (앱에 미포함) |

변환 계수는 표에서 복사하지 않고 계산합니다. 예: 포도당 C6H12O6 = 180.156 g/mol → 1 mg/dL = 10/180.156 = 0.055507 mmol/L.

## 확보하지 못한 데이터 / TODO(verify)
개발 환경에서 rcpa.edu.au, ngsp.org, kdigo.org, ciaaw.org, labcorp.com, caliperproject.ca 등에 직접 접속할 수 없어(네트워크 정책 차단) 웹 검색 발췌로 확인된 값만 사용했습니다.
- **RCPA 참고구간 미수록**: ALT, AST, ALP, GGT, Lipase, CK, 총단백, 알부민, 빌리루빈, 요산, 요소, 포도당, 지질, HbA1c — 원문 표에 접근하지 못해 수치를 확인할 수 없었음(억지로 채우지 않음).
- **TODO(verify)**: Na·Cl·Ca·PO4·Mg 성인 구간의 나이 하한(18 y)과 검체 표기, 칼륨 각주, 크레아티닌 남/녀 행 배정.
- **TODO(verify)**: IUPAC 원자량 축약값을 CIAAW 원문과 직접 대조하지 못함.
- **TODO(verify)**: KDIGO 2024 원문의 mg/g ↔ mg/mmol 반올림 대응값.
- **TODO(verify)**: CMEinfo 변환표 PDF는 찾지 못했고, Labcorp 표에서는 콜레스테롤(0.0259)·칼슘(0.25) 행만 확인. 나머지 관용 계수 테스트는 TODO(verify)로 표시.
- **CALIPER**: 수치는 앱에 넣지 않고 안내 링크만 제공.

## 개발
```bash
npm ci
npm test        # Vitest
npm run dev
npm run build
```

> 교육·참고용이며 진단에 단독으로 사용하지 마십시오.
