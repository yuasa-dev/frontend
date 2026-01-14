import { useState, useEffect, useCallback } from 'react'
import { useUser } from '../contexts/UserContext'
import { apiUrl } from '../config/api'

interface Group {
  id: string
  name: string
  inviteCode: string
  memberCount: number
  isOwner: boolean
  joinedAt: string
}

export function useGroups() {
  const { token } = useUser()
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(apiUrl('/api/groups'), {
        headers: { 'X-Token': token },
      })

      if (!res.ok) {
        throw new Error('グループの取得に失敗しました')
      }

      const data = await res.json()
      setGroups(data.groups)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const createGroup = async (name: string) => {
    const res = await fetch(apiUrl('/api/groups'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Token': token,
      },
      body: JSON.stringify({ name }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'グループの作成に失敗しました')
    }

    await fetchGroups()
  }

  const joinGroup = async (inviteCode: string) => {
    const res = await fetch(apiUrl('/api/groups/join'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Token': token,
      },
      body: JSON.stringify({ inviteCode }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'グループへの参加に失敗しました')
    }

    await fetchGroups()
  }

  const leaveGroup = async (groupId: string) => {
    const res = await fetch(apiUrl(`/api/groups/${groupId}/leave`), {
      method: 'DELETE',
      headers: { 'X-Token': token },
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'グループからの脱退に失敗しました')
    }

    await fetchGroups()
  }

  return {
    groups,
    isLoading,
    error,
    createGroup,
    joinGroup,
    leaveGroup,
    refetch: fetchGroups,
  }
}
