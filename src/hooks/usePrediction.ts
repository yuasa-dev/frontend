import { useState, useEffect, useCallback } from 'react'
import { useUser } from '../contexts/UserContext'
import { apiUrl } from '../config/api'
import { type MarkType } from '../components/prediction/MarkCell'

interface Horse {
  id: number  // 馬ID（予想の紐づけに使用）
  number: number
  name: string
  jockeyName: string | null
  scratched: boolean
}

interface RaceInfo {
  id: string
  externalId: string
  date: string
  venue: string
  raceNumber: number
  raceName: string
  postTime: string | null
  distance: number | null
  surface: string | null
  status: string
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
  comment: string | null
}

interface MyPrediction {
  honmei: number | null  // 馬ID
  taikou: number | null  // 馬ID
  tanana: number | null  // 馬ID
  renka: number[]        // 馬IDの配列
  ana: number[]          // 馬IDの配列
  jiku: number[]         // 馬IDの配列
  osae: number[]         // 馬IDの配列
}

export function usePrediction(raceId: string, groupId: string | null) {
  const { token } = useUser()
  const [race, setRace] = useState<RaceInfo | null>(null)
  const [horses, setHorses] = useState<Horse[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [myPrediction, setMyPrediction] = useState<MyPrediction>({
    honmei: null,
    taikou: null,
    tanana: null,
    renka: [],
    ana: [],
    jiku: [],
    osae: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const fetchPredictions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const url = groupId
        ? `/api/races/${raceId}/predictions?groupId=${groupId}`
        : `/api/races/${raceId}/predictions`

      const res = await fetch(apiUrl(url), {
        headers: { 'X-Token': token },
      })

      if (!res.ok) {
        throw new Error('予想情報の取得に失敗しました')
      }

      const data = await res.json()
      // デバッグ: APIレスポンスの内容を確認
      console.log('=== Fetch Predictions Debug ===')
      console.log('predictions:', data.predictions)
      const debugMine = data.predictions?.find((p: Prediction) => p.isMine)
      console.log('mine:', debugMine)
      console.log('mine.jiku:', debugMine?.jiku)
      console.log('mine.osae:', debugMine?.osae)

      setRace(data.race)
      setHorses(data.horses)
      // jiku, osaeがない場合のデフォルト値を設定
      const predictionsWithDefaults = data.predictions.map((p: Prediction) => ({
        ...p,
        jiku: p.jiku ?? [],
        osae: p.osae ?? [],
      }))
      setPredictions(predictionsWithDefaults)

      // 自分の予想を初期化
      const mine = predictionsWithDefaults.find((p: Prediction) => p.isMine)
      if (mine) {
        setMyPrediction({
          honmei: mine.honmei,
          taikou: mine.taikou,
          tanana: mine.tanana,
          renka: mine.renka ?? [],
          ana: mine.ana ?? [],
          jiku: mine.jiku ?? [],
          osae: mine.osae ?? [],
        })
      } else {
        setMyPrediction({
          honmei: null,
          taikou: null,
          tanana: null,
          renka: [],
          ana: [],
          jiku: [],
          osae: [],
        })
      }
      setIsDirty(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }, [raceId, groupId, token])

  useEffect(() => {
    fetchPredictions()
  }, [fetchPredictions])

  // 馬IDベースで印を変更
  const handleMarkChange = (horseId: number, mark: MarkType) => {
    setMyPrediction((prev) => {
      const newPrediction = { ...prev }

      // まず該当馬IDを全ての印から削除
      if (prev.honmei === horseId) newPrediction.honmei = null
      if (prev.taikou === horseId) newPrediction.taikou = null
      if (prev.tanana === horseId) newPrediction.tanana = null
      newPrediction.renka = prev.renka.filter((id) => id !== horseId)
      newPrediction.ana = prev.ana.filter((id) => id !== horseId)

      // 新しい印を設定
      if (mark === 'honmei') {
        newPrediction.honmei = horseId
      } else if (mark === 'taikou') {
        newPrediction.taikou = horseId
      } else if (mark === 'tanana') {
        newPrediction.tanana = horseId
      } else if (mark === 'renka') {
        newPrediction.renka = [...newPrediction.renka, horseId]
      } else if (mark === 'ana') {
        newPrediction.ana = [...newPrediction.ana, horseId]
      }

      return newPrediction
    })
    setIsDirty(true)
  }

  // 軸・抑えのトグル（軸→抑え→なし→軸...）馬IDベース
  const handleBuyToggle = (horseId: number) => {
    setMyPrediction((prev) => {
      const newPrediction = { ...prev }
      const isJiku = prev.jiku.includes(horseId)
      const isOsae = prev.osae.includes(horseId)

      // 現在の状態から次の状態へ遷移
      if (isJiku) {
        // 軸 → 抑え
        newPrediction.jiku = prev.jiku.filter((id) => id !== horseId)
        newPrediction.osae = [...prev.osae, horseId]
      } else if (isOsae) {
        // 抑え → なし
        newPrediction.osae = prev.osae.filter((id) => id !== horseId)
      } else {
        // なし → 軸
        newPrediction.jiku = [...prev.jiku, horseId]
      }

      return newPrediction
    })
    setIsDirty(true)
  }

  // 軸・抑えを直接設定（馬IDベース）
  type BuyType = 'jiku' | 'osae' | null
  const handleBuyChange = (horseId: number, buyType: BuyType) => {
    setMyPrediction((prev) => {
      const newPrediction = { ...prev }

      // まず該当馬IDを両方から削除
      newPrediction.jiku = prev.jiku.filter((id) => id !== horseId)
      newPrediction.osae = prev.osae.filter((id) => id !== horseId)

      // 新しい状態を設定
      if (buyType === 'jiku') {
        newPrediction.jiku = [...newPrediction.jiku, horseId]
      } else if (buyType === 'osae') {
        newPrediction.osae = [...newPrediction.osae, horseId]
      }

      return newPrediction
    })
    setIsDirty(true)
  }

  const savePrediction = async () => {
    setIsSaving(true)
    setError(null)

    try {
      // デバッグ: 送信データを確認
      const sendData = {
        groupId: groupId || null,
        ...myPrediction,
      }
      console.log('=== Save Prediction Debug ===')
      console.log('sendData:', sendData)
      console.log('sendData.jiku:', sendData.jiku)
      console.log('sendData.osae:', sendData.osae)

      const res = await fetch(apiUrl(`/api/races/${raceId}/predictions`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
        body: JSON.stringify(sendData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '予想の保存に失敗しました')
      }

      setIsDirty(false)
      await fetchPredictions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    race,
    horses,
    predictions,
    myPrediction,
    isLoading,
    isSaving,
    error,
    isDirty,
    handleMarkChange,
    handleBuyToggle,
    handleBuyChange,
    savePrediction,
    refetch: fetchPredictions,
  }
}
