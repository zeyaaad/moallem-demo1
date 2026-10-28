import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, CalendarDays, CheckCircle2, CreditCard, Download, Pencil, Search, Sparkles, TrendingUp,
  Users, Wallet,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Subscription } from '../../types'
import {
  Avatar, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, ProgressBar, SearchInput, StatCard, Switch, useToast,
} from '../../components/ui'
import { AreaChart, BarChart, Doughnut } from '../../components/charts'
import { monthlyRevenue } from '../../data/content'
import { cn, formatDate, formatNumber } from '../../lib/utils'
import { planTone, statusTone } from '../schools/SchoolsPage'

const planLabels = { basic: 'أساسي', pro: 'احترافي', enterprise: 'مؤسسي' } as const
const statusLabels = { active: 'نشط', trial: 'تجريبي', expired: 'منتهي' } as const

type Draft = { plan: Subscription['plan']; price: number; status: Subscription['status']; endDate: string; seats: number; autoRenew: boolean }

export default function SubscriptionsPage() {
  const { db, updateSubscription, notify } = useStore()
  const { push } = useToast()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | Subscription['status']>('all')
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [draft, setDraft] = useState<Draft>({ plan: 'pro', price: 9500, status: 'active', endDate: '', seats: 0, autoRenew: true })

  const subscriptions = useMemo(
    () => db.subscriptions
      .filter((s) => status === 'all' || s.status === status)
      .filter((s) => {
        const school = db.schools.find((x) => x.id === s.schoolId)
        return !q || (school?.name.includes(q) ?? false) || (school?.city.includes(q) ?? false)
      }),
    [db.schools, db.subscriptions, q, status],
  )

  const mrr = db.subscriptions.filter((s) => s.status !== 'expired').reduce((sum, s) => sum + s.price, 0)
  const arr = mrr * 12
  const renewalSoon = db.subscriptions.filter((s) => {
    const days = Math.ceil((new Date(s.endDate).getTime() - Date.now()) / 86400000)
    return days > 0 && days <= 30
  }).length

  const openEdit = (sub: Subscription) => {
    setEditing(sub)
    setDraft({ plan: sub.plan, price: sub.price, status: sub.status, endDate: sub.endDate, seats: sub.seats, autoRenew: sub.autoRenew })
  }

  const save = () => {
    if (!editing) return
    updateSubscription(editing.id, draft)
    const school = db.schools.find((s) => s.id === editing.schoolId)
    notify('حدّث اشتراك مدرسة', school?.name ?? '')
    push({ title: 'تم حفظ الاشتراك', body: 'تم تحديث بيانات المدرسة تلقائيًا.', tone: 'success' })
    setEditing(null)
  }

  const toggleRenew = (sub: Subscription, value: boolean) => {
    updateSubscription(sub.id, { autoRenew: value })
    push({ title: value ? 'تم تفعيل التجديد التلقائي' : 'تم إيقاف التجديد التلقائي', tone: 'info' })
  }

  return (
    <div>
      <PageHeader
        title="الاشتراكات والإيرادات"
        subtitle="إدارة اشتراكات المدارس، التجديد، والمقاعد — مع صورة واضحة للإيراد المتكرر."
        actions={<Link to="/app/plans"><Button><Sparkles className="size-4" /> خطط الأسعار</Button></Link>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="الإيراد الشهري" value={`${formatNumber(mrr)} ج.م`} icon={Wallet} tone="emerald" delta="+٨٪" hint="مقارنة بالشهر السابق" />
        <StatCard label="الإيراد السنوي المتوقع" value={`${formatNumber(arr)} ج.م`} icon={TrendingUp} tone="brand" hint="على أساس الاشتراك الحالي" />
        <StatCard label="اشتراكات نشطة" value={db.subscriptions.filter((s) => s.status === 'active').length} icon={CheckCircle2} tone="sky" hint={`${db.subscriptions.filter((s) => s.status === 'trial').length} تجريبي`} />
        <StatCard label="تجديد خلال ٣٠ يوم" value={renewalSoon} icon={CalendarDays} tone="amber" hint="تحتاج متابعة" />
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">تطور الإيرادات</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">آخر ٦ أشهر — إجمالي المنصة</p>
            </div>
            <Badge tone="emerald">+٢٤٪</Badge>
          </div>
          <AreaChart data={monthlyRevenue} height={200} color="#4f46e5" suffix=" ج.م" />
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-extrabold text-slate-900">توزيع الاشتراكات</h2>
          <Doughnut
            centerLabel="اشتراك"
            centerValue={String(db.subscriptions.length)}
            segments={[
              { label: 'نشط', value: db.subscriptions.filter((s) => s.status === 'active').length, color: '#10b981' },
              { label: 'تجريبي', value: db.subscriptions.filter((s) => s.status === 'trial').length, color: '#f59e0b' },
              { label: 'منتهي', value: db.subscriptions.filter((s) => s.status === 'expired').length, color: '#f43f5e' },
            ]}
          />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 p-2"><p className="text-sm font-black text-slate-800">{db.schools.length}</p><p className="text-[9px] text-slate-400">مدارس</p></div>
            <div className="rounded-xl bg-slate-50 p-2"><p className="text-sm font-black text-slate-800">{db.subscriptions.reduce((sum, s) => sum + s.seats, 0)}</p><p className="text-[9px] text-slate-400">مقعد</p></div>
            <div className="rounded-xl bg-slate-50 p-2"><p className="text-sm font-black text-slate-800">{Math.round((mrr / Math.max(1, db.schools.length)) / 100) / 10}k</p><p className="text-[9px] text-slate-400">متوسط</p></div>
          </div>
        </Card>
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <SearchInput value={q} onChange={setQ} placeholder="ابحث باسم المدرسة أو المدينة…" className="w-full sm:w-80" />
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 sm:ms-auto scrollbar-hide">
          {(['all', 'active', 'trial', 'expired'] as const).map((value) => (
            <button key={value} onClick={() => setStatus(value)} className={cn('chip shrink-0', status === value && 'chip-active')}>
              {value === 'all' ? 'كل الاشتراكات' : statusLabels[value]}
            </button>
          ))}
        </div>
      </Card>

      {subscriptions.length === 0 ? (
        <Card><EmptyState icon={Search} title="لا توجد اشتراكات مطابقة" description="جرّب تعديل البحث أو الفلتر." /></Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="table-head">
                    <th className="px-5 py-3">المدرسة</th>
                    <th className="px-3 py-3">الخطة</th>
                    <th className="px-3 py-3">السعر / شهر</th>
                    <th className="px-3 py-3">المقاعد</th>
                    <th className="px-3 py-3">تاريخ الانتهاء</th>
                    <th className="px-3 py-3">الحالة</th>
                    <th className="px-3 py-3">تجديد تلقائي</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const school = db.schools.find((s) => s.id === sub.schoolId)
                    const used = (school?.studentsCount ?? 0) + (school?.teachersCount ?? 0)
                    const usage = Math.min(100, Math.round((used / Math.max(1, sub.seats)) * 100))
                    return (
                      <tr key={sub.id} className="transition hover:bg-slate-50/70">
                        <td className="table-cell">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={school?.name ?? 'مدرسة'} color={school?.logoColor ?? '#4f46e5'} size="xs" />
                            <div>
                              <Link to={`/app/schools/${sub.schoolId}`} className="text-xs font-extrabold text-slate-800 hover:text-brand-600">{school?.name ?? 'مدرسة محذوفة'}</Link>
                              <p className="text-[9px] text-slate-400">{school?.city ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell"><Badge tone={planTone(sub.plan)}>{planLabels[sub.plan]}</Badge></td>
                        <td className="table-cell text-xs font-extrabold text-slate-700">{formatNumber(sub.price)} <span className="text-[9px] font-bold text-slate-400">ج.م</span></td>
                        <td className="table-cell">
                          <div className="w-24">
                            <div className="mb-1 flex items-center justify-between text-[9px] font-bold text-slate-400"><span>{used}</span><span>{sub.seats}</span></div>
                            <ProgressBar value={usage} size="sm" tone={usage > 90 ? 'rose' : usage > 70 ? 'amber' : 'emerald'} />
                          </div>
                        </td>
                        <td className="table-cell text-[11px] text-slate-500">{formatDate(sub.endDate)}</td>
                        <td className="table-cell"><Badge tone={statusTone(sub.status)} dot>{statusLabels[sub.status]}</Badge></td>
                        <td className="table-cell"><Switch checked={sub.autoRenew} onChange={(v) => toggleRenew(sub, v)} /></td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(sub)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-brand-50 hover:text-brand-600" aria-label="تعديل الاشتراك"><Pencil className="size-3.5" /></button>
                            <Link to={`/app/schools/${sub.schoolId}`} className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="تفاصيل المدرسة"><ArrowLeft className="size-3.5" /></Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800"><CreditCard className="size-4 text-brand-500" /> الفواتير القادمة</p>
              <p className="mt-1.5 text-[10px] leading-5 text-slate-400">{renewalSoon} اشتراكات تحتاج تجديدًا خلال ٣٠ يومًا. يتم إرسال تذكير تلقائي قبل ٧ أيام.</p>
            </Card>
            <Card className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800"><Users className="size-4 text-emerald-500" /> استخدام المقاعد</p>
              <p className="mt-1.5 text-[10px] leading-5 text-slate-400">متوسط الاستخدام {Math.round(db.subscriptions.reduce((sum, s) => {
                const school = db.schools.find((x) => x.id === s.schoolId)
                return sum + ((school?.studentsCount ?? 0) + (school?.teachersCount ?? 0)) / Math.max(1, s.seats)
              }, 0) / Math.max(1, db.subscriptions.length) * 100)}٪ من إجمالي المقاعد.</p>
            </Card>
            <Card className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800"><Download className="size-4 text-amber-500" /> تقرير الإيرادات</p>
              <button
                onClick={() => push({ title: 'تم تجهيز التقرير', body: 'تقرير الإيرادات الشهري جاهز للتنزيل (نسخة تجريبية).', tone: 'success' })}
                className="mt-1.5 text-[10px] font-bold text-brand-600 hover:text-brand-700"
              >
                تنزيل تقرير PDF ←
              </button>
            </Card>
          </div>

          <Card className="mt-5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900">الإيراد حسب الخطة</h2>
              <Badge tone="slate">شهري</Badge>
            </div>
            <BarChart
              height={180}
              color="#8b5cf6"
              data={[
                { label: 'أساسي', value: db.subscriptions.filter((s) => s.plan === 'basic').reduce((sum, s) => sum + s.price, 0) },
                { label: 'احترافي', value: db.subscriptions.filter((s) => s.plan === 'pro').reduce((sum, s) => sum + s.price, 0) },
                { label: 'مؤسسي', value: db.subscriptions.filter((s) => s.plan === 'enterprise').reduce((sum, s) => sum + s.price, 0) },
              ]}
              suffix=" ج.م"
            />
          </Card>
        </>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="تعديل الاشتراك"
        description="سيتم تحديث المدرسة والخطة والسعر وحالة الاشتراك في كل الصفحات."
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>إلغاء</Button><Button onClick={save}><CheckCircle2 className="size-4" /> حفظ</Button></>}
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-700">
            {db.schools.find((s) => s.id === editing?.schoolId)?.name ?? '—'}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الخطة">
              <select className="select" value={draft.plan} onChange={(e) => {
                const plan = e.target.value as Subscription['plan']
                setDraft({ ...draft, plan, price: plan === 'enterprise' ? 18000 : plan === 'pro' ? 9500 : 4500 })
              }}>
                <option value="basic">أساسي</option>
                <option value="pro">احترافي</option>
                <option value="enterprise">مؤسسي</option>
              </select>
            </Field>
            <Field label="السعر الشهري">
              <input type="number" className="input" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الحالة">
              <select className="select" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Subscription['status'] })}>
                <option value="active">نشط</option>
                <option value="trial">تجريبي</option>
                <option value="expired">منتهي</option>
              </select>
            </Field>
            <Field label="تاريخ الانتهاء">
              <input type="date" className="input" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} />
            </Field>
          </div>
          <Field label="المقاعد">
            <input type="number" className="input" value={draft.seats} onChange={(e) => setDraft({ ...draft, seats: Number(e.target.value) })} />
          </Field>
          <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
            <span className="text-xs font-bold text-slate-700">التجديد التلقائي</span>
            <input type="checkbox" className="size-4 accent-brand-600" checked={draft.autoRenew} onChange={(e) => setDraft({ ...draft, autoRenew: e.target.checked })} />
          </label>
        </div>
      </Modal>
    </div>
  )
}
