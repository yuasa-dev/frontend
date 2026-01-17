import VenueSection from './VenueSection'

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

interface Venue {
  venue: string
  races: Race[]
}

interface RaceGridProps {
  venues: Venue[]
  isLoading?: boolean
  isEmpty?: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
  canRefresh?: boolean
  remainingSeconds?: number
}

export default function RaceGrid({
  venues,
  isLoading,
  isEmpty,
  onRefresh,
  isRefreshing = false,
  canRefresh = true,
  remainingSeconds = 0,
}: RaceGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (isEmpty || venues.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
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
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>この日のレース情報はありません</p>
        <p className="text-sm mt-2">別の日を選択するか、レース情報を取得してください</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {venues.map((venue, index) => (
        <VenueSection
          key={venue.venue}
          venue={venue.venue}
          races={venue.races}
          showRefreshButton={index === 0}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          canRefresh={canRefresh}
          remainingSeconds={remainingSeconds}
        />
      ))}
    </div>
  )
}
