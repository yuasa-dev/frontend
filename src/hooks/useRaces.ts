import { useState, useEffect, useCallback, useRef } from 'react'
import { useUser } from '../contexts/UserContext'
import { apiUrl } from '../config/api'

interface Race {
  id: string
  externalId: string
  raceNumber: number
  raceName: string
  postTime: string | null
  distance: number | null
  surface: string | null
  status: string
  horseCount: number
  hasPrediction?: boolean
}

interface Venue {
  venue: string
  races: Race[]
}

interface FetchStatus {
  canFetch: boolean
  lastFetchTime: string | null
  nextAvailableTime: string | null
  retryAfterSeconds: number
}

export function useRaces(date: Date, _groupId: string | null) {
  const { token } = useUser()
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>({
    canFetch: true,
    lastFetchTime: null,
    nextAvailableTime: null,
    retryAfterSeconds: 0,
  })
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const dateStr = date.toISOString().split('T')[0]

  // カウントダウンタイマー
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            setFetchStatus((s) => ({ ...s, canFetch: true }))
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [remainingSeconds])

  // 更新状態を取得
  const fetchFetchStatus = useCallback(async () => {
    try {
      const res = await fetch(apiUrl(`/api/races/fetch-status?date=${dateStr}`), {
        headers: { 'X-Token': token },
      })

      if (res.ok) {
        const data = await res.json()
        setFetchStatus({
          canFetch: data.canFetch,
          lastFetchTime: data.lastFetchTime,
          nextAvailableTime: data.nextAvailableTime,
          retryAfterSeconds: data.retryAfterSeconds,
        })
        if (!data.canFetch && data.retryAfterSeconds > 0) {
          setRemainingSeconds(data.retryAfterSeconds)
        }
      }
    } catch {
      // ステータス取得失敗は無視
    }
  }, [dateStr, token])

  const fetchRaces = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(apiUrl(`/api/external-races?date=${dateStr}`), {
        headers: { 'X-Token': token },
      })

      if (!res.ok) {
        throw new Error('レース情報の取得に失敗しました')
      }

      const data = await res.json()
      setVenues(data.venues || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }, [dateStr, token])

  useEffect(() => {
    fetchRaces()
    fetchFetchStatus()
  }, [fetchRaces, fetchFetchStatus])

  const fetchRaceData = async () => {
    setIsFetching(true)
    setError(null)

    try {
      const res = await fetch(apiUrl('/api/external-races/fetch'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
        body: JSON.stringify({ date: dateStr }),
      })

      const data = await res.json()

      if (res.status === 429) {
        // レート制限エラー
        setFetchStatus({
          canFetch: false,
          lastFetchTime: data.lastFetchTime,
          nextAvailableTime: data.nextAvailableTime,
          retryAfterSeconds: data.retryAfterSeconds,
        })
        setRemainingSeconds(data.retryAfterSeconds)
        setError(data.error)
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'レース情報の取得に失敗しました')
      }

      // 成功時：更新状態を更新
      setFetchStatus({
        canFetch: false,
        lastFetchTime: data.lastFetchTime,
        nextAvailableTime: null,
        retryAfterSeconds: 600, // 10分
      })
      setRemainingSeconds(600)

      await fetchRaces()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsFetching(false)
    }
  }

  return {
    venues,
    isLoading,
    isFetching,
    error,
    refetch: fetchRaces,
    fetchRaceData,
    fetchStatus,
    remainingSeconds,
  }
}
