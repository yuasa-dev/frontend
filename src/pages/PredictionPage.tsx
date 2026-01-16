import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import PredictionTable from '../components/prediction/PredictionTable'
import GroupSelector from '../components/common/GroupSelector'
import { usePrediction } from '../hooks/usePrediction'
import { useGroups } from '../hooks/useGroups'

export default function PredictionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const groupId = searchParams.get('groupId')

  const [showGroupSelector, setShowGroupSelector] = useState(false)
  const { groups } = useGroups()

  const {
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
  } = usePrediction(id || '', groupId)

  const selectedGroup = groupId ? groups.find((g) => g.id === groupId) : null

  const handleGroupChange = (newGroupId: string | null) => {
    if (newGroupId) {
      setSearchParams({ groupId: newGroupId })
    } else {
      setSearchParams({})
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!race) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">レースが見つかりません</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-800 truncate">
              {race.venue} {race.raceNumber}R {race.raceName}
            </h1>
            <p className="text-xs text-gray-500">
              {race.surface} {race.distance}m
              {race.postTime && ` ${race.postTime}発走`}
            </p>
          </div>

          <button
            onClick={() => setShowGroupSelector(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <span className="text-gray-600">
              {selectedGroup?.name || '個人'}
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <PredictionTable
            horses={horses}
            predictions={predictions}
            myPrediction={myPrediction}
            onMarkChange={handleMarkChange}
            onBuyToggle={handleBuyToggle}
            onBuyChange={handleBuyChange}
          />
        </div>

        {/* 保存ボタン */}
        <div className="mt-4 sticky bottom-4">
          <button
            onClick={savePrediction}
            disabled={isSaving || !isDirty}
            className={`
              w-full py-4 rounded-lg font-bold text-lg transition-colors shadow-lg
              ${isDirty
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isSaving ? '保存中...' : isDirty ? '登録 / 更新' : '変更なし'}
          </button>
        </div>
      </main>

      <GroupSelector
        groups={groups}
        selectedGroupId={groupId}
        onSelect={handleGroupChange}
        isOpen={showGroupSelector}
        onClose={() => setShowGroupSelector(false)}
      />
    </div>
  )
}
