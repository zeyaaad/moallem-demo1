export type Role = 'super_admin' | 'manager' | 'teacher' | 'student' | 'parent'

export type UserStatus = 'active' | 'suspended'

export interface BaseUser {
  id: string
  role: Role
  name: string
  email: string
  phone: string
  avatarColor: string
  schoolId: string
  status: UserStatus
  createdAt: string
}

export interface School {
  id: string
  name: string
  shortName: string
  city: string
  address: string
  phone: string
  email: string
  logoColor: string
  managerName: string
  managerId: string
  plan: 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'trial' | 'expired'
  studentsCount: number
  teachersCount: number
  classesCount: number
  subscriptionEnd: string
  createdAt: string
  monthlyPrice: number
}

export interface Teacher extends BaseUser {
  role: 'teacher'
  subjectIds: string[]
  classIds: string[]
  bio: string
  experienceYears: number
  rating: number
  studentsCount: number
  reelsCount: number
}

export interface Student extends BaseUser {
  role: 'student'
  classId: string
  gradeLevelId: string
  parentId: string
  code: string
  points: number
  level: number
  average: number
  attendanceRate: number
  rank: number
}

export interface Parent extends BaseUser {
  role: 'parent'
  job: string
  studentIds: string[]
}

export type User = Teacher | Student | Parent | (BaseUser & { role: 'manager' | 'super_admin' })

export interface GradeLevel {
  id: string
  name: string
  order: number
  schoolId: string
}

export interface SchoolClass {
  id: string
  name: string
  gradeLevelId: string
  schoolId: string
  supervisorId: string
  room: string
  studentsCount: number
}

export interface Subject {
  id: string
  name: string
  icon: string
  color: string
  gradeLevelId: string
  schoolId: string
  teacherId: string
}

export interface Reel {
  id: string
  teacherId: string
  subjectId: string
  title: string
  description: string
  duration: number
  views: number
  likes: number
  comments: number
  saves: number
  createdAt: string
  gradient: string
  emoji: string
  tags: string[]
  transcript: string[]
}

export type QuestionType = 'mcq' | 'truefalse'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Question {
  id: string
  text: string
  type: QuestionType
  options: string[]
  correctIndex: number
  marks: number
  difficulty: Difficulty
  skill: string
}

export type ExamStatus = 'draft' | 'published' | 'closed'

export interface Exam {
  id: string
  schoolId: string
  teacherId: string
  subjectId: string
  classId: string
  title: string
  description: string
  durationMin: number
  totalMarks: number
  questions: Question[]
  status: ExamStatus
  dueDate: string
  createdAt: string
  source: 'manual' | 'ai'
  attempts: number
  averageScore: number
  materials?: string[]
}

export interface ExamAttempt {
  id: string
  examId: string
  studentId: string
  score: number
  total: number
  answers: Record<string, number>
  submittedAt: string
  timeSpentMin: number
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface AttendanceRecord {
  id: string
  studentId: string
  classId: string
  date: string
  status: AttendanceStatus
}

export interface Subscription {
  id: string
  schoolId: string
  plan: 'basic' | 'pro' | 'enterprise'
  price: number
  startDate: string
  endDate: string
  status: 'active' | 'trial' | 'expired'
  seats: number
  autoRenew: boolean
}

export interface Notification {
  id: string
  title: string
  body: string
  time: string
  type: 'exam' | 'grade' | 'attendance' | 'system' | 'reel'
  read: boolean
  role: Role
}

export interface SkillScore {
  skill: string
  score: number
}

export interface Announcement {
  id: string
  schoolId: string
  authorName: string
  title: string
  body: string
  date: string
  audience: string
}

export interface AuditEntry {
  id: string
  actor: string
  action: string
  target: string
  time: string
  type: 'create' | 'update' | 'delete' | 'login'
}
