import { Link } from 'react-router-dom'
import {
  ArrowLeft, BarChart3, Brain, CalendarCheck, CheckCircle2, Clapperboard, Clock, FileQuestion, GraduationCap,
  Plus, Sparkles, TrendingUp, Users, Video,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Teacher } from '../../types'
import { Avatar, Badge, Button, Card, ProgressBar, StatCard } from '../../components/ui'
import { BarChart, Doughnut } from '../../components/charts'
import { subjectPerformance } from '../../data/content'
import { formatNumber, relativeDay } from '../../lib/utils'

export default function TeacherDashboard() {
  const { currentUser, db, getClass, getStudent } = useStore()
  const me = currentUser as Teacher
  const myClasses = db.classes.filter((c) => me.classIds.includes(c.id))
  const myStudents = db.students.filter((s) => me.classIds.includes(s.classId))
  const myExams = db.exams.filter((e) => e.teacherId === me.id)
  const myExamIds = myExams.map((e) => e.id)
  const myAttempts = db.attempts.filter((a) => myExamIds.includes(a.examId))
  const myReels = db.reels.filter((r) => r.teacherId === me.id)
  const totalViews = myReels.reduce((s, r) => s + r.views, 0)
  const avg = Math.round(myStudents.reduce((s, x) => s + x.average, 0) / Math.max(1, myStudents.length))
  const pending = myAttempts.filter((a) => !a.answers || Object.keys(a.answers).length === 0).length
  const recent = [...myAttempts].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 5)
  const topStudents = [...myStudents].sort((a, b) => b.average - a.average).slice(0, 4)
  const atRisk = myStudents.filter((s) => s.average < 65)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar name={me.name} color={me.avatarColor} size="lg" />
          <div>
            <p className="text-[11px] font-semibold text-slate-400">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">أهلًا، {me.name.replace('أ. ', '')} 👋</h1>
            <p className="mt-0.5 text-xs text-slate-500">عندك <b className="text-brand-600">{myExams.filter((e) => e.status === 'published').length} امتحانات نشطة</b> و{myClasses.length} فصول لمتابعتها اليوم.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/app/reels"><Button variant="secondary"><Video className="size-4" /> ارفع ريل</Button></Link>
          <Link to="/app/exams?new=1"><Button><Plus className="size-4" /> أنشئ امتحان</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="إجمالي طلابي" value={myStudents.length} icon={Users} tone="brand" hint={`${myClasses.length} فصول`} />
        <StatCard label="متوسط الفصل" value={`${avg}%`} icon={TrendingUp} tone="emerald" delta="+٤٪" hint="مقارنة بالشهر الماضي" />
        <StatCard label="مشاهدات الريلز" value={formatNumber(totalViews)} icon={Clapperboard} tone="rose" delta="+١.٢K" hint="هذا الأسبوع" />
        <StatCard label="تسليمات بانتظارك" value={pending || 3} icon={FileQuestion} tone="amber" hint="راجع النتائج" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">أداء الفصول</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">متوسط درجات كل فصل خلال الفترة الحالية</p>
            </div>
            <Link to="/app/results" className="text-[11px] font-bold text-brand-600">تحليلات مفصلة</Link>
          </div>
          <BarChart
            data={myClasses.map((c, i) => ({ label: c.name, value: [84, 76, 69][i] ?? 72 }))}
            color="#4f46e5"
            height={190}
          />
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-[10px] font-semibold text-slate-400">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand-600" /> المتوسط العام ٧٦٪</span>
            <span>أعلى فصل: ٢ / أ — ٨٤٪</span>
            <span className="text-rose-500">أدنى فصل: ٣ / أ — ٦٩٪</span>
          </div>
        </Card>

        <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-5 text-white">
          <div className="absolute -top-10 -end-10 size-40 rounded-full bg-violet-500/30 blur-2xl" />
          <div className="relative">
            <span className="flex size-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300"><Brain className="size-5" /></span>
            <h3 className="mt-3 text-base font-extrabold">ولّد امتحانًا من مذكرتك</h3>
            <p className="mt-1.5 text-[11px] leading-6 text-slate-400">ارفع ملف PDF أو Word، ودع الذكاء الاصطناعي يجهز أسئلة متوازنة في أقل من دقيقة.</p>
            <Link to="/app/exams?ai=1" className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-500 px-3.5 text-[11px] font-bold transition hover:bg-violet-600">
              <Sparkles className="size-3.5" /> ابدأ التوليد
            </Link>
            <p className="mt-4 text-[9px] text-slate-500">استخدمته ٣٢ مرة هذا الشهر • وفرت ١٢ ساعة</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-extrabold text-slate-900">أحدث التسليمات</h2>
            <Link to="/app/results" className="text-[11px] font-bold text-brand-600">عرض الكل</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="table-head">
                  <th className="px-5 py-2.5">الطالب</th>
                  <th className="px-3 py-2.5">الامتحان</th>
                  <th className="px-3 py-2.5">الدرجة</th>
                  <th className="px-5 py-2.5">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => {
                  const student = getStudent(a.studentId)
                  const exam = db.exams.find((e) => e.id === a.examId)
                  const pct = Math.round((a.score / a.total) * 100)
                  return (
                    <tr key={a.id} className="transition hover:bg-slate-50/70">
                      <td className="table-cell">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={student?.name ?? ''} color={student?.avatarColor} size="xs" />
                          <span className="text-xs font-bold text-slate-800">{student?.name.split(' ').slice(0, 2).join(' ')}</span>
                        </div>
                      </td>
                      <td className="table-cell max-w-48 truncate text-xs text-slate-500">{exam?.title}</td>
                      <td className="table-cell">
                        <Badge tone={pct >= 80 ? 'emerald' : pct >= 60 ? 'amber' : 'rose'}>{a.score} / {a.total}</Badge>
                      </td>
                      <td className="table-cell text-xs text-slate-400">{relativeDay(a.submittedAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">الطلاب المتميزون</h2>
            <TrophyIcon />
          </div>
          <div className="space-y-3">
            {topStudents.map((s, i) => (
              <Link key={s.id} to={`/app/students/${s.id}`} className="flex items-center gap-2.5">
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                <Avatar name={s.name} color={s.avatarColor} size="xs" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-slate-800">{s.name}</span>
                  <span className="block text-[10px] text-slate-400">{getClass(s.classId)?.name}</span>
                </span>
                <span className="text-xs font-extrabold text-emerald-600">{s.average}٪</span>
              </Link>
            ))}
          </div>
          {atRisk.length > 0 && (
            <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50/60 p-3">
              <div className="flex items-center gap-2 text-[11px] font-extrabold text-rose-700">
                <TrendingUp className="size-3.5 rotate-180" /> {atRisk.length} طلاب يحتاجون دعمًا
              </div>
              <p className="mt-1 text-[10px] leading-5 text-rose-600/80">{atRisk.map((s) => s.name.split(' ')[0]).join('، ')} — متوسطهم أقل من ٦٥٪.</p>
              <Link to="/app/students" className="mt-1.5 inline-block text-[10px] font-bold text-rose-700 underline">اتخذ إجراءً</Link>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">فصولي</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">نظرة سريعة على كل فصل</p>
            </div>
            <Link to="/app/attendance" className="flex items-center gap-1 text-[11px] font-bold text-brand-600"><CalendarCheck className="size-3.5" /> رصد الحضور</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {myClasses.map((c) => {
              const count = db.students.filter((s) => s.classId === c.id).length
              const grade = db.gradeLevels.find((g) => g.id === c.gradeLevelId)
              return (
                <div key={c.id} className="rounded-xl border border-slate-100 p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><GraduationCap className="size-4" /></span>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">فصل {c.name}</p>
                        <p className="text-[10px] text-slate-400">{grade?.name}</p>
                      </div>
                    </div>
                    <Badge tone="slate">{count} طالب</Badge>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>نسبة الحضور</span><span className="font-bold text-slate-600">٩٤٪</span>
                    </div>
                    <ProgressBar value={94} tone="emerald" size="sm" />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-extrabold text-slate-900">توزيع الطلاب</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">حسب مستوى الأداء</p>
          <div className="mt-4">
            <Doughnut
              segments={[
                { label: 'ممتاز', value: myStudents.filter((s) => s.average >= 85).length, color: '#10b981' },
                { label: 'جيد', value: myStudents.filter((s) => s.average >= 70 && s.average < 85).length, color: '#6366f1' },
                { label: 'يحتاج دعم', value: myStudents.filter((s) => s.average < 70).length, color: '#f59e0b' },
              ]}
              centerValue={`${myStudents.length}`}
              centerLabel="طالب"
              size={150}
            />
          </div>
          <div className="mt-4 space-y-2">
            {subjectPerformance.slice(0, 3).map((s) => (
              <div key={s.label} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{s.label}</span>
                <span className="font-bold text-slate-700">{s.value}٪</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">أحدث الريلز</h2>
            <Link to="/app/reels" className="text-[11px] font-bold text-brand-600">إدارة الريلز</Link>
          </div>
          <div className="space-y-3">
            {myReels.slice(0, 3).map((r) => (
              <Link key={r.id} to="/app/reels" className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 transition hover:bg-slate-50">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${r.gradient} text-lg text-white/70`}>{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-slate-800">{r.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{formatNumber(r.views)} مشاهدة • {r.likes} إعجاب</p>
                </div>
                <BarChart3 className="size-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">امتحاناتي</h2>
            <Link to="/app/exams" className="text-[11px] font-bold text-brand-600">عرض الكل</Link>
          </div>
          <div className="space-y-2.5">
            {myExams.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><FileQuestion className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-slate-800">{e.title}</p>
                  <p className="text-[10px] text-slate-400">{e.questions.length} أسئلة • {e.attempts} تسليم</p>
                </div>
                {e.source === 'ai' && <Badge tone="violet"><Sparkles className="size-3" /> AI</Badge>}
                <span className="text-[10px] text-slate-400">{relativeDay(e.dueDate)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-5 py-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-5 text-emerald-600" />
          <p className="text-xs font-semibold text-emerald-800">تم رصد حضور فصل ٢ / أ اليوم بنجاح — ١٢ حاضر، ٠ غائب.</p>
        </div>
        <Link to="/app/attendance" className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">عرض السجل <ArrowLeft className="size-3.5" /></Link>
      </div>
    </div>
  )
}

function TrophyIcon() {
  return <span className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-500"><Clock className="size-3.5" /></span>
}
