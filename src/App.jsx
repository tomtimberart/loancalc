import { useState, useMemo, useEffect } from 'react'
import { runCalc } from './utils/calc'
import ModeToggle from './components/ModeToggle'
import SliderControl from './components/SliderControl'
import ToggleSection from './components/ToggleSection'
import ResultsSection from './components/ResultsSection'
import CompareSection from './components/CompareSection'
import InflationNote from './components/InflationNote'

const INIT = {
  loan: 650000,
  mode: 'term',
  monthly: 5000,
  term: 120,
  rate: 8.5,
  usePrime: false,
  prime: 5.5,
  useCPI: false,
  cpi: 3.0,
  useInf: false,
  inf: 3.0,
  primeHint: '',
  useBalloon: false,
  balloon: 0,
}

function loadState(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return { ...INIT, ...JSON.parse(raw) }
  } catch {
    return null
  }
}

function saveState(key, state) {
  const { primeHint: _, ...toSave } = state
  localStorage.setItem(key, JSON.stringify(toSave))
}

const makeTog = (setter) => (key) => () =>
  setter((p) => {
    const next = { ...p, [key]: !p[key] }
    if (key === 'useCPI' && next.useCPI) next.useInf = false
    if (key === 'useInf' && next.useInf) next.useCPI = false
    return next
  })

const makeUpd = (setter) => (key) => (val) => setter((p) => ({ ...p, [key]: val }))

