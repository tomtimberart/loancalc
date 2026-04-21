export default function ToggleSection({ title, subtitle, checked, onToggle, children }) {
  return (
    <div>
      <div className="flex items-center justify-between py-3.5 border-t border-gray-200 gap-4">
        <div className="min-w-0">
          <div className="text-sm font-bold text-gray-700">{title}</div>
          {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
        </div>
        {/* dir="ltr" keeps thumb movement LTR regardless of page RTL */}
        <button
          dir="ltr"
          onClick={onToggle}
          role="switch"
          aria-checked={checked}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
            checked ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          checked ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-1 pb-2">{children}</div>
      </div>
    </div>
  )
}
