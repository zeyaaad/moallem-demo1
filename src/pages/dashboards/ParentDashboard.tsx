import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, CalendarCheck, CheckCircle2, Clock, GraduationCap, MessageCircle, Phone, Star,
  TrendingUp, Trophy, UserRound,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Parent } from '../../types'
import { Avatar, Badge, Card, ProgressBar, StatCard } from '../../components/ui'
import { AreaChart, AttendanceHeatmap, RadarChart } from '../../components/charts'
import { studentSkills, subjectPerformance, weeklyPerformance } from '../../data/content'
import { cn, relativeDay } from '../../lib/utils'

export default function ParentDashboard() {
  const { currentUser, db, getClass, getGrade } = useStore()
  const me = currentUser as Parent
  const children = db.students.filter((s) => me.studentIds.includes(s.id))
  const [selectedId, setSelectedId] = useState(children[0]?.id ?? '')
  const child = children.find((c) => c.id === selectedId) ?? children[0]
  const cls = child ? getClass(child.classId) : undefined
  const grade = child ? getGrade(child.gradeLevelId) : undefined
  const exams = db.exams.filter((e) => e.classId === child?.classId && e.status === 'published')
  const attempts = db.attempts.filter((a) => a.studentId === child?.id)
  const attendance = db.attendance.filter((a) => a.studentId === child?.id)
  const absent = attendance.filter((a) => a.status === 'absent').length
  const late = attendance.filter((a) => a.status === 'late').length
  const skills = child ? studentSkills[child.id] ?? studentSkills.stu_1 : []
  const teachers = db.teachers.filter((t) => child && t.classIds.includes(child.classId)).slice(0, 4)
  const classStudents = db.students.filter((s) => s.classId === child?.classId)
  const rank = classStudents.filter((s) => s.average > (child?.average ?? 0)).length + 1

  if (!child) return <div className="p-10 text-center text-sm text-slate-500">لا يوجد أبناء مرتبطون بهذا الحساب.</div>

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-slate-400">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">أهلًا، {me.name.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-xs text-slate-500">تابع مستوى أبنائك، درجاتهم وحضورهم من مكان واحد.</p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-bold transition', c.id === child.id ? 'bg-brand-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50')}
            >
              <Avatar name={c.name} color={c.avatarColor} size="xs" className="size-5 text-[8px] ring-0" />
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Child hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="pointer-events-none absolute -start-16 -top-16 size-48 rounded-full bg-brand-50" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={child.name} color={child.avatarColor} size="xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-slate-950">{child.name}</h2>
                <Badge tone="emerald" dot>منتظم</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">{grade?.name} • فصل {cls?.name} • رقم الطالب {child.code}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700"><Trophy className="size-3" /> الترتيب #{rank} في الفصل</span>
                <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700"><Star className="size-3" /> مستوى {child.level}</span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 className="size-3" /> {child.attendanceRate}٪ حضور</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-3xl font-black text-brand-600">{child.average}٪</p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">المعدل العام</p>
            </div>
            <div className="h-12 w-px bg-slate-100" />
            <div className="space-y-1.5">
              <Link to="/app/child" className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-slate-800">
                التقرير الكامل <ArrowLeft className="size-3.5" />
              </Link>
              <Link to="/app/teachers" className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50">
                <MessageCircle className="size-3.5" /> تواصل مع المعلمين
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="المعدل العام" value={`${child.average}%`} icon={TrendingUp} tone="emerald" delta="+٦٪" hint="هذا الشهر" />
        <StatCard label="أيام الغياب" value={absent} icon={CalendarCheck} tone="rose" hint="آخر ٦ أسابيع" />
        <StatCard label="الامتحانات القادمة" value={exams.length} icon={BookOpen} tone="brand" hint={`${attempts.length} امتحان تم`} />
        <StatCard label="نقاط التميز" value={child.points} icon={Trophy} tone="amber" hint={`المستوى ${child.level}`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">تقدم {child.name.split(' ')[0]} الدراسي</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">متوسط الدرجات خلال ٦ أسابيع</p>
            </div>
            <Badge tone="emerald">تحسن مستمر</Badge>
          </div>
          <AreaChart data={weeklyPerformance} height={195} />
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">ملخص الحضور</h2>
            <Link to="/app/attendance" className="text-[10px] font-bold text-brand-600">التفاصيل</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex size-20 items-center justify-center rounded-full bg-emerald-50">
              <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#d1fae5" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray={`${(child.attendanceRate / 100) * 94} 94`} strokeLinecap="round" />
              </svg>
              <span className="text-base font-black text-emerald-700">{child.attendanceRate}٪</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <p className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-500" /> حاضر — {attendance.filter((a) => a.status === 'present').length} يوم</p>
              <p className="flex items-center gap-2"><span className="size-2 rounded-full bg-rose-500" /> غائب — {absent} أيام</p>
              <p className="flex items-center gap-2"><span className="size-2 rounded-full bg-amber-400" /> متأخر — {late} أيام</p>
            </div>
          </div>
          <div className="mt-4">
            <AttendanceHeatmap records={attendance} days={28} />
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-sm font-extrabold text-slate-900">الدرجات حسب المادة</h2>
          <div className="mt-4 space-y-3.5">
            {subjectPerformance.slice(0, 5).map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="font-semibold text-slate-600">{s.label}</span>
                  <span className={cn('font-bold', s.value >= 80 ? 'text-emerald-600' : s.value >= 70 ? 'text-amber-600' : 'text-rose-600')}>{s.value}٪</span>
                </div>
                <ProgressBar value={s.value} size="sm" tone={s.value >= 80 ? 'emerald' : s.value >= 70 ? 'amber' : 'rose'} />
              </div>
            ))}
          </div>
          <Link to="/app/results" className="mt-4 flex items-center justify-center gap-1 rounded-xl bg-slate-50 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100">
            كل الدرجات <ArrowLeft className="size-3" />
          </Link>
        </Card>

        <Card className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">نقاط القوة والضعف</h2>
            <Link to="/app/child" className="text-[10px] font-bold text-brand-600">تحليل</Link>
          </div>
          <RadarChart data={skills.length ? skills : studentSkills.stu_1} />
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">الامتحانات القادمة</h2>
            <Link to="/app/exams" className="text-[10px] font-bold text-brand-600">الكل</Link>
          </div>
          <div className="space-y-3">
            {exams.slice(0, 3).map((e) => (
              <div key={e.id} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-bold leading-5 text-slate-800">{e.title}</p>
                  <Badge tone="amber">{relativeDay(e.dueDate)}</Badge>
                </div>
                <p className="mt-1 flex items-center gap-2 text-[10px] text-slate-400"><Clock className="size-3" /> {e.durationMin} دقيقة • {e.totalMarks} درجة</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 p-3">
            <GraduationCap className="size-4 shrink-0 text-brand-600" />
            <p className="text-[10px] leading-5 text-brand-800">ساعد {child.name.split(' ')[0]} على مراجعة الرياضيات قبل اختبار الأحد.</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">معلمو الفصل</h2>
            <Link to="/app/teachers" className="text-[11px] font-bold text-brand-600">عرض الكل</Link>
          </div>
          <div className="space-y-3">
            {teachers.map((t) => (
              <div key={t.id} className="flex items-center gap-2.5">
                <Avatar name={t.name} color={t.avatarColor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800">{t.name}</p>
                  <p className="text-[10px] text-slate-400">{db.subjects.find((s) => s.id === t.subjectIds[0])?.name} • تقييم {t.rating}</p>
                </div>
                <a href={`tel:${t.phone}`} className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"><Phone className="size-3.5" /></a>
                <Link to={`/app/teachers/${t.id}`} className="flex size-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition hover:bg-slate-100"><UserRound className="size-3.5" /></Link>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-extrabold text-slate-900">إعلانات وإشعارات</h2>
          <div className="space-y-3">
            {db.announcements.slice(0, 2).map((a) => (
              <div key={a.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><CalendarCheck className="size-4" /></span>
                <div>
                  <p className="text-[11px] font-bold text-slate-800">{a.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-5 text-slate-500">{a.body}</p>
                </div>
              </div>
            ))}
            <div className="rounded-xl bg-emerald-50/70 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800"><CheckCircle2 className="size-3.5" /> تم تسجيل حضور {child.name.split(' ')[0]} اليوم</p>
              <p className="mt-1 text-[10px] text-emerald-700/70">الحصة الأولى — الرياضيات — ٨:٠٠ ص</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
