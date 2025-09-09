
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import pkg from 'pg'
import bcrypt from 'bcryptjs'
import session from 'express-session'
import { v4 as uuidv4 } from 'uuid'
const { Pool } = pkg

const app = express()
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://beta-test-frontend-beryl.vercel.app',
      'https://beta-test-frontend.vercel.app'
    ];
    
    // In production, be more strict with CORS
    if (process.env.NODE_ENV === 'production') {
      if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
        callback(null, true);
      } else {
        console.warn('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, allow all origins
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}))

app.options("*", cors());

app.use(express.json({limit:'1mb'}))

// Session configuration
// Validate required environment variables
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}
// JWT_SECRET은 현재 사용하지 않으므로 경고만 출력
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET environment variable not set - some features may not work');
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? undefined : undefined // Let browser handle domain
  },
  name: 'nexeed.session.id' // Custom session name
}))

const PORT = process.env.PORT || 8080
const AI_BASE = process.env.AI_BASE || 'http://localhost:8001'
const pool = new Pool({ connectionString: process.env.POSTGRES_URL })

async function init() {
  // 조건부 스키마 적용 - Railway 환경에서 파일 경로 문제 방지
  if (process.env.APPLY_SCHEMA === 'true') {
    try {
      const schema = await (await import('fs/promises')).readFile(new URL('../schema.sql', import.meta.url))
      await pool.query(schema.toString())
      console.log('DB schema applied')
    } catch (error) {
      console.warn('Schema file not found or failed to apply:', error.message)
      console.log('Skipping schema application - database should already be initialized')
    }
  } else {
    console.log('Schema application skipped (APPLY_SCHEMA != true)')
  }
}
init().catch(console.error)

// Authentication middleware
const requireAuth = async (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  
  try {
    const result = await pool.query('SELECT id, username FROM admin_users WHERE id = $1', [req.session.adminId])
    if (result.rows.length === 0) {
      req.session.destroy()
      return res.status(401).json({ error: 'Invalid session' })
    }
    req.admin = result.rows[0]
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Authentication error' })
  }
}

// Login endpoint
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }
  
  try {
    const result = await pool.query('SELECT id, username, password_hash FROM admin_users WHERE username = $1', [username])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const admin = result.rows[0]
    const validPassword = await bcrypt.compare(password, admin.password_hash)
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Update last login
    await pool.query('UPDATE admin_users SET last_login = now() WHERE id = $1', [admin.id])
    
    // Set session
    req.session.adminId = admin.id
    req.session.username = admin.username
    
    res.json({ 
      success: true, 
      admin: { id: admin.id, username: admin.username }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Logout endpoint
app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' })
    }
    res.json({ success: true })
  })
})

// Check auth status
app.get('/auth/status', (req, res) => {
  if (req.session.adminId) {
    res.json({ 
      authenticated: true, 
      admin: { id: req.session.adminId, username: req.session.username }
    })
  } else {
    res.json({ authenticated: false })
  }
})

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Team Matching API Server',
    version: '1.0.0',
    endpoints: {
      'POST /api/cohorts/:cohortId/submit': 'Submit student info and survey',
      'GET /api/cohorts/:cohortId/status': 'Get cohort status',
      'GET /api/cohorts/:cohortId/students': 'Get students in cohort',
      'POST /api/cohorts/:cohortId/match': 'Create teams for cohort',
      'GET /admin': 'Admin dashboard for team matching'
    }
  })
})

// Admin login page
app.get('/admin/login', (req, res) => {
  if (req.session.adminId) {
    return res.redirect('/admin')
  }
  
  // Railway 환경에서도 작동하도록 환경변수 사용
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  res.redirect(`${frontendUrl}/admin/login`)
})

// Admin dashboard with authentication
app.get('/admin', requireAuth, (req, res) => {
  // Railway 환경에서도 작동하도록 환경변수 사용
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  res.redirect(`${frontendUrl}/admin`)
})

