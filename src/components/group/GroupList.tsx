import GroupCard from './GroupCard'

interface Group {
  id: string
  name: string
  inviteCode: string
  memberCount: number
  isOwner: boolean
}

interface GroupListProps {
  groups: Group[]
  isLoading?: boolean
  onLeaveGroup?: (groupId: string) => void
}

export default function GroupList({ groups, isLoading, onLeaveGroup }: GroupListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p>グループに参加していません</p>
        <p className="text-sm mt-2">グループを作成するか、招待コードで参加してください</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          {...group}
          onLeave={onLeaveGroup ? () => onLeaveGroup(group.id) : undefined}
        />
      ))}
    </div>
  )
}
