import RaceButton from './RaceButton'

interface Race {
  id: string
  raceNumber: number
  raceName: string
  postTime: string | null
  distance: number | null
  surface: string | null
  status: string
  hasPrediction?: boolean
}

interface VenueSectionProps {
  venue: string
  races: Race[]
  showRefreshButton?: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
  canRefresh?: boolean
  remainingSeconds?: number
}

function formatRemainingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function VenueSection({
  venue,
  races,
  showRefreshButton = false,
  onRefresh,
  isRefreshing = false,
  canRefresh = true,
  remainingSeconds = 0,
}: VenueSectionProps) {
  // レースを番号順にソート
  const sortedRaces = [...races].sort((a, b) => a.raceNumber - b.raceNumber)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">{venue}</h3>
        {showRefreshButton && (
          <button
            onClick={onRefresh}
            disabled={!canRefresh || isRefreshing}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              canRefresh && !isRefreshing
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isRefreshing ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>更新中...</span>
              </>
            ) : !canRefresh ? (
              <span>{formatRemainingTime(remainingSeconds)}</span>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>更新</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="grid grid-cols-6 gap-2">
          {sortedRaces.map((race) => (
            <RaceButton
              key={race.id}
              raceId={race.id}
              raceNumber={race.raceNumber}
              hasPrediction={race.hasPrediction || false}
              status={race.status}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
