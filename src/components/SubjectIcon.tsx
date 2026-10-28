import { Atom, BookOpen, Calculator, Cpu, Dna, FlaskConical, Landmark, Languages, type LucideIcon } from 'lucide-react'
import type { Subject } from '../types'
import { cn } from '../lib/utils'

const icons: Record<string, LucideIcon> = {
  Calculator, Atom, FlaskConical, Dna, BookOpen, Languages, Landmark, Cpu,
}

export default function SubjectIcon({ subject, className }: { subject?: Subject; className?: string }) {
  const Icon = icons[subject?.icon ?? 'BookOpen'] ?? BookOpen
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-xl', className)}
      style={{ backgroundColor: `${subject?.color ?? '#4f46e5'}14`, color: subject?.color ?? '#4f46e5' }}
    >
      <Icon className="size-[55%]" />
    </span>
  )
}
