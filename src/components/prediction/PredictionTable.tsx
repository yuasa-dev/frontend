import { useState } from 'react'
import MarkCell, { type MarkType, type BuyType } from './MarkCell'
import MarkPopup from './MarkPopup'

interface Horse {
  number: number
  name: string
  jockeyName: string | null
  scratched: boolean
}

interface Prediction {
  userId: string
  nickname: string
  isMine: boolean
  honmei: number | null
  taikou: number | null
  tanana: number | null
  renka: number[]
  ana: number[]
  jiku: number[]
  osae: number[]
}

interface PredictionTableProps {
  horses: Horse[]
  predictions: Prediction[]
  myPrediction: {
    honmei: number | null
    taikou: number | null
    tanana: number | null
    renka: number[]
    ana: number[]
    jiku: number[]
    osae: number[]
  }
  onMarkChange: (horseNumber: number, mark: MarkType) => void
  onBuyToggle: (horseNumber: number) => void
  onBuyChange: (horseNumber: number, buyType: BuyType) => void
}

export default function PredictionTable({
  horses,
  predictions,
  myPrediction,
  onMarkChange,
  onBuyToggle,
  onBuyChange,
}: PredictionTableProps) {
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null)

  // 自分の予想から馬番→印のマッピングを作成
  const getMyMark = (horseNumber: number): MarkType => {
    if (myPrediction.honmei === horseNumber) return 'honmei'
    if (myPrediction.taikou === horseNumber) return 'taikou'
    if (myPrediction.tanana === horseNumber) return 'tanana'
    if (myPrediction.renka.includes(horseNumber)) return 'renka'
    if (myPrediction.ana.includes(horseNumber)) return 'ana'
    return null
  }

  // 自分の買い情報から馬番→買いタイプのマッピングを作成
  const getMyBuyType = (horseNumber: number): BuyType => {
    if (myPrediction.jiku.includes(horseNumber)) return 'jiku'
    if (myPrediction.osae.includes(horseNumber)) return 'osae'
    return null
  }

  // 他者の予想から馬番→印のマッピングを作成
  const getOtherMark = (prediction: Prediction, horseNumber: number): MarkType => {
    if (prediction.honmei === horseNumber) return 'honmei'
    if (prediction.taikou === horseNumber) return 'taikou'
    if (prediction.tanana === horseNumber) return 'tanana'
    if (prediction.renka.includes(horseNumber)) return 'renka'
    if (prediction.ana.includes(horseNumber)) return 'ana'
    return null
  }

  // 他者の買い情報から馬番→買いタイプのマッピングを作成
  const getOtherBuyType = (prediction: Prediction, horseNumber: number): BuyType => {
    if (prediction.jiku.includes(horseNumber)) return 'jiku'
    if (prediction.osae.includes(horseNumber)) return 'osae'
    return null
  }

  const handleMarkSelect = (mark: MarkType) => {
    if (selectedHorse) {
      onMarkChange(selectedHorse.number, mark)
    }
  }

  const handleBuySelect = (buyType: BuyType) => {
    if (selectedHorse) {
      onBuyChange(selectedHorse.number, buyType)
    }
  }

  // 他者の予想（自分以外）
  const otherPredictions = predictions.filter((p) => !p.isMine)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="sticky left-0 bg-gray-50 px-2 py-2 text-xs font-medium text-gray-500 border-b w-10">
              馬番
            </th>
            <th className="sticky left-10 bg-gray-50 px-2 py-2 text-xs font-medium text-gray-500 border-b min-w-24">
              馬名
            </th>
            <th className="px-2 py-2 text-xs font-medium text-blue-600 border-b bg-blue-50 w-12">
              自分
            </th>
            {otherPredictions.map((p) => (
              <th
                key={p.userId}
                className="px-2 py-2 text-xs font-medium text-gray-500 border-b w-12"
              >
                <div className="truncate max-w-12" title={p.nickname}>
                  {p.nickname}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horses.map((horse) => (
            <tr
              key={horse.number}
              className={`border-b ${horse.scratched ? 'opacity-50' : ''}`}
            >
              <td className="sticky left-0 bg-white px-2 py-2 text-center font-medium text-gray-700 border-r">
                {horse.number}
              </td>
              <td className="sticky left-10 bg-white px-2 py-2 border-r">
                <div className="font-medium text-gray-800 text-sm">
                  {horse.name}
                </div>
                {horse.jockeyName && (
                  <div className="text-xs text-gray-500">{horse.jockeyName}</div>
                )}
              </td>
              <td className="px-1 py-1 bg-blue-50/30 border-r overflow-visible">
                <MarkCell
                  mark={getMyMark(horse.number)}
                  buyType={getMyBuyType(horse.number)}
                  isEditable={!horse.scratched}
                  isHighlighted
                  onClick={() => !horse.scratched && setSelectedHorse(horse)}
                  onBuyToggle={() => !horse.scratched && onBuyToggle(horse.number)}
                />
              </td>
              {otherPredictions.map((p) => (
                <td key={p.userId} className="px-1 py-1 border-r overflow-visible">
                  <MarkCell
                    mark={getOtherMark(p, horse.number)}
                    buyType={getOtherBuyType(p, horse.number)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedHorse && (
        <MarkPopup
          horseNumber={selectedHorse.number}
          horseName={selectedHorse.name}
          currentMark={getMyMark(selectedHorse.number)}
          currentBuyType={getMyBuyType(selectedHorse.number)}
          onSelect={handleMarkSelect}
          onBuySelect={handleBuySelect}
          onClose={() => setSelectedHorse(null)}
        />
      )}
    </div>
  )
}
