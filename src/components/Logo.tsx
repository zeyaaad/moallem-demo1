import { cn } from '../lib/utils'

export function LogoMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-teal-500 text-white shadow-lg shadow-brand-600/25', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 48 48" fill="none" className="size-[62%]">
        <path d="M8 18.5 24 10l16 8.5L24 27 8 18.5Z" fill="currentColor" />
        <path d="M14 23.4v7.4c0 3.3 4.5 6.2 10 6.2s10-2.9 10-6.2v-7.4l-10 5.3-10-5.3Z" fill="currentColor" opacity=".78" />
        <path d="M38 19.2v9.4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="38" cy="30.5" r="2.1" fill="currentColor" />
      </svg>
    </span>
  )
}

export function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={compact ? 36 : 42} />
      {!compact && (
        <div className="leading-tight">
          <p className={cn('text-xl font-black tracking-tight', dark ? 'text-white' : 'text-slate-900')}>
            مُعلّم<span className="text-brand-500">.</span>
          </p>
          <p className={cn('text-[10px] font-semibold tracking-wide', dark ? 'text-slate-400' : 'text-slate-400')}>
            منصة التعليم الذكية
          </p>
        </div>
      )}
    </div>
  )
}
