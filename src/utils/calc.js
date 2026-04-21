function calcPmt(principal, r, months) {
  if (r === 0) return principal / months
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function calcMonths(principal, r, pmt) {
  if (r === 0) return principal / pmt
  if (pmt <= principal * r) return Infinity
  return -Math.log(1 - (principal * r) / pmt) / Math.log(1 + r)
}

function simBal(principal, r, cpiM, pmt, months) {
  let bal = principal
  for (let m = 0; m < months; m++) {
    bal *= 1 + cpiM
    bal -= pmt - bal * r
  }
  return bal
}

function simMonthsCPI(principal, r, cpiM, pmt, maxM = 600) {
  let bal = principal
  for (let m = 1; m <= maxM; m++) {
    bal *= 1 + cpiM
    const ip = bal * r
    if (pmt - ip <= 0) return Infinity
    bal -= pmt - ip
    if (bal <= 0.5) return m
  }
  return Infinity
}

function calcPmtCPI(principal, r, cpiM, months) {
  let lo = principal * (r + cpiM + 0.001)
  let hi = principal * 5
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (simBal(principal, r, cpiM, mid, months) > 0) lo = mid
    else hi = mid
    if (hi - lo < 0.01) break
  }
  return (lo + hi) / 2
}

function buildAmort(principal, r, cpiM, pmt, months) {
  let bal = principal
  const rows = []
  for (let m = 1; m <= months; m++) {
    const idx = bal * cpiM
    bal += idx
    const ip = bal * r
    let pp = pmt - ip
    if (pp > bal) pp = bal
    bal -= pp
    if (bal < 0.01) bal = 0
    rows.push({
      month: m,
      payment: pp + ip + idx,
      interest: ip,
      indexation: idx,
      principal: pp,
      balance: bal,
    })
    if (bal === 0) break
  }
  return rows
}

export function runCalc({ loan, mode, monthly, term, rate, usePrime, prime, useCPI, cpi, useInf, inf }) {
  const annualRate = rate / 100 + (usePrime ? prime / 100 : 0)
  const r = annualRate / 12
  const cpiAnnual = useCPI ? cpi / 100 : 0
  const cpiM = useCPI ? Math.pow(1 + cpiAnnual, 1 / 12) - 1 : 0
  const infRate = useCPI ? cpiAnnual : useInf ? inf / 100 : 0

  let months, pmt

  if (mode === 'monthly') {
    if (!useCPI && r > 0 && monthly <= loan * r) {
      return { warning: 'התשלום החודשי נמוך מדי לכיסוי הריבית — הגדל את התשלום' }
    }
    if (r === 0) months = loan / monthly
    else if (!useCPI) months = calcMonths(loan, r, monthly)
    else {
      months = simMonthsCPI(loan, r, cpiM, monthly)
      if (!isFinite(months)) return { warning: 'התשלום החודשי נמוך מדי לכיסוי הריבית — הגדל את התשלום' }
    }
    pmt = monthly
  } else {
    months = term
    if (r === 0) pmt = loan / months
    else if (!useCPI) pmt = calcPmt(loan, r, months)
    else pmt = calcPmtCPI(loan, r, cpiM, months)
  }

  if (!isFinite(months) || isNaN(months) || !isFinite(pmt) || isNaN(pmt)) {
    return { warning: 'לא ניתן לחשב עם הערכים הנוכחיים' }
  }

  const amort = buildAmort(loan, r, cpiM, pmt, Math.ceil(months))
  const totalPaid = amort.reduce((s, row) => s + row.payment, 0)
  const totalInt = amort.reduce((s, row) => s + row.interest, 0)
  const totalIdx = amort.reduce((s, row) => s + row.indexation, 0)
  const totalPrinc = totalPaid - totalInt - totalIdx

  return {
    warning: null,
    annualRate,
    pmt,
    months: amort.length,
    totalPaid,
    totalInt,
    totalIdx,
    totalPrinc,
    amort,
    infRate,
    showInf: (useCPI || useInf) && infRate > 0,
  }
}
