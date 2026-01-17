import { useState } from 'react'
import Header from '../components/common/Header'
import DatePicker from '../components/common/DatePicker'
import GroupSelector from '../components/common/GroupSelector'
import RaceGrid from '../components/race/RaceGrid'
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

        <RaceGrid
          venues={venues}
          isLoading={isLoading}
          isEmpty={venues.length === 0}
          onRefresh={fetchRaceData}
          isRefreshing={isFetching}
          canRefresh={fetchStatus.canFetch}
          remainingSeconds={remainingSeconds}
        />

        {!isLoading && venues.length === 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={fetchRaceData}
              disabled={!fetchStatus.canFetch || isFetching}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                fetchStatus.canFetch && !isFetching
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isFetching ? 'レース情報を取得中...' : 'レース情報を取得'}
            </button>
            <p className="mt-2 text-xs text-gray-500">
              netkeibaからレース情報をスクレイピングします
            </p>
          </div>
        )}
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
