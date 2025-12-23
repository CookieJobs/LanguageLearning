// input: react, ./Logo, lucide-react, ../services/config
// output: Auth
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React, { useState } from 'react'
import { Logo } from './Logo'
import { ArrowRight, Loader2 } from 'lucide-react'
import { API_BASE } from '../services/config'

interface AuthProps {
  onAuthed: (token: string) => void
}

export const Auth: React.FC<AuthProps> = ({ onAuthed }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')

  const submit = async () => {
    if (isLoading) return
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/${mode === 'login' ? 'auth/login' : 'auth/register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      let data: any = null
      try { data = await res.json() } catch { }
      if (!res.ok || !data?.accessToken) {
        const msg = toReadableError(res.status, data)
        setError(msg)
        return
      }
      localStorage.setItem('linguaCraft_token', data.accessToken)
      if (data.refreshToken) localStorage.setItem('linguaCraft_refresh', data.refreshToken)
      onAuthed(data.accessToken)
    } catch (e: any) {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  function toReadableError(status: number, data: any): string {
    const code = String(data?.message || data?.error || '').toLowerCase()
    if (status === 401 || status === 403) return '登录已过期或没有权限'
    if (code.includes('email_exists')) return '该邮箱已注册，请直接登录'
    if (code.includes('invalid_credentials')) return '邮箱或密码不正确'
    if (status >= 500) return '服务器繁忙，请稍后再试'
    return '请求失败，请稍后再试'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-[2rem] p-8 shadow-2xl shadow-brand-500/10">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              {mode === 'login' ? '欢迎回来' : '创建新账户'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              {mode === 'login' ? '请输入您的账号信息' : '开启您的语言学习之旅'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">邮箱</label>
                <input
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                      e.preventDefault(); e.currentTarget.select();
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">密码</label>
                <input
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                      e.preventDefault(); e.currentTarget.select();
                    }
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold flex items-center justify-center border border-red-100 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl py-3.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>处理中...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? '登录' : '注册'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors"
            >
              {mode === 'login' ? "还没有账号？去注册" : "已有账号？去登录"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-400 font-medium">
        &copy; {new Date().getFullYear()} LinguaCraft AI.
      </div>
    </div>
  )
}
