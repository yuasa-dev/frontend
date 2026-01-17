import { useState } from 'react'
import Header from '../components/common/Header'
import DatePicker from '../components/common/DatePicker'
import GroupSelector from '../components/common/GroupSelector'
import RaceGrid from '../components/race/RaceGrid'
import RefreshButton from '../components/race/RefreshButton'
import { useRaces } from '../hooks/useRaces'
import { useGroups } from '../hooks/useGroups'

export default function RaceListPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [showGroupSelector, setShowGroupSelector] = useState(false)

  const { groups } = useGroups()
  const {
    venues,
    isLoading,
    isFetching,
    error,
    fetchRaceData,
    fetchStatus,
    remainingSeconds,
  } = useRaces(selectedDate, selectedGroupId)

  const selectedGroup = selectedGroupId
    ? groups.find((g) => g.id === selectedGroupId)
    : null

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        onGroupClick={() => setShowGroupSelector(true)}
        selectedGroupName={selectedGroup?.name}
      />

      <main className="max-w-4xl mx-auto px-4 pb-8">
        <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* 更新ボタン（レース一覧の上に配置） */}
        <RefreshButton
          onRefresh={fetchRaceData}
          isRefreshing={isFetching}
          canRefresh={fetchStatus.canFetch}
          remainingSeconds={remainingSeconds}
          isEmpty={!isLoading && venues.length === 0}
        />

        <RaceGrid
          venues={venues}
          isLoading={isLoading}
          isEmpty={venues.length === 0}
        />
      </main>

      <GroupSelector
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelect={setSelectedGroupId}
        isOpen={showGroupSelector}
        onClose={() => setShowGroupSelector(false)}
      />
    </div>
  )
}
