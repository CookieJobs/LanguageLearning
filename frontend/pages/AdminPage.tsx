// input: react, lucide-react, ../services/adminService, ../types, ../contexts/AppContext
// output: AdminPage
// pos: 前端/页面层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React, { useEffect, useState } from 'react'
import { Users, BookOpen, Flame, TrendingUp, Calendar, Activity, ChevronDown, ChevronRight, Shield, RefreshCw, AlertTriangle } from 'lucide-react'
import {
  fetchAdminDashboard, fetchAdminUsers, fetchAdminUserDetail, setAdminRole,
  AdminDashboard, AdminUser, AdminUserDetail
} from '../services/adminService'
import { useApp } from '../contexts/AppContext'

type Tab = 'overview' | 'users' | 'detail'

export const AdminPage: React.FC = () => {
  const { isAdmin, meLoaded } = useApp()
  const [tab, setTab] = useState<Tab>('overview')
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try { setDashboard(await fetchAdminDashboard()) } catch (e) { console.error(e) }
    setLoading(false)
  }

  const loadUsers = async () => {
    setLoading(true)
    try { setUsers(await fetchAdminUsers()); setTab('users') } catch (e) { console.error(e) }
    setLoading(false)
  }

  const loadUserDetail = async (id: string) => {
    setLoading(true)
    try {
      const detail = await fetchAdminUserDetail(id)
      setSelectedUser(detail)
      setTab('detail')
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const toggleAdmin = async (id: string, isAdmin: boolean) => {
    await setAdminRole(id, !isAdmin)
    loadUsers()
  }

  const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; sub?: string }> = ({ icon, label, value, sub }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">{icon}{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { loadDashboard(); setTab('overview') }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${tab === 'overview' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              概览
            </button>
            <button onClick={loadUsers}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${tab === 'users' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              用户列表
            </button>
            {selectedUser && (
              <button onClick={() => setTab('detail')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${tab === 'detail' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                {selectedUser.email}
              </button>
            )}
            <button onClick={() => { loadDashboard(); setTab('overview') }}
              className="ml-2 p-2 rounded-lg hover:bg-gray-100 text-gray-400" title="刷新">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {meLoaded && !isAdmin ? (
        <div className="max-w-xl mx-auto mt-20 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">无权访问</h2>
          <p className="text-gray-500">此页面仅限管理员查看。如需权限，请联系管理员。</p>
        </div>
      ) : (

      <div className="max-w-7xl mx-auto p-6">
        {loading && !dashboard && !users.length && (
          <div className="flex items-center justify-center py-20 text-gray-400">加载中...</div>
        )}

        {/* Overview Tab */}
        {tab === 'overview' && dashboard && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<Users className="w-4 h-4" />} label="总注册用户" value={dashboard.totalUsers}
                sub={`本周 +${dashboard.newUsersThisWeek} · 本月 +${dashboard.newUsersThisMonth}`} />
              <StatCard icon={<BookOpen className="w-4 h-4" />} label="词库总量" value={dashboard.totalVocabWords} />
              <StatCard icon={<Activity className="w-4 h-4" />} label="今日活跃" value={dashboard.activeToday}
                sub={`本周 ${dashboard.activeThisWeek} · 本月 ${dashboard.activeThisMonth}`} />
              <StatCard icon={<Flame className="w-4 h-4" />} label="平均连续打卡" value={`${dashboard.avgStreak} 天`}
                sub={`最长 ${dashboard.longestStreak} 天`} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<TrendingUp className="w-4 h-4" />} label="学习中用户" value={dashboard.usersLearning} />
              <StatCard icon={<TrendingUp className="w-4 h-4" />} label="已掌握≥1词用户" value={dashboard.usersMastered} />
              <StatCard icon={<BookOpen className="w-4 h-4" />} label="累计掌握记录" value={dashboard.totalMasteredRecords} />
              <StatCard icon={<Calendar className="w-4 h-4" />} label="转化率" value={`${dashboard.totalUsers > 0 ? Math.round(dashboard.usersLearning / dashboard.totalUsers * 100) : 0}%`}
                sub="有学习行为的用户占比" />
            </div>

            {/* Level Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">各学段用户分布</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(dashboard.usersByLevel).sort(([,a], [,b]) => b - a).map(([level, count]) => (
                  <div key={level} className="text-center p-3 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-indigo-600">{count}</div>
                    <div className="text-xs text-gray-500 mt-1">{level === 'unset' ? '未设置' : level}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">全局学习阶段分布</h3>
              <div className="flex gap-4">
                {[
                  { key: 'stage0', label: '新词 (0)', color: 'bg-gray-200' },
                  { key: 'stage1', label: '熟悉 (1)', color: 'bg-yellow-400' },
                  { key: 'stage2', label: '熟练 (2)', color: 'bg-blue-400' },
                  { key: 'stage3', label: '掌握 (3)', color: 'bg-green-500' }
                ].map(s => {
                  const count = (dashboard.stageDistribution as any)[s.key] || 0
                  const total = Object.values(dashboard.stageDistribution).reduce((a: number, b: unknown) => a + (b as number), 0) || 1
                  return (
                    <div key={s.key} className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">{s.label}: <strong>{count}</strong></div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} rounded-full transition-all`}
                          style={{ width: `${Math.round(count / total * 100)}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">🏆 掌握单词最多 TOP 10</h3>
              <div className="space-y-2">
                {dashboard.topUsers.map((u, i) => (
                  <div key={u.userId} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => loadUserDetail(u.userId)}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-6">{i + 1}</span>
                      <span className="text-sm text-gray-700">{u.userId.slice(0, 12)}...</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-indigo-600 font-medium">掌握 {u.totalMastered} 词</span>
                      <span className="text-orange-500">🔥 {u.currentStreak} 天</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                ))}
                {dashboard.topUsers.length === 0 && (
                  <div className="text-center text-gray-400 py-4">暂无数据</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">全部用户 ({users.length})</h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">用户</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">学段</th>
                      <th className="text-center px-4 py-3 text-gray-600 font-medium">已学 / 掌握</th>
                      <th className="text-center px-4 py-3 text-gray-600 font-medium">阶段分布</th>
                      <th className="text-center px-4 py-3 text-gray-600 font-medium">连续打卡</th>
                      <th className="text-center px-4 py-3 text-gray-600 font-medium">注册时间</th>
                      <th className="text-center px-4 py-3 text-gray-600 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <React.Fragment key={u.id}>
                        <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{u.email}</div>
                            <div className="text-xs text-gray-400">{u.id.slice(0, 16)}...</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{u.educationLevel === 'unset' ? '—' : u.educationLevel}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-medium text-indigo-600">{u.wordsTotal}</span>
                            <span className="text-gray-400"> / </span>
                            <span className="font-medium text-green-600">{u.totalMastered}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-center">
                              {u.wordsTotal > 0 ? (
                                <>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100" title="新词">0:{u.wordsStage0}</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100" title="熟悉">1:{u.wordsStage1}</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100" title="熟练">2:{u.wordsStage2}</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-100" title="掌握">3:{u.wordsStage3}</span>
                                </>
                              ) : <span className="text-gray-400">—</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {u.currentStreak > 0 ? (
                              <span className="text-orange-500 font-medium">🔥 {u.currentStreak} 天</span>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('zh-CN') : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={(e) => { e.stopPropagation(); loadUserDetail(u.id) }}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                详情
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); toggleAdmin(u.id, u.isAdmin) }}
                                className={`text-xs px-2 py-0.5 rounded font-medium ${
                                  u.isAdmin ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>
                                {u.isAdmin ? '取消管理' : '设管理'}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedUser === u.id && (
                          <tr key={`${u.id}-exp`}>
                            <td colSpan={7} className="px-4 py-3 bg-gray-50">
                              <div className="text-xs text-gray-500 space-y-1">
                                <div>ID: {u.id}</div>
                                <div>教材: {u.textbook || '—'}</div>
                                <div>最长连续打卡: {u.longestStreak} 天</div>
                                <div>最后活跃: {u.lastActive ? new Date(u.lastActive).toLocaleString('zh-CN') : '—'}</div>
                                <div>管理员: {u.isAdmin ? '是' : '否'}</div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Detail Tab */}
        {tab === 'detail' && selectedUser && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedUser.email}</h2>
                  <div className="text-sm text-gray-500 mt-1">
                    学段: {selectedUser.educationLevel} · 教材: {selectedUser.textbook || '—'} · 
                    注册: {new Date(selectedUser.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{selectedUser.currentStreak}</div>
                    <div className="text-xs text-gray-400">连续打卡</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedUser.totalMastered}</div>
                    <div className="text-xs text-gray-400">累计掌握</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{selectedUser.activeDays}</div>
                    <div className="text-xs text-gray-400">活跃天数</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Word Progress */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-900">
                单词学习进度 ({selectedUser.words.length} 词)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">单词</th>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">释义</th>
                      <th className="text-center px-4 py-2 text-gray-600 font-medium">阶段</th>
                      <th className="text-center px-4 py-2 text-gray-600 font-medium">正确</th>
                      <th className="text-center px-4 py-2 text-gray-600 font-medium">错误</th>
                      <th className="text-center px-4 py-2 text-gray-600 font-medium">曝光</th>
                      <th className="text-center px-4 py-2 text-gray-600 font-medium">连对</th>
                      <th className="text-center px-4 py-2 text-gray-600 font-medium">上次练习</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedUser.words.map(w => (
                      <tr key={w.wordId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">{w.word}</td>
                        <td className="px-4 py-2 text-gray-600">{w.definition}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            w.stage === 0 ? 'bg-gray-100 text-gray-600' :
                            w.stage === 1 ? 'bg-yellow-100 text-yellow-700' :
                            w.stage === 2 ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>{w.stage}</span>
                        </td>
                        <td className="px-4 py-2 text-center text-green-600">{w.correctCount}</td>
                        <td className="px-4 py-2 text-center text-red-500">{w.wrongCount}</td>
                        <td className="px-4 py-2 text-center text-gray-500">{w.exposureCount}</td>
                        <td className="px-4 py-2 text-center text-gray-500">{w.consecutiveCorrect}</td>
                        <td className="px-4 py-2 text-center text-xs text-gray-400">
                          {new Date(w.lastPracticedAt).toLocaleDateString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mastered List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-900">
                已掌握词汇 ({selectedUser.masteredList.length})
              </div>
              <div className="p-4">
                {selectedUser.masteredList.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">暂无掌握词汇</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.masteredList.map((m, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm"
                        title={`${m.definition} · ${m.partOfSpeech} · ${new Date(m.masteredAt).toLocaleDateString('zh-CN')}`}>
                        {m.word}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  )
}
