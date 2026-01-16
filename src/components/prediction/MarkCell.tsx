export type MarkType = 'honmei' | 'taikou' | 'tanana' | 'renka' | 'ana' | null
export type BuyType = 'jiku' | 'osae' | null

interface MarkCellProps {
  mark: MarkType
  buyType?: BuyType
  isEditable?: boolean
  onClick?: () => void
  onBuyToggle?: () => void
  isHighlighted?: boolean
}

export const MARK_CONFIG = {
  honmei: { symbol: '\u25ce', label: '\u672c\u547d', color: 'text-red-500', bgColor: 'bg-red-50' },
  taikou: { symbol: '\u25cb', label: '\u5bfe\u6297', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  tanana: { symbol: '\u25b2', label: '\u5358\u7a74', color: 'text-green-500', bgColor: 'bg-green-50' },
  renka: { symbol: '\u25b3', label: '\u9023\u4e0b', color: 'text-purple-500', bgColor: 'bg-purple-50' },
  ana: { symbol: '\u2606', label: '\u7a74', color: 'text-orange-500', bgColor: 'bg-orange-50' },
} as const

export const BUY_CONFIG = {
  jiku: { label: '軸', color: 'text-red-600', bgColor: 'bg-red-100' },
  osae: { label: '抑', color: 'text-blue-600', bgColor: 'bg-blue-100' },
} as const

export default function MarkCell({ mark, buyType, isEditable, onClick, onBuyToggle, isHighlighted }: MarkCellProps) {
  const config = mark ? MARK_CONFIG[mark] : null
  const buyConfig = buyType ? BUY_CONFIG[buyType] : null

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick()
    }
  }

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onBuyToggle) {
      onBuyToggle()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
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
      {/* 買いチェックマーク（右下に小さく表示） */}
      {isEditable && (
        <button
          onClick={handleBuyClick}
          className={`
            absolute -bottom-0.5 -right-0.5 w-4 h-4
            flex items-center justify-center
            text-[10px] font-bold rounded-full
            border transition-all
            ${buyConfig
              ? `${buyConfig.bgColor} ${buyConfig.color} border-current`
              : 'bg-gray-100 text-gray-400 border-gray-300 hover:bg-gray-200'
            }
          `}
          title={buyConfig ? (buyType === 'jiku' ? '軸として買い' : '抑えとして買い') : 'クリックで軸/抑え切替'}
        >
          {buyConfig ? buyConfig.label : ''}
        </button>
      )}
      {/* 他メンバーの買いチェック表示（編集不可時） */}
      {!isEditable && buyConfig && (
        <span
          className={`
            absolute -bottom-0.5 -right-0.5 w-4 h-4
            flex items-center justify-center
            text-[10px] font-bold rounded-full
            ${buyConfig.bgColor} ${buyConfig.color}
          `}
          title={buyType === 'jiku' ? '軸として買い' : '抑えとして買い'}
        >
          {buyConfig.label}
        </span>
      )}
    </div>
  )
}
