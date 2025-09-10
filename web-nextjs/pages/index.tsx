
import { useState, useEffect } from "react"
import Head from 'next/head'
import { v4 as uuidv4 } from 'uuid'

const Q = Array.from({length:30}, (_,i)=>i+1)

// 문항별 질문과 선택지 정의
const QUESTIONS = [
  {
    question: "새로운 프로젝트를 맡게 되면 나는…",
    options: ["① 검증된 기존 방식이 더 효율적이라고 생각한다", "② 새로운 방식은 위험부담이 크다고 본다", "③ 상황에 따라 기존 방식과 새 방식을 섞어서 한다", "④ 새로운 방식을 시도해보고 싶어한다", "⑤ 완전히 새로운 접근법을 찾는 것에 흥미를 느낀다"]
  },
  {
    question: "다음 중 더 나와 가까운 것은?",
    options: ["A) 여행에서는 맛있다고 검증된 유명한 음식을 찾아먹는다", "B) 여행에서는 현지인만 아는 특이한 음식을 찾아먹는다", "", "", ""]
  },
  {
    question: "회의에서 예상치 못한 아이디어가 나올 때 나는…",
    options: ["① 보통 듣지만 별다른 반응은 안 한다", "② 관심은 있지만 조용히 넘어간다", "③ 간단히 의견을 묻거나 확인한다", "④ 적극적으로 질문하고 의견을 낸다", "⑤ 그 아이디어를 더 발전시키려고 노력한다"]
  },
  {
    question: "친구들이 평가하는 나는…",
    options: ["① '안정적이고 현실적인 사람'이라고 할 것이다", "② '신중하지만 가끔 새로운 시도를 하는 사람'이라고 할 것이다", "③ '호기심은 많지만 실행력은 보통인 사람'이라고 할 것이다", "④ '새로운 것을 좋아하는 사람'이라고 할 것이다", "⑤ '항상 뭔가 새로운걸 하고 있는 사람'이라고 할 것이다"]
  },
  {
    question: "솔직히, 전시회나 공연 정보를 봤을 때 실제로 가는 비율은?",
    options: ["① 거의 안 감 (10% 이하)", "② 가끔 감 (20-30%)", "③ 반반 정도 (40-50%)", "④ 자주 감 (60-70%)", "⑤ 대부분 감 (80% 이상)"]
  },
  {
    question: "나의 일상 루틴에 대해 솔직한 평가는…",
    options: ["① 효율적이라서 거의 바꾸지 않는다", "② 바꾸고 싶지만 귀찮아서 안 바꾼다", "③ 가끔 작은 변화는 시도한다", "④ 정기적으로 새로운 방법을 실험한다", "⑤ 루틴 자체를 싫어해서 자주 바꾼다"]
  },
  {
    question: "과제 마감 일주일 전, 실제 내 모습은…",
    options: ["① 마감 전날까지 미룬다", "② 마감 2-3일 전에 시작한다", "③ 중반쯤 조금씩 시작한다", "④ 바로 계획을 세우고 시작한다", "⑤ 즉시 시작해서 여유있게 마무리한다"]
  },
  {
    question: "다음 중 더 나와 가까운 것은?",
    options: ["A) 완벽하게 준비하다가 시간이 부족할 때가 있다", "B) 적당히 준비해도 순발력으로 잘 해낸다", "", "", ""]
  },
  {
    question: "지난 한 달간 약속이나 일정을 깜빡한 횟수는?",
    options: ["① 5회 이상", "② 3-4회", "③ 1-2회", "④ 거의 없음", "⑤ 전혀 없음"]
  },
  {
    question: "작업 중 실수를 발견했을 때, 동료들이 보는 내 모습은…",
    options: ["① '대충 넘어가는 편'이라고 할 것이다", "② '필요한 정도만 고치는 편'이라고 할 것이다", "③ '보통 정도로 꼼꼼한 편'이라고 할 것이다", "④ '꼼꼼하게 확인하는 편'이라고 할 것이다", "⑤ '완벽주의적으로 계속 점검하는 편'이라고 할 것이다"]
  },
  {
    question: "솔직히, 충동적인 결정을 내리는 빈도는?",
    options: ["① 매우 자주 (주 3회 이상)", "② 자주 (주 1-2회)", "③ 가끔 (월 2-3회)", "④ 드물게 (월 1회 이하)", "⑤ 거의 안함"]
  },
  {
    question: "계획 세우는 것에 대해 솔직한 내 생각은…",
    options: ["① 계획은 시간 낭비라고 생각한다", "② 그때그때 즉흥적으로 하는 게 더 편하다", "③ 대략적인 방향만 정해놓고 진행한다", "④ 세부 계획까지 세워야 마음이 편하다", "⑤ 완벽한 계획이 있어야 시작할 수 있다"]
  },
  // 외향성 (Extraversion) 영역
  {
    question: "새로운 모임의 쉬는 시간, 실제 내 모습은…",
    options: ["① 아무에게도 말을 걸지 않는다", "② 누가 말을 걸면 대답만 한다", "③ 아는 사람이 있으면 그 사람과만 이야기한다", "④ 옆 사람에게 가볍게 말을 건다", "⑤ 여러 사람과 적극적으로 대화한다"]
  },
  {
    question: "다음 중 더 나와 가까운 것은?",
    options: ["A) 금요일 밤에는 집에서 혼자만의 시간을 갖고 싶다", "B) 금요일 밤에는 사람들과 어울려 에너지를 충전하고 싶다", "", "", ""]
  },
  {
    question: "지난 한 달간 단체 활동에서 내가 주도적 역할을 맡은 횟수는?",
    options: ["① 0회", "② 1-2회", "③ 3-4회", "④ 5-6회", "⑤ 7회 이상"]
  },
  {
    question: "사람들과 함께 있을 때 나는…",
    options: ["① 에너지가 소모되어 피곤해진다", "② 조용히 있고 싶어진다", "③ 상황에 따라 다르다", "④ 기분이 좋아진다", "⑤ 더 활기차고 신난다"]
  },
  {
    question: "대화 중 감정 표현에 대한 솔직한 자가평가는…",
    options: ["① 표정이나 목소리 변화가 거의 없다", "② 가까운 사람에게만 감정을 드러낸다", "③ 상황에 맞게 적절히 표현한다", "④ 감정이 얼굴이나 몸짓에 잘 드러난다", "⑤ 감정 기복이 크고 표현도 강하다"]
  },
  {
    question: "모임에서 내가 침묵하는 시간 vs 말하는 시간의 비율은?",
    options: ["① 8:2 (대부분 듣기만)", "② 7:3", "③ 5:5", "④ 3:7", "⑤ 2:8 (대부분 말함)"]
  },
  // 우호성 (Agreeableness) 영역
  {
    question: "친구의 고민 상담, 실제 내 모습은…",
    options: ["① 듣다가 다른 이야기로 넘어간다", "② 들어주지만 해결책은 별로 안 준다", "③ 공감은 하지만 조언은 간단히만 한다", "④ 끝까지 들어주고 조언도 해준다", "⑤ 내 일처럼 적극적으로 해결책을 찾아준다"]
  },
  {
    question: "다음 중 더 나와 가까운 것은?",
    options: ["A) 각자 자기 일에 집중하는 것이 팀워크에 더 도움된다", "B) 서로 도와주는 것이 팀워크에 더 도움된다", "", "", ""]
  },
  {
    question: "경쟁 상황에서 솔직한 내 모습은…",
    options: ["① 내가 이기는 것이 가장 중요하다", "② 이기려고 노력하지만 관계도 신경쓴다", "③ 경쟁보다는 협력을 선호한다", "④ 다른 사람이 이겨도 별로 신경 안 쓴다", "⑤ 승부 자체에 별로 관심이 없다"]
  },
  {
    question: "동료가 실수했을 때, 주변 사람들이 보는 내 반응은…",
    options: ["① '차갑게 지적하는 편'이라고 할 것이다", "② '무표정하게 넘어가는 편'이라고 할 것이다", "③ '필요한 말만 하는 편'이라고 할 것이다", "④ '이해하며 도와주는 편'이라고 할 것이다", "⑤ '오히려 위로해주는 편'이라고 할 것이다"]
  },
  {
    question: "솔직히, 다른 사람을 도와주는 것에 대해…",
    options: ["① 귀찮다고 느낄 때가 많다", "② 내 일도 바쁜데 부담스럽다", "③ 상황에 따라 다르다", "④ 보통 기꺼이 도와준다", "⑤ 도와주는 것 자체가 기쁘다"]
  },
  {
    question: "타인의 입장을 이해하려 노력하는 빈도는?",
    options: ["① 거의 안함", "② 가끔", "③ 보통", "④ 자주", "⑤ 항상"]
  },
  // 신경성 (Neuroticism) 영역
  {
    question: "시험/발표 전날 밤, 실제 내 모습은…",
    options: ["① 평소처럼 잠든다", "② 조금 늦게 잠든다", "③ 뒤척이다가 잠든다", "④ 자주 깨면서 잔다", "⑤ 거의 못 잔다"]
  },
  {
    question: "다음 중 더 나와 가까운 것은?",
    options: ["A) 예상치 못한 문제가 생기면 당황하고 스트레스를 많이 받는다", "B) 예상치 못한 문제가 생기면 오히려 차분하게 대응한다", "", "", ""]
  },
  {
    question: "지난 한 달간 작은 실수 때문에 하루 종일 신경쓴 횟수는?",
    options: ["① 0회", "② 1-2회", "③ 3-4회", "④ 5-6회", "⑤ 7회 이상"]
  },
  {
    question: "스트레스가 많은 상황에서 나는…",
    options: ["① 평소와 전혀 다르지 않다", "② 조금 예민해지지만 금방 회복한다", "③ 어느 정도 영향을 받는다", "④ 꽤 많이 힘들어한다", "⑤ 감정 조절이 매우 어려워진다"]
  },
  {
    question: "중요한 발표 직전 내 신체 반응은…",
    options: ["① 평소와 똑같다", "② 심장이 조금 빨라진다", "③ 손에 땀이 난다", "④ 떨리고 목소리가 변한다", "⑤ 메스꺼움이나 어지러움을 느낀다"]
  },
  {
    question: "솔직히, 부정적인 생각이 계속 맴도는 빈도는?",
    options: ["① 거의 없음", "② 월 1-2회", "③ 주 1회 정도", "④ 거의 매일", "⑤ 하루 종일"]
  }
]


