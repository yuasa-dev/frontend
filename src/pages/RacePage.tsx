import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { nanoid } from 'nanoid'

interface Horse {
  id: number
  number: number
  name: string
}

interface Prediction {
  nickname: string
  honmei: { number: number; name: string }
  taikou: { number: number; name: string }
  tanana: { number: number; name: string }
  renka: { number: number; name: string }
  comment: string | null
  isMine: boolean
}

interface RaceData {
  id: string
  name: string
  date: string
  venue: string
  raceNumber: number
  horses: Horse[]
  predictions: Prediction[]
}

const VENUES = [
  '東京', '中山', '阪神', '京都', '中京', '小倉', '新潟', '福島', '札幌', '函館'
]

function getToken(): string {
  let token = localStorage.getItem('keiba-token')
  if (!token) {
    token = nanoid()
    localStorage.setItem('keiba-token', token)
  }
  return token
}

function getMark(horse: Horse, prediction: Prediction): string {
  if (prediction.honmei.number === horse.number) return '◎'
  if (prediction.taikou.number === horse.number) return '○'
  if (prediction.tanana.number === horse.number) return '▲'
  if (prediction.renka.number === horse.number) return '△'
  return ''
}

export default function RacePage() {
  const { id } = useParams<{ id: string }>()
  const [race, setRace] = useState<RaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [nickname, setNickname] = useState('')
  const [honmeiId, setHonmeiId] = useState<number | ''>('')
  const [taikouId, setTaikouId] = useState<number | ''>('')
  const [tananaId, setTananaId] = useState<number | ''>('')
  const [renkaId, setRenkaId] = useState<number | ''>('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [copied, setCopied] = useState(false)

  // 編集モーダル用
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editVenue, setEditVenue] = useState('')
  const [editRaceNumber, setEditRaceNumber] = useState(11)
  const [editHorses, setEditHorses] = useState<{ id?: number; number: number; name: string }[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [editError, setEditError] = useState('')

  const token = getToken()

  const fetchRace = async () => {
    try {
      const res = await fetch(`/api/races/${id}`, {
        headers: { 'X-Token': token },
      })
      if (!res.ok) {
        throw new Error('レースが見つかりません')
      }
      const data = await res.json()
      setRace(data)

      // 自分の予想があれば入力フォームにセット
      const myPrediction = data.predictions.find((p: Prediction) => p.isMine)
      if (myPrediction) {
        setNickname(myPrediction.nickname)
        const honmei = data.horses.find((h: Horse) => h.number === myPrediction.honmei.number)
        const taikou = data.horses.find((h: Horse) => h.number === myPrediction.taikou.number)
        const tanana = data.horses.find((h: Horse) => h.number === myPrediction.tanana.number)
        const renka = data.horses.find((h: Horse) => h.number === myPrediction.renka.number)
        if (honmei) setHonmeiId(honmei.id)
        if (taikou) setTaikouId(taikou.id)
        if (tanana) setTananaId(tanana.id)
        if (renka) setRenkaId(renka.id)
        setComment(myPrediction.comment || '')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRace()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!nickname || !honmeiId || !taikouId || !tananaId || !renkaId) {
      setSubmitError('すべての項目を入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/races/${id}/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
        body: JSON.stringify({
          nickname,
          honmeiId,
          taikouId,
          tananaId,
          renkaId,
          comment: comment || null,
        }),
      })

      if (!res.ok) {
        throw new Error('予想の登録に失敗しました')
      }

      await fetchRace()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openEditModal = () => {
    if (!race) return
    setEditName(race.name)
    setEditDate(race.date)
    setEditVenue(race.venue)
    setEditRaceNumber(race.raceNumber)
    setEditHorses(race.horses.map(h => ({ id: h.id, number: h.number, name: h.name })))
    setEditError('')
    setIsEditModalOpen(true)
  }

  const addEditHorse = () => {
    const nextNumber = editHorses.length + 1
    setEditHorses([...editHorses, { number: nextNumber, name: '' }])
  }

  const removeEditHorse = (index: number) => {
    if (editHorses.length <= 1) return
    const newHorses = editHorses.filter((_, i) => i !== index)
    setEditHorses(newHorses.map((h, i) => ({ ...h, number: i + 1 })))
  }

  const updateEditHorseName = (index: number, name: string) => {
    const newHorses = [...editHorses]
    newHorses[index] = { ...newHorses[index], name }
    setEditHorses(newHorses)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError('')

    const filledHorses = editHorses.filter(h => h.name.trim() !== '')
    if (filledHorses.length < 2) {
      setEditError('少なくとも2頭の馬を入力してください')
      return
    }

    setIsUpdating(true)
    try {
      const res = await fetch(`/api/races/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          date: editDate,
          venue: editVenue,
          raceNumber: editRaceNumber,
          horses: filledHorses.map((h, i) => ({ id: h.id, number: i + 1, name: h.name })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'レース情報の更新に失敗しました')
      }

      setIsEditModalOpen(false)
      await fetchRace()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (error || !race) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || 'レースが見つかりません'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        {/* レース情報ヘッダー */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{race.name}</h1>
              <p className="text-gray-600 text-sm">
                {race.date} {race.venue} {race.raceNumber}R
              </p>
            </div>
            <button
              onClick={openEditModal}
              className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded"
            >
              編集
            </button>
          </div>
          <button
            onClick={copyUrl}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {copied ? 'コピーしました!' : 'URLをコピー'}
          </button>
        </div>

        {/* 予想一覧（調整さん風） */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">予想一覧</h2>
          {race.predictions.length === 0 ? (
            <p className="text-gray-500 text-sm">まだ予想がありません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-2 bg-gray-50 sticky left-0 min-w-24">馬番</th>
                    <th className="text-left py-2 px-2 bg-gray-50 min-w-32">馬名</th>
                    {race.predictions.map((p, i) => (
                      <th
                        key={i}
                        className={`text-center py-2 px-2 min-w-16 ${p.isMine ? 'bg-yellow-50' : ''}`}
                      >
                        {p.nickname}
                        {p.isMine && <span className="text-yellow-600 ml-1">★</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {race.horses.map((horse) => (
                    <tr key={horse.id} className="border-b">
                      <td className="py-2 px-2 font-medium bg-gray-50 sticky left-0">{horse.number}</td>
                      <td className="py-2 px-2 bg-gray-50">{horse.name}</td>
                      {race.predictions.map((p, i) => {
                        const mark = getMark(horse, p)
                        return (
                          <td
                            key={i}
                            className={`text-center py-2 px-2 text-lg font-bold ${p.isMine ? 'bg-yellow-50' : ''} ${
                              mark === '◎' ? 'text-red-600' :
                              mark === '○' ? 'text-blue-600' :
                              mark === '▲' ? 'text-green-600' :
                              mark === '△' ? 'text-purple-600' : ''
                            }`}
                          >
                            {mark}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 予想入力フォーム */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">予想を入力</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ニックネーム
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                placeholder="名前を入力"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-600 font-bold">◎</span> 本命
                </label>
                <select
                  value={honmeiId}
                  onChange={(e) => setHonmeiId(Number(e.target.value) || '')}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択</option>
                  {race.horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.number}. {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-blue-600 font-bold">○</span> 対抗
                </label>
                <select
                  value={taikouId}
                  onChange={(e) => setTaikouId(Number(e.target.value) || '')}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択</option>
                  {race.horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.number}. {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-green-600 font-bold">▲</span> 単穴
                </label>
                <select
                  value={tananaId}
                  onChange={(e) => setTananaId(Number(e.target.value) || '')}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択</option>
                  {race.horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.number}. {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-purple-600 font-bold">△</span> 連下
                </label>
                <select
                  value={renkaId}
                  onChange={(e) => setRenkaId(Number(e.target.value) || '')}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択</option>
                  {race.horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.number}. {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                コメント（任意）
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="一言コメント"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {submitError && (
              <div className="text-red-600 text-sm">{submitError}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? '送信中...' : '予想を送信'}
            </button>
          </form>
        </div>
      </div>

      {/* 編集モーダル */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">レース情報を編集</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  レース名
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開催日
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    競馬場
                  </label>
                  <select
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
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
                    レース番号
                  </label>
                  <select
                    value={editRaceNumber}
                    onChange={(e) => setEditRaceNumber(Number(e.target.value))}
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
                  出走馬
                </label>
                <div className="space-y-2">
                  {editHorses.map((horse, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-8 text-center text-gray-500">{index + 1}</span>
                      <input
                        type="text"
                        value={horse.name}
                        onChange={(e) => updateEditHorseName(index, e.target.value)}
                        placeholder="馬名"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeEditHorse(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addEditHorse}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  + 馬を追加
                </button>
              </div>

              {editError && (
                <div className="text-red-600 text-sm">{editError}</div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isUpdating ? '更新中...' : '更新'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
