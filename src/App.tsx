import { useState } from 'react';
import { ConvertTab } from './components/ConvertTab';
import { ReferenceTab } from './components/ReferenceTab';

type Tab = 'convert' | 'reference';

export default function App() {
  const [tab, setTab] = useState<Tab>('convert');
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="logo" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" /><path d="M7.5 15h9" /></svg>
            </span>
            <div>
              <h1>임상검사 단위 변환 · 참고구간</h1>
              <p>UCUM + IUPAC 원자량으로 계수를 계산합니다 · 표에서 복사하지 않음</p>
            </div>
          </div>
          <nav className="segmented" role="tablist" aria-label="기능 선택">
            <button role="tab" aria-selected={tab === 'convert'} className={tab === 'convert' ? 'active' : ''} onClick={() => setTab('convert')}>
              단위 변환
            </button>
            <button role="tab" aria-selected={tab === 'reference'} className={tab === 'reference' ? 'active' : ''} onClick={() => setTab('reference')}>
              참고구간
            </button>
          </nav>
        </div>
      </header>

      <main>{tab === 'convert' ? <ConvertTab /> : <ReferenceTab />}</main>

      <footer>
        <p>
          참고구간: RCPA Harmonised Reference Intervals (Table 6) · 소아: CALIPER 안내 · 단위: UCUM (@lhncbc/ucum-lhc)
        </p>
        <p>교육·참고용입니다. 진단에 단독으로 사용하지 마십시오.</p>
      </footer>
    </>
  );
}
