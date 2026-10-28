import { useId } from 'react'
import { cn, formatNumber } from '../lib/utils'

type Point = { label: string; value: number }

/* ------------------------------------------------------------------ */
/* Line / area chart                                                   */
/* ------------------------------------------------------------------ */

function smoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const midX = (p0.x + p1.x) / 2
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`
  }
  return d
}

export function AreaChart({ data, color = '#4f46e5', height = 210, suffix = '%' }: {
  data: Point[]
  color?: string
  height?: number
  suffix?: string
}) {
  const id = useId().replace(/:/g, '')
  const W = 560
  const H = height
  const pad = { top: 18, right: 14, bottom: 30, left: 34 }
  const max = Math.max(...data.map((d) => d.value), 100)
  const min = 0
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom
  const x = (i: number) => pad.left + (i * innerW) / Math.max(1, data.length - 1)
  const y = (v: number) => pad.top + innerH - ((v - min) / (max - min)) * innerH
  const points = data.map((d, i) => ({ x: x(i), y: y(d.value) }))
  const line = smoothPath(points)
  const area = `${line} L ${x(data.length - 1)} ${pad.top + innerH} L ${pad.left} ${pad.top + innerH} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="مخطط الأداء">
      <defs>
        <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((tick) => (
        <g key={tick}>
          <line x1={pad.left} x2={W - pad.right} y1={y(tick)} y2={y(tick)} stroke="#eef2f7" strokeDasharray="4 6" />
          <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{tick}</text>
        </g>
      ))}
      <path d={area} fill={`url(#area-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="9" fill="transparent">
            <title>{`${data[i].label}: ${data[i].value}${suffix}`}</title>
          </circle>
          <circle cx={p.x} cy={p.y} r="3.6" fill="#fff" stroke={color} strokeWidth="2.4" />
          <text x={p.x} y={H - 9} textAnchor="middle" fontSize="9" fill="#94a3b8">{data[i].label}</text>
        </g>
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Bars                                                                */
/* ------------------------------------------------------------------ */

export function BarChart({ data, color = '#4f46e5', height = 210, suffix = '%' }: {
  data: Point[]
  color?: string
  height?: number
  suffix?: string
}) {
  const W = 560
  const H = height
  const pad = { top: 22, right: 10, bottom: 30, left: 30 }
  const innerH = H - pad.top - pad.bottom
  const innerW = W - pad.left - pad.right
  const max = Math.max(...data.map((d) => d.value), 100)
  const bw = (innerW / data.length) * 0.46

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="مخطط أعمدة">
      {[0, 25, 50, 75, 100].map((tick) => {
        const yy = pad.top + innerH - (tick / max) * innerH
        return <line key={tick} x1={pad.left} x2={W - pad.right} y1={yy} y2={yy} stroke="#eef2f7" strokeDasharray="4 6" />
      })}
      {data.map((d, i) => {
        const cx = pad.left + (i + 0.5) * (innerW / data.length)
        const h = Math.max(2, (d.value / max) * innerH)
        const yy = pad.top + innerH - h
        return (
          <g key={d.label}>
            <rect x={cx - bw / 2} y={yy} width={bw} height={h} rx="6" fill={color} opacity={0.18 + (i / data.length) * 0.55}>
              <title>{`${d.label}: ${d.value}${suffix}`}</title>
            </rect>
            <text x={cx} y={yy - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">{d.value}</text>
            <text x={cx} y={H - 10} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Doughnut                                                            */
/* ------------------------------------------------------------------ */

export function Doughnut({ segments, centerLabel, centerValue, size = 160 }: {
  segments: Array<{ label: string; value: number; color: string }>
  centerLabel?: string
  centerValue?: string
  size?: number
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = 54
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 140 140" className="shrink-0 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
        {segments.map((seg) => {
          const dash = (seg.value / total) * c
          const el = (
            <circle
              key={seg.label} cx="70" cy="70" r={r} fill="none" stroke={seg.color} strokeWidth="16"
              strokeDasharray={`${Math.max(0, dash - 3)} ${c}`} strokeDashoffset={-offset} strokeLinecap="round"
            >
              <title>{`${seg.label}: ${seg.value}`}</title>
            </circle>
          )
          offset += dash
          return el
        })}
        <text x="70" y="66" transform="rotate(90 70 70)" textAnchor="middle" fontSize="17" fontWeight="800" fill="#0f172a">{centerValue}</text>
        <text x="70" y="81" transform="rotate(90 70 70)" textAnchor="middle" fontSize="8" fill="#94a3b8">{centerLabel}</text>
      </svg>
      <div className="min-w-0 space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: seg.color }} />
            <span className="truncate font-semibold text-slate-600">{seg.label}</span>
            <span className="ms-auto font-bold text-slate-900">{formatNumber(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Radar                                                               */
/* ------------------------------------------------------------------ */

export function RadarChart({ data, size = 250, color = '#4f46e5', compare }: {
  data: Array<{ skill: string; score: number }>
  size?: number
  color?: string
  compare?: number[]
}) {
  const c = size / 2
  const r = size * 0.31
  const n = data.length
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const point = (i: number, value: number) => ({
    x: c + Math.cos(angle(i)) * r * (value / 100),
    y: c + Math.sin(angle(i)) * r * (value / 100),
  })
  const poly = (values: number[]) => values.map((v, i) => { const p = point(i, v); return `${p.x},${p.y}` }).join(' ')
  const labelPoint = (i: number) => {
    const rad = 1.18
    return { x: c + Math.cos(angle(i)) * r * rad, y: c + Math.sin(angle(i)) * r * rad }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[300px]" role="img" aria-label="مخطط المهارات">
      {[0.25, 0.5, 0.75, 1].map((level) => (
        <polygon
          key={level}
          points={Array.from({ length: n }, (_, i) => { const p = point(i, level * 100); return `${p.x},${p.y}` }).join(' ')}
          fill="none" stroke="#e2e8f0" strokeWidth="1"
        />
      ))}
      {data.map((_, i) => {
        const p = point(i, 100)
        return <line key={i} x1={c} y1={c} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />
      })}
      {compare && <polygon points={poly(compare)} fill="#94a3b8" fillOpacity="0.1" stroke="#94a3b8" strokeWidth="1.4" strokeDasharray="4 3" />}
      <polygon points={poly(data.map((d) => d.score))} fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2.2" />
      {data.map((d, i) => {
        const p = point(i, d.score)
        const lp = labelPoint(i)
        return (
          <g key={d.skill}>
            <circle cx={p.x} cy={p.y} r="3.4" fill="#fff" stroke={color} strokeWidth="2" />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill="#64748b">
              {d.skill}
            </text>
            <text x={lp.x} y={lp.y + 12} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fontWeight="800" fill={color}>
              {d.score}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Sparkline                                                           */
/* ------------------------------------------------------------------ */

export function Sparkline({ values, color = '#4f46e5', className }: { values: number[]; color?: string; className?: string }) {
  const W = 120
  const H = 36
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const points = values.map((v, i) => `${(i / (values.length - 1)) * W},${H - ((v - min) / range) * (H - 6) - 3}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('h-9 w-28', className)} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Attendance heatmap                                                  */
/* ------------------------------------------------------------------ */

