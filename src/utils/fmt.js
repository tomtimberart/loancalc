export function fmtMoney(n) {
  if (!isFinite(n) || isNaN(n)) return '—'
  if (Math.abs(n) >= 1_000_000) return '₪' + (n / 1_000_000).toFixed(2) + 'M'
  return '₪' + Math.round(n).toLocaleString('he-IL')
}

export function fmtDur(months) {
  if (!isFinite(months) || isNaN(months) || months > 600) return '—'
  const m = Math.ceil(months)
  const y = Math.floor(m / 12)
  const mo = m % 12
  if (y === 0) return `${mo} חודשים`
  if (mo === 0) return `${y} שנים`
  return `${y} שנים ו-${mo} חודשים`
}

export function fmtPct(n, dec = 2) {
  return n.toFixed(dec) + '%'
}