// 스타일 상수 정의
const styles = {
  container: {
    maxWidth: 1000,
    margin: "0 auto",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    padding: "20px",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    lineHeight: 1.6,
  },
  header: {
    textAlign: "center" as const,
    color: "#0f172a",
    marginBottom: 48,
    fontSize: "2.75rem",
    fontWeight: 800,
    letterSpacing: "-0.025em",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: 1.2,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 24,
    marginBottom: 40,
    padding: "32px",
    backgroundColor: "white",
    borderRadius: 20,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  label: {
    fontWeight: 600,
    fontSize: 15,
    color: "#1e293b",
    letterSpacing: "0.025em",
    marginBottom: 8,
  },
  input: {
    padding: "14px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#f8fafc",
    transition: "all 0.2s ease-in-out",
    outline: "none",
    color: "#1e293b",
    fontWeight: 500,
  },
  inputFocus: {
    borderColor: "#3b82f6",
    backgroundColor: "white",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
  },
  select: {
    padding: "14px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#f8fafc",
    transition: "all 0.2s ease-in-out",
    outline: "none",
    cursor: "pointer",
    color: "#1e293b",
    fontWeight: 500,
  },
  divider: {
    margin: "30px 0",
    border: "none",
    borderTop: "1px solid #eee",
  },
  cohortSection: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  cohortInput: {
    width: 80,
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 4,
  },
  instructionsSection: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 32,
    marginBottom: 40,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  instructionsTitle: {
    color: "#0f172a",
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "-0.025em",
  },
  instructionsContent: {
    lineHeight: 1.7,
    color: "#475569",
    fontSize: 16,
    fontWeight: 500,
  },
  questionTitle: {
    marginBottom: 32,
    color: "#0f172a",
    fontSize: 26,
    fontWeight: 800,
    textAlign: "center" as const,
    letterSpacing: "-0.025em",
  },

  questionItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 24,
    margin: "24px 0",
    padding: "24px",
    backgroundColor: "white",
    borderRadius: 20,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease-in-out",
    border: "1px solid #e2e8f0",
  },
  questionItemHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    borderColor: "#cbd5e1",
  },
  questionNumber: {
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "white",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    borderRadius: "50%",
    fontSize: 16,
    flexShrink: 0,
  },
  questionText: {
    marginBottom: 16,
    fontSize: 17,
    lineHeight: 1.6,
    color: "#0f172a",
    fontWeight: 600,
  },
  optionsGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  optionLabel: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    padding: "12px 16px",
    borderRadius: 12,
    transition: "all 0.2s ease-in-out",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    fontSize: 15,
    lineHeight: 1.5,
    color: "#1e293b",
    fontWeight: 500,
  },
  optionLabelHover: {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
  },
  optionLabelSelected: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "#3b82f6",
    color: "#0f172a",
    fontWeight: 600,
  },
  submitButton: {
    marginTop: 40,
    padding: "16px 32px",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease-in-out",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    width: "100%",
    maxWidth: 300,
    margin: "40px auto 0",
    display: "block",
  },
  submitButtonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  requiredField: {
    color: "#e53e3e",
    marginLeft: 4,
  },
  radioGroup: {
    display: "flex",
    gap: 15,
  },
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 8,
    maxWidth: 500,
    width: "90%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 600,
    margin: 0,
  },
  modalCloseButton: {
    background: "none",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    color: "#666",
  },
  modalBody: {
    marginBottom: 20,
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },
  modalButton: {
    padding: "8px 16px",
    backgroundColor: "#4a6cf7",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 14,
    marginTop: 4,
  },
  successModalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 8,
    maxWidth: 500,
    width: "90%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center" as const,
  },
  oceanResult: {
    display: "flex",
    justifyContent: "space-around",
    margin: "20px 0",
    flexWrap: "wrap" as const,
  },
  oceanItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    margin: "10px 0",
  },
  oceanScore: {
    fontSize: 24,
    fontWeight: 700,
    color: "#4a6cf7",
  },
  oceanLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    height: 12,
    overflow: "hidden",
    boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    transition: "width 0.5s ease-in-out",
    borderRadius: 12,
  },
  progressText: {
    fontSize: 16,
    color: "#475569",
    marginTop: 12,
    textAlign: "center" as const,
    fontWeight: 600,
  },
}

