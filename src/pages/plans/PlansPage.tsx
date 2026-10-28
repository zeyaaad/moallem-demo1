import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Building2, Check, Crown, GraduationCap, Rocket, Sparkles, Users, X, Zap,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Badge, Button, Card, PageHeader, Switch } from '../../components/ui'
import { cn, formatNumber } from '../../lib/utils'

const plans = [
  {
    id: 'basic' as const,
    name: 'أساسي',
    icon: Users,
    color: 'slate',
    monthly: 4500,
    tagline: 'بداية منظمة لمدرسة صغيرة',
    students: 'حتى ٣٠٠ طالب',
    features: [
      { label: 'لوحة مدير المدرسة', on: true },
      { label: 'إدارة الطلاب والمعلمين', on: true },
      { label: 'الفصول والمواد', on: true },
      { label: 'الحضور والغياب', on: true },
      { label: 'ريلز تعليمية', on: false },
      { label: 'توليد امتحانات بالذكاء الاصطناعي', on: false },
      { label: 'تقارير متقدمة', on: false },
    ],
  },
  {
    id: 'pro' as const,
    name: 'احترافي',
    icon: Rocket,
    color: 'brand',
    monthly: 9500,
    tagline: 'الأكثر اختيارًا من المدارس',
    students: 'حتى ١٫٠٠٠ طالب',
    popular: true,
    features: [
      { label: 'كل مزايا الأساسي', on: true },
      { label: 'ريلز تعليمية غير محدودة', on: true },
      { label: 'توليد امتحانات بالذكاء الاصطناعي', on: true },
      { label: 'تحليلات ونقاط ضعف', on: true },
      { label: 'تطبيق ولي الأمر', on: true },
      { label: 'دعم فني أولوية', on: true },
      { label: 'تخصيص الهوية البصرية', on: false },
    ],
  },
  {
    id: 'enterprise' as const,
    name: 'مؤسسي',
    icon: Crown,
    color: 'violet',
    monthly: 18000,
    tagline: 'لمجموعات المدارس والكيانات الكبيرة',
    students: 'عدد طلاب غير محدود',
    features: [
      { label: 'كل مزايا الاحترافي', on: true },
      { label: 'مدارس وفروع متعددة', on: true },
      { label: 'تخصيص الهوية البصرية', on: true },
      { label: 'مدير حساب مخصص', on: true },
      { label: 'تكامل مع أنظمة المدرسة', on: true },
      { label: 'تقارير تنفيذية متقدمة', on: true },
      { label: 'اتفاقية مستوى خدمة SLA', on: true },
    ],
  },
]

