import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Building2, CalendarDays, CheckCircle2, CreditCard, Filter, GraduationCap, Mail, MapPin,
  Plus, School as SchoolIcon, Search, Sparkles, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { School } from '../../types'
import {
  Avatar, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, SearchInput, StatCard, useToast,
} from '../../components/ui'
import { BarChart, Doughnut } from '../../components/charts'
import { monthlyRevenue } from '../../data/content'
import { cn, formatDate, formatNumber } from '../../lib/utils'

const planLabels: Record<School['plan'], string> = { basic: 'أساسي', pro: 'احترافي', enterprise: 'مؤسسي' }
const statusLabels: Record<School['status'], string> = { active: 'نشط', trial: 'تجريبي', expired: 'منتهي' }

export function planTone(plan: School['plan']) {
  return plan === 'enterprise' ? 'violet' : plan === 'pro' ? 'brand' : 'slate'
}

export function statusTone(status: School['status']) {
  return status === 'active' ? 'emerald' : status === 'trial' ? 'amber' : 'rose'
}

export default function SchoolsPage() {
  const { db, addSchool, notify } = useStore()
  const { push } = useToast()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | School['status']>('all')
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    name: '', city: 'القاهرة', plan: 'pro' as School['plan'], managerName: '', email: '', phone: '',
  })

  const schools = useMemo(
    () => db.schools
      .filter((s) => status === 'all' || s.status === status)
      .filter((s) => !q || s.name.includes(q) || s.city.includes(q) || s.managerName.includes(q)),
    [db.schools, q, status],
  )

  const mrr = db.schools.filter((s) => s.status !== 'expired').reduce((sum, s) => sum + s.monthlyPrice, 0)
  const totalStudents = db.schools.reduce((sum, s) => sum + s.studentsCount, 0)
  const activeCount = db.schools.filter((s) => s.status === 'active').length

  const submit = () => {
    if (!form.name.trim()) { push({ title: 'اكتب اسم المدرسة', tone: 'error' }); return }
    if (!form.managerName.trim()) { push({ title: 'اكتب اسم مدير المدرسة', tone: 'error' }); return }
    const created = addSchool({
      name: form.name.trim(),
      city: form.city.trim(),
      plan: form.plan,
      managerName: form.managerName.trim(),
      email: form.email || `info@${Date.now()}.edu.eg`,
      phone: form.phone || '0100 000 0000',
    })
    notify('أنشأ مدرسة جديدة', `${created.name} — ${planLabels[created.plan]}`)
    push({ title: 'تم إنشاء المدرسة', body: 'تم إنشاء حساب مدير المدرسة تلقائيًا.', tone: 'success' })
    setOpen(false)
    setForm({ name: '', city: 'القاهرة', plan: 'pro', managerName: '', email: '', phone: '' })
    navigate(`/app/schools/${created.id}`)
  }

  return (
    <div>
      <PageHeader
        title="المدارس المشتركة"
        subtitle="تابع كل المدارس على المنصة، اشتراكاتها، ومديريها — وأضف مدرسة جديدة في دقيقة."
        actions={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> مدرسة جديدة</Button>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="إجمالي المدارس" value={db.schools.length} icon={SchoolIcon} tone="brand" hint={`${activeCount} نشطة`} />
        <StatCard label="إجمالي الطلاب" value={formatNumber(totalStudents)} icon={Users} tone="emerald" hint="على مستوى المنصة" />
        <StatCard label="الإيراد الشهري" value={`${formatNumber(mrr)} ج.م`} icon={CreditCard} tone="amber" hint="اشتراكات نشطة" />
        <StatCard label="خطط مؤسسية" value={db.schools.filter((s) => s.plan === 'enterprise').length} icon={Sparkles} tone="violet" hint="أعلى فئة" />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <SearchInput value={q} onChange={setQ} placeholder="ابحث باسم المدرسة أو المدينة أو المدير…" className="w-full sm:w-80" />
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 sm:ms-auto scrollbar-hide">
          {(['all', 'active', 'trial', 'expired'] as const).map((value) => (
            <button key={value} onClick={() => setStatus(value)} className={cn('chip shrink-0', status === value && 'chip-active')}>
              <Filter className="size-3" />
              {value === 'all' ? 'الكل' : statusLabels[value]}
            </button>
          ))}
        </div>
      </Card>

      {schools.length === 0 ? (
        <Card><EmptyState icon={Search} title="لا توجد مدارس مطابقة" description="جرّب تعديل البحث أو أضف مدرسة جديدة للمنصة." action={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> مدرسة جديدة</Button>} /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {schools.map((school) => {
            const sub = db.subscriptions.find((s) => s.schoolId === school.id)
            return (
              <Card key={school.id} className="card-hover overflow-hidden">
                <div className="relative h-24 bg-slate-950">
                  <div className="absolute inset-0 opacity-90" style={{ backgroundImage: `linear-gradient(120deg, ${school.logoColor}, #0f172a)` }} />
                  <div className="absolute inset-0 bg-dots opacity-20" />
                  <div className="absolute end-3 top-3 flex gap-1.5">
                    <Badge tone={statusTone(school.status)}>{statusLabels[school.status]}</Badge>
                    <Badge tone="slate" className="border-white/15 bg-white/10 text-white">{planLabels[school.plan]}</Badge>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <div className="-mt-8 flex items-end justify-between">
                    <span className="flex size-14 items-center justify-center rounded-2xl text-xl font-black text-white ring-4 ring-white" style={{ background: school.logoColor }}>
                      {school.shortName.slice(0, 1)}
                    </span>
                    <span className="mb-1 flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                      <CalendarDays className="size-3" /> ينتهي {formatDate(school.subscriptionEnd, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-extrabold text-slate-900">{school.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><MapPin className="size-3" /> {school.city} • {school.address}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-100 p-2.5">
                    <Avatar name={school.managerName} color={school.logoColor} size="xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-bold text-slate-700">{school.managerName}</p>
                      <p className="text-[9px] text-slate-400">مدير المدرسة</p>
                    </div>
                    <a href={`mailto:${school.email}`} className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50" aria-label="مراسلة"><Mail className="size-3.5" /></a>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center">
                    <div><p className="text-xs font-extrabold text-slate-800">{formatNumber(school.studentsCount)}</p><p className="text-[9px] text-slate-400">طالب</p></div>
                    <div className="border-x border-slate-200"><p className="text-xs font-extrabold text-slate-800">{school.teachersCount}</p><p className="text-[9px] text-slate-400">معلم</p></div>
                    <div><p className="text-xs font-extrabold text-slate-800">{school.classesCount}</p><p className="text-[9px] text-slate-400">فصل</p></div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-50/60 px-3 py-2">
                    <span className="text-[10px] font-semibold text-brand-800">اشتراك شهري</span>
                    <span className="text-xs font-extrabold text-brand-900">{formatNumber(school.monthlyPrice)} ج.م</span>
                  </div>

                  <div className="mt-3 flex gap-1.5">
                    <Link to={`/app/schools/${school.id}`} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-[11px] font-bold text-white transition hover:bg-slate-800">
                      تفاصيل المدرسة <ArrowLeft className="size-3.5" />
                    </Link>
                    <Link to="/app/subscriptions" className="flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50">
                      الاشتراك
                    </Link>
                  </div>
                  {sub && <p className="mt-2 text-center text-[9px] text-slate-400">{formatNumber(sub.seats)} مقعد • تجديد تلقائي {sub.autoRenew ? 'مفعّل' : 'متوقف'}</p>}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">نمو إيرادات المنصة</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">آخر ٦ أشهر — بالجنيه المصري</p>
            </div>
            <Badge tone="emerald"><Sparkles className="size-3" /> +٢٤٪</Badge>
          </div>
          <BarChart data={monthlyRevenue} height={200} color="#4f46e5" />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-extrabold text-slate-900">توزيع الخطط</h2>
          <Doughnut
            centerLabel="مدرسة"
            centerValue={String(db.schools.length)}
            segments={[
              { label: 'أساسي', value: db.schools.filter((s) => s.plan === 'basic').length, color: '#94a3b8' },
              { label: 'احترافي', value: db.schools.filter((s) => s.plan === 'pro').length, color: '#4f46e5' },
              { label: 'مؤسسي', value: db.schools.filter((s) => s.plan === 'enterprise').length, color: '#8b5cf6' },
            ]}
          />
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">مدارس نشطة</span><span className="font-bold text-emerald-600">{activeCount}</span></div>
            <div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">فترات تجريبية</span><span className="font-bold text-amber-600">{db.schools.filter((s) => s.status === 'trial').length}</span></div>
            <div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">منتهية</span><span className="font-bold text-rose-600">{db.schools.filter((s) => s.status === 'expired').length}</span></div>
          </div>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="إضافة مدرسة جديدة"
        description="سيتم إنشاء حساب مدير للمدرسة وربطه بالاشتراك المختار."
        size="lg"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>إلغاء</Button><Button onClick={submit}><Building2 className="size-4" /> إنشاء المدرسة</Button></>}
      >
        <div className="space-y-4">
          <Field label="اسم المدرسة">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: مدارس المستقبل الدولية" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="المدينة">
              <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="القاهرة" />
            </Field>
            <Field label="الخطة">
              <select className="select" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value as School['plan'] })}>
                <option value="basic">أساسي — ٤٫٥٠٠ ج.م / شهر</option>
                <option value="pro">احترافي — ٩٫٥٠٠ ج.م / شهر</option>
                <option value="enterprise">مؤسسي — ١٨٫٠٠٠ ج.م / شهر</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="اسم مدير المدرسة">
              <input className="input" value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} placeholder="مثال: أ. سامي عبد الرحمن" />
            </Field>
            <Field label="بريد المدير" hint="يُستخدم لتسجيل الدخول">
              <input className="input" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="manager@school.edu.eg" />
            </Field>
          </div>
          <Field label="هاتف المدرسة">
            <input className="input" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0100 000 0000" />
          </Field>

          <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-brand-900"><CheckCircle2 className="size-4" /> ما سيحدث تلقائيًا</p>
            <ul className="mt-2 space-y-1 text-[10px] leading-5 text-brand-800">
              <li>• إنشاء حساب مدير مرتبط بالمدرسة.</li>
              <li>• بدء فترة تجريبية ٣٠ يومًا على الخطة المختارة.</li>
              <li>• إنشاء سجل اشتراك قابل للتعديل من صفحة الاشتراكات.</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[10px] text-slate-500">
            <span className="flex size-9 items-center justify-center rounded-xl font-black text-white" style={{ background: '#4f46e5' }}>
              {form.name.trim().slice(0, 1) || <GraduationCap className="size-4" />}
            </span>
            معاينة: {form.name || 'اسم المدرسة'} — {planLabels[form.plan]}
          </div>
        </div>
      </Modal>
    </div>
  )
}
