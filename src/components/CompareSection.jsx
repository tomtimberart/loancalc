import { fmtMoney, fmtDur } from '../utils/fmt'

export default function CompareSection({ resultsA, resultsB, stateA, stateB }) {
  if (!resultsA || !resultsB) return null

  const warnA = resultsA.warning
  const warnB = resultsB.warning

  const hasBalloon = (resultsA.balloonPayment ?? 0) > 0.5 || (resultsB.balloonPayment ?? 0) > 0.5
  const hasIdx =
    (stateA.useCPI && (resultsA.totalIdx ?? 0) > 0.5) ||
    (stateB.useCPI && (resultsB.totalIdx ?? 0) > 0.5)

  const rows = [
    { label: 'תשלום חודשי', keyA: resultsA.pmt, keyB: resultsB.pmt, fmt: fmtMoney },
    { label: 'תקופת החזר', keyA: resultsA.months, keyB: resultsB.months, fmt: fmtDur },
    { label: 'סה״כ ריבית', keyA: resultsA.totalInt, keyB: resultsB.totalInt, fmt: fmtMoney },
    ...(hasIdx
      ? [{ label: 'עלות הצמדה', keyA: resultsA.totalIdx, keyB: resultsB.totalIdx, fmt: fmtMoney }]
      : []),
    ...(hasBalloon
      ? [{ label: 'תשלום בלון', keyA: resultsA.balloonPayment, keyB: resultsB.balloonPayment, fmt: fmtMoney }]
      : []),
    { label: 'סה״כ התשלום', keyA: resultsA.totalPaid, keyB: resultsB.totalPaid, fmt: fmtMoney, bold: true },
  ]

  const diff =
    !warnA && !warnB ? resultsB.totalPaid - resultsA.totalPaid : null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="text-sm font-black text-gray-900 flex items-center gap-2">
        ⚖️ השוואת מסלולים
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 gap-2">
        <div />
        <div className="text-center text-xs font-black text-blue-700 bg-blue-50 rounded-lg py-2 border border-blue-100">
          מסלול א׳
        </div>
        <div className="text-center text-xs font-black text-purple-700 bg-purple-50 rounded-lg py-2 border border-purple-100">
          מסלול ב׳
        </div>
      </div>

      {/* Params summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-xs font-bold text-gray-400 flex items-center">פרטים</div>
        {[stateA, stateB].map((st, i) => (
          <div key={i} className="text-xs text-center text-gray-600 bg-gray-50 rounded-lg p-2 space-y-0.5">
            <div className="font-bold">{fmtMoney(st.loan)}</div>
            <div>
              {st.mode === 'term'
                ? `${st.term} חודשים`
                : `${fmtMoney(st.monthly)}/חודש`}
            </div>
            <div>{st.rate}%{st.usePrime ? ' + פריים' : ''}</div>
          </div>
        ))}
      </div>

      {/* Metric rows */}
      <div className="space-y-1.5">
        {rows.map(({ label, keyA, keyB, fmt, bold }) => {
          const aBetter = !warnA && !warnB && keyA < keyB
          const bBetter = !warnA && !warnB && keyB < keyA
          return (
            <div key={label} className="grid grid-cols-3 gap-2 items-center">
              <div className={`text-xs ${bold ? 'font-black text-gray-700' : 'font-bold text-gray-500'}`}>
                {label}
              </div>
              <Cell value={warnA ? null : keyA} fmt={fmt} better={aBetter} worse={bBetter} bold={bold} />
              <Cell value={warnB ? null : keyB} fmt={fmt} better={bBetter} worse={aBetter} bold={bold} />
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {diff !== null && (
        <div className="pt-3 border-t border-gray-100 text-center">
          {Math.abs(diff) < 1 ? (
            <span className="text-sm font-black text-gray-500">המסלולים זהים בעלותם</span>
          ) : diff > 0 ? (
            <span className="text-sm font-black text-blue-700 bg-blue-50 rounded-xl px-4 py-2 inline-block">
              מסלול א׳ זול יותר ב־{fmtMoney(diff)}
            </span>
          ) : (
            <span className="text-sm font-black text-purple-700 bg-purple-50 rounded-xl px-4 py-2 inline-block">
              מסלול ב׳ זול יותר ב־{fmtMoney(-diff)}
            </span>
          )}
        </div>
      )}

      {(warnA || warnB) && (
        <div className="text-xs text-red-500 font-bold">
          {warnA && <div>⚠️ מסלול א׳: {warnA}</div>}
          {warnB && <div>⚠️ מסלול ב׳: {warnB}</div>}
        </div>
      )}
    </div>
  )
}

function Cell({ value, fmt, better, worse, bold }) {
  const base = bold ? 'font-black text-base' : 'font-bold text-sm'
  const color = better
    ? 'bg-green-50 text-green-700 border border-green-200'
    : worse
    ? 'bg-red-50 text-red-500 border border-red-100'
    : 'bg-gray-50 text-gray-700'
  return (
    <div className={`text-center rounded-lg py-2 px-1 ${base} ${color}`}>
      {value == null ? '—' : fmt(value)}
      {better && <span className="text-xs mr-1">✓</span>}
    </div>
  )
}
