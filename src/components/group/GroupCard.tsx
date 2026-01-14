interface GroupCardProps {
  id: string
  name: string
  inviteCode: string
  memberCount: number
  isOwner: boolean
  onLeave?: () => void
}

export default function GroupCard({
  name,
  inviteCode,
  memberCount,
  isOwner,
}: GroupCardProps) {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode)
    alert('招待コードをコピーしました')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {isOwner ? '\uD83D\uDC51' : '\uD83C\uDFE0'}
          </span>
          <div>
            <h3 className="font-bold text-gray-800">{name}</h3>
            <p className="text-sm text-gray-500">{memberCount}人</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2">
        <span className="text-xs text-gray-500">招待コード:</span>
        <code className="font-mono font-bold text-gray-800">{inviteCode}</code>
        <button
          onClick={handleCopyCode}
          className="ml-auto p-1 text-gray-400 hover:text-gray-600"
          title="コピー"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