export default function PlansPage() {
  const { db } = useStore()
  const [yearly, setYearly] = useState(false)

  const price = (monthly: number) => (yearly ? Math.round(monthly * 12 * 0.8) : monthly)
  const counts = {
    basic: db.schools.filter((s) => s.plan === 'basic').length,
    pro: db.schools.filter((s) => s.plan === 'pro').length,
    enterprise: db.schools.filter((s) => s.plan === 'enterprise').length,
  }

  return (
    <div>
      <PageHeader
        title="خطط الأسعار"
        subtitle="خطط مرنة تناسب مدرسة واحدة أو مجموعة مدارس — اختر ما يناسب حجم مؤسستك."
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <span className={cn('text-xs font-bold', !yearly ? 'text-slate-900' : 'text-slate-400')}>شهري</span>
            <Switch checked={yearly} onChange={setYearly} />
            <span className={cn('text-xs font-bold', yearly ? 'text-slate-900' : 'text-slate-400')}>سنوي</span>
            <Badge tone="emerald" className="ms-1">خصم ٢٠٪</Badge>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={cn('relative overflow-hidden p-6', plan.popular && 'ring-2 ring-brand-500')}>
            {plan.popular && (
              <span className="absolute end-0 top-0 rounded-bl-2xl bg-brand-600 px-3 py-1.5 text-[10px] font-extrabold text-white">
                الأكثر اختيارًا
              </span>
            )}
            <span className={cn(
              'flex size-12 items-center justify-center rounded-2xl',
              plan.color === 'brand' ? 'bg-brand-50 text-brand-600' : plan.color === 'violet' ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-600',
            )}>
              <plan.icon className="size-6" />
            </span>
            <h2 className="mt-3 text-lg font-black text-slate-900">{plan.name}</h2>
            <p className="mt-0.5 text-[11px] text-slate-400">{plan.tagline}</p>

            <div className="mt-4 flex items-end gap-1.5">
              <span className="text-3xl font-black tracking-tight text-slate-900">{formatNumber(price(plan.monthly))}</span>
              <span className="mb-1 text-xs font-bold text-slate-400">ج.م / {yearly ? 'سنة' : 'شهر'}</span>
            </div>
            {yearly && <p className="mt-1 text-[10px] font-semibold text-emerald-600">توفير {formatNumber(plan.monthly * 12 - price(plan.monthly))} ج.م سنويًا</p>}

            <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600">
              <GraduationCap className="size-4 text-slate-400" /> {plan.students}
            </div>

            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature.label} className={cn('flex items-center gap-2 text-[11px]', feature.on ? 'text-slate-600' : 'text-slate-400')}>
                  {feature.on ? <Check className="size-3.5 shrink-0 text-emerald-500" /> : <X className="size-3.5 shrink-0 text-slate-300" />}
                  <span className={cn(feature.on && 'font-semibold')}>{feature.label}</span>
                </li>
              ))}
            </ul>

            <Link to="/app/schools" className="mt-5 block">
              <Button variant={plan.popular ? 'primary' : 'secondary'} className="w-full">
                <Building2 className="size-4" /> {plan.popular ? 'ترقية مدرسة' : 'اختيار الخطة'}
              </Button>
            </Link>
            <p className="mt-2 text-center text-[9px] text-slate-400">{counts[plan.id]} مدارس على هذه الخطة حاليًا</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-1 text-sm font-extrabold text-slate-900">كل المزايا مقارنة</h2>
          <p className="mb-4 text-[11px] text-slate-400">لمحة سريعة تساعدك على اختيار الخطة المناسبة</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] whitespace-nowrap text-xs">
              <thead>
                <tr className="table-head">
                  <th className="px-3 py-3 text-start">الميزة</th>
                  <th className="px-3 py-3">أساسي</th>
                  <th className="px-3 py-3">احترافي</th>
                  <th className="px-3 py-3">مؤسسي</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['الطلاب والمعلمون', true, true, true],
                  ['الفصول والمواد', true, true, true],
                  ['الحضور والغياب', true, true, true],
                  ['الريلز التعليمية', false, true, true],
                  ['امتحانات AI', false, true, true],
                  ['تحليلات ونقاط ضعف', false, true, true],
                  ['تطبيق ولي الأمر', false, true, true],
                  ['مدارس متعددة', false, false, true],
                  ['مدير حساب مخصص', false, false, true],
                  ['دعم SLA', false, false, true],
                ].map(([label, ...values]) => (
                  <tr key={label as string} className="border-b border-slate-50 last:border-0">
                    <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-600">{label as string}</td>
                    {values.map((value, i) => (
                      <td key={i} className="px-3 py-2.5 text-center">
                        {value ? <Check className="mx-auto size-4 text-emerald-500" /> : <X className="mx-auto size-4 text-slate-300" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">إجمالي الإيراد المتكرر</h2>
            <p className="text-3xl font-black text-slate-900">{formatNumber(db.schools.reduce((sum, s) => sum + s.monthlyPrice, 0))}</p>
            <p className="mt-1 text-[11px] text-slate-400">ج.م شهريًا من {db.schools.length} مدارس</p>
            <div className="mt-4 space-y-2.5">
              {plans.map((plan) => {
                const total = db.schools.filter((s) => s.plan === plan.id).reduce((sum, s) => sum + s.monthlyPrice, 0)
                const all = Math.max(1, db.schools.reduce((sum, s) => sum + s.monthlyPrice, 0))
                return (
                  <div key={plan.id}>
                    <div className="mb-1 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-500">{plan.name}</span>
                      <span className="font-bold text-slate-700">{formatNumber(total)} ج.م</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={cn('h-full rounded-full', plan.id === 'basic' ? 'bg-slate-400' : plan.id === 'pro' ? 'bg-brand-500' : 'bg-violet-500')} style={{ width: `${(total / all) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white"><Sparkles className="size-5" /></span>
            <h2 className="mt-3 text-sm font-extrabold text-slate-900">تحتاج خطة مخصصة؟</h2>
            <p className="mt-1.5 text-[11px] leading-6 text-slate-500">لأنظمة المدارس الكبيرة أو المجموعات التعليمية، يمكننا تصميم خطة تناسب احتياجك.</p>
            <Link to="/app/schools" className="mt-3 flex items-center gap-1 text-[11px] font-bold text-brand-600">تحدث مع فريق المنصة <ArrowLeft className="size-3.5" /></Link>
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800"><Zap className="size-4 text-amber-500" /> تجربة مجانية ٣٠ يومًا</p>
            <p className="mt-1.5 text-[10px] leading-5 text-slate-400">كل المدارس الجديدة تبدأ بفترة تجريبية كاملة المزايا — بدون بطاقة دفع.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