// Submit survey + student info
app.post('/api/cohorts/:cohortId/submit', async (req,res) => {
  const { cohortId } = req.params
  const { student, answers } = req.body || {}
  if(!student || !answers) return res.status(400).json({ok:false, error:'student & answers required'})
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // upsert student
    await client.query(
      `INSERT INTO students(id,name,email,major,skills,mbti,role_pref,availability,consent)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,true)
       ON CONFLICT (email) DO UPDATE SET id=EXCLUDED.id, name=EXCLUDED.name,
       major=EXCLUDED.major, skills=EXCLUDED.skills, mbti=EXCLUDED.mbti,
       role_pref=EXCLUDED.role_pref, availability=EXCLUDED.availability`,
      [student.id, student.name, student.email, student.major, student.skills, student.mbti, student.role_pref, student.availability]
    )
    await client.query(
      `INSERT INTO cohort_enrollments(cohort_id, student_id) VALUES($1,$2)
       ON CONFLICT (cohort_id, student_id) DO NOTHING`,
      [cohortId, student.id]
    )
    // score via AI
    const r = await fetch(`${AI_BASE}/score/bigfive`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({answers, scale:5})
    })
    if(!r.ok) throw new Error('AI score error')
    const ocean = await r.json()
    await client.query(
      `INSERT INTO bigfive_responses(cohort_id, student_id, answers, O, C, E, A, N)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (cohort_id, student_id) DO UPDATE SET answers=EXCLUDED.answers, O=EXCLUDED.O, C=EXCLUDED.C, E=EXCLUDED.E, A=EXCLUDED.A, N=EXCLUDED.N`,
      [cohortId, student.id, answers, ocean.O, ocean.C, ocean.E, ocean.A, ocean.N]
    )
    await client.query('COMMIT')
    res.json({ok:true, ocean})
  } catch(e){
    await client.query('ROLLBACK')
    console.error(e)
    res.status(500).json({ok:false, error:String(e)})
  } finally {
    client.release()
  }
})

// Status
app.get('/api/cohorts/:cohortId/status', requireAuth, async (req,res) => {
  const { cohortId } = req.params
  const r = await pool.query(`SELECT COUNT(*)::int AS submitted FROM bigfive_responses WHERE cohort_id=$1`, [cohortId])
  res.json({submitted: r.rows[0].submitted, status:'collecting'})
})

// Get students in cohort
app.get('/api/cohorts/:cohortId/students', requireAuth, async (req,res) => {
  const { cohortId } = req.params
  try {
    const r = await pool.query(
      `SELECT s.id, s.name, s.email, s.major, s.skills, s.mbti, s.role_pref, s.availability, s.created_at,
              b.O, b.C, b.E, b.A, b.N, b.scored_at
       FROM cohort_enrollments e
       JOIN students s ON s.id = e.student_id
       LEFT JOIN bigfive_responses b ON b.student_id = s.id AND b.cohort_id = e.cohort_id
       WHERE e.cohort_id = $1
       ORDER BY s.created_at DESC`, [cohortId]
    )
    res.json({students: r.rows, count: r.rows.length})
  } catch(e) {
    console.error(e)
    res.status(500).json({error: String(e)})
  }
})

// Run matching
app.post('/api/cohorts/:cohortId/match', requireAuth, async (req,res) => {
  const { cohortId } = req.params
  const team_size = (req.body && req.body.team_size) || 4
  const req_roles = (req.body && req.body.required_roles) || {"PM":1,"FE":1,"BE":1,"Design":1}
  try {
    const r = await pool.query(
      `SELECT s.id AS student_id, s.name, s.major, s.skills, s.mbti AS "MBTI", s.role_pref, s.availability,
              COALESCE(b.O, 0.5) AS "O", COALESCE(b.C, 0.5) AS "C", COALESCE(b.E, 0.5) AS "E", 
              COALESCE(b.A, 0.5) AS "A", COALESCE(b.N, 0.5) AS "N"
       FROM cohort_enrollments e
       JOIN students s ON s.id = e.student_id
       LEFT JOIN bigfive_responses b ON b.student_id = s.id AND b.cohort_id = e.cohort_id
       WHERE e.cohort_id = $1`, [cohortId]
    )
    const payload = { team_size, required_roles: req_roles, students: r.rows }
    const resp = await fetch(`${AI_BASE}/match/run`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    if(!resp.ok) {
      const errorText = await resp.text()
      throw new Error(`AI match error: ${resp.status} - ${errorText}`)
    }
    const data = await resp.json()
    
    // 학생 ID를 이름으로 매핑하기 위해 학생 정보 조회
    const studentMap = {}
    for(const student of r.rows) {
      studentMap[student.student_id] = student.name
    }
    
    // 팀 데이터에 학생 이름 추가
    if(data.teams) {
      data.teams.forEach(team => {
        if(team.members) {
          team.members.forEach(member => {
            member.name = studentMap[member.student_id] || member.student_id
          })
        }
      })
    }
    
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      // 기존 팀 데이터 삭제 (중복 매칭 방지)
      await client.query('DELETE FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE cohort_id = $1)', [cohortId])
      await client.query('DELETE FROM teams WHERE cohort_id = $1', [cohortId])
      
      for(const t of data.teams){
        const tRes = await client.query(`INSERT INTO teams(cohort_id, score, meta) VALUES($1,$2,$3) RETURNING id`, [cohortId, t.score, JSON.stringify(t.reasons)])
        const team_id = tRes.rows[0].id
        for(const m of t.members){
          await client.query(`INSERT INTO team_members(team_id, student_id, role_assigned) VALUES($1,$2,$3)`, [team_id, m.student_id, m.role_assigned || null])
        }
      }
      await client.query('COMMIT')
    } catch(e){
      await client.query('ROLLBACK'); throw e
    } finally {
      client.release()
    }
    res.json({ok:true, ...data})
  } catch(e){
    console.error(e)
    res.status(500).json({ok:false, error:String(e)})
  }
})

