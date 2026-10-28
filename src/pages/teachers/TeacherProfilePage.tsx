import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, BookOpen, CalendarDays, Clapperboard, Eye, GraduationCap, Heart, Mail,
  MessageCircle, Play, Star, TrendingUp, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Student } from '../../types'
import SubjectIcon from '../../components/SubjectIcon'
import { Avatar, Badge, Button, Card, EmptyState, ProgressBar, StatCard } from '../../components/ui'
import { AreaChart } from '../../components/charts'
import { weeklyPerformance } from '../../data/content'
import { cn, formatNumber, relativeDay } from '../../lib/utils'

export default function TeacherProfilePage() {
  const { id } = useParams()
  const { db, getTeacher, getSubject, getClass } = useStore()
  const teacher = getTeacher(id ?? '')

  const subjects = useMemo(
    () => (teacher ? teacher.subjectIds.map((sid) => db.subjects.find((s) => s.id === sid)).filter(Boolean) : []),
    [db.subjects, teacher],
  )
  const reels = useMemo(() => (teacher ? db.reels.filter((r) => r.teacherId === teacher.id) : []), [db.reels, teacher])
  const exams = useMemo(() => (teacher ? db.exams.filter((e) => e.teacherId === teacher.id) : []), [db.exams, teacher])
  const classes = useMemo(() => (teacher ? db.classes.filter((c) => teacher.classIds.includes(c.id)) : []), [db.classes, teacher])

  if (!teacher) {
    return (
      <Card>
        <div className="p-10 text-center text-sm text-slate-500">
          المعلم غير موجود. <Link to="/app/teachers" className="font-bold text-brand-600">العودة للمعلمين</Link>
        </div>
      </Card>
    )
  }

  const teacherStudents = db.students.filter((s) => teacher.classIds.includes(s.classId))
  const avg = Math.round(teacherStudents.reduce((sum, s) => sum + s.average, 0) / Math.max(1, teacherStudents.length))
  const reelViews = reels.reduce((sum, r) => sum + r.views, 0)
  const attempts = db.attempts.filter((a) => exams.some((e) => e.id === a.examId))
  const published = exams.filter((e) => e.status === 'published')

  return (
    <div>
      <Link to="/app/teachers" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">
        <ArrowRight className="size-3.5" /> العودة للمعلمين
      </Link>

      <Card className="mb-5 overflow-hidden">
        <div className="relative h-32 bg-slate-950">
          <div className="absolute inset-0 opacity-90" style={{ backgroundImage: `linear-gradient(120deg, ${teacher.avatarColor}, #0f172a)` }} />
          <div className="absolute inset-0 bg-dots opacity-20" />
        </div>
        <div className="relative px-5 pb-5 sm:px-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar name={teacher.name} color={teacher.avatarColor} size="xl" className="ring-4 ring-white" />
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900">{teacher.name}</h1>
                  <Badge tone="amber"><Star className="size-3 fill-amber-400 text-amber-400" /> {teacher.rating}</Badge>
                  <Badge tone="brand">{teacher.experienceYears} سنة خبرة</Badge>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  <span>{subjects.map((s) => s?.name).join(' • ')}</span>
                  <span>•</span>
                  <span>{classes.length} فصول</span>
                  <span>•</span>
                  <span>{teacher.email}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2 pb-1">
              <a href={`mailto:${teacher.email}`}><Button variant="secondary" size="sm"><Mail className="size-3.5" /> مراسلة</Button></a>
              <Link to={`/app/reels?teacher=${teacher.id}`}><Button size="sm"><Play className="size-3.5" /> شاهد الريلز</Button></Link>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-6 text-slate-500">{teacher.bio}</p>
        </div>
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="الطلاب" value={formatNumber(teacherStudents.length)} icon={Users} tone="brand" hint={`${classes.length} فصول`} />
        <StatCard label="متوسط أداء الطلاب" value={`${avg}%`} icon={TrendingUp} tone="emerald" delta="+٣٪" hint="هذا الشهر" />
        <StatCard label="الريلز" value={reels.length} icon={Clapperboard} tone="rose" hint={`${formatNumber(reelViews)} مشاهدة`} />
        <StatCard label="الامتحانات" value={published.length} icon={BookOpen} tone="violet" hint={`${attempts.length} تسليم`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">المواد التي يدرّسها</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">اضغط على المادة لتصفح ريلزها وامتحاناتها</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {subjects.map((s) => {
                const subjectReels = db.reels.filter((r) => r.subjectId === s?.id)
                const subjectExams = exams.filter((e) => e.subjectId === s?.id)
                return (
                  <Link key={s?.id} to={`/app/reels?subject=${s?.id}`} className="group flex items-center gap-3 rounded-2xl border border-slate-100 p-3.5 transition hover:border-brand-200 hover:bg-brand-50/30">
                    <SubjectIcon subject={s} className="size-11" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-800">{s?.name}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{subjectReels.length} ريل • {subjectExams.length} امتحان</p>
                    </div>
                    <ArrowLeft className="size-4 text-slate-300 transition group-hover:text-brand-500" />
                  </Link>
                )
              })}
              {subjects.length === 0 && <p className="col-span-2 py-6 text-center text-xs text-slate-400">لم تُحدد مواد لهذا المعلم بعد.</p>}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-slate-900">أحدث الريلز</h2>
              <Link to="/app/reels" className="text-[11px] font-bold text-brand-600">كل الريلز</Link>
            </div>
            {reels.length === 0 ? (
              <EmptyState icon={Clapperboard} title="لا توجد ريلز بعد" description="لم يقم هذا المعلم برفع محتوى قصير حتى الآن." />
            ) : (
              <div className="divide-y divide-slate-50">
                {reels.slice(0, 4).map((reel) => (
                  <Link key={reel.id} to={`/app/reels?open=${reel.id}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50/70">
                    <div className={cn('relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br text-xl', reel.gradient)}>
                      <span className="relative z-10">{reel.emoji}</span>
                      <Play className="absolute bottom-1 end-1 size-3 fill-white text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">{reel.title}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-[9px] text-slate-400">
                        <span className="flex items-center gap-0.5"><Eye className="size-2.5" /> {formatNumber(reel.views)}</span>
                        <span className="flex items-center gap-0.5"><Heart className="size-2.5" /> {formatNumber(reel.likes)}</span>
                        <span className="flex items-center gap-0.5"><MessageCircle className="size-2.5" /> {reel.comments}</span>
                        <span>• {relativeDay(reel.createdAt)}</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">امتحانات المعلم</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">آخر الامتحانات المنشورة لطلابه</p>
              </div>
              <Badge tone="brand">{exams.length} امتحان</Badge>
            </div>
            <div className="space-y-2.5">
              {exams.map((exam) => (
                <Link key={exam.id} to={`/app/exams/${exam.id}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50">
                  <SubjectIcon subject={getSubject(exam.subjectId)} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">{exam.title}</p>
                    <p className="mt-0.5 text-[9px] text-slate-400">{getClass(exam.classId)?.name} • {exam.questions.length} أسئلة • {exam.durationMin} دقيقة</p>
                  </div>
                  <Badge tone={exam.status === 'published' ? 'emerald' : exam.status === 'draft' ? 'amber' : 'slate'}>
                    {exam.status === 'published' ? 'منشور' : exam.status === 'draft' ? 'مسودة' : 'مغلق'}
                  </Badge>
                  <span className="text-[10px] font-bold text-slate-500">{exam.attempts} تسليم</span>
                </Link>
              ))}
              {exams.length === 0 && <p className="py-6 text-center text-xs text-slate-400">لا توجد امتحانات بعد.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-slate-900"><GraduationCap className="size-4 text-brand-500" /> الفصول</h2>
            <div className="space-y-2">
              {classes.map((c) => {
                const count = db.students.filter((s) => s.classId === c.id).length
                return (
                  <div key={c.id} className="rounded-xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800">فصل {c.name}</p>
                      <Badge tone="slate">{count} طالب</Badge>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">قاعة {c.room} • {db.gradeLevels.find((g) => g.id === c.gradeLevelId)?.name}</p>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900">مؤشر الأداء</h2>
              <Badge tone="emerald">{avg}%</Badge>
            </div>
            <AreaChart data={weeklyPerformance} height={160} color="#0ea5e9" />
            <p className="mt-2 text-[10px] leading-5 text-slate-400">متوسط أداء طلاب المعلم خلال الأسابيع الأخيرة مقارنة بالمستهدف (٨٥٪).</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">إحصائيات سريعة</h2>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px]"><span className="text-slate-500">نسبة التفاعل مع الريلز</span><span className="font-bold text-slate-700">٨٤٪</span></div>
                <ProgressBar value={84} size="sm" tone="rose" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px]"><span className="text-slate-500">نسبة إتمام الامتحانات</span><span className="font-bold text-slate-700">٧٦٪</span></div>
                <ProgressBar value={76} size="sm" tone="brand" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px]"><span className="text-slate-500">رضا الطلاب</span><span className="font-bold text-slate-700">{Math.round(teacher.rating * 20)}٪</span></div>
                <ProgressBar value={teacher.rating * 20} size="sm" tone="emerald" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[10px] text-slate-500">
              <CalendarDays className="size-3.5 text-slate-400" /> عضو في المنصة منذ سبتمبر ٢٠٢٤
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">طلاب متفوقون</h2>
            <div className="space-y-2">
              {[...teacherStudents].sort((a, b) => b.average - a.average).slice(0, 4).map((s: Student) => (
                <Link key={s.id} to={`/app/students/${s.id}`} className="flex items-center gap-2.5 rounded-xl p-1.5 transition hover:bg-slate-50">
                  <Avatar name={s.name} color={s.avatarColor} size="xs" />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-700">{s.name}</span>
                  <span className="text-[10px] font-extrabold text-emerald-600">{s.average}%</span>
                </Link>
              ))}
              {teacherStudents.length === 0 && <p className="py-4 text-center text-[11px] text-slate-400">لا يوجد طلاب.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
