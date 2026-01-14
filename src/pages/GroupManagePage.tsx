import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GroupList from '../components/group/GroupList'
import JoinGroupModal from '../components/group/JoinGroupModal'
import { useGroups } from '../hooks/useGroups'

export default function GroupManagePage() {
  const navigate = useNavigate()
  const { groups, isLoading, createGroup, joinGroup, leaveGroup } = useGroups()

  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) {
      setCreateError('グループ名を入力してください')
      return
    }

    setIsCreating(true)
    setCreateError('')

    try {
      await createGroup(newGroupName.trim())
      setShowCreateModal(false)
      setNewGroupName('')
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '作成に失敗しました')
    } finally {
      setIsCreating(false)
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm('本当にこのグループから脱退しますか？')) return

    try {
      await leaveGroup(groupId)
    } catch (err) {
      alert(err instanceof Error ? err.message : '脱退に失敗しました')
    }
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

          <h1 className="font-bold text-gray-800">グループ管理</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">所属グループ</h2>
          <GroupList
            groups={groups}
            isLoading={isLoading}
            onLeaveGroup={handleLeaveGroup}
          />
        </div>

        <hr className="my-6 border-gray-200" />

        <div className="space-y-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            グループを作成
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            招待コードで参加
          </button>
        </div>
      </main>

      {/* 招待コードモーダル */}
      <JoinGroupModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={joinGroup}
      />

      {/* グループ作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              グループを作成
            </h2>

            <form onSubmit={handleCreateGroup}>
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                  グループ名
                </label>
                <input
                  id="groupName"
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="例: 競馬仲間"
                  maxLength={30}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {createError && (
                <p className="mt-2 text-sm text-red-500">{createError}</p>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewGroupName('')
                    setCreateError('')
                  }}
                  className="flex-1 py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {isCreating ? '作成中...' : '作成する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
