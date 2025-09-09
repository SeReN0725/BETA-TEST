import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin')
      } else {
        setError(data.error || '로그인 실패')
      }
    } catch (error) {
      setError('로그인 요청 실패: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login</title>
        <meta charSet="utf-8" />
      </Head>
      
      <div className="container">
        <div className="login-container">
          <h1>🔐 관리자 로그인</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">사용자명:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                aria-describedby={error ? 'error-message' : undefined}
                aria-invalid={error ? 'true' : 'false'}
                autoComplete="username"
                placeholder="사용자명을 입력하세요"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">비밀번호:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                aria-describedby={error ? 'error-message' : undefined}
                aria-invalid={error ? 'true' : 'false'}
                autoComplete="current-password"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              aria-describedby={loading ? 'loading-status' : undefined}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
            {loading && (
              <div id="loading-status" className="sr-only" aria-live="polite">
                로그인을 처리하고 있습니다. 잠시만 기다려주세요.
              </div>
            )}
            {error && (
              <div 
                id="error-message" 
                className="error" 
                role="alert" 
                aria-live="assertive"
              >
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

      <style jsx>{`
        .container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1rem;
        }
        .login-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
          width: 100%;
          max-width: 420px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        .login-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3);
        }
        h1 {
          text-align: center;
          margin-bottom: 2.5rem;
          color: #1e293b;
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .form-group {
          margin-bottom: 1.5rem;
          position: relative;
        }
        label {
          display: block;
          margin-bottom: 0.75rem;
          color: #374151;
          font-weight: 600;
          font-size: 0.875rem;
          letter-spacing: 0.025em;
          text-transform: uppercase;
        }
        input[type="text"], input[type="password"] {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          box-sizing: border-box;
          font-size: 1rem;
          font-family: inherit;
          background: #ffffff;
          transition: all 0.2s ease;
          outline: none;
        }
        input[type="text"]:focus, input[type="password"]:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
        }
        input:disabled {
          background-color: #f9fafb;
          border-color: #d1d5db;
          cursor: not-allowed;
          opacity: 0.6;
        }
        button {
          width: 100%;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(102, 126, 234, 0.3);
          letter-spacing: 0.025em;
          margin-top: 0.5rem;
        }
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }
        button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 14px rgba(102, 126, 234, 0.3);
        }
        button:disabled {
          background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .error {
          color: #dc2626;
          margin-top: 1.5rem;
          text-align: center;
          padding: 1rem;
          background: rgba(254, 226, 226, 0.8);
          border: 1px solid rgba(248, 113, 113, 0.3);
          border-radius: 12px;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        @media (max-width: 480px) {
          .container {
            padding: 0.5rem;
          }
          .login-container {
            padding: 2rem;
            border-radius: 16px;
          }
          h1 {
            font-size: 1.75rem;
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </>
  )
}