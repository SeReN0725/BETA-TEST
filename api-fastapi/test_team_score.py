import psycopg2
import requests
import json

# 데이터베이스에서 학생 데이터 가져오기
conn = psycopg2.connect('postgresql://nexeed:nexeed@db:5432/nexeed')
cur = conn.cursor()

cur.execute("""
    SELECT s.id, s.name, s.role_pref, s.availability, b.O, b.C, b.E, b.A, b.N 
    FROM students s 
    JOIN cohort_enrollments ce ON s.id = ce.student_id 
    JOIN bigfive_responses b ON s.id = b.student_id 
    WHERE ce.cohort_id = 4 
    LIMIT 6
""")

rows = cur.fetchall()
students = []

for r in rows:
    student = {
        'student_id': str(r[0]),
        'name': r[1],
        'role_pref': r[2],
        'availability': r[3],
        'O': float(r[4]),
        'C': float(r[5]),
        'E': float(r[6]),
        'A': float(r[7]),
        'N': float(r[8])
    }
    students.append(student)

conn.close()

print("학생 데이터:")
for s in students[:3]:
    print(f"ID: {s['student_id']}, O: {s['O']}, C: {s['C']}, E: {s['E']}, A: {s['A']}, N: {s['N']}")

# API 테스트
print("\n팀 매칭 테스트:")
response = requests.post('http://localhost:8001/match/run', json={
    'students': students,
    'team_size': 3,
    'required_roles': {'PM': 1, 'FE': 1, 'BE': 1}
})

print(f"Response status: {response.status_code}")
result = response.json()
print(f"Teams count: {len(result['teams'])}")

for i, team in enumerate(result['teams']):
    print(f"\n팀 {i+1} 점수: {team['score']:.4f}")
    print(f"멤버: {[m['student_id'] for m in team['members']]}")
    if 'reasons' in team:
        print(f"이유: {team['reasons']}")