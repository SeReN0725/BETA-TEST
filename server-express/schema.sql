
CREATE TABLE IF NOT EXISTS cohorts(
  id SERIAL PRIMARY KEY,
  name TEXT, term TEXT, team_size INT DEFAULT 4,
  required_roles JSONB DEFAULT '{"PM":1,"FE":1,"BE":1,"Design":1}',
  open_at TIMESTAMP, close_at TIMESTAMP, status TEXT DEFAULT 'collecting',
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE IF NOT EXISTS students(
  id UUID PRIMARY KEY,
  name TEXT, email TEXT UNIQUE, major TEXT, skills TEXT, mbti TEXT,
  role_pref TEXT, availability TEXT, consent BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE IF NOT EXISTS cohort_enrollments(
  cohort_id INT REFERENCES cohorts(id),
  student_id UUID REFERENCES students(id),
  PRIMARY KEY(cohort_id, student_id)
);
CREATE TABLE IF NOT EXISTS bigfive_responses(
  cohort_id INT, student_id UUID,
  answers JSONB, O NUMERIC, C NUMERIC, E NUMERIC, A NUMERIC, N NUMERIC,
  scored_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY(cohort_id, student_id)
);
CREATE TABLE IF NOT EXISTS teams(
  id SERIAL PRIMARY KEY, cohort_id INT REFERENCES cohorts(id),
  score NUMERIC, meta JSONB, created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE IF NOT EXISTS team_members(
  team_id INT REFERENCES teams(id),
  student_id UUID REFERENCES students(id),
  role_assigned TEXT, PRIMARY KEY(team_id, student_id)
);

-- Insert sample cohorts (only if they don't exist)
INSERT INTO cohorts (name, term, team_size, required_roles, open_at, close_at, status) 
SELECT '2024 Spring Cohort', '2024-1', 4, '{"PM":1,"FE":1,"BE":1,"Design":1}', '2024-03-01 00:00:00', '2024-03-15 23:59:59', 'collecting'
WHERE NOT EXISTS (SELECT 1 FROM cohorts WHERE name = '2024 Spring Cohort');

INSERT INTO cohorts (name, term, team_size, required_roles, open_at, close_at, status) 
SELECT '2024 Summer Cohort', '2024-2', 4, '{"PM":1,"FE":1,"BE":1,"Design":1}', '2024-06-01 00:00:00', '2024-06-15 23:59:59', 'collecting'
WHERE NOT EXISTS (SELECT 1 FROM cohorts WHERE name = '2024 Summer Cohort');

INSERT INTO cohorts (name, term, team_size, required_roles, open_at, close_at, status) 
SELECT '2024 Fall Cohort', '2024-3', 5, '{"PM":1,"FE":2,"BE":1,"Design":1}', '2024-09-01 00:00:00', '2024-09-15 23:59:59', 'collecting'
WHERE NOT EXISTS (SELECT 1 FROM cohorts WHERE name = '2024 Fall Cohort');

-- Add admin users table for authentication
CREATE TABLE IF NOT EXISTS admin_users(
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  last_login TIMESTAMP
);

-- Add admin sessions table for session management
CREATE TABLE IF NOT EXISTS admin_sessions(
  session_id TEXT PRIMARY KEY,
  admin_id INT REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  ip_address TEXT
);

-- Insert default admin user
-- Note: Default password is 'admin123' - should be changed immediately after first login
-- Use environment variable ADMIN_DEFAULT_PASSWORD or change via admin interface
INSERT INTO admin_users (username, password_hash, email) 
SELECT 'admin', '$2a$10$v8Ikr09f0yMD5baD4NIM3eBgUWMd2S42mSWGSldkrVRbmXj3c.UzK', 'admin@example.com'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin');

-- Add default cohort for testing
INSERT INTO cohorts (name, term, team_size, required_roles, open_at, close_at, status) 
SELECT 'Default Cohort', 'Fall 2024', 4, '{"PM":1,"FE":1,"BE":1,"Design":1}', '2024-08-31 15:00:00', '2024-12-31 23:59:59', 'collecting'
WHERE NOT EXISTS (SELECT 1 FROM cohorts WHERE name = 'Default Cohort');