// 데이터베이스 조회 API
app.get('/api/db/:table', requireAuth, async (req, res) => {
  const { table } = req.params
  const allowedTables = ['cohorts', 'students', 'cohort_enrollments', 'bigfive_responses', 'teams', 'team_members']
  
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table name' })
  }
  
  try {
    const result = await pool.query(`SELECT * FROM ${table} ORDER BY 1 LIMIT 100`)
    res.json({ table, count: result.rows.length, data: result.rows })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 관리자 코호트 목록 및 통계 API
app.get('/api/admin/cohorts', requireAuth, async (req, res) => {
  try {
    // 코호트 목록 조회
    const cohortsResult = await pool.query(`
      SELECT c.id, c.name, c.term, c.team_size, c.status, 
             COALESCE(c.created_at, now()) as created_at,
             COUNT(DISTINCT ce.student_id) as student_count,
             COUNT(DISTINCT t.id) as team_count
      FROM cohorts c
      LEFT JOIN cohort_enrollments ce ON c.id = ce.cohort_id
      LEFT JOIN teams t ON c.id = t.cohort_id
      GROUP BY c.id, c.name, c.term, c.team_size, c.status, c.created_at
      ORDER BY COALESCE(c.created_at, now()) DESC
    `);
    
    // 전체 통계 조회
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM students) as "totalStudents",
        (SELECT COUNT(*) FROM cohorts) as "totalCohorts",
        (SELECT COUNT(*) FROM cohorts WHERE status = 'collecting') as "activeCohorts"
    `);
    
    res.json({
      cohorts: cohortsResult.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Admin cohorts error:', error);
    res.status(500).json({ error: 'Failed to load cohorts data' });
  }
});

// 코호트 생성 API
app.post('/api/admin/cohorts', requireAuth, async (req, res) => {
  const { name, term, team_size, required_roles } = req.body;
  
  if (!name || !term) {
    return res.status(400).json({ error: 'Name and term are required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO cohorts (name, term, team_size, required_roles, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, term, team_size || 4, required_roles || '{"PM":1,"FE":1,"BE":1,"Design":1}', 'collecting']
    );
    
    res.json({ success: true, cohort: result.rows[0] });
  } catch (error) {
    console.error('Create cohort error:', error);
    res.status(500).json({ error: 'Failed to create cohort' });
  }
});

// 코호트 삭제 API
app.delete('/api/admin/cohorts/:cohortId', requireAuth, async (req, res) => {
  const { cohortId } = req.params;
  
  try {
    await pool.query('BEGIN');
    
    // 관련 데이터 삭제
    await pool.query('DELETE FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE cohort_id = $1)', [cohortId]);
    await pool.query('DELETE FROM teams WHERE cohort_id = $1', [cohortId]);
    await pool.query('DELETE FROM bigfive_responses WHERE cohort_id = $1', [cohortId]);
    await pool.query('DELETE FROM cohort_enrollments WHERE cohort_id = $1', [cohortId]);
    await pool.query('DELETE FROM cohorts WHERE id = $1', [cohortId]);
    
    await pool.query('COMMIT');
    
    res.json({ success: true });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Delete cohort error:', error);
    res.status(500).json({ error: 'Failed to delete cohort' });
  }
});

// 매칭 결과 조회 API
app.get('/api/cohorts/:cohortId/teams', requireAuth, async (req, res) => {
  const { cohortId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT t.id as team_id, t.score, t.meta,
             s.id as student_id, s.name, s.email, s.role_pref,
             tm.role_assigned
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      JOIN students s ON tm.student_id = s.id
      WHERE t.cohort_id = $1
      ORDER BY t.id, s.name
    `, [cohortId]);
    
    // 팀별로 그룹화
    const teamsMap = {};
    result.rows.forEach(row => {
      if (!teamsMap[row.team_id]) {
        teamsMap[row.team_id] = {
          id: row.team_id,
          score: row.score,
          meta: row.meta,
          members: []
        };
      }
      teamsMap[row.team_id].members.push({
        student_id: row.student_id,
        name: row.name,
        email: row.email,
        role_pref: row.role_pref,
        role_assigned: row.role_assigned
      });
    });
    
    const teams = Object.values(teamsMap);
    res.json({ teams, count: teams.length });
  } catch (error) {
    console.error('Teams query error:', error);
    res.status(500).json({ error: 'Failed to load teams data' });
  }
});

