export type MarkType = 'honmei' | 'taikou' | 'tanana' | 'renka' | 'ana' | null

interface MarkCellProps {
  mark: MarkType
  isEditable?: boolean
  onClick?: () => void
  isHighlighted?: boolean
}

export const MARK_CONFIG = {
  honmei: { symbol: '\u25ce', label: '\u672c\u547d', color: 'text-red-500', bgColor: 'bg-red-50' },
  taikou: { symbol: '\u25cb', label: '\u5bfe\u6297', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  tanana: { symbol: '\u25b2', label: '\u5358\u7a74', color: 'text-green-500', bgColor: 'bg-green-50' },
  renka: { symbol: '\u25b3', label: '\u9023\u4e0b', color: 'text-purple-500', bgColor: 'bg-purple-50' },
  ana: { symbol: '\u2606', label: '\u7a74', color: 'text-orange-500', bgColor: 'bg-orange-50' },
} as const

export default function MarkCell({ mark, isEditable, onClick, isHighlighted }: MarkCellProps) {
  const config = mark ? MARK_CONFIG[mark] : null

  return (
    <button
      onClick={onClick}
      disabled={!isEditable}
      className={`
        w-10 h-10 flex items-center justify-center text-lg font-bold
        rounded transition-colors
        ${isHighlighted ? 'bg-yellow-100' : ''}
        ${isEditable ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'}
        ${config ? config.color : 'text-gray-300'}
      `}
    >
      {config ? config.symbol : isEditable ? '-' : ''}
    </button>
  )
}
