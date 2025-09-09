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
          <button className="logout-btn" onClick={logout}>로그아웃</button>
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
          <button onClick={createCohort}>새 코호트 생성</button>
          <button onClick={loadData}>새로고침</button>
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
                <button onClick={() => viewStudents(cohort.id)}>학생 목록 보기</button>
                <button 
                  onClick={() => runMatching(cohort.id)} 
                  disabled={cohort.status !== 'collecting'}
                >
                  매칭 실행
                </button>
                <button onClick={() => viewTeams(cohort.id)}>매칭 결과 보기</button>
                <button onClick={() => exportData(cohort.id)}>데이터 내보내기</button>
                <button 
                  className="delete-btn" 
                  onClick={() => deleteCohort(cohort.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .container {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: Arial, sans-serif;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        h1 {
          margin: 0;
          color: #333;
        }
        .logout-btn {
          background: #f44336;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
        .logout-btn:hover {
          background: #d32f2f;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .stat-card {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-number {
          font-size: 2em;
          font-weight: bold;
          color: #2196f3;
        }
        .stat-label {
          color: #666;
          margin-top: 5px;
        }
        .actions {
          margin: 20px 0;
        }
        .actions button {
          background: #2196f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
        }
        .actions button:hover {
          background: #1976d2;
        }
        .cohorts {
          margin-top: 20px;
        }
        .cohort {
          border: 1px solid #ddd;
          margin: 20px 0;
          padding: 20px;
          border-radius: 8px;
        }
        .cohort h3 {
          margin-top: 0;
          color: #333;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: normal;
        }
        .status.collecting {
          background: #e3f2fd;
          color: #1976d2;
        }
        .status.matched {
          background: #e8f5e8;
          color: #388e3c;
        }
        .cohort-actions {
          margin-top: 15px;
        }
        .cohort-actions button {
          background: #2196f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px 5px 5px 0;
        }
        .cohort-actions button:hover:not(:disabled) {
          background: #1976d2;
        }
        .cohort-actions button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .delete-btn {
          background: #f44336 !important;
        }
        .delete-btn:hover {
          background: #d32f2f !important;
        }
      `}</style>
    </>
  )
}