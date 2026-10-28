import { useMemo, useState } from 'react'
import {
  CalendarDays, CheckCircle2, Clock, Download, Filter, History, LogIn, Pencil, Plus, Search, Trash2,
  type LucideIcon,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { AuditEntry } from '../../types'
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, SearchInput, StatCard, useToast } from '../../components/ui'
import { cn } from '../../lib/utils'

type Kind = AuditEntry['type'] | 'all'

const meta: Record<AuditEntry['type'], { label: string; icon: LucideIcon; tone: string; chip: string }> = {
  create: { label: 'إضافة', icon: Plus, tone: 'bg-emerald-50 text-emerald-600', chip: 'emerald' },
  update: { label: 'تعديل', icon: Pencil, tone: 'bg-sky-50 text-sky-600', chip: 'sky' },
  delete: { label: 'حذف', icon: Trash2, tone: 'bg-rose-50 text-rose-600', chip: 'rose' },
  login: { label: 'دخول', icon: LogIn, tone: 'bg-violet-50 text-violet-600', chip: 'violet' },
}

const filters: Array<{ value: Kind; label: string }> = [
  { value: 'all', label: 'كل النشاط' },
  { value: 'create', label: 'إضافات' },
  { value: 'update', label: 'تعديلات' },
  { value: 'delete', label: 'حذف' },
  { value: 'login', label: 'دخول' },
]

export default function AuditPage() {
  const { db } = useStore()
  const { push } = useToast()
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<Kind>('all')

  const entries = useMemo(
    () => db.auditLog
      .filter((entry) => kind === 'all' || entry.type === kind)
      .filter((entry) => !q || entry.actor.includes(q) || entry.action.includes(q) || entry.target.includes(q)),
    [db.auditLog, kind, q],
  )

  const counts = useMemo(() => ({
    create: db.auditLog.filter((e) => e.type === 'create').length,
    update: db.auditLog.filter((e) => e.type === 'update').length,
    delete: db.auditLog.filter((e) => e.type === 'delete').length,
    login: db.auditLog.filter((e) => e.type === 'login').length,
  }), [db.auditLog])

  const actors = Array.from(new Set(db.auditLog.map((e) => e.actor)))

  return (
    <div>
      <PageHeader
        title="سجل النشاط"
        subtitle="كل إجراء مهم داخل المنصة مسجّل هنا — للمراجعة والمساءلة والشفافية."
        actions={
          <Button
            variant="secondary"
            onClick={() => push({ title: 'تم تصدير السجل', body: 'ملف CSV تجريبي يحتوي كل الأحداث.', tone: 'success' })}
          >
            <Download className="size-4" /> تصدير السجل
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="إجمالي الأحداث" value={db.auditLog.length} icon={History} tone="brand" hint="منذ إنشاء المنصة" />
        <StatCard label="إضافات" value={counts.create} icon={Plus} tone="emerald" hint="حسابات، امتحانات، ريلز" />
        <StatCard label="تعديلات" value={counts.update} icon={Pencil} tone="sky" hint="بيانات واشتراكات" />
        <StatCard label="دخول المنصة" value={counts.login} icon={LogIn} tone="violet" hint="جلسات مسجلة" />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <SearchInput value={q} onChange={setQ} placeholder="ابحث بالفاعل أو الإجراء أو الهدف…" className="w-full sm:w-80" />
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 sm:ms-auto scrollbar-hide">
          {filters.map((filter) => (
            <button key={filter.value} onClick={() => setKind(filter.value)} className={cn('chip shrink-0', kind === filter.value && 'chip-active')}>
              <Filter className="size-3" /> {filter.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-extrabold text-slate-900">الأحداث الأخيرة</h2>
            <Badge tone="slate">{entries.length} حدث</Badge>
          </div>
          {entries.length === 0 ? (
            <EmptyState icon={Search} title="لا توجد أحداث مطابقة" description="جرّب بحثًا آخر أو غيّر نوع النشاط." />
          ) : (
            <ol className="relative px-5 py-4">
              <span className="absolute inset-y-4 start-[2.05rem] w-px bg-slate-100" aria-hidden />
              {entries.map((entry) => {
                const info = meta[entry.type]
                const Icon = info.icon
                return (
                  <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-1">
                    <span className={cn('relative z-10 flex size-8 shrink-0 items-center justify-center rounded-xl ring-4 ring-white', info.tone)}>
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1 rounded-xl border border-slate-100 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold text-slate-800">{entry.action}</p>
                        <Badge tone={info.chip as 'emerald' | 'sky' | 'rose' | 'violet'}>{info.label}</Badge>
                      </div>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">{entry.target || '—'}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[9px] font-semibold text-slate-400">
                        <span className="flex items-center gap-1"><Avatar name={entry.actor} color="#4f46e5" size="xs" className="size-4 text-[7px] ring-0" /> {entry.actor}</span>
                        <span className="flex items-center gap-1"><Clock className="size-3" /> {entry.time}</span>
                        <span className="flex items-center gap-1"><CalendarDays className="size-3" /> اليوم</span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">توزيع النشاط</h2>
            <div className="space-y-3">
              {(Object.keys(meta) as Array<AuditEntry['type']>).map((key) => {
                const info = meta[key]
                const Icon = info.icon
                const value = counts[key]
                const pct = Math.round((value / Math.max(1, db.auditLog.length)) * 100)
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center gap-1.5 text-[10px]">
                      <Icon className="size-3 text-slate-400" />
                      <span className="font-semibold text-slate-500">{info.label}</span>
                      <span className="ms-auto font-extrabold text-slate-700">{value} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={cn('h-full rounded-full', key === 'create' ? 'bg-emerald-500' : key === 'update' ? 'bg-sky-500' : key === 'delete' ? 'bg-rose-500' : 'bg-violet-500')} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">أكثر المستخدمين نشاطًا</h2>
            <div className="space-y-2">
              {actors.map((actor) => {
                const total = db.auditLog.filter((e) => e.actor === actor).length
                return (
                  <div key={actor} className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5">
                    <Avatar name={actor} color="#4f46e5" size="xs" />
                    <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-700">{actor}</span>
                    <Badge tone="slate">{total}</Badge>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="border-emerald-100 bg-emerald-50/50 p-5">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900"><CheckCircle2 className="size-4" /> السجل محمي</p>
            <p className="mt-1.5 text-[10px] leading-5 text-emerald-800">
              لا يمكن تعديل أو حذف الأحداث من السجل. تُحفظ كل العمليات تلقائيًا لأغراض المراجعة.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
