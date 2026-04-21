import { useState, useEffect } from 'react'

export default function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  decimals = 0,
  prefix = '',
  suffix = '',
  color = '#2563eb',
  hint,
}) {
  const [inputVal, setInputVal] = useState('')
  const [focused, setFocused] = useState(false)

  const toDisplay = (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()

  useEffect(() => {
    if (!focused) setInputVal(toDisplay(value))
  }, [value, focused]) // eslint-disable-line react-hooks/exhaustive-deps

  const pct = ((value - min) / (max - min)) * 100

  const handleSlider = (e) => onChange(parseFloat(e.target.value))

  const handleInputChange = (e) => {
    setInputVal(e.target.value)
    const num = parseFloat(e.target.value.replace(/[₪,\s]/g, ''))
    if (!isNaN(num) && num >= min) onChange(Math.min(max, num))
  }

  const handleBlur = () => {
    setFocused(false)
    const num = parseFloat(inputVal.replace(/[₪,\s]/g, ''))
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num))
      onChange(clamped)
    }
  }

  const fmtLabel = (v) => {
    if (decimals > 0) return `${prefix}${v.toFixed(decimals)}${suffix}`
    if (v >= 1000) return `${prefix}${v.toLocaleString('he-IL')}${suffix}`
    return `${prefix}${v}${suffix}`
  }

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2 gap-3">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-black text-sm" style={{ color }}>
            {fmtLabel(value)}
          </span>
          <input
            type="text"
            value={focused ? inputVal : toDisplay(value)}
            onFocus={() => { setFocused(true); setInputVal(toDisplay(value)) }}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-24 text-center text-xs font-bold border border-gray-300 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            dir="ltr"
          />
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSlider}
        className="w-full"
        style={{
          '--thumb-color': color,
          background: `linear-gradient(to right, ${color} ${pct}%, #e2e8f0 ${pct}%)`,
        }}
      />

      <div className="flex justify-between mt-1" dir="ltr">
        <span className="text-xs text-gray-400 font-medium">{fmtLabel(min)}</span>
        <span className="text-xs text-gray-400 font-medium">{fmtLabel(max)}</span>
      </div>

      {hint && <p className="text-xs text-blue-500 mt-1 font-medium">{hint}</p>}
    </div>
  )
}
