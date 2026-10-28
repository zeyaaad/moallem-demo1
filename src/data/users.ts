import type { GradeLevel, Parent, School, SchoolClass, Student, Subject, Teacher, User } from '../types'

const palette = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316']

export const schools: School[] = [
  {
    id: 'sch_1',
    name: 'مدرسة النور الدولية',
    shortName: 'النور',
    city: 'القاهرة',
    address: '١٢ شارع التحرير، المعادي، القاهرة',
    phone: '0100 234 5678',
    email: 'info@alnoor.edu.eg',
    logoColor: '#4f46e5',
    managerName: 'خالد المنصور',
    managerId: 'mgr_1',
    plan: 'pro',
    status: 'active',
    studentsCount: 486,
    teachersCount: 32,
    classesCount: 18,
    subscriptionEnd: '2027-06-30',
    createdAt: '2024-09-01',
    monthlyPrice: 9500,
  },
  {
    id: 'sch_2',
    name: 'مدارس الأندلس',
    shortName: 'الأندلس',
    city: 'الإسكندرية',
    address: '٤٥ طريق الحرية، سموحة',
    phone: '0101 777 8899',
    email: 'hello@andalus.edu.eg',
    logoColor: '#0ea5a4',
    managerName: 'منى إبراهيم',
    managerId: 'mgr_2',
    plan: 'enterprise',
    status: 'active',
    studentsCount: 920,
    teachersCount: 64,
    classesCount: 30,
    subscriptionEnd: '2027-02-15',
    createdAt: '2024-02-20',
    monthlyPrice: 18000,
  },
  {
    id: 'sch_3',
    name: 'مدرسة المستقبل الحديثة',
    shortName: 'المستقبل',
    city: 'الجيزة',
    address: '٧ شارع الجامعة، الدقي',
    phone: '0112 445 6677',
    email: 'contact@future.edu.eg',
    logoColor: '#f59e0b',
    managerName: 'شريف علام',
    managerId: 'mgr_3',
    plan: 'basic',
    status: 'trial',
    studentsCount: 230,
    teachersCount: 18,
    classesCount: 9,
    subscriptionEnd: '2026-11-20',
    createdAt: '2026-09-10',
    monthlyPrice: 4500,
  },
  {
    id: 'sch_4',
    name: 'مدارس رواد المعرفة',
    shortName: 'رواد',
    city: 'المنصورة',
    address: '٢٠ شارع الجيش، المنصورة',
    phone: '0128 900 1122',
    email: 'info@rowad.edu.eg',
    logoColor: '#ec4899',
    managerName: 'هالة كمال',
    managerId: 'mgr_4',
    plan: 'pro',
    status: 'active',
    studentsCount: 610,
    teachersCount: 41,
    classesCount: 22,
    subscriptionEnd: '2027-01-10',
    createdAt: '2025-01-10',
    monthlyPrice: 11000,
  },
  {
    id: 'sch_5',
    name: 'أكاديمية الأمل',
    shortName: 'الأمل',
    city: 'طنطا',
    address: '٣ شارع البحر، طنطا',
    phone: '0114 556 7788',
    email: 'hi@amal.edu.eg',
    logoColor: '#64748b',
    managerName: 'وليد فتحي',
    managerId: 'mgr_5',
    plan: 'basic',
    status: 'expired',
    studentsCount: 175,
    teachersCount: 14,
    classesCount: 7,
    subscriptionEnd: '2026-08-30',
    createdAt: '2024-08-30',
    monthlyPrice: 3500,
  },
]

export const gradeLevels: GradeLevel[] = [
  { id: 'g1', name: 'الصف الأول الثانوي', order: 1, schoolId: 'sch_1' },
  { id: 'g2', name: 'الصف الثاني الثانوي', order: 2, schoolId: 'sch_1' },
  { id: 'g3', name: 'الصف الثالث الثانوي', order: 3, schoolId: 'sch_1' },
]

