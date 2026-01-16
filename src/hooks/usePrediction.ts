import { useState, useEffect, useCallback } from 'react'
import { useUser } from '../contexts/UserContext'
import { apiUrl } from '../config/api'
import { type MarkType } from '../components/prediction/MarkCell'

interface Horse {
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
  comment: string | null
}

interface MyPrediction {
  honmei: number | null
  taikou: number | null
  tanana: number | null
  renka: number[]
  ana: number[]
  jiku: number[]
  osae: number[]
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
        ? `/api/external-races/${raceId}/predictions?groupId=${groupId}`
        : `/api/external-races/${raceId}/predictions`

      const res = await fetch(apiUrl(url), {
        headers: { 'X-Token': token },
      })

      if (!res.ok) {
        throw new Error('予想情報の取得に失敗しました')
      }

      const data = await res.json()
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

  const handleMarkChange = (horseNumber: number, mark: MarkType) => {
    setMyPrediction((prev) => {
      const newPrediction = { ...prev }

      // まず該当馬番を全ての印から削除
      if (prev.honmei === horseNumber) newPrediction.honmei = null
      if (prev.taikou === horseNumber) newPrediction.taikou = null
      if (prev.tanana === horseNumber) newPrediction.tanana = null
      newPrediction.renka = prev.renka.filter((n) => n !== horseNumber)
      newPrediction.ana = prev.ana.filter((n) => n !== horseNumber)

      // 新しい印を設定
      if (mark === 'honmei') {
        newPrediction.honmei = horseNumber
      } else if (mark === 'taikou') {
        newPrediction.taikou = horseNumber
      } else if (mark === 'tanana') {
        newPrediction.tanana = horseNumber
      } else if (mark === 'renka') {
        newPrediction.renka = [...newPrediction.renka, horseNumber]
      } else if (mark === 'ana') {
        newPrediction.ana = [...newPrediction.ana, horseNumber]
      }

      return newPrediction
    })
    setIsDirty(true)
  }

  // 軸・抑えのトグル（軸→抑え→なし→軸...）
  const handleBuyToggle = (horseNumber: number) => {
    setMyPrediction((prev) => {
      const newPrediction = { ...prev }
      const isJiku = prev.jiku.includes(horseNumber)
      const isOsae = prev.osae.includes(horseNumber)

      // 現在の状態から次の状態へ遷移
      if (isJiku) {
        // 軸 → 抑え
        newPrediction.jiku = prev.jiku.filter((n) => n !== horseNumber)
        newPrediction.osae = [...prev.osae, horseNumber]
      } else if (isOsae) {
        // 抑え → なし
        newPrediction.osae = prev.osae.filter((n) => n !== horseNumber)
      } else {
        // なし → 軸
        newPrediction.jiku = [...prev.jiku, horseNumber]
      }

      return newPrediction
    })
    setIsDirty(true)
  }

  // 軸・抑えを直接設定
  type BuyType = 'jiku' | 'osae' | null
  const handleBuyChange = (horseNumber: number, buyType: BuyType) => {
    setMyPrediction((prev) => {
      const newPrediction = { ...prev }

      // まず該当馬番を両方から削除
      newPrediction.jiku = prev.jiku.filter((n) => n !== horseNumber)
      newPrediction.osae = prev.osae.filter((n) => n !== horseNumber)

      // 新しい状態を設定
      if (buyType === 'jiku') {
        newPrediction.jiku = [...newPrediction.jiku, horseNumber]
      } else if (buyType === 'osae') {
        newPrediction.osae = [...newPrediction.osae, horseNumber]
      }

      return newPrediction
    })
    setIsDirty(true)
  }

  const savePrediction = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const res = await fetch(apiUrl(`/api/external-races/${raceId}/predictions`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
        body: JSON.stringify({
          groupId: groupId || null,
          ...myPrediction,
        }),
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
