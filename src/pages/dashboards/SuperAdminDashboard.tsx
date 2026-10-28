import { Link } from 'react-router-dom'
import {
  ArrowLeft, Building2, CreditCard, DollarSign, Plus, TrendingUp, Users, AlertTriangle,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Badge, Button, Card, StatCard } from '../../components/ui'
import { AreaChart, Doughnut } from '../../components/charts'
import { monthlyRevenue } from '../../data/content'
import { formatNumber, relativeDay } from '../../lib/utils'

const planPrice = { basic: 4500, pro: 9500, enterprise: 18000 }

export default function SuperAdminDashboard() {
  const { db, currentUser } = useStore()
  const schools = db.schools
  const active = schools.filter((s) => s.status === 'active')
  const mrr = active.reduce((sum, s) => sum + planPrice[s.plan], 0)
  const totalStudents = schools.reduce((sum, s) => sum + s.studentsCount, 0)
  const expiring = db.subscriptions.filter((s) => new Date(s.endDate).getTime() - Date.now() < 60 * 86400000)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-slate-400">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">مركز قيادة المنصة</h1>
          <p className="mt-1 text-xs text-slate-500">أهلًا {currentUser?.name} — إليك نظرة شاملة على أداء مُعلّم.</p>
        </div>
        <Link to="/app/schools?new=1"><Button><Plus className="size-4" /> مدرسة جديدة</Button></Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="الإيراد الشهري (MRR)" value={`${formatNumber(mrr)} ج.م`} icon={DollarSign} tone="emerald" delta="+١٢.٤٪" hint="مقارنة بالشهر الماضي" />
        <StatCard label="المدارس المشتركة" value={schools.length} icon={Building2} tone="brand" delta={`${active.length} نشطة`} hint={`${schools.length - active.length} تجريبية`} />
        <StatCard label="إجمالي الطلاب" value={formatNumber(totalStudents)} icon={Users} tone="sky" delta="+٨.٢٪" hint="على مستوى المنصة" />
        <StatCard label="اشتراكات تنتهي قريبًا" value={expiring.length} icon={CreditCard} tone="amber" hint="خلال ٦٠ يومًا" />
      </div>

      {/* Revenue banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-5 text-white sm:p-6">
        <div className="absolute inset-0 bg-gradient-to-l from-brand-700/60 via-slate-950 to-slate-950" />
        <div className="pointer-events-none absolute -top-20 end-1/4 size-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-white/50"><TrendingUp className="size-3.5" /> الإيراد الشهري المتكرر</div>
            <div className="mt-2 flex items-end gap-3">
              <p className="text-4xl font-black">{formatNumber(mrr)}<span className="ms-1 text-base font-bold text-white/50">ج.م</span></p>
              <span className="mb-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">+١٢.٤٪</span>
            </div>
            <p className="mt-2 text-[11px] text-white/40">متوسط الإيراد لكل مدرسة {formatNumber(Math.round(mrr / Math.max(1, active.length)))} ج.م / شهر</p>
          </div>
          <div className="flex gap-6 text-xs">
            <div><p className="text-white/40">هدف الربع</p><p className="mt-1 text-lg font-extrabold">٩٢٪</p></div>
            <div><p className="text-white/40">معدل التجديد</p><p className="mt-1 text-lg font-extrabold">٩٦٪</p></div>
            <div><p className="text-white/40">أيام للتحصيل</p><p className="mt-1 text-lg font-extrabold">١٨</p></div>
          </div>
          <Link to="/app/subscriptions" className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-[11px] font-bold backdrop-blur transition hover:bg-white/15">
            إدارة الاشتراكات <ArrowLeft className="size-3.5" />
          </Link>
        </div>
        <div className="relative mt-4 h-14 opacity-90">
          <svg viewBox="0 0 800 60" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#818cf8" stopOpacity=".5" />
                <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 48 C80 44 100 30 160 34 S260 18 320 26 S430 8 500 16 S620 4 700 10 S770 2 800 6 V60 H0Z" fill="url(#rev)" />
            <path d="M0 48 C80 44 100 30 160 34 S260 18 320 26 S430 8 500 16 S620 4 700 10 S770 2 800 6" fill="none" stroke="#a5b4fc" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">نمو الإيرادات</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">آخر ٦ أشهر — بالجنيه المصري</p>
            </div>
            <Badge tone="emerald">+٥٠٪ نمو</Badge>
          </div>
          <AreaChart data={monthlyRevenue.map((m) => ({ label: m.label, value: Math.round(m.value / 1000) }))} height={200} color="#10b981" suffix="K" />
          <p className="mt-1 text-center text-[9px] text-slate-400">القيم بالآلاف</p>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-extrabold text-slate-900">توزيع الخطط</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">حسب عدد المدارس</p>
          <div className="mt-4">
            <Doughnut
              segments={[
                { label: 'احترافية', value: schools.filter((s) => s.plan === 'pro').length, color: '#4f46e5' },
                { label: 'مؤسسية', value: schools.filter((s) => s.plan === 'enterprise').length, color: '#0d9488' },
                { label: 'أساسية', value: schools.filter((s) => s.plan === 'basic').length, color: '#f59e0b' },
              ]}
              centerValue={`${schools.length}`}
              centerLabel="مدرسة"
              size={150}
            />
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-bold text-slate-500">الخطة الأعلى إيرادًا</p>
            <p className="mt-1 text-xs font-extrabold text-slate-800">المؤسسية — {formatNumber(planPrice.enterprise * schools.filter((s) => s.plan === 'enterprise').length)} ج.م / شهر</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-extrabold text-slate-900">المدارس</h2>
            <Link to="/app/schools" className="text-[11px] font-bold text-brand-600">إدارة الكل</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="table-head">
                  <th className="px-5 py-2.5">المدرسة</th>
                  <th className="px-3 py-2.5">الخطة</th>
                  <th className="px-3 py-2.5">الطلاب</th>
                  <th className="px-3 py-2.5">الحالة</th>
                  <th className="px-5 py-2.5">التجديد</th>
                </tr>
              </thead>
              <tbody>
                {schools.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl text-[11px] font-black text-white" style={{ background: s.logoColor }}>{s.shortName[0]}</span>
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">{s.name}</p>
                          <p className="text-[10px] text-slate-400">{s.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell"><Badge tone={s.plan === 'enterprise' ? 'violet' : s.plan === 'pro' ? 'brand' : 'slate'}>{s.plan === 'enterprise' ? 'مؤسسية' : s.plan === 'pro' ? 'احترافية' : 'أساسية'}</Badge></td>
                    <td className="table-cell text-xs text-slate-600">{formatNumber(s.studentsCount)}</td>
                    <td className="table-cell"><Badge tone={s.status === 'active' ? 'emerald' : s.status === 'trial' ? 'amber' : 'rose'} dot>{s.status === 'active' ? 'نشط' : s.status === 'trial' ? 'تجريبي' : 'منتهي'}</Badge></td>
                    <td className="table-cell text-xs text-slate-400">{relativeDay(s.subscriptionEnd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              <h2 className="text-sm font-extrabold text-slate-900">تحتاج انتباهك</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { title: 'اشتراك مدرسة المستقبل', body: 'تجريبي ينتهي خلال ٢٣ يومًا', tone: 'amber' },
                { title: 'أكاديمية الأمل', body: 'الاشتراك منتهي — ١٧٥ طالبًا متوقف', tone: 'rose' },
                { title: 'فاتورة متأخرة', body: 'مدارس رواد المعرفة — ١١,٠٠٠ ج.م', tone: 'amber' },
              ].map((a) => (
                <div key={a.title} className={`rounded-xl border p-3 ${a.tone === 'rose' ? 'border-rose-100 bg-rose-50/60' : 'border-amber-100 bg-amber-50/60'}`}>
                  <p className="text-[11px] font-extrabold text-slate-800">{a.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{a.body}</p>
                </div>
              ))}
            </div>
            <Link to="/app/subscriptions" className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-slate-50 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100">
              إدارة الاشتراكات <ArrowLeft className="size-3.5" />
            </Link>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">آخر النشاطات</h2>
            <div className="space-y-3">
              {db.auditLog.slice(0, 3).map((a) => (
                <div key={a.id} className="flex gap-2.5">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-400" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-700"><b className="font-extrabold">{a.actor}</b> {a.action}</p>
                    <p className="text-[10px] text-slate-400">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'معدل الاحتفاظ بالطلاب', value: '٩٤٪', hint: 'مقارنة بالعام الماضي', tone: 'emerald' as const },
          { label: 'متوسط زمن الرد', value: '٤ دقائق', hint: 'دعم فني', tone: 'brand' as const },
          { label: 'رضا المدراء', value: '٤.٩ / ٥', hint: 'من ٨٦ تقييم', tone: 'amber' as const },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-[11px] font-semibold text-slate-400">{s.label}</p>
            <p className="mt-1 text-xl font-black text-slate-900">{s.value}</p>
            <p className="mt-1 text-[10px] text-slate-400">{s.hint}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
