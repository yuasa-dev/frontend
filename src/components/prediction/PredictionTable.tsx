import { useState } from 'react'
import MarkCell, { type MarkType, type BuyType } from './MarkCell'
import MarkPopup from './MarkPopup'

interface Horse {
  id: number     // 馬ID（予想の紐づけに使用）
  number: number // 馬番（表示用）
  name: string
  jockeyName: string | null
  scratched: boolean
}

// 予想は馬ID（ExternalHorse.id）で管理
interface Prediction {
  userId: string
  nickname: string
  isMine: boolean
  honmei: number | null  // 馬ID
  taikou: number | null  // 馬ID
  tanana: number | null  // 馬ID
  renka: number[]        // 馬IDの配列
  ana: number[]          // 馬IDの配列
  jiku: number[]         // 馬IDの配列
  osae: number[]         // 馬IDの配列
}

interface PredictionTableProps {
  horses: Horse[]
  predictions: Prediction[]
  myPrediction: {
    honmei: number | null  // 馬ID
    taikou: number | null  // 馬ID
    tanana: number | null  // 馬ID
    renka: number[]        // 馬IDの配列
    ana: number[]          // 馬IDの配列
    jiku: number[]         // 馬IDの配列
    osae: number[]         // 馬IDの配列
  }
  onMarkChange: (horseId: number, mark: MarkType) => void
  onBuyToggle: (horseId: number) => void
  onBuyChange: (horseId: number, buyType: BuyType) => void
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

  // 自分の予想から馬ID→印のマッピングを作成
  const getMyMark = (horseId: number): MarkType => {
    if (myPrediction.honmei === horseId) return 'honmei'
    if (myPrediction.taikou === horseId) return 'taikou'
    if (myPrediction.tanana === horseId) return 'tanana'
    if (myPrediction.renka.includes(horseId)) return 'renka'
    if (myPrediction.ana.includes(horseId)) return 'ana'
    return null
  }

  // 自分の買い情報から馬ID→買いタイプのマッピングを作成
  const getMyBuyType = (horseId: number): BuyType => {
    if (myPrediction.jiku.includes(horseId)) return 'jiku'
    if (myPrediction.osae.includes(horseId)) return 'osae'
    return null
  }

  // 他者の予想から馬ID→印のマッピングを作成
  const getOtherMark = (prediction: Prediction, horseId: number): MarkType => {
    if (prediction.honmei === horseId) return 'honmei'
    if (prediction.taikou === horseId) return 'taikou'
    if (prediction.tanana === horseId) return 'tanana'
    if (prediction.renka.includes(horseId)) return 'renka'
    if (prediction.ana.includes(horseId)) return 'ana'
    return null
  }

  // 他者の買い情報から馬ID→買いタイプのマッピングを作成
  const getOtherBuyType = (prediction: Prediction, horseId: number): BuyType => {
    if (prediction.jiku.includes(horseId)) return 'jiku'
    if (prediction.osae.includes(horseId)) return 'osae'
    return null
  }

  const handleMarkSelect = (mark: MarkType) => {
    if (selectedHorse) {
      onMarkChange(selectedHorse.id, mark)  // 馬IDを渡す
    }
  }

  const handleBuySelect = (buyType: BuyType) => {
    if (selectedHorse) {
      onBuyChange(selectedHorse.id, buyType)  // 馬IDを渡す
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
              key={horse.id}
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
                  mark={getMyMark(horse.id)}
                  buyType={getMyBuyType(horse.id)}
                  isEditable={!horse.scratched}
                  isHighlighted
                  onClick={() => !horse.scratched && setSelectedHorse(horse)}
                  onBuyToggle={() => !horse.scratched && onBuyToggle(horse.id)}
                />
              </td>
              {otherPredictions.map((p) => (
                <td key={p.userId} className="px-1 py-1 border-r overflow-visible">
                  <MarkCell
                    mark={getOtherMark(p, horse.id)}
                    buyType={getOtherBuyType(p, horse.id)}
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
