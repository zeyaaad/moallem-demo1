import { Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowUpRight, CalendarCheck, CheckCircle2, GraduationCap, Megaphone,
  Plus, School, Sparkles, TrendingUp, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Avatar, Badge, Button, Card, ProgressBar, StatCard } from '../../components/ui'
import { AreaChart, BarChart, Doughnut } from '../../components/charts'
import { weeklyPerformance } from '../../data/content'

export default function ManagerDashboard() {
  const { currentUser, school, db } = useStore()
  const students = db.students
  const teachers = db.teachers
  const classes = db.classes
  const today = new Date().toISOString().slice(0, 10)
  const todayRecords = db.attendance.filter((a) => a.date === today)
  const presentToday = todayRecords.filter((a) => a.status === 'present').length
  const attendanceRate = todayRecords.length ? Math.round((presentToday / todayRecords.length) * 100) : 94
  const avg = Math.round(students.reduce((s, x) => s + x.average, 0) / Math.max(1, students.length))
  const gradeData = db.gradeLevels.map((g) => ({
    label: g.name.replace('الصف ', '').replace(' الثانوي', ''),
    value: students.filter((s) => s.gradeLevelId === g.id).length,
  }))
  const topTeachers = [...teachers].sort((a, b) => b.rating - a.rating).slice(0, 4)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold text-slate-400">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <Badge tone="brand" dot>{school?.plan === 'pro' ? 'الخطة الاحترافية' : school?.plan === 'enterprise' ? 'الخطة المؤسسية' : 'الخطة الأساسية'}</Badge>
          </div>
          <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950">{school?.name}</h1>
          <p className="mt-1 text-xs text-slate-500">أهلًا {currentUser?.name} — إليك ملخص أداء المدرسة اليوم.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/app/students?new=1"><Button variant="secondary"><Plus className="size-4" /> إضافة طالب</Button></Link>
          <Link to="/app/manage/teachers?new=1"><Button><Plus className="size-4" /> إضافة معلم</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="إجمالي الطلاب" value={students.length} icon={Users} tone="brand" delta="+٤" hint="هذا الشهر" />
        <StatCard label="هيئة التدريس" value={teachers.length} icon={GraduationCap} tone="sky" hint={`${classes.length} فصول دراسية`} />
        <StatCard label="نسبة الحضور اليوم" value={`${attendanceRate}%`} icon={CalendarCheck} tone="emerald" delta="+٢٪" hint={`${presentToday || 21} طالب حاضر`} />
        <StatCard label="متوسط الأداء العام" value={`${avg}%`} icon={TrendingUp} tone="violet" delta="+٣٪" hint="مقارنة بالفصل الماضي" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { to: '/app/students?new=1', label: 'إضافة طالب', desc: 'تسجيل طالب جديد', icon: Users, tone: 'bg-brand-50 text-brand-600' },
          { to: '/app/manage/teachers?new=1', label: 'إضافة معلم', desc: 'تعيين معلم ومادة', icon: GraduationCap, tone: 'bg-sky-50 text-sky-600' },
          { to: '/app/manage/classes', label: 'إنشاء فصل', desc: 'فصل لمستوى جديد', icon: School, tone: 'bg-emerald-50 text-emerald-600' },
          { to: '/app/announcements', label: 'إعلان جديد', desc: 'إرسال للجميع', icon: Megaphone, tone: 'bg-amber-50 text-amber-600' },
        ].map((a) => (
          <Link key={a.label} to={a.to} className="group card card-hover flex items-center gap-3 p-3.5">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${a.tone}`}><a.icon className="size-5" /></span>
            <span className="min-w-0">
              <span className="block text-xs font-extrabold text-slate-800">{a.label}</span>
              <span className="block text-[10px] text-slate-400">{a.desc}</span>
            </span>
            <ArrowLeft className="ms-auto size-3.5 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-brand-500" />
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">تطور الأداء الأكاديمي</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">متوسط درجات المدرسة — آخر ٦ أسابيع</p>
            </div>
            <Badge tone="emerald">+٦٪ تحسن</Badge>
          </div>
          <AreaChart data={weeklyPerformance} height={190} color="#4f46e5" />
          <div className="mt-3 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
            {[['الرياضيات', '٨٨٪'], ['الفيزياء', '٧٤٪'], ['الكيمياء', '٨١٪'], ['اللغة العربية', '٩٢٪']].map(([l, v]) => (
              <div key={l}>
                <p className="text-[10px] text-slate-400">{l}</p>
                <p className="text-sm font-extrabold text-slate-800">{v}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-extrabold text-slate-900">حضور اليوم</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">مقارنة بالغياب والتأخير</p>
          <div className="mt-4">
            <Doughnut
              segments={[
                { label: 'حاضر', value: presentToday || 21, color: '#10b981' },
                { label: 'غائب', value: db.attendance.filter((a) => a.date === today && a.status === 'absent').length || 2, color: '#f43f5e' },
                { label: 'متأخر', value: db.attendance.filter((a) => a.date === today && a.status === 'late').length || 1, color: '#f59e0b' },
                { label: 'بعذر', value: db.attendance.filter((a) => a.date === today && a.status === 'excused').length || 0, color: '#38bdf8' },
              ]}
              centerValue={`${attendanceRate}%`}
              centerLabel="حضور"
              size={150}
            />
          </div>
          <Link to="/app/attendance" className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-slate-50 py-2.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-100">
            تقرير الحضور الكامل <ArrowLeft className="size-3.5" />
          </Link>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-sm font-extrabold text-slate-900">توزيع الطلاب</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">حسب المستويات الدراسية</p>
          <div className="mt-3">
            <BarChart data={gradeData} height={180} color="#0ea5e9" suffix="" />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
            {db.gradeLevels.map((g) => (
              <div key={g.id}>
                <p className="text-[9px] text-slate-400">{g.name.replace('الصف ', '')}</p>
                <p className="text-sm font-extrabold text-slate-800">{students.filter((s) => s.gradeLevelId === g.id).length}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-extrabold text-slate-900">أداء الفصول</h2>
            <Link to="/app/manage/classes" className="text-[11px] font-bold text-brand-600">إدارة الفصول</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="table-head">
                  <th className="px-5 py-2.5">الفصل</th>
                  <th className="px-3 py-2.5">المستوى</th>
                  <th className="px-3 py-2.5">الطلاب</th>
                  <th className="px-3 py-2.5">المشرف</th>
                  <th className="px-5 py-2.5">الأداء</th>
                </tr>
              </thead>
              <tbody>
                {classes.slice(0, 5).map((c, i) => {
                  const grade = db.gradeLevels.find((g) => g.id === c.gradeLevelId)
                  const supervisor = db.teachers.find((t) => t.id === c.supervisorId)
                  const value = [84, 76, 69, 88, 71][i] ?? 78
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="table-cell font-bold text-slate-800">{c.name}</td>
                      <td className="table-cell text-xs text-slate-500">{grade?.name.replace('الصف ', '')}</td>
                      <td className="table-cell text-xs text-slate-600">{db.students.filter((s) => s.classId === c.id).length}</td>
                      <td className="table-cell text-xs text-slate-500">{supervisor?.name}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={value} tone={value >= 80 ? 'emerald' : 'amber'} size="sm" className="w-20" />
                          <span className="text-[11px] font-bold text-slate-600">{value}٪</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">أفضل المعلمين</h2>
            <Link to="/app/manage/teachers" className="text-[11px] font-bold text-brand-600">الكل</Link>
          </div>
          <div className="space-y-3">
            {topTeachers.map((t) => (
              <div key={t.id} className="flex items-center gap-2.5">
                <Avatar name={t.name} color={t.avatarColor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800">{t.name}</p>
                  <p className="text-[10px] text-slate-400">{db.subjects.find((s) => s.id === t.subjectIds[0])?.name}</p>
                </div>
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">★ {t.rating}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">آخر النشاطات</h2>
            <Badge tone="slate">اليوم</Badge>
          </div>
          <div className="space-y-3">
            {db.auditLog.slice(0, 4).map((a) => (
              <div key={a.id} className="flex gap-2.5">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-400" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-700"><b className="font-extrabold text-slate-900">{a.actor}</b> {a.action}</p>
                  <p className="text-[10px] text-slate-400">{a.target} • {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-teal-600 p-5 text-white">
          <div className="absolute -bottom-10 -end-10 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex h-full flex-col">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/15"><Sparkles className="size-5" /></span>
            <h3 className="mt-3 text-base font-extrabold">رحّل بيانات مدرستك</h3>
            <p className="mt-1.5 text-[11px] leading-6 text-white/70">فريق مُعلّم يساعدك في نقل بيانات الطلاب والمعلمين من Excel مجانًا.</p>
            <a href="mailto:support@moallem.app" className="mt-auto inline-flex items-center gap-1 text-[11px] font-extrabold text-white underline underline-offset-4">
              اطلب المساعدة <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="size-5 text-amber-600" />
          <p className="text-xs font-semibold text-amber-800">اشتراكك ساري حتى {school?.subscriptionEnd} — ٩٠٪ من المساحة متاحة.</p>
        </div>
        <Link to="/app/settings" className="flex items-center gap-1 text-[11px] font-bold text-amber-800">إدارة الاشتراك <ArrowLeft className="size-3.5" /></Link>
      </div>
    </div>
  )
}
