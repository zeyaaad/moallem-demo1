import { Link } from 'react-router-dom'
import {
  ArrowLeft, Award, BookOpen, CalendarDays, CheckCircle2, Clock, Flame, Play, Sparkles, Target, TrendingUp, Trophy,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Student } from '../../types'
import { Avatar, Badge, Card, ProgressBar, StatCard } from '../../components/ui'
import { AreaChart, RadarChart } from '../../components/charts'
import { studentSkills, subjectPerformance, weeklyPerformance } from '../../data/content'
import { cn, formatNumber, relativeDay } from '../../lib/utils'

export default function StudentDashboard() {
  const { currentUser, db, getClass, getGrade } = useStore()
  const me = currentUser as Student
  const cls = getClass(me.classId)
  const grade = getGrade(me.gradeLevelId)
  const myExams = db.exams.filter((e) => e.classId === me.classId && e.status === 'published')
  const nextExam = [...myExams].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
  const myAttempts = db.attempts.filter((a) => a.studentId === me.id)
  const classStudents = db.students.filter((s) => s.classId === me.classId)
  const myRank = classStudents.filter((s) => s.average > me.average).length + 1
  const skills = studentSkills[me.id] ?? studentSkills.stu_3
  const weakest = [...skills].sort((a, b) => a.score - b.score)[0]
  const levelProgress = Math.min(100, Math.round(((me.points % 350) / 350) * 100))
  const recommendations = db.reels.slice(0, 4)

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-5 text-white sm:p-7">
        <div className="absolute inset-0 bg-gradient-to-l from-brand-700/80 via-slate-950 to-slate-950" />
        <div className="absolute -top-20 end-10 size-64 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute -bottom-24 end-1/3 size-56 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={me.name} color={me.avatarColor} size="lg" className="ring-white/20" />
            <div>
              <p className="text-[11px] font-semibold text-white/50">لوحة الطالب • {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <h1 className="mt-1 text-2xl font-black">أهلًا، {me.name.split(' ')[0]} 👋</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                <span className="rounded-full bg-white/10 px-2.5 py-1 font-bold backdrop-blur">{grade?.name}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 font-bold backdrop-blur">فصل {cls?.name}</span>
                <span className="rounded-full bg-amber-400/15 px-2.5 py-1 font-bold text-amber-300">🔥 {me.level} مستوى</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[10px] font-semibold text-white/50">نقاطك</p>
              <p className="mt-0.5 text-2xl font-black">{formatNumber(me.points)}</p>
              <div className="mt-2 w-32">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-gradient-to-l from-amber-400 to-orange-400" style={{ width: `${levelProgress}%` }} />
                </div>
                <p className="mt-1 text-[9px] text-white/40">{350 - (me.points % 350)} نقطة للمستوى القادم</p>
              </div>
            </div>
            <Link
              to="/app/reels"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow-lg transition hover:bg-slate-100"
            >
              <Play className="size-4 fill-current" /> متابعة التعلم
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="متوسط درجاتك" value={`${me.average}%`} icon={TrendingUp} tone="emerald" delta="+٦٪" hint="هذا الشهر" />
        <StatCard label="ترتيبك في الفصل" value={`#${myRank}`} icon={Trophy} tone="amber" hint={`من ${classStudents.length} طالب`} />
        <StatCard label="نسبة الحضور" value={`${me.attendanceRate}%`} icon={CalendarDays} tone="sky" hint="آخر ٣٠ يوم" />
        <StatCard label="امتحانات متاحة" value={myExams.length} icon={BookOpen} tone="violet" hint={`${myAttempts.length} تم حلها`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Performance */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">تطور مستواك</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">متوسط الدرجات خلال الأسابيع الستة الماضية</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="emerald" dot>+١٦٪ تحسن</Badge>
              <Link to="/app/progress" className="text-[11px] font-bold text-brand-600">التفاصيل</Link>
            </div>
          </div>
          <AreaChart data={weeklyPerformance} height={200} />
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
            <div>
              <p className="text-[10px] text-slate-400">أعلى درجة</p>
              <p className="text-sm font-extrabold text-slate-800">٩٦٪</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">أقل درجة</p>
              <p className="text-sm font-extrabold text-slate-800">٧٢٪</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">المستوى العام</p>
              <Badge tone="emerald" className="mt-1">جيد جدًا</Badge>
            </div>
          </div>
        </Card>

        {/* Next exam */}
        <Card className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-extrabold text-slate-900">الامتحان القادم</h2>
            <Link to="/app/exams" className="text-[11px] font-bold text-brand-600">الكل</Link>
          </div>
          {nextExam ? (
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-xl">∫</span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold leading-6 text-slate-900">{nextExam.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{nextExam.questions.length} أسئلة • {nextExam.durationMin} دقيقة • {nextExam.totalMarks} درجة</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] font-bold text-amber-700">
                <Clock className="size-4" /> آخر موعد: {relativeDay(nextExam.dueDate)}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
                <span className="flex size-5 items-center justify-center rounded-full bg-brand-100 text-[9px] font-bold text-brand-700">م</span>
                أ. محمد العزب — الرياضيات
              </div>
              <Link
                to={`/app/exams/${nextExam.id}`}
                className="mt-auto flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 text-xs font-extrabold text-white transition hover:bg-brand-700"
              >
                ابدأ الامتحان <ArrowLeft className="size-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-xs text-slate-400">لا توجد امتحانات قادمة 🎉</div>
          )}
        </Card>
      </div>

      {/* Continue learning */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">استكمل التعلم</h2>
            <p className="text-[11px] text-slate-400">ريلز مختارة من معلميك</p>
          </div>
          <Link to="/app/reels" className="flex items-center gap-1 text-[11px] font-bold text-brand-600">كل الريلز <ArrowLeft className="size-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {recommendations.map((reel) => (
            <Link key={reel.id} to={`/app/reels?open=${reel.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className={cn('relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br', reel.gradient)}>
                <span className="text-4xl font-black text-white/30">{reel.emoji}</span>
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.2),transparent_55%)]" />
                <span className="absolute bottom-2 end-2 rounded-md bg-black/35 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur">{Math.floor(reel.duration / 60)}:{String(reel.duration % 60).padStart(2, '0')}</span>
                <span className="absolute start-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                  <Play className="size-4 fill-white" />
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-[11px] font-bold leading-5 text-slate-800">{reel.title}</p>
                <p className="mt-1 text-[10px] text-slate-400">{reel.views > 1000 ? `${(reel.views / 1000).toFixed(1)} ألف` : reel.views} مشاهدة</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Weakness */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">خريطة مهاراتك</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">مقارنة بأداء الفصل (الخط المتقطع)</p>
            </div>
            <Link to="/app/progress" className="text-[11px] font-bold text-brand-600">تحليل كامل</Link>
          </div>
          <div className="grid items-center gap-2 sm:grid-cols-[1fr_1.1fr]">
            <RadarChart data={skills} compare={[78, 70, 68, 64, 82]} />
            <div className="space-y-3">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
                <div className="flex items-center gap-2 text-rose-700">
                  <Target className="size-4" />
                  <p className="text-xs font-extrabold">نقطة تحتاج تركيز</p>
                </div>
                <p className="mt-1.5 text-[11px] leading-6 text-rose-700/80">
                  مهارة <b>{weakest.skill}</b> عندك {weakest.score}٪ — أقل من متوسط الفصل. راجع ريلز الوحدة وشاهد حل الأمثلة.
                </p>
                <Link to="/app/reels" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 underline">ريلز مقترحة <ArrowLeft className="size-3" /></Link>
              </div>
              <div className="space-y-2.5">
                {skills.map((s) => (
                  <div key={s.skill}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">{s.skill}</span>
                      <span className={cn('font-bold', s.score >= 75 ? 'text-emerald-600' : s.score >= 60 ? 'text-amber-600' : 'text-rose-600')}>{s.score}٪</span>
                    </div>
                    <ProgressBar value={s.score} tone={s.score >= 75 ? 'emerald' : s.score >= 60 ? 'amber' : 'rose'} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Subjects */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">أداء المواد</h2>
            <Flame className="size-4 text-amber-500" />
          </div>
          <div className="space-y-3.5">
            {subjectPerformance.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-600">{s.label}</span>
                  <span className="font-bold text-slate-800">{s.value}٪</span>
                </div>
                <ProgressBar value={s.value} tone={s.value >= 85 ? 'emerald' : s.value >= 72 ? 'brand' : 'amber'} size="sm" />
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <p className="text-[10px] leading-5 text-emerald-700">أداؤك في اللغة العربية ممتاز — حافظ على مستواك!</p>
          </div>
        </Card>
      </div>

      {/* Achievements + announcements */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-extrabold text-slate-900">إعلانات المدرسة</h2>
          <div className="space-y-3">
            {db.announcements.slice(0, 2).map((a) => (
              <div key={a.id} className="flex gap-3 rounded-xl border border-slate-100 p-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Sparkles className="size-4" /></span>
                <div>
                  <p className="text-xs font-bold text-slate-800">{a.title}</p>
                  <p className="mt-1 text-[11px] leading-6 text-slate-500">{a.body}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{a.authorName} • {relativeDay(a.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Award className="size-4 text-amber-500" />
            <h2 className="text-sm font-extrabold text-slate-900">أوسمتك</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['🔥', 'سلسلة ٧ أيام'],
              ['🏆', 'الأول في الكويز'],
              ['🎯', '١٠ امتحانات'],
              ['📚', 'قارئ نشط'],
              ['⭐', 'مستوى ٧'],
              ['💎', 'حضور كامل'],
            ].map(([e, l]) => (
              <div key={l} className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 p-2.5 text-center">
                <span className="text-xl">{e}</span>
                <span className="text-[8px] font-bold leading-3 text-slate-500">{l}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
