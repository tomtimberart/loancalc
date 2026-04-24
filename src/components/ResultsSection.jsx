import { fmtMoney, fmtDur, fmtPct } from '../utils/fmt'
import BarChart from './BarChart'
import AmortTable from './AmortTable'

export default function ResultsSection({ results, state }) {
  if (!results) return null

  if (results.warning) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 font-bold text-sm shadow-sm">
        ⚠️ {results.warning}
      </div>
    )
  }

  const { annualRate, pmt, months, totalPaid, totalInt, totalIdx, totalPrinc, amort, balloonPayment } = results
  const hasIdx = state.useCPI && totalIdx > 0.5
  const hasBalloon = balloonPayment > 0.5

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-5">
      <div className="text-sm font-black text-gray-900 flex items-center gap-2">
        🧾 תוצאות החישוב
      </div>

      {/* Top 4 metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricBox
          label="סכום קרן"
          value={fmtMoney(state.loan)}
          valueClass="text-green-600"
        />
        <MetricBox
          label="ריבית שנתית סופית"
          value={fmtPct(annualRate * 100)}
          valueClass="text-red-500"
          sub={state.usePrime ? `(${state.rate.toFixed(1)}% + ${state.prime.toFixed(1)}%)` : ''}
        />
        <MetricBox
          label="תקופת החזר"
          value={fmtDur(months)}
          valueClass="text-blue-600 text-xl sm:text-2xl"
        />
        <MetricBox
          label="תשלום חודשי"
          value={fmtMoney(pmt)}
          valueClass="text-blue-600"
          sub={state.usePrime ? `בסיס ${state.rate.toFixed(1)}% + פריים` : ''}
        />
      </div>

      {/* Bottom metrics */}
      <div className={`grid gap-3 grid-cols-2 ${hasIdx || hasBalloon ? 'sm:grid-cols-4' : 'sm:grid-cols-2'}`}>
        <MetricBox label="סה״כ ריבית" value={fmtMoney(totalInt)} valueClass="text-red-500" />
        {hasIdx && (
          <MetricBox label="עלות הצמדה" value={fmtMoney(totalIdx)} valueClass="text-purple-600" />
        )}
        {hasBalloon && (
          <MetricBox
            label="תשלום בלון סופי"
            value={fmtMoney(balloonPayment)}
            valueClass="text-violet-600"
            sub="תשלום חד-פעמי בסוף"
          />
        )}
        <MetricBox label="סה״כ התשלום" value={fmtMoney(totalPaid)} sub={hasBalloon ? 'כולל בלון' : ''} />
      </div>

      {/* Bar chart */}
      <BarChart
        totalPrinc={totalPrinc}
        totalInt={totalInt}
        totalIdx={hasIdx ? totalIdx : 0}
        totalPaid={totalPaid}
      />

      {/* Amort table */}
      <div className="border-t border-gray-200 pt-5">
        <div className="text-sm font-black text-gray-700 mb-3">📅 לוח סילוקין (תמצית שנתית)</div>
        <AmortTable
          amort={amort}
          useCPI={state.useCPI}
          totalPaid={totalPaid}
          totalPrinc={totalPrinc}
          totalInt={totalInt}
          totalIdx={totalIdx}
        />
      </div>
    </div>
  )
}

function MetricBox({ label, value, valueClass = 'text-gray-900', sub }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 leading-tight">
        {label}
      </div>
      <div className={`font-black leading-none text-xl ${valueClass}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1.5 font-semibold">{sub}</div>}
    </div>
  )
}