// 코호트 데이터 내보내기 API
app.get('/api/admin/cohorts/:cohortId/export', requireAuth, async (req, res) => {
  const { cohortId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT s.name, s.email, s.id as student_id, s.major, s.role_pref, s.skills, s.mbti,
             b.O, b.C, b.E, b.A, b.N, b.scored_at,
             COALESCE(tm.role_assigned, 'Unassigned') as team_role
      FROM cohort_enrollments ce
      JOIN students s ON s.id = ce.student_id
      LEFT JOIN bigfive_responses b ON b.student_id = s.id AND b.cohort_id = ce.cohort_id
      LEFT JOIN team_members tm ON tm.student_id = s.id
      LEFT JOIN teams t ON t.id = tm.team_id AND t.cohort_id = ce.cohort_id
      WHERE ce.cohort_id = $1
      ORDER BY s.name
    `, [cohortId]);
    
    // CSV 형식으로 변환
    const headers = ['Name', 'Email', 'Student ID', 'Major', 'Role Preference', 'Skills', 'MBTI', 'Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism', 'Scored At', 'Team Role'];
    const csvData = [headers.join(',')];
    
    result.rows.forEach(row => {
      const csvRow = [
        row.name || '',
        row.email || '',
        row.student_id || '',
        row.major || '',
        row.role_pref || '',
        row.skills || '',
        row.mbti || '',
        row.o || '',
        row.c || '',
        row.e || '',
        row.a || '',
        row.n || '',
        row.scored_at || '',
        row.team_role || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`);
      csvData.push(csvRow.join(','));
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="cohort_${cohortId}_data.csv"`);
    res.send(csvData.join('\n'));
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Get students in cohort (admin endpoint)
app.get('/api/admin/cohorts/:cohortId/students', requireAuth, async (req, res) => {
  const { cohortId } = req.params;
  try {
    const r = await pool.query(
      `SELECT s.id, s.name, s.email, s.major, s.skills, s.mbti, s.role_pref, s.availability, s.created_at,
              b.O, b.C, b.E, b.A, b.N, b.scored_at
       FROM cohort_enrollments e
       JOIN students s ON s.id = e.student_id
       LEFT JOIN bigfive_responses b ON b.student_id = s.id AND b.cohort_id = e.cohort_id
       WHERE e.cohort_id = $1
       ORDER BY s.created_at DESC`, [cohortId]
    );
    res.json({ students: r.rows, count: r.rows.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// 중복 코호트 정리 API
app.post('/api/admin/cleanup-cohorts', requireAuth, async (req, res) => {
  try {
    // 중복된 코호트들을 찾아서 삭제 (가장 오래된 것만 남기고)
    const duplicates = await pool.query(`
      WITH cohort_groups AS (
        SELECT name, MIN(id) as keep_id, array_agg(id ORDER BY id) as all_ids
        FROM cohorts 
        GROUP BY name 
        HAVING COUNT(*) > 1
      )
      SELECT unnest(all_ids[2:]) as delete_id FROM cohort_groups
    `);
    
    if (duplicates.rows.length === 0) {
      return res.json({ message: 'No duplicate cohorts found', deleted: 0 });
    }
    
    // 중복 코호트들과 관련된 데이터 삭제
    const deleteIds = duplicates.rows.map(row => row.delete_id);
    
    await pool.query('BEGIN');
    
    // 관련 데이터 삭제
    await pool.query('DELETE FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE cohort_id = ANY($1))', [deleteIds]);
    await pool.query('DELETE FROM teams WHERE cohort_id = ANY($1)', [deleteIds]);
    await pool.query('DELETE FROM bigfive_responses WHERE cohort_id = ANY($1)', [deleteIds]);
    await pool.query('DELETE FROM cohort_enrollments WHERE cohort_id = ANY($1)', [deleteIds]);
    await pool.query('DELETE FROM cohorts WHERE id = ANY($1)', [deleteIds]);
    
    await pool.query('COMMIT');
    
    res.json({ message: 'Duplicate cohorts cleaned up', deleted: deleteIds.length, deletedIds: deleteIds });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

app.listen(PORT, ()=> console.log(`Express listening on :${PORT}`))
