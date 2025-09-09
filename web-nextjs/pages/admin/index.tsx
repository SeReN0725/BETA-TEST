import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface Cohort {
  id: string
  name: string
  description?: string
  status: 'collecting' | 'matched'
  student_count?: number
  created_at: string
}

interface Stats {
  totalStudents: number
  totalCohorts: number
  activeCohorts: number
}

interface Student {
  id: string
  name: string
  email: string
  major?: string
  role_pref?: string
  skills?: string
  mbti?: string
  availability?: string
  created_at?: string
}

export default function AdminDashboard() {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, totalCohorts: 0, activeCohorts: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/cohorts`, {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
      
      const responseText = await response.text()
      console.log('Raw response:', responseText)
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        console.error('Response text:', responseText)
        alert('서버 응답 파싱 오류: ' + parseError.message + '\n응답: ' + responseText.substring(0, 200))
        return
      }
      
      if (response.ok) {
        setCohorts(data.cohorts || [])
        setStats(data.stats || { totalStudents: 0, totalCohorts: 0, activeCohorts: 0 })
      } else {
        alert('데이터 로드 실패: ' + (data.error || '알 수 없는 오류'))
      }
    } catch (error) {
      console.error('Load data error:', error)
      alert('데이터 로드 실패: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const createCohort = async () => {
    const name = prompt('코호트 이름을 입력하세요:')
    if (!name) return
    
    const description = prompt('코호트 설명을 입력하세요 (선택사항):') || ''
    
    try {
      const response = await fetch(`${apiUrl}/api/admin/cohorts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, description })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('코호트가 생성되었습니다!')
        loadData()
      } else {
        alert('코호트 생성 실패: ' + (data.error || '알 수 없는 오류'))
      }
    } catch (error) {
      alert('코호트 생성 실패: ' + (error as Error).message)
    }
  }

  const runMatching = async (cohortId: string) => {
    if (!confirm('매칭을 실행하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    
    try {
      const response = await fetch(`${apiUrl}/api/cohorts/${cohortId}/match`, {
        method: 'POST',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('매칭이 완료되었습니다!')
        loadData()
      } else {
        alert('매칭 실패: ' + (data.error || '알 수 없는 오류'))
      }
    } catch (error) {
      alert('매칭 실패: ' + (error as Error).message)
    }
  }

  const viewTeams = async (cohortId: string) => {
    try {
      console.log('Fetching teams for cohort:', cohortId)
      const response = await fetch(`${apiUrl}/api/cohorts/${cohortId}/teams`, {
        credentials: 'include'
      })
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok) {
        const teams = data.teams || []
        console.log('Teams array:', teams)
        if (teams.length === 0) {
          alert('아직 매칭된 팀이 없습니다. 먼저 매칭을 실행해주세요.')
          return
        }
        
        let teamInfo = `코호트 ${cohortId} 매칭 결과:\n\n`
        teams.forEach((team: any, index: number) => {
          console.log('Processing team:', team)
          console.log('Team score type:', typeof team.score, 'value:', team.score)
          const scoreValue = typeof team.score === 'number' ? team.score : Number(team.score)
          const scoreDisplay = !isNaN(scoreValue) ? scoreValue.toFixed(2) : 'N/A'
          teamInfo += `팀 ${index + 1} (점수: ${scoreDisplay}):\n`
          if (team.members && Array.isArray(team.members)) {
            team.members.forEach((member: any) => {
              console.log('Processing member:', member)
              teamInfo += `  - ${member.name || 'Unknown'} (${member.role_assigned || member.role_pref || 'No role'})\n`
            })
          } else {
            console.error('Team members is not an array:', team.members)
            teamInfo += '  - 멤버 정보를 불러올 수 없습니다.\n'
          }
          teamInfo += '\n'
        })
        
        alert(teamInfo)
      } else {
        console.error('API Error:', data)
        alert('팀 목록 로드 실패: ' + (data.error || '알 수 없는 오류'))
      }
    } catch (error) {
      console.error('Fetch error:', error)
      alert('팀 목록 로드 실패: ' + (error as Error).message)
    }
  }

  const viewStudents = async (cohortId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/cohorts/${cohortId}/students`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (response.ok) {
        const students: Student[] = data.students || []
        const studentList = students.map(s => 
          `${s.name} (${s.email}) - ID: ${s.id || 'ID 없음'}`
        ).join('\n')
        
        alert(`코호트 ${cohortId} 학생 목록:\n\n${studentList || '등록된 학생이 없습니다.'}`)
      } else {
        alert('학생 목록 로드 실패: ' + (data.error || '알 수 없는 오류'))
      }
    } catch (error) {
      alert('학생 목록 로드 실패: ' + (error as Error).message)
    }
  }

  const exportData = async (cohortId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/cohorts/${cohortId}/export`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cohort_${cohortId}_data.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        const data = await response.json()
        alert('데이터 내보내기 실패: ' + (data.error || '알 수 없는 오류'))
      }
    } catch (error) {
      alert('데이터 내보내기 실패: ' + (error as Error).message)
    }
  }

  const deleteCohort = async (cohortId: string) => {
    if (!confirm(`코호트 ${cohortId}를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return
    
    try {
      const response = await fetch(`${apiUrl}/api/admin/cohorts/${cohortId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('코호트가 삭제되었습니다.')
        loadData()
      } else {
        alert('코호트 삭제 실패: ' + (data.error || '알 수 없는 오류'))
      }
    } catch (error) {
      alert('코호트 삭제 실패: ' + (error as Error).message)
    }
  }

  const logout = async () => {
    try {
      const response = await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        router.push('/admin/login')
      } else {
        alert('로그아웃 실패')
      }
    } catch (error) {
      alert('로그아웃 실패: ' + (error as Error).message)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Team Matching Admin</title>
        <meta charSet="utf-8" />
      </Head>
      
      <div className="container">
        <div className="header">
          <h1>🎯 Team Matching Admin Dashboard</h1>
          <button 
            className="logout-btn" 
            onClick={logout}
            aria-label="관리자 계정에서 로그아웃"
          >
            로그아웃
          </button>
        </div>
        
        <div className="stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalStudents}</div>
            <div className="stat-label">총 등록 학생</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalCohorts}</div>
            <div className="stat-label">총 코호트</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.activeCohorts}</div>
            <div className="stat-label">활성 코호트</div>
          </div>
        </div>
        
        <div className="actions">
          <button 
            onClick={createCohort}
            aria-label="새로운 코호트를 생성합니다"
          >
            새 코호트 생성
          </button>
          <button 
            onClick={loadData}
            aria-label="데이터를 새로고침합니다"
          >
            새로고침
          </button>
        </div>
        
        <div className="cohorts">
          {cohorts.map(cohort => (
            <div key={cohort.id} className="cohort">
              <h3>
                {cohort.name} ({cohort.id})
                <span className={`status ${cohort.status}`}>
                  {cohort.status === 'collecting' ? '수집 중' : '매칭 완료'}
                </span>
              </h3>
              <p><strong>설명:</strong> {cohort.description || '설명 없음'}</p>
              <p><strong>등록 학생:</strong> {cohort.student_count || 0}명</p>
              <p><strong>생성일:</strong> {new Date(cohort.created_at).toLocaleDateString()}</p>
              
              <div className="cohort-actions">
                <button 
                  onClick={() => viewStudents(cohort.id)}
                  aria-label={`${cohort.name} 코호트의 학생 목록을 확인합니다`}
                >
                  학생 목록 보기
                </button>
                <button 
                  onClick={() => runMatching(cohort.id)} 
                  disabled={cohort.status !== 'collecting'}
                  aria-label={`${cohort.name} 코호트의 매칭을 실행합니다`}
                  aria-describedby={cohort.status !== 'collecting' ? 'matching-disabled' : undefined}
                >
                  매칭 실행
                </button>
                <button 
                  onClick={() => viewTeams(cohort.id)}
                  aria-label={`${cohort.name} 코호트의 매칭 결과를 확인합니다`}
                >
                  매칭 결과 보기
                </button>
                <button 
                  onClick={() => exportData(cohort.id)}
                  aria-label={`${cohort.name} 코호트의 데이터를 CSV 파일로 내보냅니다`}
                >
                  데이터 내보내기
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => deleteCohort(cohort.id)}
                  aria-label={`${cohort.name} 코호트를 삭제합니다. 이 작업은 되돌릴 수 없습니다`}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        .container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 1.125rem;
          font-weight: 500;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 {
          margin: 0;
          color: #1e293b;
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logout-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
        }
        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .stat-number {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }
        .stat-label {
          color: #64748b;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .actions {
          margin: 2rem 0;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .actions button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(102, 126, 234, 0.3);
          font-size: 0.875rem;
          letter-spacing: 0.025em;
        }
        .actions button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }
        .cohorts {
          margin-top: 2rem;
          display: grid;
          gap: 1.5rem;
        }
        .cohort {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin: 0;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .cohort:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .cohort h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.025em;
        }
        .cohort p {
          color: #64748b;
          margin: 0.75rem 0;
          font-weight: 500;
        }
        .cohort p strong {
          color: #374151;
          font-weight: 600;
        }
        .status {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .status.collecting {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .status.matched {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #166534;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .cohort-actions {
          margin-top: 1.5rem;
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .cohort-actions button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }
        .cohort-actions button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(102, 126, 234, 0.3);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }
        .cohort-actions button:disabled {
          background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
          opacity: 0.6;
        }
        .delete-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2) !important;
        }
        .delete-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3) !important;
        }
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          .header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
            padding: 1.5rem;
          }
          h1 {
            font-size: 1.875rem;
          }
          .stats {
            grid-template-columns: 1fr;
          }
          .actions {
            flex-direction: column;
          }
          .cohort-actions {
            flex-direction: column;
          }
          .cohort-actions button {
            width: 100%;
          }
        }
        @media (max-width: 480px) {
          .container {
            padding: 0.5rem;
          }
          .header {
            padding: 1rem;
            border-radius: 16px;
          }
          h1 {
            font-size: 1.5rem;
          }
          .stat-card {
            padding: 1.5rem;
            border-radius: 16px;
          }
          .cohort {
            padding: 1.5rem;
            border-radius: 16px;
          }
        }
      `}</style>
    </>
  )
}