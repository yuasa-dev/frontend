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
}

export default function VenueSection({ venue, races }: VenueSectionProps) {
  // レースを番号順にソート
  const sortedRaces = [...races].sort((a, b) => a.raceNumber - b.raceNumber)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-bold text-gray-800">{venue}</h3>
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