export const classes: SchoolClass[] = [
  { id: 'c1', name: '١ / أ', gradeLevelId: 'g1', schoolId: 'sch_1', supervisorId: 'tch_5', room: 'A-101', studentsCount: 24 },
  { id: 'c2', name: '١ / ب', gradeLevelId: 'g1', schoolId: 'sch_1', supervisorId: 'tch_6', room: 'A-102', studentsCount: 22 },
  { id: 'c3', name: '٢ / أ', gradeLevelId: 'g2', schoolId: 'sch_1', supervisorId: 'tch_1', room: 'B-201', studentsCount: 26 },
  { id: 'c4', name: '٢ / ب', gradeLevelId: 'g2', schoolId: 'sch_1', supervisorId: 'tch_2', room: 'B-202', studentsCount: 23 },
  { id: 'c5', name: '٣ / أ', gradeLevelId: 'g3', schoolId: 'sch_1', supervisorId: 'tch_3', room: 'C-301', studentsCount: 21 },
  { id: 'c6', name: '٣ / ب', gradeLevelId: 'g3', schoolId: 'sch_1', supervisorId: 'tch_4', room: 'C-302', studentsCount: 20 },
]

export const subjects: Subject[] = [
  { id: 'sub_math', name: 'الرياضيات', icon: 'Calculator', color: '#4f46e5', gradeLevelId: 'g2', schoolId: 'sch_1', teacherId: 'tch_1' },
  { id: 'sub_physics', name: 'الفيزياء', icon: 'Atom', color: '#0ea5e9', gradeLevelId: 'g2', schoolId: 'sch_1', teacherId: 'tch_2' },
  { id: 'sub_chem', name: 'الكيمياء', icon: 'FlaskConical', color: '#10b981', gradeLevelId: 'g2', schoolId: 'sch_1', teacherId: 'tch_3' },
  { id: 'sub_bio', name: 'الأحياء', icon: 'Dna', color: '#14b8a6', gradeLevelId: 'g2', schoolId: 'sch_1', teacherId: 'tch_4' },
  { id: 'sub_ar', name: 'اللغة العربية', icon: 'BookOpen', color: '#f59e0b', gradeLevelId: 'g2', schoolId: 'sch_1', teacherId: 'tch_5' },
  { id: 'sub_en', name: 'اللغة الإنجليزية', icon: 'Languages', color: '#ec4899', gradeLevelId: 'g2', schoolId: 'sch_1', teacherId: 'tch_6' },
  { id: 'sub_hist', name: 'التاريخ', icon: 'Landmark', color: '#f97316', gradeLevelId: 'g2', schoolId: 'sch_1', teacherId: 'tch_7' },
  { id: 'sub_cs', name: 'علوم الحاسب', icon: 'Cpu', color: '#8b5cf6', gradeLevelId: 'g2', schoolId: 'sch_1', teacherId: 'tch_8' },
]

