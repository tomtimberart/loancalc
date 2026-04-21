import { fmtMoney } from '../utils/fmt'

export default function AmortTable({ amort, useCPI, totalPaid, totalPrinc, totalInt, totalIdx }) {
  const years = Math.ceil(amort.length / 12)
  const step = Math.max(1, Math.floor(years / 8))

  const showYears = new Set([1])
  for (let y = step; y < years; y += step) showYears.add(y)
  showYears.add(years)

  const rows = []
  for (let y = 1; y <= years; y++) {
    if (!showYears.has(y)) continue
    const slice = amort.slice((y - 1) * 12, y * 12)
    if (!slice.length) continue
    rows.push({
      year: y,
      pay: slice.reduce((s, r) => s + r.payment, 0),
      prin: slice.reduce((s, r) => s + r.principal, 0),
      int: slice.reduce((s, r) => s + r.interest, 0),
      idx: slice.reduce((s, r) => s + r.indexation, 0),
      bal: slice[slice.length - 1].balance,
    })
  }

  const th = 'text-right text-xs font-black text-gray-400 p-2.5 border-b-2 border-gray-200 uppercase tracking-wide'
  const td = 'p-2.5 border-b border-gray-100 font-semibold text-sm'

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full border-collapse min-w-[480px]">
        <thead>
          <tr className="bg-gray-50">
            <th className={th}>שנה</th>
            <th className={th}>תשלום שנתי</th>
            <th className={th}>קרן</th>
            {useCPI && <th className={th}>הצמדה</th>}
            <th className={th}>ריבית</th>
            <th className={th}>יתרה</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ year, pay, prin, int, idx, bal }) => (
            <tr key={year} className="hover:bg-blue-50 transition-colors">
              <td className={`${td} font-bold text-gray-700`}>{year}</td>
              <td className={`${td} text-gray-600`}>{fmtMoney(pay)}</td>
              <td className={`${td} text-green-600`}>{fmtMoney(prin)}</td>
              {useCPI && <td className={`${td} text-purple-600`}>{fmtMoney(idx)}</td>}
              <td className={`${td} text-red-500`}>{fmtMoney(int)}</td>
              <td className={`${td} text-gray-500`}>{bal < 1 ? '—' : fmtMoney(bal)}</td>
            </tr>
          ))}
          <tr className="bg-gray-50">
            <td className="p-2.5 border-t-2 border-gray-300 font-black text-sm text-blue-600">סה״כ</td>
            <td className="p-2.5 border-t-2 border-gray-300 font-black text-sm">{fmtMoney(totalPaid)}</td>
            <td className="p-2.5 border-t-2 border-gray-300 font-black text-sm text-green-600">{fmtMoney(totalPrinc)}</td>
            {useCPI && <td className="p-2.5 border-t-2 border-gray-300 font-black text-sm text-purple-600">{fmtMoney(totalIdx)}</td>}
            <td className="p-2.5 border-t-2 border-gray-300 font-black text-sm text-red-500">{fmtMoney(totalInt)}</td>
            <td className="p-2.5 border-t-2 border-gray-300 font-black text-sm">—</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
