import { fmtMoney } from '../utils/fmt'

export default function InflationNote({ results }) {
  const { totalPaid, amort, infRate } = results
  const yrs = amort.length / 12
  const real = totalPaid * Math.pow(1 + infRate, -yrs)

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
      <div className="text-sm font-black text-amber-800 mb-4">
        💸 ערך ריאלי של הכסף (בהתחשב באינפלציה)
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InfoBox label="סה״כ נומינלי" value={fmtMoney(totalPaid)} />
        <InfoBox label="ערך ריאלי היום" value={fmtMoney(real)} />
        <InfoBox label="הפסד כוח קנייה" value={fmtMoney(totalPaid - real)} />
      </div>
    </div>
  )
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-white/70 rounded-xl p-3.5 text-center">
      <div className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1.5">{label}</div>
      <div className="text-xl font-black text-amber-800">{value}</div>
    </div>
  )
}
