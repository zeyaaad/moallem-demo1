import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Bookmark, BookmarkCheck, CheckCircle2, Clapperboard, Eye, Heart, MessageCircle, Pause, Play, Plus,
  Send, Share2, Sparkles, Upload, Volume2, VolumeX,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Reel } from '../../types'
import { Avatar, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, StatCard, useToast } from '../../components/ui'
import { cn, formatNumber } from '../../lib/utils'

const gradients = [
  'from-indigo-600 via-violet-600 to-fuchsia-500',
  'from-sky-500 via-blue-600 to-indigo-700',
  'from-emerald-500 via-teal-600 to-cyan-600',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-rose-500 via-pink-600 to-purple-600',
  'from-violet-600 via-purple-600 to-indigo-700',
]

const emojis = ['∫', '🪐', '⚗️', '✍️', '⌨️', '🧬', '📈', '🇬🇧', '🏛️', '💡']

export default function ReelsPage() {
  const { currentUser, db, getTeacher, getSubject, addReel, notify } = useStore()
  const { push } = useToast()
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState<Reel | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const isTeacher = currentUser?.role === 'teacher'
  const reels = useMemo(() => {
    const base = isTeacher ? db.reels.filter((r) => r.teacherId === currentUser?.id) : db.reels
    return filter === 'all' ? base : base.filter((r) => r.subjectId === filter)
  }, [db.reels, filter, isTeacher, currentUser?.id])

  useEffect(() => {
    const openId = params.get('open')
    if (openId) {
      const reel = db.reels.find((r) => r.id === openId)
      if (reel) setActive(reel)
      params.delete('open')
      setParams(params, { replace: true })
    }
  }, [params, db.reels, setParams])

  const myReels = db.reels.filter((r) => r.teacherId === currentUser?.id)
  const totalViews = myReels.reduce((s, r) => s + r.views, 0)
  const totalLikes = myReels.reduce((s, r) => s + r.likes, 0)

  return (
    <div>
      <PageHeader
        title={isTeacher ? 'الريلز التعليمية' : 'ريلز تعليمية'}
        subtitle={isTeacher ? 'ارفع شرحًا قصيرًا، وتابع مشاهدات وتفاعل طلابك.' : 'تعلّم في دقائق من أفضل معلميك — فيديوهات قصيرة، مركزة، وممتعة.'}
        actions={isTeacher ? <Button onClick={() => setUploadOpen(true)}><Plus className="size-4" /> ريل جديد</Button> : <Badge tone="violet"><Sparkles className="size-3" /> محتوى مقترح لك</Badge>}
      />

      {isTeacher && (
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="إجمالي الريلز" value={myReels.length} icon={Clapperboard} tone="brand" />
          <StatCard label="المشاهدات" value={formatNumber(totalViews)} icon={Eye} tone="sky" delta="+١٢٪" hint="هذا الأسبوع" />
          <StatCard label="الإعجابات" value={formatNumber(totalLikes)} icon={Heart} tone="rose" delta="+٨٪" />
          <StatCard label="متوسط المشاهدة" value="٧٨٪" icon={CheckCircle2} tone="emerald" hint="من مدة الفيديو" />
        </div>
      )}

      {/* subject filter */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => setFilter('all')} className={cn('chip shrink-0', filter === 'all' && 'chip-active')}>كل المواد</button>
        {db.subjects
          .filter((s) => !isTeacher || currentUser?.role === 'teacher' && db.teachers.find((t) => t.id === currentUser.id)?.subjectIds.includes(s.id))
          .map((s) => (
            <button key={s.id} onClick={() => setFilter(s.id)} className={cn('chip shrink-0', filter === s.id && 'chip-active')}>
              <span className="size-2 rounded-full" style={{ background: s.color }} /> {s.name}
            </button>
          ))}
      </div>

      {reels.length === 0 ? (
        <Card><EmptyState icon={Clapperboard} title="لا توجد ريلز بعد" description="ابدأ برفع أول فيديو تعليمي لطلابك." action={isTeacher ? <Button onClick={() => setUploadOpen(true)}><Plus className="size-4" /> ارفع ريل</Button> : undefined} /></Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {reels.map((reel) => {
            const teacher = getTeacher(reel.teacherId)
            const subject = getSubject(reel.subjectId)
            return (
              <button
                key={reel.id}
                onClick={() => setActive(reel)}
                className="group relative aspect-[9/13] overflow-hidden rounded-2xl bg-gradient-to-br p-3 text-start text-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl sm:p-4"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br', reel.gradient)} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.2),transparent_55%)]" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold backdrop-blur">{subject?.name}</span>
                    <span className="rounded-md bg-black/30 px-1.5 py-0.5 text-[9px] font-bold backdrop-blur">
                      {Math.floor(reel.duration / 60)}:{String(reel.duration % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="mt-3 text-4xl font-black opacity-25">{reel.emoji}</span>
                  <div className="mt-auto">
                    <p className="line-clamp-2 text-xs font-extrabold leading-5 sm:text-sm sm:leading-6">{reel.title}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Avatar name={teacher?.name ?? ''} color={teacher?.avatarColor} size="xs" className="size-5 text-[8px] ring-0" />
                      <span className="truncate text-[9px] font-semibold text-white/80">{teacher?.name}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[9px] text-white/70">
                      <span className="flex items-center gap-1"><Eye className="size-3" /> {formatNumber(reel.views)}</span>
                      <span className="flex items-center gap-1"><Heart className="size-3" /> {formatNumber(reel.likes)}</span>
                    </div>
                  </div>
                  <span className="absolute start-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 opacity-0 backdrop-blur transition group-hover:opacity-100">
                    <Play className="size-5 fill-white" />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {active && (
        <ReelPlayer
          reel={active}
          onClose={() => setActive(null)}
          liked={!!liked[active.id]}
          saved={!!saved[active.id]}
          onLike={() => setLiked((p) => ({ ...p, [active.id]: !p[active.id] }))}
          onSave={() => { setSaved((p) => ({ ...p, [active.id]: !p[active.id] })); push({ title: saved[active.id] ? 'تمت إزالة الريل من المحفوظات' : 'تم حفظ الريل', tone: 'success' }) }}
        />
      )}

      <UploadReel
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={(data) => {
          addReel(data)
          notify('تم نشر ريل جديد', data.title)
          push({ title: 'تم نشر الريل بنجاح 🎉', body: 'سيظهر الآن لطلاب فصلك.', tone: 'success' })
          setUploadOpen(false)
        }}
      />
    </div>
  )
}

function ReelPlayer({ reel, onClose, liked, saved, onLike, onSave }: {
  reel: Reel
  onClose: () => void
  liked: boolean
  saved: boolean
  onLike: () => void
  onSave: () => void
}) {
  const { getTeacher, getSubject } = useStore()
  const teacher = getTeacher(reel.teacherId)
  const subject = getSubject(reel.subjectId)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(8)
  const [line, setLine] = useState(0)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 0
        return p + 100 / reel.duration
      })
    }, 1000)
    return () => clearInterval(t)
  }, [playing, reel.duration])

  useEffect(() => {
    if (reel.transcript.length === 0) return
    setLine(Math.min(reel.transcript.length - 1, Math.floor((progress / 100) * reel.transcript.length)))
  }, [progress, reel.transcript.length])

  return (
    <Modal open onClose={onClose} title="مشاهدة الريل" size="xl">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,260px)_1fr]">
        <div className={cn('relative mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-2xl bg-gradient-to-br text-white', reel.gradient)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="relative flex h-full flex-col p-4">
            <div className="flex items-center gap-2">
              <Avatar name={teacher?.name ?? ''} color="#ffffff33" size="xs" />
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold">{teacher?.name}</p>
                <p className="text-[8px] text-white/60">{subject?.name}</p>
              </div>
              <span className="ms-auto rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-bold">{reel.duration} ث</span>
            </div>

            <div className="my-auto text-center">
              <span className="text-7xl font-black opacity-20">{reel.emoji}</span>
              <div className="mt-2 flex items-center justify-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={cn('w-1 rounded-full bg-white/60 transition-all', playing ? 'animate-pulse' : '')}
                    style={{ height: `${[10, 22, 14, 26, 12][i]}px`, animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
              <p className="mx-auto mt-5 min-h-10 max-w-[200px] rounded-xl bg-black/35 p-2.5 text-[10px] leading-5 backdrop-blur">
                {reel.transcript[line] ?? reel.description}
              </p>
            </div>

            <div className="mt-auto">
              <div className="h-1 overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-white transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[8px] text-white/60">
                <span>{Math.floor((progress / 100) * reel.duration)} ث</span>
                <span>{reel.duration} ث</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPlaying((p) => !p)} className="flex size-8 items-center justify-center rounded-full bg-white/20 backdrop-blur transition hover:bg-white/30">
                    {playing ? <Pause className="size-3.5 fill-white" /> : <Play className="size-3.5 fill-white" />}
                  </button>
                  <button onClick={() => setMuted((m) => !m)} className="flex size-8 items-center justify-center rounded-full bg-white/20 backdrop-blur transition hover:bg-white/30">
                    {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                  </button>
                  <button onClick={onLike} className="flex size-8 items-center justify-center rounded-full bg-white/20 backdrop-blur transition hover:bg-white/30">
                    <Heart className={cn('size-3.5', liked && 'fill-rose-400 text-rose-400')} />
                  </button>
                </div>
                <button onClick={onSave} className="flex size-8 items-center justify-center rounded-full bg-white/20 backdrop-blur transition hover:bg-white/30">
                  {saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Badge tone="brand">{subject?.name}</Badge>
            {reel.tags.slice(0, 2).map((t) => <Badge key={t} tone="slate">#{t}</Badge>)}
          </div>
          <h3 className="mt-3 text-lg font-extrabold leading-7 text-slate-900">{reel.title}</h3>
          <p className="mt-2 text-xs leading-6 text-slate-500">{reel.description}</p>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Eye className="size-3.5" /> {formatNumber(reel.views)} مشاهدة</span>
            <span className="flex items-center gap-1"><Heart className="size-3.5" /> {formatNumber(reel.likes + (liked ? 1 : 0))}</span>
            <span className="flex items-center gap-1"><MessageCircle className="size-3.5" /> {reel.comments}</span>
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-700"><BookOpenIcon /> ملخص الشرح</p>
            <ul className="space-y-1.5">
              {reel.transcript.map((t, i) => (
                <li key={i} className={cn('flex items-start gap-2 text-[10px] leading-5', i === line ? 'font-bold text-slate-800' : 'text-slate-500')}>
                  <span className={cn('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold', i === line ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500')}>{i + 1}</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            <Button variant="secondary" size="sm" onClick={onSave}>{saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />} {saved ? 'محفوظ' : 'حفظ'}</Button>
            <Button variant="secondary" size="sm"><Share2 className="size-3.5" /> مشاركة</Button>
            <Button variant="soft" size="sm"><Send className="size-3.5" /> أرسل لصديق</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function BookOpenIcon() {
  return <span className="size-3.5 rounded bg-brand-100" />
}

function UploadReel({ open, onClose, onSubmit }: {
  open: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; subjectId: string; emoji: string; gradient: string; duration: number }) => void
}) {
  const { db } = useStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState(db.subjects[0]?.id ?? 'sub_math')
  const [emoji, setEmoji] = useState('💡')
  const [gradient, setGradient] = useState(gradients[0])
  const [duration, setDuration] = useState(45)
  const [uploaded, setUploaded] = useState(false)
  const { push } = useToast()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { push({ title: 'اكتب عنوانًا للريل', tone: 'error' }); return }
    onSubmit({ title, description, subjectId, emoji, gradient, duration })
    setTitle(''); setDescription(''); setUploaded(false)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="رفع ريل تعليمي"
      description="فيديو قصير لا يزيد عن ٩٠ ثانية — أفقده لطلابك فورًا."
      footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={submit}><Upload className="size-4" /> نشر الريل</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div
          className={cn('relative flex aspect-video w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition', uploaded ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/60 hover:border-brand-300 hover:bg-brand-50/30')}
          onClick={() => setUploaded(true)}
        >
          {uploaded ? (
            <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)}>
              <div className="flex h-full flex-col items-center justify-center text-white">
                <span className="text-4xl">{emoji}</span>
                <p className="mt-2 text-xs font-bold">تم اختيار الفيديو — جاهز للنشر</p>
                <p className="text-[10px] text-white/70">video_reel.mp4 • ٢٤ ميجابايت</p>
              </div>
            </div>
          ) : (
            <>
              <span className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm"><Upload className="size-5" /></span>
              <p className="text-xs font-bold text-slate-700">اسحب الفيديو هنا أو اضغط للاختيار</p>
              <p className="mt-1 text-[10px] text-slate-400">MP4 أو MOV — حتى ١٠٠ ميجابايت</p>
            </>
          )}
        </div>

        <Field label="عنوان الريل">
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: خدعة النهايات في ٣٠ ثانية" />
        </Field>
        <Field label="وصف قصير">
          <textarea className="textarea min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ماذا سيتعلم الطالب من هذا الفيديو؟" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المادة">
            <select className="select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              {db.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="المدة (ثانية)">
            <input type="number" min={10} max={90} className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </Field>
        </div>
        <Field label="أيقونة الغلاف">
          <div className="flex flex-wrap gap-1.5">
            {emojis.map((e) => (
              <button type="button" key={e} onClick={() => setEmoji(e)} className={cn('flex size-9 items-center justify-center rounded-lg border text-lg transition', emoji === e ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50')}>{e}</button>
            ))}
          </div>
        </Field>
        <Field label="لون الغلاف">
          <div className="flex flex-wrap gap-2">
            {gradients.map((g) => (
              <button type="button" key={g} onClick={() => setGradient(g)} className={cn('size-9 rounded-xl bg-gradient-to-br ring-2 ring-offset-2 transition', g, gradient === g ? 'ring-brand-500' : 'ring-transparent')} />
            ))}
          </div>
        </Field>
      </form>
    </Modal>
  )
}
