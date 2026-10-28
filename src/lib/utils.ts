export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n)
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('ar-EG', opts).format(d)
}

export function shortDate(iso: string) {
  return formatDate(iso, { day: 'numeric', month: 'short' })
}

export function weekday(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(d)
}

export function initials(name: string) {
  return name
    .replace(/^(أ\.|د\.|م\.)\s*/, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

export function relativeDay(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const diff = Math.round((new Date(d.toDateString()).getTime() - new Date(today.toDateString()).getTime()) / 86400000)
  if (diff === 0) return 'اليوم'
  if (diff === 1) return 'غدًا'
  if (diff === -1) return 'أمس'
  if (diff > 1) return `بعد ${diff} أيام`
  return `منذ ${Math.abs(diff)} أيام`
}

export function percent(part: number, total: number) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

export function gradeLabel(score: number) {
  if (score >= 90) return 'ممتاز'
  if (score >= 80) return 'جيد جدًا'
  if (score >= 70) return 'جيد'
  if (score >= 60) return 'مقبول'
  return 'يحتاج تحسين'
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export const AVATAR_GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-purple-500 to-fuchsia-600',
]