export default function Home(){
  const [cohortId,setCohortId] = useState("2")
  const [form,setForm] = useState({
    id: uuidv4(), // 자동으로 UUID 생성
    name: "", email:"", major:"", skills:"", mbti:"",
    role_pref:"FE", availability:"MonEve;WedEve;Weekend"
  })
  const [answers,setAnswers] = useState<Record<string,number>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [oceanResults, setOceanResults] = useState<Record<string, number>>({})
  const [progress, setProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 진행 상황 계산
  useEffect(() => {
    const answeredCount = Object.keys(answers).length
    const totalQuestions = 30
    const newProgress = Math.floor((answeredCount / totalQuestions) * 100)
    setProgress(newProgress)
  }, [answers])

  const update = (k:string,v:string)=> {
    setForm(prev=>({...prev,[k]:v}))
    // 에러 메시지 제거
    if (errors[k]) {
      setErrors(prev => {
        const newErrors = {...prev}
        delete newErrors[k]
        return newErrors
      })
    }
  }
  
  const setAns = (q:number,v:number)=> setAnswers(prev=>({...prev,[`Q${q}`]:v}))

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    let isValid = true
    
    // UUID 형식 검사
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!form.id || !uuidRegex.test(form.id)) {
      newErrors.id = "유효하지 않은 UUID 형식입니다"
      isValid = false
    }
    
    if (!form.name) {
      newErrors.name = "이름을 입력해주세요"
      isValid = false
    }
    
    if (!form.email) {
      newErrors.email = "이메일을 입력해주세요"
      isValid = false
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다"
      isValid = false
    }
    
    // 모든 질문 응답 확인
    const unansweredQuestions = []
    for (let i = 1; i <= 30; i++) {
      if (!answers[`Q${i}`]) {
        unansweredQuestions.push(i)
        isValid = false
      }
    }
    
    if (unansweredQuestions.length > 0) {
      if (unansweredQuestions.length <= 5) {
        setErrorMessage(`다음 문항에 응답해주세요: Q${unansweredQuestions.join(', Q')}`)
      } else {
        setErrorMessage(`${unansweredQuestions.length}개 문항에 응답하지 않았습니다. 모든 문항에 응답해주세요.`)
      }
      setShowErrorModal(true)
    }
    
    setErrors(newErrors)
    return isValid
  }

  const submit = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const payload = {
        student: form,
        answers
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/cohorts/${cohortId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      
      if (data.ok) {
        setOceanResults(data.ocean)
        setShowSuccessModal(true)
      } else {
        setErrorMessage(data.error || "서버 오류가 발생했습니다. 다시 시도해주세요.")
        setShowErrorModal(true)
      }
    } catch (error) {
      // 에러 유형에 따른 더 자세한 메시지 제공
      let message = "네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.";
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        message = "서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.";
      } else if (error instanceof SyntaxError) {
        message = "서버로부터 잘못된 응답을 받았습니다. 관리자에게 문의해주세요.";
      }
      
      setErrorMessage(message);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>NeXeed Big Five 설문</title>
        <meta name="description" content="NeXeed 프로젝트를 위한 Big Five 성격 설문" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <main style={styles.container} role="main">
        <h1 style={styles.header}>NeXeed Big Five 설문 제출</h1>
        
        <div style={styles.progressContainer} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="설문 진행률">
          <div style={{...styles.progressBar, width: `${progress}%`}}></div>
        </div>
        <div style={styles.progressText} aria-live="polite" id="progress-text">
          {progress}% 완료 ({Object.keys(answers).length}/30 문항 응답)
        </div>
        
        <fieldset style={{...styles.formGrid, border: "none", margin: 0, padding: "32px"}}>
          <legend style={{fontSize: "20px", fontWeight: 700, color: "#1f2937", marginBottom: "24px", padding: 0}}>개인정보 입력</legend>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              학번 (자동 생성된 UUID) <span style={styles.requiredField}>*</span>
            </label>
            <div style={{display: "flex", gap: 10}}>
              <input 
                style={{...styles.input, ...(errors.id ? {border: "1px solid #e53e3e"} : {}), flex: 1, backgroundColor: "#f5f5f5"}}
                value={form.id} 
                readOnly
              />
              <button 
                style={{padding: "0 12px", backgroundColor: "#4a6cf7", color: "white", border: "none", borderRadius: 4, cursor: "pointer"}}
                onClick={() => {
                  navigator.clipboard.writeText(form.id);
                  alert("UUID가 클립보드에 복사되었습니다.");
                }}
              >
                복사
              </button>
            </div>
            <div style={{fontSize: 12, color: "#666", marginTop: 4}}>자동 생성된 UUID를 사용합니다. 필요시 복사 버튼을 클릭하세요.</div>
            {errors.id && <div style={styles.errorText}>{errors.id}</div>}
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>
              이름 <span style={styles.requiredField}>*</span>
            </label>
            <input 
              style={{...styles.input, ...(errors.name ? {border: "2px solid #ef4444"} : {})}}
              placeholder="예: 홍길동" 
              value={form.name} 
              onChange={e=>update("name", e.target.value)}
              onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={e => {
                e.target.style.borderColor = errors.name ? "#ef4444" : "#e5e7eb";
                e.target.style.backgroundColor = "#f9fafb";
                e.target.style.boxShadow = "none";
              }}
            />
            {errors.name && <div style={styles.errorText}>{errors.name}</div>}
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>
              이메일 <span style={styles.requiredField}>*</span>
            </label>
            <input 
              style={{...styles.input, ...(errors.email ? {border: "2px solid #ef4444"} : {})}}
              placeholder="예: example@email.com" 
              value={form.email} 
              onChange={e=>update("email", e.target.value)}
              onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={e => {
                e.target.style.borderColor = errors.email ? "#ef4444" : "#e5e7eb";
                e.target.style.backgroundColor = "#f9fafb";
                e.target.style.boxShadow = "none";
              }}
            />
            {errors.email && <div style={styles.errorText}>{errors.email}</div>}
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>전공</label>
            <input 
              style={styles.input}
              placeholder="예: 컴퓨터공학과" 
              value={form.major} 
              onChange={e=>update("major", e.target.value)} 
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>보유 기술</label>
            <input 
              style={styles.input}
              placeholder="예: React, Node.js, Python" 
              value={form.skills} 
              onChange={e=>update("skills", e.target.value)} 
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>MBTI (선택사항)</label>
            <input 
              style={styles.input}
              placeholder="예: ENFP" 
              value={form.mbti} 
              onChange={e=>update("mbti", e.target.value)} 
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>선호 역할</label>
            <select 
              style={styles.select}
              value={form.role_pref} 
              onChange={e=>update("role_pref", e.target.value)}
            >
              <option value="PM">프로젝트 매니저 (PM)</option>
              <option value="FE">프론트엔드 (FE)</option>
              <option value="BE">백엔드 (BE)</option>
              <option value="Design">디자인 (Design)</option>
              <option value="Any">상관없음 (Any)</option>
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>가능한 시간 (고정값)</label>
            <input 
              style={{...styles.input, backgroundColor: "#f5f5f5", cursor: "not-allowed"}}
              placeholder="예: MonEve;WedEve;Weekend" 
              value={form.availability} 
              readOnly
            />
            <div style={{fontSize: 12, color: "#666", marginTop: 4}}>이 값은 수정할 수 없습니다.</div>
          </div>
        </fieldset>

        <hr style={styles.divider} />

        <div style={styles.cohortSection}>
          <label style={styles.label}>코호트 ID: </label>
          <input 
            style={styles.cohortInput} 
            value={cohortId} 
            onChange={e=>setCohortId(e.target.value)} 
          />
        </div>

        <div style={styles.instructionsSection}>
          <h2 style={styles.instructionsTitle}>안내사항</h2>
          <div style={styles.instructionsContent}>
            <p><strong>검사 지시사항:</strong></p>
            <p>이 검사는 대학생 팀빌딩을 위해 설계되었습니다.</p>
            <p>각 문항에 대해 가장 솔직하게 답변해주세요.</p>
            <p>정답은 없으며, 이는 당신의 자연스러운 성향을 이해하기 위한 것입니다.</p>
            <p>응답 시 사회적 기대(예: "이게 더 좋게 보일까?")를 배제하고 실제 모습을 떠올려주세요.</p>
            <p>문항은 영역별로 섞여 있으며, 역문항(점수 반전 필요)이 포함되어 있습니다.</p>
          </div>
        </div>
        
        <h2 style={styles.questionTitle} id="questions-title">성격 설문 문항 (1~5점)</h2>
        <p>각 문항에 대해 1(전혀 그렇지 않다)부터 5(매우 그렇다)까지 평가해주세요.</p>
        
        {Q.map(i => {
          return (
            <div 
              key={i} 
              role="group"
              aria-labelledby={`question-${i}-text`}
              style={{...styles.questionItem, borderLeft: `4px solid #667eea`}}
              onMouseEnter={e => Object.assign(e.currentTarget.style, styles.questionItemHover)}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                e.currentTarget.style.borderColor = "#f3f4f6";
              }}
            >
              <div style={styles.questionNumber}>Q{i}</div>
              <div style={{flex: 1}}>
                <div style={styles.questionText} id={`question-${i}-text`}>
                  {QUESTIONS[i-1].question}
                </div>
                <div style={styles.optionsGroup} role="radiogroup" aria-labelledby={`question-${i}-text`}>
                  {QUESTIONS[i-1].options.map((option,idx)=>{
                    // 빈 선택지는 렌더링하지 않음
                    if (!option || option.trim() === '') return null;
                    
                    // A/B 강제선택 문항의 경우 A=1점, B=5점으로 설정
                    const isForceChoice = QUESTIONS[i-1].question.includes('강제선택');
                    const v = isForceChoice ? (idx === 0 ? 1 : 5) : idx+1;
                    const checked = answers[`Q${i}`]===v
                    return (
                      <label 
                        key={v} 
                        style={{...styles.optionLabel, ...(checked ? styles.optionLabelSelected : {})}}
                        onMouseEnter={e => {
                          if (!checked) {
                            Object.assign(e.currentTarget.style, styles.optionLabelHover);
                          }
                        }}
                        onMouseLeave={e => {
                          if (!checked) {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                            e.currentTarget.style.borderColor = "#f3f4f6";
                          }
                        }}
                      >
                        <input 
                          type="radio" 
                          name={`Q${i}`} 
                          checked={checked} 
                          onChange={()=>setAns(i,v)} 
                          aria-describedby={`question-${i}-text`}
                        /> 
                        {option}
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          );
        })}

        <button 
          onClick={submit} 
          style={{...styles.submitButton, ...(isSubmitting ? {opacity: 0.7, cursor: "not-allowed"} : {})}}
          disabled={isSubmitting}
          onMouseEnter={e => {
            if (!isSubmitting) {
              Object.assign(e.currentTarget.style, styles.submitButtonHover);
            }
          }}
          onMouseLeave={e => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }
          }}
          onFocus={e => {
            if (!isSubmitting) {
              Object.assign(e.currentTarget.style, styles.submitButtonHover);
            }
          }}
          onBlur={e => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }
          }}
          aria-describedby="progress-text"
          aria-label="설문 제출하기"
        >
          {isSubmitting ? "제출 중..." : "설문 제출하기"}
        </button>
        
        {/* 에러 모달 */}
        {showErrorModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>알림</h3>
                <button 
                  style={styles.modalCloseButton}
                  onClick={() => setShowErrorModal(false)}
                >
                  ×
                </button>
              </div>
              <div style={styles.modalBody}>
                <p>{errorMessage}</p>
              </div>
              <div style={styles.modalFooter}>
                <button 
                  style={styles.modalButton}
                  onClick={() => setShowErrorModal(false)}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 성공 모달 */}
        {showSuccessModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.successModalContent}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>제출 완료!</h3>
                <button 
                  style={styles.modalCloseButton}
                  onClick={() => setShowSuccessModal(false)}
                >
                  ×
                </button>
              </div>
              <div style={styles.modalBody}>
                <p>성격 설문이 성공적으로 제출되었습니다.</p>
                <p>당신의 Big Five 성격 특성 결과:</p>
                
                <div style={styles.oceanResult}>
                  <div style={styles.oceanItem}>
                    <div style={styles.oceanScore}>{oceanResults.O}</div>
                    <div style={styles.oceanLabel}>개방성 (O)</div>
                  </div>
                  <div style={styles.oceanItem}>
                    <div style={styles.oceanScore}>{oceanResults.C}</div>
                    <div style={styles.oceanLabel}>성실성 (C)</div>
                  </div>
                  <div style={styles.oceanItem}>
                    <div style={styles.oceanScore}>{oceanResults.E}</div>
                    <div style={styles.oceanLabel}>외향성 (E)</div>
                  </div>
                  <div style={styles.oceanItem}>
                    <div style={styles.oceanScore}>{oceanResults.A}</div>
                    <div style={styles.oceanLabel}>친화성 (A)</div>
                  </div>
                  <div style={styles.oceanItem}>
                    <div style={styles.oceanScore}>{oceanResults.N}</div>
                    <div style={styles.oceanLabel}>신경성 (N)</div>
                  </div>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button 
                  style={styles.modalButton}
                  onClick={() => setShowSuccessModal(false)}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
          
        {/* 관리자 로그인 링크 */}
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          <a 
            href="/admin/login"
            style={{
              display: 'inline-block',
              padding: '10px 15px',
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              fontSize: '14px',
              opacity: 0.7,
              transition: 'opacity 0.3s'
            }}
            onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.opacity = '1'}
            onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.opacity = '0.7'}
          >
            관리자
          </a>
        </div>
      </main>
    </>
  )
}
