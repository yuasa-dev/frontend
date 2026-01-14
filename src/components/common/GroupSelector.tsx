import { useEffect, useRef } from 'react'

interface Group {
  id: string
  name: string
  memberCount: number
}

interface GroupSelectorProps {
  groups: Group[]
  selectedGroupId: string | null
  onSelect: (groupId: string | null) => void
  isOpen: boolean
  onClose: () => void
}

export default function GroupSelector({
  groups,
  selectedGroupId,
  onSelect,
  isOpen,
  onClose,
}: GroupSelectorProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-start justify-center pt-16">
      <div
        ref={ref}
        className="bg-white rounded-lg shadow-xl w-72 max-h-80 overflow-hidden"
      >
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">グループを選択</h3>
        </div>
        <div className="overflow-y-auto max-h-60">
          <button
            onClick={() => {
              onSelect(null)
              onClose()
            }}
            className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
              selectedGroupId === null ? 'bg-blue-50' : ''
            }`}
          >
            <span className="font-medium text-gray-800">個人</span>
            {selectedGroupId === null && (
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => {
                onSelect(group.id)
                onClose()
              }}
              className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                selectedGroupId === group.id ? 'bg-blue-50' : ''
              }`}
            >
              <div>
                <div className="font-medium text-gray-800">{group.name}</div>
                <div className="text-xs text-gray-500">{group.memberCount}人</div>
              </div>
              {selectedGroupId === group.id && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
