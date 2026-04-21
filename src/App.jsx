import { useState, useMemo, useEffect } from 'react'
import { runCalc } from './utils/calc'
import ModeToggle from './components/ModeToggle'
import SliderControl from './components/SliderControl'
import ToggleSection from './components/ToggleSection'
import ResultsSection from './components/ResultsSection'
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
}

export default function App() {
  const [s, setS] = useState(INIT)

  const upd = (key) => (val) => setS((p) => ({ ...p, [key]: val }))
  const tog = (key) => () =>
    setS((p) => {
      const next = { ...p, [key]: !p[key] }
      // CPI and Inflation are mutually exclusive
      if (key === 'useCPI' && next.useCPI) next.useInf = false
      if (key === 'useInf' && next.useInf) next.useCPI = false
      return next
    })

  // Try to fetch current Bank of Israel rate
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

  const results = useMemo(() => runCalc(s), [s])

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
        </header>

        {/* Basic params card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
          <div className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
            ⚙️ פרמטרים בסיסיים
          </div>

          <ModeToggle mode={s.mode} onChange={upd('mode')} />

          <SliderControl
            label="סכום ההלוואה"
            value={s.loan}
            onChange={upd('loan')}
            min={10000}
            max={2000000}
            step={5000}
            prefix="₪"
            color="#2563eb"
          />

          {s.mode === 'monthly' ? (
            <SliderControl
              label="תשלום חודשי רצוי"
              value={s.monthly}
              onChange={upd('monthly')}
              min={500}
              max={60000}
              step={500}
              prefix="₪"
              color="#16a34a"
            />
          ) : (
            <SliderControl
              label="תקופה"
              value={s.term}
              onChange={upd('term')}
              min={6}
              max={360}
              step={1}
              suffix=" חודשים"
              color="#16a34a"
            />
          )}
        </div>

        {/* Interest card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
          <div className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
            📊 הגדרות ריבית
          </div>

          <SliderControl
            label="ריבית שנתית בסיס"
            value={s.rate}
            onChange={upd('rate')}
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
            checked={s.usePrime}
            onToggle={tog('usePrime')}
          >
            <SliderControl
              label="ריבית פריים נוכחית"
              value={s.prime}
              onChange={upd('prime')}
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
            checked={s.useCPI}
            onToggle={tog('useCPI')}
          >
            <SliderControl
              label="אחוז עלייה שנתי צפוי"
              value={s.cpi}
              onChange={upd('cpi')}
              min={0}
              max={10}
              step={0.1}
              decimals={1}
              suffix="%"
              color="#d97706"
              hint="* מחושב על הקרן בכל חודש"
            />
          </ToggleSection>

          {!s.useCPI && (
            <ToggleSection
              title="💸 שחיקת ערך ריאלי (אינפלציה)"
              subtitle="ערך הכסף בהתחשב באינפלציה"
              checked={s.useInf}
              onToggle={tog('useInf')}
            >
              <SliderControl
                label="שיעור אינפלציה שנתי"
                value={s.inf}
                onChange={upd('inf')}
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
        <ResultsSection results={results} state={s} />

        {/* Inflation block */}
        {results?.showInf && <InflationNote results={results} />}

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
