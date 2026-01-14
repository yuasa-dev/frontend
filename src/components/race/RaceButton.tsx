import { Link } from 'react-router-dom'

interface RaceButtonProps {
  raceId: string
  raceNumber: number
  hasPrediction: boolean
  status: string
}

export default function RaceButton({ raceId, raceNumber, hasPrediction, status }: RaceButtonProps) {
  const isFinished = status === 'finished' || status === 'cancelled'

  return (
    <Link
      to={`/prediction/${raceId}`}
      className={`
        w-12 h-12 flex items-center justify-center rounded-lg text-sm font-medium
        transition-colors relative
        ${isFinished
          ? 'bg-gray-200 text-gray-500 cursor-default'
          : hasPrediction
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }
      `}
    >
      {raceNumber}R
      {hasPrediction && !isFinished && (
        <svg
          className="absolute -top-1 -right-1 w-4 h-4 text-green-400 bg-white rounded-full"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </Link>
  )
}