export const teachers: Teacher[] = [
  {
    id: 'tch_1', role: 'teacher', name: 'أ. محمد العزب', email: 'mohamed@alnoor.edu.eg', phone: '0100 111 2233',
    avatarColor: palette[0], schoolId: 'sch_1', status: 'active', createdAt: '2024-09-01',
    subjectIds: ['sub_math'], classIds: ['c3', 'c4', 'c5'], bio: 'مدرس رياضيات بخبرة ١٢ عامًا، متخصص في التفاضل والتكامل والهندسة التحليلية. أحب تبسيط الرياضيات بالقصص والرسومات.',
    experienceYears: 12, rating: 4.9, studentsCount: 86, reelsCount: 6,
  },
  {
    id: 'tch_2', role: 'teacher', name: 'أ. سارة النجار', email: 'sara@alnoor.edu.eg', phone: '0100 222 3344',
    avatarColor: palette[2], schoolId: 'sch_1', status: 'active', createdAt: '2024-09-01',
    subjectIds: ['sub_physics'], classIds: ['c3', 'c4'], bio: 'مدرسة فيزياء، مهتمة بالتجارب العملية وتبسيط مفاهيم الحركة والطاقة.',
    experienceYears: 8, rating: 4.8, studentsCount: 52, reelsCount: 4,
  },
  {
    id: 'tch_3', role: 'teacher', name: 'أ. كريم فؤاد', email: 'karim@alnoor.edu.eg', phone: '0100 333 4455',
    avatarColor: palette[5], schoolId: 'sch_1', status: 'active', createdAt: '2024-09-01',
    subjectIds: ['sub_chem'], classIds: ['c3', 'c5'], bio: 'مدرس كيمياء، أحوّل المعادلات الصعبة إلى تجارب ممتعة.',
    experienceYears: 10, rating: 4.7, studentsCount: 48, reelsCount: 3,
  },
  {
    id: 'tch_4', role: 'teacher', name: 'أ. هدى سالم', email: 'hoda@alnoor.edu.eg', phone: '0100 444 5566',
    avatarColor: palette[3], schoolId: 'sch_1', status: 'active', createdAt: '2024-09-01',
    subjectIds: ['sub_bio'], classIds: ['c4', 'c5'], bio: 'مدرسة أحياء، شغوفة بعلم الوراثة والخلية.',
    experienceYears: 6, rating: 4.6, studentsCount: 44, reelsCount: 2,
  },
  {
    id: 'tch_5', role: 'teacher', name: 'أ. أحمد جمال', email: 'ahmed@alnoor.edu.eg', phone: '0100 555 6677',
    avatarColor: palette[4], schoolId: 'sch_1', status: 'active', createdAt: '2024-09-01',
    subjectIds: ['sub_ar'], classIds: ['c1', 'c2', 'c3'], bio: 'مدرس لغة عربية، أؤمن أن القراءة بوابة التفكير النقدي.',
    experienceYears: 15, rating: 4.9, studentsCount: 70, reelsCount: 5,
  },
  {
    id: 'tch_6', role: 'teacher', name: 'أ. مريم عادل', email: 'mariam@alnoor.edu.eg', phone: '0100 666 7788',
    avatarColor: palette[1], schoolId: 'sch_1', status: 'active', createdAt: '2024-09-01',
    subjectIds: ['sub_en'], classIds: ['c1', 'c2', 'c3'], bio: 'English teacher. Making grammar feel like a conversation, not a rule book.',
    experienceYears: 9, rating: 4.8, studentsCount: 68, reelsCount: 4,
  },
  {
    id: 'tch_7', role: 'teacher', name: 'أ. طارق حسن', email: 'tarek@alnoor.edu.eg', phone: '0100 777 8899',
    avatarColor: palette[7], schoolId: 'sch_1', status: 'active', createdAt: '2024-09-01',
    subjectIds: ['sub_hist'], classIds: ['c3', 'c4'], bio: 'مدرس تاريخ، أحكي التاريخ كأنه فيلم.',
    experienceYears: 7, rating: 4.5, studentsCount: 46, reelsCount: 2,
  },
  {
    id: 'tch_8', role: 'teacher', name: 'أ. نور الهدى', email: 'nour@alnoor.edu.eg', phone: '0100 888 9900',
    avatarColor: palette[6], schoolId: 'sch_1', status: 'active', createdAt: '2024-09-01',
    subjectIds: ['sub_cs'], classIds: ['c3', 'c4', 'c5'], bio: 'مدرسة علوم حاسب وبرمجة، أحب تحويل الأفكار إلى مشاريع حقيقية.',
    experienceYears: 5, rating: 4.7, studentsCount: 62, reelsCount: 3,
  },
]

type StudentSeed = [name: string, classId: string, gradeLevelId: string, parentId: string, average: number, attendance: number, points: number]

const studentSeeds: StudentSeed[] = [
  ['يوسف سامي', 'c3', 'g2', 'par_1', 88, 94, 2450],
  ['مريم سامي', 'c1', 'g1', 'par_1', 93, 98, 2780],
  ['عمر خالد', 'c3', 'g2', 'par_2', 76, 88, 1720],
  ['لينا خالد', 'c3', 'g2', 'par_2', 84, 91, 2100],
  ['آدم محمود', 'c3', 'g2', 'par_3', 69, 79, 1340],
  ['سلمى محمود', 'c3', 'g2', 'par_3', 91, 96, 2540],
  ['زياد فتحي', 'c3', 'g2', 'par_4', 58, 72, 980],
  ['جنى فتحي', 'c1', 'g1', 'par_4', 86, 93, 2010],
  ['ياسين أشرف', 'c3', 'g2', 'par_5', 95, 99, 3100],
  ['ريم أشرف', 'c3', 'g2', 'par_5', 89, 95, 2370],
  ['حمزة سيد', 'c3', 'g2', 'par_6', 73, 84, 1540],
  ['ملك سيد', 'c3', 'g2', 'par_6', 81, 90, 1880],
  ['عمران وليد', 'c1', 'g1', 'par_7', 67, 81, 1120],
  ['تالية وليد', 'c1', 'g1', 'par_7', 90, 97, 2460],
  ['فؤاد رمضان', 'c1', 'g1', 'par_8', 78, 86, 1610],
  ['هبة رمضان', 'c1', 'g1', 'par_8', 83, 92, 1950],
  ['سيف الدين', 'c2', 'g1', '', 72, 85, 1440],
  ['رنا إبراهيم', 'c2', 'g1', '', 88, 94, 2220],
  ['مازن عاطف', 'c2', 'g1', '', 64, 76, 1010],
  ['دينا مصطفى', 'c2', 'g1', '', 92, 98, 2600],
  ['أيمن رفعت', 'c4', 'g2', '', 74, 83, 1490],
  ['شهد عمرو', 'c4', 'g2', '', 87, 93, 2070],
  ['يحيى ناصر', 'c4', 'g2', '', 61, 74, 900],
  ['نور هشام', 'c4', 'g2', '', 79, 89, 1660],
]

