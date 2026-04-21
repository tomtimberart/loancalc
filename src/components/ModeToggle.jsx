export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="flex gap-1.5 mb-5 bg-gray-100 rounded-xl p-1 border border-gray-200">
      <button
        onClick={() => onChange('monthly')}
        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
          mode === 'monthly'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        💰 לפי תשלום חודשי
      </button>
      <button
        onClick={() => onChange('term')}
        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
          mode === 'term'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        📅 לפי תקופה
      </button>
    </div>
  )
}
