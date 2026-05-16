import React, { useState, useRef, useEffect } from 'react'
import { Logo } from './Logo'
import { Button } from './Button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { API_BASE } from '../services/config'

interface AuthProps {
  onAuthed: (token: string) => void
}

export const Auth: React.FC<AuthProps> = ({ onAuthed }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login')
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [resetStep, setResetStep] = useState<'email' | 'code'>('email')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const startCooldown = () => {
    setCooldown(60)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const sendCode = async () => {
    if (isLoading || cooldown > 0) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const endpoint = mode === 'forgot-password' ? 'auth/forgot-password' : 'auth/send-code'
      const res = await fetch(`${API_BASE}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = String(data?.message || '')
        if (msg.includes('cooldown')) { setError('发送太频繁，请60秒后再试'); return }
        setError('发送失败，请稍后重试')
        return
      }
      startCooldown()
      if (mode === 'forgot-password') setResetStep('code')
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const submitResetPassword = async () => {
    if (isLoading) return
    if (!code || code.length !== 6) { setError('请输入6位验证码'); return }
    if (!password || password.length < 6) { setError('新密码至少6位'); return }
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.accessToken) {
        setError(toReadableError(res.status, data))
        return
      }
      localStorage.setItem('linguaCraft_token', data.accessToken)
      if (data.refreshToken) localStorage.setItem('linguaCraft_refresh', data.refreshToken)
      onAuthed(data.accessToken)
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const submit = async () => {
    if (isLoading) return
    setIsLoading(true)
    setError('')
    try {
      const endpoint = mode === 'login' ? 'auth/login' : 'auth/register'
      const body = mode === 'login'
        ? JSON.stringify({ email, password })
        : JSON.stringify({ email, password, code })
      const res = await fetch(`${API_BASE}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      })
      let data: any = null
      try { data = await res.json() } catch { }
      if (!res.ok || !data?.accessToken) {
        setError(toReadableError(res.status, data))
        return
      }
      localStorage.setItem('linguaCraft_token', data.accessToken)
      if (data.refreshToken) localStorage.setItem('linguaCraft_refresh', data.refreshToken)
      onAuthed(data.accessToken)
    } catch {
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
    if (code.includes('code_cooldown')) return '发送太频繁，请60秒后再试'
    if (code.includes('code_expired')) return '验证码已过期，请重新获取'
    if (code.includes('code_mismatch')) return '验证码不正确'
    if (status >= 500) return '服务器繁忙，请稍后再试'
    return '请求失败，请稍后再试'
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
    setCode('')
  }

  const enterForgotPassword = () => {
    setMode('forgot-password')
    setResetStep('email')
    setError('')
    setCode('')
    setPassword('')
  }

  const backToLogin = () => {
    setMode('login')
    setResetStep('email')
    setError('')
    setCode('')
    setPassword('')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gray-50">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border-2 border-gray-200 border-b-4 rounded-3xl p-8 animate-fade-in-up">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="space-y-6">
            {mode === 'forgot-password' ? (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">重置密码</h2>
                <p className="text-gray-500 mt-2 text-sm font-medium">
                  {resetStep === 'email' ? '请输入您的注册邮箱' : '请输入验证码和新密码'}
                </p>
              </div>

              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); resetStep === 'email' ? sendCode() : submitResetPassword(); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 ml-1">邮箱</label>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-gray-100 border-2 border-transparent rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-duo-blue transition-all font-medium"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading || resetStep === 'code'}
                          onKeyDown={(e) => {
                            if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                              e.preventDefault(); e.currentTarget.select();
                            }
                          }}
                        />
                        {resetStep === 'email' && (
                          <button
                            type="button"
                            onClick={sendCode}
                            disabled={isLoading || cooldown > 0}
                            className="shrink-0 px-4 py-3.5 rounded-xl bg-duo-blue text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity min-w-[120px]"
                          >
                            {cooldown > 0 ? `${cooldown}s` : '发送重置码'}
                          </button>
                        )}
                      </div>
                    </div>

                    {resetStep === 'code' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 ml-1">重置码</label>
                          <input
                            className="w-full bg-gray-100 border-2 border-transparent rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-duo-blue transition-all font-medium tracking-[0.25em] text-center text-lg"
                            placeholder="000000"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            disabled={isLoading}
                          />
                          <div className="mt-2 text-right">
                            <button
                              type="button"
                              onClick={sendCode}
                              disabled={isLoading || cooldown > 0}
                              className="text-xs font-medium text-gray-400 hover:text-brand-600 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                            >
                              {cooldown > 0 ? `${cooldown}s 后可重新发送` : '未收到验证码？重新发送'}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 ml-1">新密码</label>
                          <input
                            className="w-full bg-gray-100 border-2 border-transparent rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-duo-blue transition-all font-medium"
                            placeholder="••••••••（至少6位）"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold flex items-center justify-center border border-red-100 animate-fade-in">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-bold justify-center"
                    isLoading={isLoading}
                  >
                    <span>{resetStep === 'email' ? '发送重置码' : '重置密码'}</span>
                    <ArrowRight size={18} />
                  </Button>
                </form>

              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={backToLogin}
                  className="text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors"
                >
                  返回登录
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  {mode === 'login' ? '欢迎回来' : '创建新账户'}
                </h2>
                <p className="text-gray-500 mt-2 text-sm font-medium flex items-center justify-center gap-1.5">
                  {mode === 'login' ? '请输入您的账号信息' : (
                    <>
                      <Sparkles size={14} className="text-accent-500" />
                      <span>开启您的语言学习之旅</span>
                    </>
                  )}
                </p>
              </div>

              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 ml-1">邮箱</label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 bg-gray-100 border-2 border-transparent rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-duo-blue transition-all font-medium"
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
                      {mode === 'register' && (
                        <button
                          type="button"
                          onClick={sendCode}
                          disabled={isLoading || cooldown > 0}
                          className="shrink-0 px-4 py-3.5 rounded-xl bg-duo-blue text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity min-w-[120px]"
                        >
                          {cooldown > 0 ? `${cooldown}s` : '获取验证码'}
                        </button>
                      )}
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 ml-1">验证码</label>
                      <input
                        className="w-full bg-gray-100 border-2 border-transparent rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-duo-blue transition-all font-medium tracking-[0.25em] text-center text-lg"
                        placeholder="000000"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 ml-1">密码</label>
                    <input
                      className="w-full bg-gray-100 border-2 border-transparent rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-duo-blue transition-all font-medium"
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
                  <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold flex items-center justify-center border border-red-100 animate-fade-in">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full font-bold justify-center"
                  isLoading={isLoading}
                >
                  <span>{mode === 'login' ? '登录' : '注册'}</span>
                  <ArrowRight size={18} />
                </Button>
              </form>

              <div className="text-center space-y-3">
                <div>
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors"
                  >
                    {mode === 'login' ? '还没有账号？去注册' : '已有账号？去登录'}
                  </button>
                </div>
                {mode === 'login' && (
                  <div>
                    <button
                      type="button"
                      onClick={enterForgotPassword}
                      className="text-sm font-medium text-gray-400 hover:text-brand-600 transition-colors"
                    >
                      忘记密码？
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} LinguaCraft AI. 让语言学习更有趣
        </div>
      </div>
    </div>
  )
}