export const students: Student[] = studentSeeds.map(([name, classId, gradeLevelId, parentId, average, attendance, points], i) => ({
  id: `stu_${i + 1}`,
  role: 'student',
  name,
  email: `student${i + 1}@alnoor.edu.eg`,
  phone: `010${String(10000000 + i * 1357).slice(0, 8)}`,
  avatarColor: palette[i % palette.length],
  schoolId: 'sch_1',
  status: 'active',
  createdAt: '2025-09-01',
  classId,
  gradeLevelId,
  parentId,
  code: `ST-${2600 + i}`,
  points,
  level: Math.max(1, Math.round(points / 350)),
  average,
  attendanceRate: attendance,
  rank: i + 1,
}))

// Re-rank students inside each class by average
for (const cls of classes) {
  const inClass = students.filter((s) => s.classId === cls.id).sort((a, b) => b.average - a.average)
  inClass.forEach((s, idx) => { s.rank = idx + 1 })
}

const parentSeeds: Array<[string, string, string, string, string, string[]]> = [
  ['سامي عبد الرحمن', 'samy@mail.com', '0100 123 4567', 'مهندس برمجيات', palette[0], ['stu_1', 'stu_2']],
  ['خالد إبراهيم', 'khaled@mail.com', '0100 234 5678', 'مدير تسويق', palette[1], ['stu_3', 'stu_4']],
  ['محمود حسن', 'mahmoud@mail.com', '0100 345 6789', 'محاسب', palette[2], ['stu_5', 'stu_6']],
  ['فتحي عبد الله', 'fathy@mail.com', '0100 456 7890', 'صاحب شركة', palette[3], ['stu_7', 'stu_8']],
  ['أشرف كامل', 'ashraf@mail.com', '0100 567 8901', 'طبيب', palette[4], ['stu_9', 'stu_10']],
  ['سيد رمضان', 'sayed@mail.com', '0100 678 9012', 'مهندس مدني', palette[5], ['stu_11', 'stu_12']],
  ['وليد شعبان', 'walid@mail.com', '0100 789 0123', 'مدرس جامعي', palette[6], ['stu_13', 'stu_14']],
  ['رمضان علي', 'ramadan@mail.com', '0100 890 1234', 'رجل أعمال', palette[7], ['stu_15', 'stu_16']],
]

export const parents: Parent[] = parentSeeds.map(([name, email, phone, job, color, studentIds], i) => ({
  id: `par_${i + 1}`,
  role: 'parent',
  name,
  email,
  phone,
  avatarColor: color,
  schoolId: 'sch_1',
  status: 'active',
  createdAt: '2025-09-01',
  job,
  studentIds,
}))

export const managers: User[] = [
  {
    id: 'mgr_1', role: 'manager', name: 'خالد المنصور', email: 'manager@alnoor.edu.eg', phone: '0100 999 0011',
    avatarColor: '#0f172a', schoolId: 'sch_1', status: 'active', createdAt: '2024-09-01',
  },
]

export const superAdmins: User[] = [
  {
    id: 'sa_1', role: 'super_admin', name: 'أحمد الشريف', email: 'admin@moallem.app', phone: '0100 000 1122',
    avatarColor: '#4f46e5', schoolId: '', status: 'active', createdAt: '2024-01-01',
  },
]

export const demoAccounts: Record<string, string> = {
  super_admin: 'sa_1',
  manager: 'mgr_1',
  teacher: 'tch_1',
  student: 'stu_1',
  parent: 'par_1',
}

export const allUsers: User[] = [...superAdmins, ...managers, ...teachers, ...students, ...parents]
