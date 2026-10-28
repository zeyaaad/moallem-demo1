import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight, Building2, CalendarDays, CheckCircle2, CreditCard, GraduationCap, Mail, MapPin, Pencil,
  Phone, Sparkles, TrendingUp, Users, Wallet,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Subscription } from '../../types'
import {
  Avatar, Badge, Button, Card, Field, InfoRow, Modal, ProgressBar, StatCard, useToast,
} from '../../components/ui'
import { AreaChart, Doughnut } from '../../components/charts'
import { monthlyRevenue } from '../../data/content'
import { cn, formatDate, formatNumber } from '../../lib/utils'
import { statusTone } from './SchoolsPage'

const planLabels = { basic: 'أساسي', pro: 'احترافي', enterprise: 'مؤسسي' } as const
const statusLabels = { active: 'نشط', trial: 'تجريبي', expired: 'منتهي' } as const

export default function SchoolDetailPage() {
  const { id } = useParams()
  const { db, updateSubscription, notify } = useStore()
  const { push } = useToast()
  const school = db.schools.find((s) => s.id === id)
  const subscription = db.subscriptions.find((s) => s.schoolId === id)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<{ plan: Subscription['plan']; price: number; status: Subscription['status']; endDate: string; seats: number; autoRenew: boolean }>({
    plan: 'pro', price: 9500, status: 'active', endDate: '', seats: 0, autoRenew: true,
  })

  const schoolTeachers = useMemo(() => db.teachers.filter((t) => t.schoolId === school?.id), [db.teachers, school?.id])
  const schoolClasses = useMemo(() => db.classes.filter((c) => c.schoolId === school?.id), [db.classes, school?.id])
  const schoolStudents = useMemo(() => db.students.filter((s) => s.schoolId === school?.id), [db.students, school?.id])

  if (!school) {
    return (
      <Card>
        <div className="p-10 text-center text-sm text-slate-500">
          المدرسة غير موجودة. <Link to="/app/schools" className="font-bold text-brand-600">العودة للمدارس</Link>
        </div>
      </Card>
    )
  }

  const sub = subscription
  const daysLeft = sub ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000)) : 0
  const usage = sub ? Math.min(100, Math.round(((school.studentsCount + school.teachersCount) / Math.max(1, sub.seats)) * 100)) : 0
  const revenueShare = Math.round((school.monthlyPrice / Math.max(1, db.schools.reduce((sum, s) => sum + s.monthlyPrice, 0))) * 100)

  const openEdit = () => {
    if (!sub) return
    setForm({ plan: sub.plan, price: sub.price, status: sub.status, endDate: sub.endDate, seats: sub.seats, autoRenew: sub.autoRenew })
    setOpen(true)
  }

  const save = () => {
    if (!sub) return
    updateSubscription(sub.id, form)
    notify('حدّث اشتراك مدرسة', `${school.name} — ${planLabels[form.plan]}`)
    push({ title: 'تم تحديث الاشتراك', body: 'تمت مزامنة بيانات المدرسة تلقائيًا.', tone: 'success' })
    setOpen(false)
  }

  return (
    <div>
      <Link to="/app/schools" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">
        <ArrowRight className="size-3.5" /> العودة للمدارس
      </Link>

      <Card className="mb-5 overflow-hidden">
        <div className="relative h-32 bg-slate-950">
          <div className="absolute inset-0 opacity-90" style={{ backgroundImage: `linear-gradient(120deg, ${school.logoColor}, #0f172a)` }} />
          <div className="absolute inset-0 bg-dots opacity-20" />
          <div className="absolute end-5 top-5 flex gap-1.5">
            <Badge tone={statusTone(school.status)}>{statusLabels[school.status]}</Badge>
            <Badge tone="slate" className="border-white/15 bg-white/10 text-white">{planLabels[school.plan]}</Badge>
          </div>
        </div>
        <div className="relative px-5 pb-5 sm:px-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <span className="flex size-20 items-center justify-center rounded-3xl text-3xl font-black text-white ring-4 ring-white" style={{ background: school.logoColor }}>
                {school.shortName.slice(0, 1)}
              </span>
              <div className="pb-1">
                <h1 className="text-xl font-black text-slate-900">{school.name}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="size-3" /> {school.city}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><CalendarDays className="size-3" /> انضمت {formatDate(school.createdAt)}</span>
                  <span>•</span>
                  <span>{school.email}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pb-1">
              <Button variant="secondary" size="sm" onClick={openEdit}><Pencil className="size-3.5" /> تعديل الاشتراك</Button>
              <Link to="/app/subscriptions"><Button size="sm"><CreditCard className="size-3.5" /> كل الاشتراكات</Button></Link>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="الطلاب" value={formatNumber(school.studentsCount)} icon={Users} tone="brand" hint={`${schoolClasses.length || school.classesCount} فصل`} />
        <StatCard label="المعلمون" value={school.teachersCount} icon={GraduationCap} tone="sky" hint="هيئة التدريس" />
        <StatCard label="الإيراد الشهري" value={`${formatNumber(school.monthlyPrice)} ج.م`} icon={Wallet} tone="amber" hint={`${revenueShare}% من إيراد المنصة`} />
        <StatCard label="الأيام المتبقية" value={daysLeft} icon={CalendarDays} tone={daysLeft > 30 ? 'emerald' : daysLeft > 7 ? 'amber' : 'rose'} hint={formatDate(school.subscriptionEnd)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">بيانات المدرسة</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">المعلومات الأساسية وبيانات التواصل</p>
              </div>
              <Badge tone="brand"><Building2 className="size-3" /> {school.shortName}</Badge>
            </div>
            <div className="grid gap-x-8 sm:grid-cols-2">
              <div>
                <InfoRow label="الاسم الكامل" value={school.name} />
                <InfoRow label="الاسم المختصر" value={school.shortName} />
                <InfoRow label="المدينة" value={school.city} />
                <InfoRow label="العنوان" value={school.address} />
              </div>
              <div>
                <InfoRow label="الهاتف" value={<span dir="ltr">{school.phone}</span>} />
                <InfoRow label="البريد الإلكتروني" value={school.email} />
                <InfoRow label="المدير" value={school.managerName} />
                <InfoRow label="تاريخ الانضمام" value={formatDate(school.createdAt)} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">الاشتراك الحالي</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">الخطة، المقاعد، وحالة التجديد</p>
              </div>
              <Button size="sm" variant="soft" onClick={openEdit}><Pencil className="size-3.5" /> تعديل</Button>
            </div>
            {sub ? (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-3.5">
                    <p className="text-[10px] font-bold text-brand-700">الخطة</p>
                    <p className="mt-1 text-lg font-black text-brand-900">{planLabels[sub.plan]}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                    <p className="text-[10px] font-bold text-slate-500">السعر الشهري</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{formatNumber(sub.price)} <span className="text-[10px]">ج.م</span></p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                    <p className="text-[10px] font-bold text-slate-500">المقاعد</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{formatNumber(sub.seats)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">استهلاك المقاعد</span>
                    <span className="font-extrabold text-slate-700">{usage}%</span>
                  </div>
                  <ProgressBar value={usage} tone={usage > 90 ? 'rose' : usage > 70 ? 'amber' : 'emerald'} />
                  <p className="mt-1.5 text-[10px] text-slate-400">{school.studentsCount + school.teachersCount} مستخدم من أصل {formatNumber(sub.seats)} مقعد</p>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-100 p-2.5 text-[11px]">
                    <CalendarDays className="size-4 text-slate-400" />
                    <span className="text-slate-500">يبدأ</span>
                    <span className="ms-auto font-bold text-slate-700">{formatDate(sub.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-100 p-2.5 text-[11px]">
                    <CalendarDays className="size-4 text-slate-400" />
                    <span className="text-slate-500">ينتهي</span>
                    <span className="ms-auto font-bold text-slate-700">{formatDate(sub.endDate)}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[10px] font-semibold text-slate-500">
                  <CheckCircle2 className={cn('size-4', sub.autoRenew ? 'text-emerald-500' : 'text-slate-300')} />
                  التجديد التلقائي {sub.autoRenew ? 'مفعّل' : 'متوقف'}
                  <span className="mx-1 text-slate-200">|</span>
                  حالة الاشتراك: <Badge tone={statusTone(sub.status as typeof school.status)}>{statusLabels[sub.status as keyof typeof statusLabels]}</Badge>
                </div>
              </>
            ) : (
              <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">لا يوجد سجل اشتراك لهذه المدرسة. أضف اشتراكًا من صفحة الاشتراكات.</p>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900">فريق المدرسة</h2>
              <Badge tone="slate">{schoolTeachers.length} معلم</Badge>
            </div>
            {schoolTeachers.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                لا توجد بيانات معلمين مرتبطة بهذه المدرسة في النسخة التجريبية.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {schoolTeachers.slice(0, 6).map((teacher) => (
                  <Link key={teacher.id} to={`/app/teachers/${teacher.id}`} className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5 transition hover:bg-slate-50">
                    <Avatar name={teacher.name} color={teacher.avatarColor} size="xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-bold text-slate-800">{teacher.name}</p>
                      <p className="text-[9px] text-slate-400">{teacher.subjectIds.map((sid) => db.subjects.find((s) => s.id === sid)?.name).filter(Boolean).join(' • ')}</p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600">★ {teacher.rating}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">مدير المدرسة</h2>
            <div className="flex items-center gap-3">
              <Avatar name={school.managerName} color={school.logoColor} />
              <div className="min-w-0">
                <p className="truncate text-xs font-extrabold text-slate-800">{school.managerName}</p>
                <p className="text-[10px] text-slate-400">مدير المدرسة</p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 text-[11px] text-slate-500">
              <p className="flex items-center gap-2"><Mail className="size-3.5" /> {school.email}</p>
              <p className="flex items-center gap-2"><Phone className="size-3.5" /> <span dir="ltr">{school.phone}</span></p>
            </div>
            <a href={`mailto:${school.email}`} className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-[11px] font-bold text-white transition hover:bg-slate-800">
              <Mail className="size-3.5" /> مراسلة الإدارة
            </a>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900">الإيراد الشهري</h2>
              <Badge tone="emerald"><TrendingUp className="size-3" /> مستقر</Badge>
            </div>
            <AreaChart data={monthlyRevenue.slice(-4)} height={150} color="#10b981" suffix=" ج.م" />
            <p className="mt-2 text-[10px] leading-5 text-slate-400">تطور الإيراد خلال آخر ٤ أشهر بعد تطبيق خطة {planLabels[school.plan]}.</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">مؤشرات الاستخدام</h2>
            <Doughnut
              size={140}
              centerValue={formatNumber(schoolStudents.length || school.studentsCount)}
              centerLabel="طالب"
              segments={[
                { label: 'نشطون', value: Math.round(school.studentsCount * 0.92), color: '#10b981' },
                { label: 'غير نشطين', value: Math.round(school.studentsCount * 0.08), color: '#e2e8f0' },
              ]}
            />
            <div className="mt-4 space-y-2 text-[10px] text-slate-500">
              <p className="flex items-center justify-between"><span>الفصول المفعّلة</span><b className="text-slate-700">{schoolClasses.length || school.classesCount}</b></p>
              <p className="flex items-center justify-between"><span>المعلمون</span><b className="text-slate-700">{school.teachersCount}</b></p>
              <p className="flex items-center justify-between"><span>الخطة</span><b className="text-slate-700">{planLabels[school.plan]}</b></p>
            </div>
          </Card>

          <Card className="border-brand-100 bg-brand-50/50 p-5">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-brand-900"><Sparkles className="size-4" /> ملاحظة للديمو</p>
            <p className="mt-2 text-[10px] leading-5 text-brand-800">
              بيانات المدرسة تُحفظ محليًا في المتصفح. يمكنك تعديل الاشتراك ومشاهدة تحديث الخطة والسعر والتاريخ في كل الصفحات.
            </p>
          </Card>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="تعديل الاشتراك"
        description="أي تغيير سيُحدّث بيانات المدرسة والخطة والسعر تلقائيًا."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>إلغاء</Button><Button onClick={save}><CheckCircle2 className="size-4" /> حفظ التغييرات</Button></>}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الخطة">
              <select className="select" value={form.plan} onChange={(e) => {
                const plan = e.target.value as Subscription['plan']
                const price = plan === 'enterprise' ? 18000 : plan === 'pro' ? 9500 : 4500
                setForm({ ...form, plan, price })
              }}>
                <option value="basic">أساسي</option>
                <option value="pro">احترافي</option>
                <option value="enterprise">مؤسسي</option>
              </select>
            </Field>
            <Field label="السعر الشهري (ج.م)">
              <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="حالة الاشتراك">
              <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Subscription['status'] })}>
                <option value="active">نشط</option>
                <option value="trial">تجريبي</option>
                <option value="expired">منتهي</option>
              </select>
            </Field>
            <Field label="تاريخ الانتهاء">
              <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </Field>
          </div>
          <Field label="عدد المقاعد">
            <input type="number" className="input" value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} />
          </Field>
          <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
            <span className="text-xs font-bold text-slate-700">التجديد التلقائي</span>
            <input type="checkbox" className="size-4 accent-brand-600" checked={form.autoRenew} onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })} />
          </label>
        </div>
      </Modal>
    </div>
  )
}
