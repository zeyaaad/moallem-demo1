import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlarmClock, ArrowRight, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Flag, RotateCcw,
  Send, Sparkles, Target, Trophy, X,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Logo } from '../../components/Logo'
import { Button, Card, Modal, useToast } from '../../components/ui'
import { cn } from '../../lib/utils'

export default function TakeExamPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, db, getSubject, getTeacher, submitAttempt } = useStore()
  const { push } = useToast()
  const exam = db.exams.find((e) => e.id === id)
  const subject = exam ? getSubject(exam.subjectId) : undefined
  const teacher = exam ? getTeacher(exam.teacherId) : undefined
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState((exam?.durationMin ?? 30) * 60)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof submitAttempt>>(null)

  const isStudent = currentUser?.role === 'student'

  useEffect(() => {
    if (result) return
    const timer = setInterval(() => setTimeLeft((v) => Math.max(0, v - 1)), 1000)
    return () => clearInterval(timer)
  }, [result])

  const doSubmit = (auto = false) => {
    if (!exam || result) return
    const attempt = submitAttempt(exam.id, answers, Math.max(1, exam.durationMin - Math.round(timeLeft / 60)))
    setResult(attempt)
    setConfirmOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    push({
      title: auto ? 'انتهى الوقت — تم تسليم الامتحان' : 'تم تسليم الامتحان بنجاح',
      body: attempt ? `درجتك ${attempt.score} من ${attempt.total}` : undefined,
      tone: 'success',
    })
  }

  useEffect(() => {
    if (timeLeft === 0 && !result) doSubmit(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  if (!exam) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">الامتحان غير موجود.</div>
  }

  if (!isStudent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center">
        <p className="text-sm font-bold text-slate-700">هذه الصفحة مخصصة للطلاب فقط.</p>
        <Link to={`/app/exams/${exam.id}`}><Button variant="secondary">العودة لصفحة الامتحان</Button></Link>
      </div>
    )
  }

  if (result) {
    return <ExamResult examId={exam.id} attempt={result} answers={answers} onRetry={() => { setResult(null); setAnswers({}); setFlagged(new Set()); setIndex(0); setTimeLeft(exam.durationMin * 60); navigate(0) }} />
  }

  const question = exam.questions[index]
  const answered = Object.keys(answers).length
  const progress = Math.round((answered / exam.questions.length) * 100)
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const lowTime = timeLeft < 300

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/app/exams" className="hidden sm:block"><Logo compact /></Link>
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-extrabold text-slate-900">{exam.title}</p>
            <p className="text-[10px] text-slate-400">{subject?.name} • {teacher?.name}</p>
          </div>
          <div className={cn('flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono text-xs font-bold tabular-nums', lowTime ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700')}>
            <AlarmClock className={cn('size-4', lowTime && 'animate-pulse')} />
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
          <button onClick={() => setConfirmOpen(true)} className="hidden h-9 items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-xs font-bold text-white transition hover:bg-brand-700 sm:flex">
            <Send className="size-3.5" /> تسليم
          </button>
        </div>
        <div className="h-1 bg-slate-100"><div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} /></div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[1fr_280px]">
        {/* Question */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-500 shadow-sm">السؤال {index + 1} من {exam.questions.length}</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className={cn('rounded-full px-2 py-1 font-bold', question.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' : question.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600')}>
                {question.difficulty === 'easy' ? 'سهل' : question.difficulty === 'medium' ? 'متوسط' : 'صعب'}
              </span>
              <span className="rounded-full bg-white px-2 py-1 font-bold text-slate-500 shadow-sm">{question.marks} درجة</span>
            </div>
          </div>

          <Card className="p-5 sm:p-7">
            <div className="mb-1 text-[10px] font-bold text-brand-600">{question.type === 'truefalse' ? 'صح أم خطأ' : 'اختر الإجابة الصحيحة'} — {question.skill}</div>
            <h2 className="text-lg font-extrabold leading-9 text-slate-900 sm:text-xl">{question.text}</h2>

            <div className="mt-6 space-y-2.5">
              {question.options.map((opt, i) => {
                const selected = answers[question.id] === i
                return (
                  <button
                    key={i}
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: i }))}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-start transition sm:p-4',
                      selected ? 'border-brand-500 bg-brand-50/60 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold', selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500')}>
                      {question.type === 'truefalse' ? (i === 0 ? <Check className="size-4" /> : <X className="size-4" />) : ['أ', 'ب', 'ج', 'د'][i]}
                    </span>
                    <span className={cn('flex-1 text-sm font-semibold', selected ? 'text-brand-900' : 'text-slate-700')}>{opt}</span>
                    <span className={cn('flex size-5 items-center justify-center rounded-full border-2', selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200')}>
                      {selected && <Check className="size-3" />}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-5">
              <div className="flex gap-2">
                <button
                  onClick={() => setFlagged((prev) => { const next = new Set(prev); if (next.has(question.id)) next.delete(question.id); else next.add(question.id); return next })}
                  className={cn('flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition', flagged.has(question.id) ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100')}
                >
                  <Flag className="size-3.5" /> {flagged.has(question.id) ? 'معلّم للمراجعة' : 'علّم للمراجعة'}
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
                  <ChevronRight className="size-3.5" /> السابق
                </Button>
                {index < exam.questions.length - 1 ? (
                  <Button size="sm" onClick={() => setIndex((i) => Math.min(exam.questions.length - 1, i + 1))}>
                    التالي <ChevronLeft className="size-3.5" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setConfirmOpen(true)}><Send className="size-3.5" /> تسليم الامتحان</Button>
                )}
              </div>
            </div>
          </Card>

          <p className="mt-3 text-center text-[10px] text-slate-400">يمكنك تغيير إجابتك في أي وقت قبل التسليم. تأكد من مراجعة الأسئلة المعلّمة.</p>
        </div>

        {/* Navigator */}
        <aside className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-extrabold text-slate-800">خريطة الأسئلة</p>
              <span className="text-[10px] text-slate-400">{answered}/{exam.questions.length}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, i) => {
                const isAnswered = answers[q.id] !== undefined
                const isFlagged = flagged.has(q.id)
                return (
                  <button
                    key={q.id}
                    onClick={() => setIndex(i)}
                    className={cn(
                      'relative flex aspect-square items-center justify-center rounded-lg text-[11px] font-bold transition',
                      i === index ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2' : isAnswered ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200',
                    )}
                  >
                    {i + 1}
                    {isFlagged && <span className="absolute -end-0.5 -top-0.5 size-2 rounded-full bg-amber-400 ring-1 ring-white" />}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
              <p className="flex items-center gap-2"><span className="size-3 rounded bg-brand-50 ring-1 ring-brand-100" /> تمت الإجابة ({answered})</p>
              <p className="flex items-center gap-2"><span className="size-3 rounded bg-slate-100" /> لم تُجب ({exam.questions.length - answered})</p>
              <p className="flex items-center gap-2"><span className="size-3 rounded bg-amber-400" /> معلّم للمراجعة ({flagged.size})</p>
            </div>
          </Card>

          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800"><Clock className="size-3.5 text-slate-400" /> الوقت المتبقي</p>
            <p className={cn('mt-2 font-mono text-2xl font-black tabular-nums', lowTime ? 'text-rose-600' : 'text-slate-900')}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">سيتم التسليم تلقائيًا عند انتهاء الوقت.</p>
            <Button className="mt-3 w-full" variant="dark" onClick={() => setConfirmOpen(true)}><Send className="size-3.5" /> تسليم الامتحان</Button>
          </Card>
        </aside>
      </main>

      <div className="sticky bottom-0 border-t border-slate-200 bg-white p-3 sm:hidden">
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>السابق</Button>
          {index < exam.questions.length - 1
            ? <Button className="flex-1" onClick={() => setIndex((i) => i + 1)}>التالي</Button>
            : <Button className="flex-1" onClick={() => setConfirmOpen(true)}>تسليم</Button>}
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="تأكيد تسليم الامتحان"
        description="بعد التسليم لا يمكنك تعديل إجاباتك."
        size="sm"
        footer={<><Button variant="secondary" onClick={() => setConfirmOpen(false)}>متابعة الحل</Button><Button onClick={() => doSubmit()}>تسليم نهائي</Button></>}
      >
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-brand-50 p-3"><p className="text-lg font-black text-brand-700">{answered}</p><p className="text-[10px] text-brand-600">تمت الإجابة</p></div>
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-lg font-black text-slate-700">{exam.questions.length - answered}</p><p className="text-[10px] text-slate-500">بدون إجابة</p></div>
          <div className="rounded-xl bg-amber-50 p-3"><p className="text-lg font-black text-amber-700">{flagged.size}</p><p className="text-[10px] text-amber-600">معلّمة</p></div>
        </div>
        {exam.questions.length - answered > 0 && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-[11px] font-semibold text-amber-700">لديك {exam.questions.length - answered} سؤالًا بدون إجابة — هل أنت متأكد؟</p>
        )}
      </Modal>
    </div>
  )
}

function ExamResult({ examId, attempt, answers, onRetry }: {
  examId: string
  attempt: NonNullable<ReturnType<ReturnType<typeof useStore>['submitAttempt']>>
  answers: Record<string, number>
  onRetry: () => void
}) {
  const { db } = useStore()
  const exam = db.exams.find((e) => e.id === examId)!
  const subject = db.subjects.find((s) => s.id === exam.subjectId)
  const pct = Math.round((attempt.score / attempt.total) * 100)
  const correct = exam.questions.filter((q) => answers[q.id] === q.correctIndex).length
  const wrong = exam.questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex).length
  const skipped = exam.questions.length - correct - wrong
  const grade = pct >= 90 ? 'ممتاز' : pct >= 80 ? 'جيد جدًا' : pct >= 70 ? 'جيد' : pct >= 60 ? 'مقبول' : 'يحتاج تحسين'

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Logo compact />
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700"><CheckCircle2 className="size-3.5" /> تم التسليم</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Card className="overflow-hidden">
          <div className="relative overflow-hidden bg-slate-950 p-6 text-center text-white sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-700/70 to-slate-950" />
            <div className="relative">
              <div className="relative mx-auto flex size-32 items-center justify-center">
                <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="9" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke={pct >= 60 ? '#34d399' : '#fb7185'} strokeWidth="9" strokeDasharray={`${(pct / 100) * 327} 327`} strokeLinecap="round" />
                </svg>
                <div>
                  <p className="text-3xl font-black">{pct}%</p>
                  <p className="text-[10px] text-white/50">{grade}</p>
                </div>
              </div>
              <h1 className="mt-4 text-xl font-black">أحسنت! انتهى الامتحان 🎉</h1>
              <p className="mt-1 text-xs text-white/60">{exam.title}</p>
              <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-white/10 px-5 py-3 text-[11px] backdrop-blur">
                <span>الدرجة: <b className="text-base">{attempt.score}</b> / {attempt.total}</span>
                <span className="text-white/30">|</span>
                <span>صحيحة: <b className="text-emerald-300">{correct}</b></span>
                <span>خاطئة: <b className="text-rose-300">{wrong}</b></span>
                <span>بدون إجابة: <b className="text-amber-300">{skipped}</b></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-100 border-b border-slate-100">
            <div className="p-4 text-center"><Clock className="mx-auto mb-1 size-4 text-slate-400" /><p className="text-sm font-extrabold">{attempt.timeSpentMin} دقيقة</p><p className="text-[10px] text-slate-400">وقت الحل</p></div>
            <div className="p-4 text-center"><Target className="mx-auto mb-1 size-4 text-slate-400" /><p className="text-sm font-extrabold">{correct}/{exam.questions.length}</p><p className="text-[10px] text-slate-400">إجابات صحيحة</p></div>
            <div className="p-4 text-center"><Trophy className="mx-auto mb-1 size-4 text-amber-500" /><p className="text-sm font-extrabold">+{attempt.score * 5}</p><p className="text-[10px] text-slate-400">نقاط مكتسبة</p></div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold text-slate-900">مراجعة الإجابات</h2>
              <span className="flex items-center gap-1 text-[10px] text-slate-400"><Sparkles className="size-3 text-violet-500" /> {subject?.name}</span>
            </div>
            <div className="space-y-3">
              {exam.questions.map((q, i) => {
                const chosen = answers[q.id]
                const isCorrect = chosen === q.correctIndex
                return (
                  <div key={q.id} className={cn('rounded-xl border p-3.5', isCorrect ? 'border-emerald-100 bg-emerald-50/40' : chosen === undefined ? 'border-slate-100 bg-slate-50/60' : 'border-rose-100 bg-rose-50/40')}>
                    <div className="flex items-start gap-2">
                      <span className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white', isCorrect ? 'bg-emerald-500' : chosen === undefined ? 'bg-slate-300' : 'bg-rose-500')}>
                        {isCorrect ? <Check className="size-3" /> : chosen === undefined ? <span className="text-[9px]">—</span> : <X className="size-3" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold leading-6 text-slate-800">{i + 1}. {q.text}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {q.options.map((opt, oi) => (
                            <span key={oi} className={cn('rounded-lg px-2 py-1 text-[10px]', oi === q.correctIndex ? 'bg-emerald-100 font-bold text-emerald-700' : oi === chosen ? 'bg-rose-100 font-bold text-rose-700' : 'bg-white text-slate-400')}>
                              {opt} {oi === q.correctIndex && '✓'} {oi === chosen && oi !== q.correctIndex && '✗'}
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 text-[10px] text-slate-400">إجابتك: {chosen !== undefined ? q.options[chosen] : 'لم تُجب'} • الصحيحة: {q.options[q.correctIndex]} • {q.marks} درجة</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/app/exams"><Button>العودة للامتحانات <ArrowRight className="size-4" /></Button></Link>
              <Button variant="secondary" onClick={onRetry}><RotateCcw className="size-4" /> إعادة المحاولة</Button>
              <Link to="/app/reels"><Button variant="ghost">راجع الريلز ذات الصلة</Button></Link>
            </div>
          </div>
        </Card>
        <p className="mt-4 text-center text-[10px] text-slate-400">تم تسجيل نتيجتك وإشعار معلمك تلقائيًا.</p>
      </main>
    </div>
  )
}