const statusColor = {
  present: 'bg-emerald-500',
  late: 'bg-amber-400',
  absent: 'bg-rose-500',
  excused: 'bg-sky-400',
}

export function AttendanceHeatmap({ records, days = 42 }: {
  records: Array<{ date: string; status: 'present' | 'absent' | 'late' | 'excused' }>
  days?: number
}) {
  const map = new Map(records.map((r) => [r.date, r.status]))
  const cells: Array<{ date: string; status?: string }> = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    cells.push({ date: iso, status: map.get(iso) })
  }
  const weeks: typeof cells[] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <div>
      <div className="flex flex-row-reverse items-start gap-1.5 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            {week.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date} — ${cell.status === 'present' ? 'حاضر' : cell.status === 'absent' ? 'غائب' : cell.status === 'late' ? 'متأخر' : cell.status === 'excused' ? 'بعذر' : 'لا يوجد سجل'}`}
                className={cn('size-4 rounded-[5px] sm:size-5', cell.status ? statusColor[cell.status as keyof typeof statusColor] : 'bg-slate-100')}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500">
        <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-emerald-500" /> حاضر</span>
        <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-amber-400" /> متأخر</span>
        <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-rose-500" /> غائب</span>
        <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-sky-400" /> بعذر</span>
      </div>
    </div>
  )
}
