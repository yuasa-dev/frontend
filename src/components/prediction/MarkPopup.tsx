import { useEffect, useRef } from 'react'
import { type MarkType, MARK_CONFIG } from './MarkCell'

interface MarkPopupProps {
  horseNumber: number
  horseName: string
  currentMark: MarkType
  onSelect: (mark: MarkType) => void
  onClose: () => void
}

const MARK_TYPES: MarkType[] = ['honmei', 'taikou', 'tanana', 'renka', 'ana']

export default function MarkPopup({
  horseNumber,
  horseName,
  currentMark,
  onSelect,
  onClose,
}: MarkPopupProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div
        ref={ref}
        className="bg-white rounded-xl shadow-xl w-full max-w-sm p-4"
      >
        <div className="text-center mb-4">
          <div className="text-lg font-bold text-gray-800">
            {horseNumber} {horseName}
          </div>
          <div className="text-sm text-gray-500">の印を選択</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {MARK_TYPES.map((mark) => {
            if (!mark) return null
            const config = MARK_CONFIG[mark]
            const isSelected = currentMark === mark

            return (
              <button
                key={mark}
                onClick={() => onSelect(mark)}
                className={`
                  py-3 rounded-lg flex flex-col items-center gap-1
                  transition-colors border-2
                  ${isSelected
                    ? `${config.bgColor} border-current ${config.color}`
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className={`text-2xl font-bold ${config.color}`}>
                  {config.symbol}
                </span>
                <span className="text-xs text-gray-600">{config.label}</span>
              </button>
            )
          })}

          <button
            onClick={() => onSelect(null)}
            className={`
              py-3 rounded-lg flex flex-col items-center gap-1
              transition-colors border-2 border-gray-200 hover:border-gray-300
            `}
          >
            <span className="text-2xl font-bold text-gray-400">
              ✕
            </span>
            <span className="text-xs text-gray-600">解除</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
