export default function BarChart({ totalPrinc, totalInt, totalIdx, totalPaid }) {
  const tot = totalPaid || 1
  const pPct = (totalPrinc / tot) * 100
  const iPct = (totalInt / tot) * 100
  const xPct = (totalIdx / tot) * 100
  const hasIdx = totalIdx > 0.5

  return (
    <div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
        פירוק עלויות כוללות
      </div>
      <div className="h-9 rounded-xl overflow-hidden flex" dir="ltr">
        <div
          className="bg-green-600 flex items-center justify-center text-white text-xs font-black transition-all duration-500 overflow-hidden"
          style={{ width: `${pPct}%` }}
        >
          {pPct > 8 ? `${Math.round(pPct)}%` : ''}
        </div>
        <div
          className="bg-red-500 flex items-center justify-center text-white text-xs font-black transition-all duration-500 overflow-hidden"
          style={{ width: `${iPct}%` }}
        >
          {iPct > 8 ? `${Math.round(iPct)}%` : ''}
        </div>
        {hasIdx && (
          <div
            className="bg-purple-600 flex items-center justify-center text-white text-xs font-black transition-all duration-500 overflow-hidden"
            style={{ width: `${xPct}%` }}
          >
            {xPct > 8 ? `${Math.round(xPct)}%` : ''}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-4 mt-2.5">
        <LegendItem color="bg-green-600" label="קרן מקורית" />
        <LegendItem color="bg-red-500" label="עלות ריבית" />
        {hasIdx && <LegendItem color="bg-purple-600" label="עלות הצמדה" />}
      </div>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600">
      <div className={`w-3 h-3 rounded ${color} shrink-0`} />
      {label}
    </div>
  )
}
