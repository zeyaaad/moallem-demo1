import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BarChart3, Brain, CalendarDays, CheckCircle2, ChevronLeft, ClipboardList, Clock, Eye,
  FileQuestion, Plus, Sparkles, Trash2, TrendingUp, Trophy, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Exam, Parent, Student } from '../../types'
import {
  Badge, Button, Card, EmptyState, Modal, PageHeader, SearchInput, StatCard, Tabs, useToast,
} from '../../components/ui'
import SubjectIcon from '../../components/SubjectIcon'
import { cn, relativeDay } from '../../lib/utils'

export default function ExamsPage() {
  const { currentUser } = useStore()
  const role = currentUser?.role
  if (role === 'teacher') return <TeacherExams />
  if (role === 'manager') return <TeacherExams schoolWide />
  if (role === 'parent') return <ParentExams />
  return <StudentExams />
}

/* ------------------------------------------------------------------ */
/* Teacher                                                             */
/* ------------------------------------------------------------------ */

function TeacherExams({ schoolWide = false }: { schoolWide?: boolean }) {
  const { currentUser, db, getClass, getSubject, publishExam, deleteExam } = useStore()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'all' | Exam['status']>('all')
  const [q, setQ] = useState('')
  const [toDelete, setToDelete] = useState<Exam | null>(null)
  const { push } = useToast()

  useEffect(() => {
    if (params.get('new') || params.get('ai')) navigate('/app/exams/new?mode=ai')
  }, [params, navigate])

  const myExams = db.exams.filter((e) =>
    schoolWide ? e.schoolId === currentUser?.schoolId : e.teacherId === currentUser?.id,
  )
  const filtered = useMemo(() => {
    return myExams
      .filter((e) => tab === 'all' || e.status === tab)
      .filter((e) => !q || e.title.includes(q) || getClass(e.classId)?.name.includes(q))
  }, [myExams, tab, q, getClass])

  const totalAttempts = db.attempts.filter((a) => myExams.some((e) => e.id === a.examId)).length
  const avg = Math.round(myExams.filter((e) => e.attempts).reduce((s, e) => s + e.averageScore, 0) / Math.max(1, myExams.filter((e) => e.attempts).length))

  return (
    <div>
      <PageHeader
        title="الامتحانات"
        subtitle={schoolWide ? 'تابع كل امتحانات المدرسة ونتائجها، واكتشف المواد التي تحتاج دعمًا.' : 'أنشئ امتحاناتك يدويًا أو بالذكاء الاصطناعي، وتابع نتائج الطلاب لحظة بلحظة.'}
        actions={schoolWide ? undefined : (
          <>
            <Link to="/app/exams/new?mode=manual"><Button variant="secondary"><Plus className="size-4" /> إنشاء يدوي</Button></Link>
            <Link to="/app/exams/new?mode=ai"><Button><Sparkles className="size-4" /> امتحان بالذكاء الاصطناعي</Button></Link>
          </>
        )}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="إجمالي الامتحانات" value={myExams.length} icon={ClipboardList} tone="brand" hint={`${myExams.filter((e) => e.status === 'published').length} منشور`} />
        <StatCard label="إجمالي التسليمات" value={totalAttempts} icon={Users} tone="sky" delta="+٨" hint="هذا الأسبوع" />
        <StatCard label="متوسط الدرجات" value={`${avg}%`} icon={TrendingUp} tone="emerald" delta="+٤٪" hint="على كل الامتحانات" />
        <StatCard label="امتحانات AI" value={myExams.filter((e) => e.source === 'ai').length} icon={Brain} tone="violet" hint="وفرت ٤ ساعات" />
      </div>

      <Card className="mb-4 flex flex-wrap items-center justify-between gap-3 p-3">
        <Tabs
          tabs={[
            { value: 'all', label: 'الكل', count: myExams.length },
            { value: 'published', label: 'منشور', count: myExams.filter((e) => e.status === 'published').length },
            { value: 'draft', label: 'مسودة', count: myExams.filter((e) => e.status === 'draft').length },
            { value: 'closed', label: 'مغلق', count: myExams.filter((e) => e.status === 'closed').length },
          ]}
          value={tab}
          onChange={setTab}
          className="bg-transparent p-0"
        />
        <SearchInput value={q} onChange={setQ} placeholder="ابحث باسم الامتحان…" className="w-full sm:w-56" />
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={ClipboardList} title="لا توجد امتحانات في هذا التصنيف" description={schoolWide ? 'لم ينشئ معلمو المدرسة امتحانات في هذا التصنيف بعد.' : 'ابدأ بإنشاء امتحان جديد لطلابك.'} action={schoolWide ? undefined : <Link to="/app/exams/new?mode=ai"><Button><Sparkles className="size-4" /> إنشاء امتحان</Button></Link>} />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((exam) => {
            const subject = getSubject(exam.subjectId)
            const cls = getClass(exam.classId)
            return (
              <Card key={exam.id} className="card-hover p-4">
                <div className="flex flex-wrap items-start gap-4">
                  <SubjectIcon subject={subject} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/app/exams/${exam.id}`} className="text-sm font-extrabold text-slate-900 hover:text-brand-600">{exam.title}</Link>
                      {exam.source === 'ai' && <Badge tone="violet"><Sparkles className="size-2.5" /> AI</Badge>}
                      <Badge tone={exam.status === 'published' ? 'emerald' : exam.status === 'draft' ? 'amber' : 'slate'} dot>
                        {exam.status === 'published' ? 'منشور' : exam.status === 'draft' ? 'مسودة' : 'مغلق'}
                      </Badge>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                      <span>{subject?.name}</span>
                      <span>•</span>
                      <span>فصل {cls?.name}</span>
                      <span>•</span>
                      <span>{exam.questions.length} أسئلة</span>
                      <span>•</span>
                      <span>{exam.durationMin} دقيقة</span>
                      <span>•</span>
                      <span>{exam.totalMarks} درجة</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-center">
                      <p className="text-[9px] text-slate-400">التسليمات</p>
                      <p className="text-sm font-extrabold text-slate-800">{exam.attempts}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-slate-400">المتوسط</p>
                      <p className={cn('text-sm font-extrabold', exam.averageScore >= 80 ? 'text-emerald-600' : exam.averageScore >= 60 ? 'text-amber-600' : 'text-slate-400')}>{exam.averageScore || '—'}%</p>
                    </div>
                    <div className="hidden text-center sm:block">
                      <p className="text-[9px] text-slate-400">آخر موعد</p>
                      <p className="text-[11px] font-bold text-slate-600">{relativeDay(exam.dueDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link to={`/app/exams/${exam.id}`}><Button variant="secondary" size="sm"><Eye className="size-3.5" /> عرض</Button></Link>
                    {exam.status === 'draft' && (
                      <Button size="sm" onClick={() => { publishExam(exam.id); push({ title: 'تم نشر الامتحان', body: 'أصبح متاحًا للطلاب الآن.', tone: 'success' }) }}>
                        نشر
                      </Button>
                    )}
                    <button onClick={() => setToDelete(exam)} className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="حذف الامتحان"
        description="سيتم حذف الامتحان ونتائجه نهائيًا. لا يمكن التراجع عن هذا الإجراء."
        size="sm"
        footer={<><Button variant="secondary" onClick={() => setToDelete(null)}>إلغاء</Button><Button variant="danger" onClick={() => { if (toDelete) { deleteExam(toDelete.id); push({ title: 'تم حذف الامتحان', tone: 'success' }) } setToDelete(null) }}>حذف نهائي</Button></>}
      >
        <p className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{toDelete?.title}</p>
      </Modal>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Student                                                             */
/* ------------------------------------------------------------------ */

function StudentExams() {
  const { currentUser, db, getClass, getSubject, getTeacher } = useStore()
  const me = currentUser as Student
  const [tab, setTab] = useState<'todo' | 'done'>('todo')
  const exams = db.exams.filter((e) => e.classId === me.classId && e.status !== 'draft')
  const myAttempts = db.attempts.filter((a) => a.studentId === me.id)
  const done = exams.filter((e) => myAttempts.some((a) => a.examId === e.id))
  const todo = exams.filter((e) => !myAttempts.some((a) => a.examId === e.id))

  return (
    <div>
      <PageHeader
        title="الامتحانات"
        subtitle="كل امتحاناتك في مكان واحد — ابدأ الامتحان وشاهد نتيجتك فورًا بعد التسليم."
        actions={<Badge tone="amber"><Clock className="size-3" /> راجع وقتك قبل البدء</Badge>}
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="امتحانات متاحة" value={todo.length} icon={ClipboardList} tone="brand" />
        <StatCard label="امتحانات مكتملة" value={done.length} icon={CheckCircle2} tone="emerald" />
        <StatCard label="متوسط درجاتك" value={`${me.average}%`} icon={TrendingUp} tone="violet" />
        <StatCard label="أعلى درجة" value={`${Math.max(0, ...myAttempts.map((a) => Math.round((a.score / a.total) * 100)))}%`} icon={Trophy} tone="amber" />
      </div>

      <Tabs
        tabs={[{ value: 'todo', label: 'متاحة الآن', count: todo.length }, { value: 'done', label: 'تم حلها', count: done.length }]}
        value={tab}
        onChange={setTab}
        className="mb-4 w-fit"
      />

      {tab === 'todo' ? (
        <div className="grid gap-3 md:grid-cols-2">
          {todo.map((exam) => {
            const subject = getSubject(exam.subjectId)
            const teacher = getTeacher(exam.teacherId)
            return (
              <Card key={exam.id} className="card-hover overflow-hidden">
                <div className="h-1.5" style={{ background: subject?.color }} />
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <SubjectIcon subject={subject} className="size-12" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="brand">{subject?.name}</Badge>
                        {exam.source === 'ai' && <Badge tone="violet"><Sparkles className="size-2.5" /> AI</Badge>}
                      </div>
                      <h3 className="mt-2 text-sm font-extrabold leading-6 text-slate-900">{exam.title}</h3>
                      <p className="mt-1 text-[10px] text-slate-400">{teacher?.name} • فصل {getClass(exam.classId)?.name}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center">
                    <div><p className="text-[9px] text-slate-400">الأسئلة</p><p className="text-xs font-extrabold text-slate-800">{exam.questions.length}</p></div>
                    <div className="border-x border-slate-200"><p className="text-[9px] text-slate-400">المدة</p><p className="text-xs font-extrabold text-slate-800">{exam.durationMin} د</p></div>
                    <div><p className="text-[9px] text-slate-400">الدرجة</p><p className="text-xs font-extrabold text-slate-800">{exam.totalMarks}</p></div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600"><CalendarDays className="size-3.5" /> آخر موعد {relativeDay(exam.dueDate)}</span>
                    <Link to={`/app/exams/${exam.id}`}><Button size="sm">ابدأ <ChevronLeft className="size-3.5" /></Button></Link>
                  </div>
                </div>
              </Card>
            )
          })}
          {todo.length === 0 && <Card className="md:col-span-2"><EmptyState icon={CheckCircle2} title="أنجزت كل الامتحانات!" description="لا توجد امتحانات متاحة حاليًا. استغل الوقت في مراجعة الريلز." action={<Link to="/app/reels"><Button variant="soft">شاهد الريلز</Button></Link>} /></Card>}
        </div>
      ) : (
        <div className="space-y-3">
          {done.map((exam) => {
            const attempt = myAttempts.find((a) => a.examId === exam.id)!
            const subject = getSubject(exam.subjectId)
            const pct = Math.round((attempt.score / attempt.total) * 100)
            return (
              <Card key={exam.id} className="flex flex-wrap items-center gap-4 p-4">
                <SubjectIcon subject={subject} className="size-11" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-900">{exam.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{subject?.name} • تم التسليم {relativeDay(attempt.submittedAt)} • {attempt.timeSpentMin} دقيقة</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-[9px] text-slate-400">الدرجة</p>
                    <p className="text-sm font-extrabold text-slate-800">{attempt.score} / {attempt.total}</p>
                  </div>
                  <div className={cn('flex size-12 items-center justify-center rounded-full text-xs font-black', pct >= 80 ? 'bg-emerald-50 text-emerald-600' : pct >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600')}>
                    {pct}%
                  </div>
                  <Link to={`/app/exams/${exam.id}`}><Button variant="secondary" size="sm">المراجعة</Button></Link>
                </div>
              </Card>
            )
          })}
          {done.length === 0 && <Card><EmptyState icon={FileQuestion} title="لم تحل أي امتحان بعد" description="ابدأ بامتحان من التبويب الآخر." /></Card>}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Parent                                                              */
/* ------------------------------------------------------------------ */

function ParentExams() {
  const { currentUser, db, getSubject } = useStore()
  const me = currentUser as Parent
  const children = db.students.filter((s) => me.studentIds.includes(s.id))
  const [childId, setChildId] = useState(children[0]?.id ?? '')
  const child = children.find((c) => c.id === childId) ?? children[0]
  const exams = db.exams.filter((e) => e.classId === child?.classId && e.status !== 'draft')
  const attempts = db.attempts.filter((a) => a.studentId === child?.id)

  return (
    <div>
      <PageHeader
        title="امتحانات الأبناء"
        subtitle="تابع الامتحانات القادمة ونتائج الأبناء أولًا بأول."
        actions={
          <select className="select w-44" value={child?.id} onChange={(e) => setChildId(e.target.value)}>
            {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        }
      />
      <div className="space-y-3">
        {exams.map((exam) => {
          const attempt = attempts.find((a) => a.examId === exam.id)
          const subject = getSubject(exam.subjectId)
          const pct = attempt ? Math.round((attempt.score / attempt.total) * 100) : null
          return (
            <Card key={exam.id} className="flex flex-wrap items-center gap-4 p-4">
              <SubjectIcon subject={subject} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900">{exam.title}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{subject?.name} • {exam.questions.length} أسئلة • {exam.durationMin} دقيقة</p>
              </div>
              {attempt ? (
                <Badge tone={pct! >= 80 ? 'emerald' : pct! >= 60 ? 'amber' : 'rose'}>{attempt.score} / {attempt.total} — {pct}%</Badge>
              ) : (
                <Badge tone="amber"><Clock className="size-3" /> لم يُحل بعد</Badge>
              )}
              <span className="text-[10px] text-slate-400">{relativeDay(exam.dueDate)}</span>
            </Card>
          )
        })}
      </div>
      {exams.length === 0 && <Card><EmptyState icon={Clock} title="لا توجد امتحانات" description="لم يتم إضافة امتحانات لهذا الفصل بعد." /></Card>}
      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
        <BarChart3 className="size-5 text-brand-600" />
        <p className="text-[11px] text-brand-800">للاطلاع على تحليل مفصل لمستوى {child?.name.split(' ')[0]}، افتح <Link to="/app/child" className="font-extrabold underline">صفحة مستوى الابن</Link>.</p>
      </div>
    </div>
  )
}
