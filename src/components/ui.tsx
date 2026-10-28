import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ComponentType, type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, CheckCircle2, Info, Search, X } from 'lucide-react'
import { cn, initials } from '../lib/utils'

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft' | 'dark'
type Size = 'sm' | 'md' | 'lg'

export function buttonStyles(variant: Variant = 'primary', size: Size = 'md', className = '') {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50'
  const sizes: Record<Size, string> = {
    sm: 'h-9 px-3.5 text-xs',
    md: 'h-10.5 px-4 text-sm',
    lg: 'h-12 px-6 text-[15px]',
  }
  const variants: Record<Variant, string> = {
    primary: 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-700/25',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700',
    soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
    dark: 'bg-slate-900 text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800',
  }
  return cn(base, sizes[size], variants[variant], className)
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={buttonStyles(variant, size, className)} {...props} />
}

export function IconButton({ label, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900',
        className,
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  )
}

type Tone = 'brand' | 'emerald' | 'amber' | 'rose' | 'slate' | 'sky' | 'violet'

const toneMap: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
}

export function Badge({ children, tone = 'slate', className, dot }: { children: ReactNode; tone?: Tone; className?: string; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold', toneMap[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  )
}

export function Avatar({ name, color = '#4f46e5', size = 'md', className }: { name: string; color?: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = { xs: 'size-7 text-[10px]', sm: 'size-9 text-xs', md: 'size-11 text-sm', lg: 'size-14 text-base', xl: 'size-20 text-xl' }
  return (
    <span
      className={cn('inline-flex shrink-0 select-none items-center justify-center rounded-full font-extrabold text-white ring-2 ring-white/70', sizes[size], className)}
      style={{ backgroundImage: `linear-gradient(135deg, ${color}, ${color}bb)` }}
    >
      {initials(name)}
    </span>
  )
}

export function ProgressBar({ value, tone = 'brand', size = 'md', className }: { value: number; tone?: Tone; size?: 'sm' | 'md'; className?: string }) {
  const colors: Record<Tone, string> = {
    brand: 'bg-brand-600', emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500',
    slate: 'bg-slate-400', sky: 'bg-sky-500', violet: 'bg-violet-500',
  }
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-slate-100', size === 'sm' ? 'h-1.5' : 'h-2.5', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colors[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function StatCard({
  label, value, icon: Icon, delta, tone = 'brand', hint,
}: {
  label: string
  value: string | number
  icon: ComponentType<{ className?: string }>
  delta?: string
  tone?: Tone
  hint?: string
}) {
  const iconTones: Record<Tone, string> = {
    brand: 'bg-brand-50 text-brand-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600', slate: 'bg-slate-100 text-slate-600', sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
  }
  return (
    <Card className="card-hover p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
          {(delta || hint) && (
            <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
              {delta && <span className="text-emerald-600">{delta}</span>} {hint}
            </p>
          )}
        </div>
        <span className={cn('inline-flex size-10 items-center justify-center rounded-xl', iconTones[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  open, onClose, title, description, children, footer, size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn('relative z-10 max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-pop sm:rounded-3xl', widths[size])}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
            {description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>}
          </div>
          <IconButton label="إغلاق" onClick={onClose}><X className="size-4.5" /></IconButton>
        </div>
        <div className="max-h-[calc(92vh-9rem)] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'بحث…', className }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input h-10.5 ps-10" />
    </div>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: {
  tabs: { value: T; label: string; count?: number }[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={cn('scrollbar-hide flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition',
            value === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
          )}
        >
          {tab.label}
          {typeof tab.count === 'number' && (
            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px]', value === tab.value ? 'bg-brand-50 text-brand-700' : 'bg-slate-200 text-slate-500')}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions, eyebrow }: {
  title: string
  subtitle?: string
  actions?: ReactNode
  eyebrow?: string
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="size-7" />
      </div>
      <h3 className="text-base font-extrabold text-slate-800">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-sm font-semibold text-slate-600"
      aria-pressed={checked}
    >
      <span className={cn('relative h-6 w-11 rounded-full transition', checked ? 'bg-brand-600' : 'bg-slate-300')}>
        <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', checked ? 'start-[22px]' : 'start-0.5')} />
      </span>
      {label}
    </button>
  )
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

type Toast = { id: number; title: string; body?: string; tone: 'success' | 'error' | 'info' }
const ToastContext = createContext<{ push: (t: Omit<Toast, 'id'>) => void } | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { ...t, id }])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000)
  }, [])

  const ctx = useMemo(() => ({ push }), [push])
  const icons = { success: CheckCircle2, error: AlertCircle, info: Info }
  const tones = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-rose-200 bg-rose-50 text-rose-900',
    info: 'border-sky-200 bg-sky-50 text-sky-900',
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2">
        {toasts.map((t) => {
          const Icon = icons[t.tone]
          return (
            <div key={t.id} className={cn('pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-xl animate-fade-up', tones[t.tone])}>
              <Icon className="mt-0.5 size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{t.title}</p>
                {t.body && <p className="mt-0.5 text-xs opacity-80">{t.body}</p>}
              </div>
              <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="opacity-50 hover:opacity-100">
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
