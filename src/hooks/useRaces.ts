import { useState, useEffect, useCallback } from 'react'
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

export function useRaces(date: Date, _groupId: string | null) {
  const { token } = useUser()
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dateStr = date.toISOString().split('T')[0]

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
  }, [fetchRaces])

  const fetchRaceData = async () => {
    setIsLoading(true)
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

      if (!res.ok) {
        throw new Error('レース情報の取得に失敗しました')
      }

      await fetchRaces()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setIsLoading(false)
    }
  }

  return {
    venues,
    isLoading,
    error,
    refetch: fetchRaces,
    fetchRaceData,
  }
}
