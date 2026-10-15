import { useState } from 'react';
import { ConvertTab } from './components/ConvertTab';
import { ReferenceTab } from './components/ReferenceTab';

type Tab = 'convert' | 'reference';

export default function App() {
  const [tab, setTab] = useState<Tab>('convert');
  return (
    <main>
      <header>
        <h1>임상검사 단위 변환 · 참고구간</h1>
        <p className="muted">
          변환 계수는 표에서 복사하지 않고 UCUM과 IUPAC 원자량으로 계산합니다. 교육·참고용이며 진단에 단독으로 사용하지 마세요.
        </p>
      </header>
      <nav className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'convert'} className={tab === 'convert' ? 'active' : ''} onClick={() => setTab('convert')}>
          변환
        </button>
        <button role="tab" aria-selected={tab === 'reference'} className={tab === 'reference' ? 'active' : ''} onClick={() => setTab('reference')}>
          참고구간
        </button>
      </nav>
      {tab === 'convert' ? <ConvertTab /> : <ReferenceTab />}
      <footer className="muted small">
        참고구간: RCPA Harmonised Reference Intervals (Table 6) · 소아: CALIPER 안내 · 단위: UCUM (@lhncbc/ucum-lhc)
      </footer>
    </main>
  );
}