export default function App() {
  const [s, setS] = useState(() => loadState('loancalc_A') ?? INIT)
  const [sB, setSB] = useState(() => loadState('loancalc_B') ?? INIT)
  const [compareMode, setCompareMode] = useState(false)
  const [activeTab, setActiveTab] = useState('A')

  const updA = makeUpd(setS)
  const togA = makeTog(setS)
  const updB = makeUpd(setSB)
  const togB = makeTog(setSB)

  const activeS = compareMode && activeTab === 'B' ? sB : s
  const activeUpd = compareMode && activeTab === 'B' ? updB : updA
  const activeTog = compareMode && activeTab === 'B' ? togB : togA

  useEffect(() => { saveState('loancalc_A', s) }, [s])
  useEffect(() => { saveState('loancalc_B', sB) }, [sB])

  useEffect(() => {
    fetch('https://www.boi.org.il/wp-json/boi/v1/interest-rate')
      .then((r) => r.json())
      .then((json) => {
        const rate = parseFloat(
          json?.rate ?? json?.Rate ?? json?.[0]?.rate ?? json?.[0]?.Rate
        )
        if (!isNaN(rate)) {
          const prime = +(rate + 1.5).toFixed(1)
          setS((p) => ({
            ...p,
            prime,
            primeHint: `ריבית בנק ישראל ${rate.toFixed(1)}% + 1.5% — עדכני`,
          }))
        }
      })
      .catch(() =>
        setS((p) => ({ ...p, primeHint: 'ברירת מחדל 5.5% (לא ניתן להתחבר לבנק ישראל)' }))
      )
  }, [])

  const resultsA = useMemo(() => runCalc(s), [s])
  const resultsB = useMemo(() => runCalc(sB), [sB])

  const handleCompareToggle = () => {
    if (!compareMode) {
      setSB((prev) => ({ ...prev }))
    }
    setCompareMode((m) => !m)
    setActiveTab('A')
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Header */}
        <header className="text-center py-4">
          <div className="inline-block bg-blue-50 text-blue-600 text-xs font-black tracking-widest px-4 py-1.5 rounded-full mb-3 uppercase border border-blue-100">
            מחשבון הלוואות מתקדם
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
            חשב את <span className="text-blue-600">ההלוואה</span> שלך
          </h1>
          <button
            onClick={handleCompareToggle}
            className={`mt-3 text-xs font-bold px-4 py-2 rounded-full border transition-colors ${
              compareMode
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            ⚖️ {compareMode ? 'חזור למסלול יחיד' : 'השווה שני מסלולים'}
          </button>
        </header>

        {/* Tab switcher */}
        {compareMode && (
          <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            {['A', 'B'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-black transition-colors ${
                  activeTab === tab
                    ? tab === 'A'
                      ? 'bg-blue-600 text-white'
                      : 'bg-purple-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {tab === 'A' ? '📋 מסלול א׳' : '📋 מסלול ב׳'}
              </button>
            ))}
          </div>
        )}

        {/* Basic params card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
          <div className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
            ⚙️ פרמטרים בסיסיים
          </div>

          <ModeToggle mode={activeS.mode} onChange={activeUpd('mode')} />

          <SliderControl
            label="סכום ההלוואה"
            value={activeS.loan}
            onChange={activeUpd('loan')}
            min={10000}
            max={2000000}
            step={5000}
            prefix="₪"
            color="#2563eb"
          />

          {activeS.mode === 'monthly' ? (
            <SliderControl
              label="תשלום חודשי רצוי"
              value={activeS.monthly}
              onChange={activeUpd('monthly')}
              min={500}
              max={60000}
              step={500}
              prefix="₪"
              color="#16a34a"
            />
          ) : (
            <>
              <SliderControl
                label="תקופה"
                value={activeS.term}
                onChange={activeUpd('term')}
                min={6}
                max={360}
                step={1}
                suffix=" חודשים"
                color="#16a34a"
              />
              <ToggleSection
                title="🎈 הלוואת בלון"
                subtitle="יתרת קרן לתשלום חד-פעמי בסוף התקופה"
                checked={activeS.useBalloon}
                onToggle={activeTog('useBalloon')}
              >
                <SliderControl
                  label="יתרת בלון"
                  value={activeS.balloon}
                  onChange={activeUpd('balloon')}
                  min={0}
                  max={activeS.loan}
                  step={5000}
                  prefix="₪"
                  color="#8b5cf6"
                />
              </ToggleSection>
            </>
          )}
        </div>

        {/* Interest card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
          <div className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
            📊 הגדרות ריבית
          </div>

          <SliderControl
            label="ריבית שנתית בסיס"
            value={activeS.rate}
            onChange={activeUpd('rate')}
            min={0.1}
            max={15}
            step={0.1}
            decimals={1}
            suffix="%"
            color="#e63946"
          />

          <ToggleSection
            title="🏦 ריבית צמודה לפריים"
            subtitle="מוסיף ריבית פריים על ריבית הבסיס"
            checked={activeS.usePrime}
            onToggle={activeTog('usePrime')}
          >
            <SliderControl
              label="ריבית פריים נוכחית"
              value={activeS.prime}
              onChange={activeUpd('prime')}
              min={0}
              max={12}
              step={0.1}
              decimals={1}
              suffix="%"
              color="#7c3aed"
              hint={s.primeHint}
            />
          </ToggleSection>

          <ToggleSection
            title="📈 צמוד מדד המחירים לצרכן"
            subtitle="הקרן גדלה בהתאם למדד הצרכן"
            checked={activeS.useCPI}
            onToggle={activeTog('useCPI')}
          >
            <SliderControl
              label="אחוז עלייה שנתי צפוי"
              value={activeS.cpi}
              onChange={activeUpd('cpi')}
              min={0}
              max={10}
              step={0.1}
              decimals={1}
              suffix="%"
              color="#d97706"
              hint="* מחושב על הקרן בכל חודש"
            />
          </ToggleSection>

          {!activeS.useCPI && (
            <ToggleSection
              title="💸 שחיקת ערך ריאלי (אינפלציה)"
              subtitle="ערך הכסף בהתחשב באינפלציה"
              checked={activeS.useInf}
              onToggle={activeTog('useInf')}
            >
              <SliderControl
                label="שיעור אינפלציה שנתי"
                value={activeS.inf}
                onChange={activeUpd('inf')}
                min={0}
                max={10}
                step={0.1}
                decimals={1}
                suffix="%"
                color="#d97706"
              />
            </ToggleSection>
          )}
        </div>

        {/* Results */}
        {compareMode ? (
          <CompareSection resultsA={resultsA} resultsB={resultsB} stateA={s} stateB={sB} />
        ) : (
          <>
            <ResultsSection results={resultsA} state={s} />
            {resultsA?.showInf && <InflationNote results={resultsA} />}
          </>
        )}

        <footer className="text-center py-6 text-xs text-gray-400">
          © 2026 תכנופרתי |{' '}
          <a href="mailto:tom@timber-art.co.il" className="text-blue-500 font-semibold">
            tom@timber-art.co.il
          </a>
        </footer>
      </div>
    </div>
  )
}
