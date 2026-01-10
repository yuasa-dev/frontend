import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VENUES = [
  '東京', '中山', '阪神', '京都', '中京', '小倉', '新潟', '福島', '札幌', '函館'
]

interface Horse {
  number: number
  name: string
}

export default function CreateRace() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [venue, setVenue] = useState('')
  const [raceNumber, setRaceNumber] = useState(11)
  const [horses, setHorses] = useState<Horse[]>([
    { number: 1, name: '' },
    { number: 2, name: '' },
    { number: 3, name: '' },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const addHorse = () => {
    const nextNumber = horses.length + 1
    setHorses([...horses, { number: nextNumber, name: '' }])
  }

  const removeHorse = (index: number) => {
    if (horses.length <= 1) return
    const newHorses = horses.filter((_, i) => i !== index)
    setHorses(newHorses.map((h, i) => ({ ...h, number: i + 1 })))
  }

  const updateHorseName = (index: number, horseName: string) => {
    const newHorses = [...horses]
    newHorses[index] = { ...newHorses[index], name: horseName }
    setHorses(newHorses)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const filledHorses = horses.filter(h => h.name.trim() !== '')
    if (filledHorses.length < 2) {
      setError('少なくとも2頭の馬を入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/races', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          date,
          venue,
          raceNumber,
          horses: filledHorses.map((h, i) => ({ number: i + 1, name: h.name })),
        }),
      })

      if (!res.ok) {
        throw new Error('レース作成に失敗しました')
      }

      const data = await res.json()
      navigate(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">レース作成</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              レース名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="例: 有馬記念"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開催日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                競馬場 <span className="text-red-500">*</span>
              </label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択</option>
                {VENUES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                レース番号 <span className="text-red-500">*</span>
              </label>
              <select
                value={raceNumber}
                onChange={(e) => setRaceNumber(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}R</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出走馬 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {horses.map((horse, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-8 text-center text-gray-500">{index + 1}</span>
                  <input
                    type="text"
                    value={horse.name}
                    onChange={(e) => updateHorseName(index, e.target.value)}
                    placeholder="馬名"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeHorse(index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addHorse}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              + 馬を追加
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? '作成中...' : 'レースを作成'}
          </button>
        </form>
      </div>
    </div>
  )
}
