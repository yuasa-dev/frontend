import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { nanoid } from 'nanoid'
import { apiUrl } from '../config/api'

interface User {
  id: string
  nickname: string
}

interface UserContextType {
  user: User | null
  token: string
  isLoading: boolean
  register: (nickname: string) => Promise<void>
  updateNickname: (nickname: string) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const TOKEN_KEY = 'keiba-token'

function getOrCreateToken(): string {
  let token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    token = nanoid()
    localStorage.setItem(TOKEN_KEY, token)
  }
  return token
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token] = useState<string>(getOrCreateToken)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(apiUrl('/api/users/me'), {
          headers: { 'X-Token': token },
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [token])

  const register = async (nickname: string) => {
    const res = await fetch(apiUrl('/api/users/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Token': token,
      },
      body: JSON.stringify({ nickname }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || '登録に失敗しました')
    }

    const data = await res.json()
    setUser(data)
  }

  const updateNickname = async (nickname: string) => {
    const res = await fetch(apiUrl('/api/users/me'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Token': token,
      },
      body: JSON.stringify({ nickname }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || '更新に失敗しました')
    }

    const data = await res.json()
    setUser(data)
  }

  return (
    <UserContext.Provider value={{ user, token, isLoading, register, updateNickname }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
