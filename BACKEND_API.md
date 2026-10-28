# توثيق واجهات البرمجة (Backend API) — منصة مُعلّم

> هذا الملف هو المرجع الكامل لبناء الباك إند (Node.js + Express + MongoDB/Mongoose) المتوافق مع نسخة الفرونت الحالية الموجودة في هذا المشروع.
> كل أسماء الحقول هنا مطابقة لملف `src/types.ts`، وكل عملية في `src/lib/store.tsx` لها Endpoint مقابل موضّح في جدول «خريطة ربط الفرونت» بالأسفل.

---

## 1. نظرة عامة

| البند | القيمة |
|---|---|
| Base URL | `https://api.moallem.app/api/v1` |
| صيغة البيانات | JSON (`application/json`) إلا رفع الملفات فيكون `multipart/form-data` |
| الترميز | UTF-8 |
| المصادقة | JWT عبر `Authorization: Bearer <accessToken>` |
| الأدوار | `super_admin` / `manager` / `teacher` / `student` / `parent` |
| تعدد المدارس | كل مستخدم (ما عدا السوبر أدمن) مرتبط بـ `schoolId` إلزاميًا |
| المنطقة الزمنية | `Africa/Cairo` |
| اللغة | رسائل الأخطاء والبيانات التجريبية بالعربية، أسماء الحقول بالإنجليزية |

### الأدوار والصلاحيات

| الدور | النطاق | يستطيع |
|---|---|---|
| `super_admin` | كل المنصة | إنشاء/تعطيل المدارس، إدارة الاشتراكات والخطط، رؤية إحصائيات المنصة وسجل النشاط |
| `manager` | مدرسته فقط | إدارة الطلاب والمعلمين وأولياء الأمور والفصول والمواد، الإعلانات، الحضور، اشتراك مدرسته (قراءة) |
| `teacher` | فصوله ومواده | رفع الريلز، إنشاء الامتحانات يدويًا أو بالذكاء الاصطناعي، رصد الحضور، رؤية درجات طلابه وتحليلاتهم |
| `student` | حسابه | مشاهدة الريلز، أداء الامتحانات المنشورة، رؤية درجاته وتقدمه وحضوره |
| `parent` | أبناؤه | رؤية مستوى الابن ودرجاته وتقدمه وأيام غيابه وفصله |

> ملاحظة: كل Endpoint إداري يجب أن يتحقق من `schoolId` الموجود في التوكن، ولا يقبل `schoolId` من الـ body إلا من `super_admin`.

---

## 2. اتفاقيات الاستجابة

### استجابة ناجحة (مفردة)

```json
{
  "success": true,
  "data": { "id": "stu_1", "name": "يوسف سامي" }
}
```

### استجابة ناجحة (قائمة + Pagination)

```json
{
  "success": true,
  "data": [ { "id": "stu_1" } ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 137,
    "totalPages": 7
  }
}
```

### استجابة خطأ

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "البريد الإلكتروني مستخدم بالفعل",
    "details": [{ "field": "email", "message": "duplicate" }]
  }
}
```

### أكواد الأخطاء

| HTTP | Code | المعنى |
|---|---|---|
| 400 | `VALIDATION_ERROR` | بيانات ناقصة أو غير صحيحة |
| 401 | `UNAUTHORIZED` | لا يوجد توكن أو منتهي |
| 403 | `FORBIDDEN` | الدور لا يملك الصلاحية أو المورد لمدرسته |
| 404 | `NOT_FOUND` | المورد غير موجود |
| 409 | `CONFLICT` | تكرار (بريد، كود طالب، اسم فصل…) |
| 422 | `UNPROCESSABLE` | منطق عمل غير صالح (مثلاً امتحان مغلق) |
| 429 | `RATE_LIMITED` | تجاوز حد الطلبات |
| 500 | `INTERNAL_ERROR` | خطأ غير متوقع |

### معاملات القوائم المشتركة

| المعامل | النوع | الوصف |
|---|---|---|
| `page` | number | افتراضي `1` |
| `limit` | number | افتراضي `20`، أقصى `100` |
| `q` | string | بحث نصي |
| `sort` | string | مثل `-createdAt` أو `name` |
| `schoolId` | ObjectId | للسوبر أدمن فقط |
| `status` | string | فلترة بالحالة |

---

## 3. المصادقة والحساب

### 3.1 تسجيل الدخول

`POST /auth/login`

```json
{
  "email": "manager@alnoor.edu.eg",
  "password": "123456"
}
```

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 3600,
    "user": {
      "id": "mgr_1",
      "role": "manager",
      "name": "خالد المنصور",
      "email": "manager@alnoor.edu.eg",
      "phone": "0100 111 2222",
      "avatarColor": "#0f172a",
      "schoolId": "sch_1",
      "status": "active",
      "createdAt": "2024-08-01"
    }
  }
}
```

### 3.2 الحساب الحالي

`GET /auth/me` → يعيد `user` + `school` + `permissions`.

### 3.3 تجديد التوكن

`POST /auth/refresh` — Body: `{ "refreshToken": "..." }`

### 3.4 تسجيل الخروج

`POST /auth/logout` — يُبطل الـ refresh token (يُخزَّن hashed في مجموعة `sessions`).

### 3.5 نسيت كلمة المرور

| Method | Endpoint | الوصف |
|---|---|---|
| POST | `/auth/forgot-password` | إرسال كود/رابط إلى البريد |
| POST | `/auth/reset-password` | `{ token, password }` |
| POST | `/auth/change-password` | `{ currentPassword, newPassword }` |

### 3.6 تسجيل الدخول التجريبي (بيئة الديمو فقط)

`POST /auth/demo-login` — Body: `{ "role": "teacher" }` → يعيد توكن حساب ديمو جاهز. يُفعّل فقط عندما `DEMO_MODE=true`.

### 3.7 JWT Payload

```json
{
  "sub": "tch_1",
  "role": "teacher",
  "schoolId": "sch_1",
  "iat": 1760000000,
  "exp": 1760003600
}
```

> لا تُضع بيانات حساسة في التوكن. تحقق دائمًا من `status !== 'suspended'` في middleware المصادقة.

---

## 4. نماذج البيانات (Mongoose Schemas)

جميع النماذج تحتوي على `timestamps: true` و`toJSON` يحوّل `_id` إلى `id` ويحذف `__v` و`password`.

### 4.1 School

```js
{
  name: { type: String, required: true, trim: true },
  shortName: { type: String, required: true },
  city: { type: String, required: true, index: true },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, required: true, lowercase: true },
  logoColor: { type: String, default: '#4f46e5' },
  managerName: { type: String, required: true },
  managerId: { type: ObjectId, ref: 'User' },
  plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'pro' },
  status: { type: String, enum: ['active', 'trial', 'expired'], default: 'trial', index: true },
  studentsCount: { type: Number, default: 0 },
  teachersCount: { type: Number, default: 0 },
  classesCount: { type: Number, default: 0 },
  subscriptionEnd: { type: Date },
  monthlyPrice: { type: Number, default: 0 },
  settings: {
    aiExams: { type: Boolean, default: true },
    reels: { type: Boolean, default: true },
    parentApp: { type: Boolean, default: true },
  },
}
```

### 4.2 User (نموذج واحد بجميع الأدوار)

```js
{
  role: { type: String, enum: ['super_admin', 'manager', 'teacher', 'student', 'parent'], required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  passwordHash: { type: String, required: true, select: false },
  avatarColor: { type: String, default: '#4f46e5' },
  schoolId: { type: ObjectId, ref: 'School', index: true }, // null للسوبر أدمن
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },

  // teacher
  subjectIds: [{ type: ObjectId, ref: 'Subject' }],
  classIds: [{ type: ObjectId, ref: 'SchoolClass' }],
  bio: String,
  experienceYears: { type: Number, default: 0 },
  rating: { type: Number, default: 5, min: 0, max: 5 },

  // student
  classId: { type: ObjectId, ref: 'SchoolClass' },
  gradeLevelId: { type: ObjectId, ref: 'GradeLevel' },
  parentId: { type: ObjectId, ref: 'User' },
  code: { type: String, unique: true, sparse: true },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  average: { type: Number, default: 0 },
  attendanceRate: { type: Number, default: 100 },
  rank: { type: Number, default: 0 },

  // parent
  job: String,
  studentIds: [{ type: ObjectId, ref: 'User' }],

  lastLoginAt: Date,
}
```

**Indexes المقترحة:** `{ schoolId: 1, role: 1, status: 1 }`, `{ schoolId: 1, classId: 1 }`, `{ email: 1 }` (unique).

### 4.3 GradeLevel

```js
{
  name: { type: String, required: true },
  order: { type: Number, required: true },
  schoolId: { type: ObjectId, ref: 'School', required: true, index: true },
}
```

### 4.4 SchoolClass

```js
{
  name: { type: String, required: true },
  gradeLevelId: { type: ObjectId, ref: 'GradeLevel', required: true, index: true },
  schoolId: { type: ObjectId, ref: 'School', required: true, index: true },
  supervisorId: { type: ObjectId, ref: 'User' }, // معلم
  room: String,
  studentsCount: { type: Number, default: 0 },
}
```

### 4.5 Subject

```js
{
  name: { type: String, required: true },
  icon: { type: String, default: 'BookOpen' }, // اسم أيقونة lucide
  color: { type: String, default: '#4f46e5' },
  gradeLevelId: { type: ObjectId, ref: 'GradeLevel', required: true },
  schoolId: { type: ObjectId, ref: 'School', required: true, index: true },
  teacherId: { type: ObjectId, ref: 'User' },
}
```

### 4.6 Reel

```js
{
  teacherId: { type: ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: ObjectId, ref: 'Subject', required: true, index: true },
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  thumbnailUrl: String,
  duration: { type: Number, default: 0 }, // ثوانٍ
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  gradient: String, // للنسخة الديمو
  emoji: String,
  tags: [String],
  transcript: [String],
  schoolId: { type: ObjectId, ref: 'School', required: true, index: true },
  status: { type: String, enum: ['published', 'hidden'], default: 'published' },
}
```

### 4.7 Exam + Question (embedded)

```js
{
  schoolId: { type: ObjectId, ref: 'School', required: true, index: true },
  teacherId: { type: ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: ObjectId, ref: 'Subject', required: true },
  classId: { type: ObjectId, ref: 'SchoolClass', required: true, index: true },
  title: { type: String, required: true },
  description: String,
  durationMin: { type: Number, default: 30 },
  totalMarks: { type: Number, default: 0 },
  questions: [{
    text: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'truefalse'], default: 'mcq' },
    options: [String],
    correctIndex: { type: Number, required: true },
    marks: { type: Number, default: 1 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    skill: String,
  }],
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft', index: true },
  dueDate: Date,
  source: { type: String, enum: ['manual', 'ai'], default: 'manual' },
  attempts: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  materials: [String],
}
```

> ⚠️ `correctIndex` يجب ألا يُعاد للطالب أثناء أداء الامتحان. استخدم `sanitizeExamForStudent()`.

### 4.8 ExamAttempt

```js
{
  examId: { type: ObjectId, ref: 'Exam', required: true, index: true },
  studentId: { type: ObjectId, ref: 'User', required: true, index: true },
  schoolId: { type: ObjectId, ref: 'School', required: true, index: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  answers: { type: Map, of: Number }, // questionId -> optionIndex
  submittedAt: { type: Date, default: Date.now },
  timeSpentMin: Number,
}
```

**Unique index:** `{ examId: 1, studentId: 1 }` لمنع إعادة التسليم (أو اسمح بمحاولات متعددة عبر إعداد `allowRetake`).

### 4.9 AttendanceRecord

```js
{
  studentId: { type: ObjectId, ref: 'User', required: true, index: true },
  classId: { type: ObjectId, ref: 'SchoolClass', required: true, index: true },
  schoolId: { type: ObjectId, ref: 'School', required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
}
```

**Unique index:** `{ studentId: 1, date: 1 }`.

### 4.10 Subscription

```js
{
  schoolId: { type: ObjectId, ref: 'School', required: true, unique: true },
  plan: { type: String, enum: ['basic', 'pro', 'enterprise'], required: true },
  price: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'trial', 'expired'], default: 'trial' },
  seats: { type: Number, default: 0 },
  autoRenew: { type: Boolean, default: true },
  invoices: [{ amount: Number, paidAt: Date, method: String, reference: String }],
}
```

### 4.11 Announcement

```js
{
  schoolId: { type: ObjectId, ref: 'School', required: true, index: true },
  authorId: { type: ObjectId, ref: 'User', required: true },
  authorName: String,
  title: { type: String, required: true },
  body: { type: String, required: true },
  audience: { type: String, default: 'الجميع' }, // 'الجميع' | 'الطلاب' | 'المعلمون' | 'أولياء الأمور' | 'فصل ١/أ'
  date: { type: Date, default: Date.now },
}
```

### 4.12 Notification

```js
{
  userId: { type: ObjectId, ref: 'User', index: true },
  schoolId: { type: ObjectId, ref: 'School', index: true },
  title: String,
  body: String,
  type: { type: String, enum: ['exam', 'grade', 'attendance', 'system', 'reel'], default: 'system' },
  read: { type: Boolean, default: false },
  role: { type: String, enum: ['super_admin', 'manager', 'teacher', 'student', 'parent'] },
  createdAt: { type: Date, default: Date.now },
}
```

### 4.13 AuditEntry

```js
{
  schoolId: { type: ObjectId, ref: 'School', index: true },
  actorId: { type: ObjectId, ref: 'User' },
  actor: String,
  action: String,
  target: String,
  type: { type: String, enum: ['create', 'update', 'delete', 'login'], required: true },
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
}
```

---

## 5. المدارس والاشتراكات (سوبر أدمن)

| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/schools` | قائمة المدارس (بحث/فلترة/ترقيم) |
| POST | `/schools` | إنشاء مدرسة + حساب مدير + اشتراك تجريبي |
| GET | `/schools/:id` | تفاصيل مدرسة + اشتراكها + إحصائياتها |
| PATCH | `/schools/:id` | تعديل بيانات المدرسة |
| DELETE | `/schools/:id` | تعطيل/حذف ناعم (`status = expired`) |
| GET | `/schools/:id/stats` | إحصائيات المدرسة |
| GET | `/schools/:id/users` | مستخدمو المدرسة |
| PATCH | `/schools/:id/settings` | إعدادات المدرسة (AI/ريلز/بوابة الوالدين) |

### 5.1 إنشاء مدرسة

`POST /schools`

```json
{
  "name": "مدارس المستقبل الدولية",
  "city": "القاهرة",
  "address": "التجمع الخامس",
  "phone": "0100 000 0000",
  "email": "manager@future.edu.eg",
  "plan": "pro",
  "managerName": "أ. سامي عبد الرحمن",
  "managerEmail": "manager@future.edu.eg",
  "managerPassword": "123456"
}
```

**الاستجابة `201`:**

```json
{
  "success": true,
  "data": {
    "school": {
      "id": "sch_6",
      "name": "مدارس المستقبل الدولية",
      "shortName": "مدارس المستقبل",
      "plan": "pro",
      "status": "trial",
      "monthlyPrice": 9500,
      "subscriptionEnd": "2026-11-27",
      "createdAt": "2026-10-28",
      "managerName": "أ. سامي عبد الرحمن",
      "managerId": "mgr_4"
    },
    "manager": { "id": "mgr_4", "email": "manager@future.edu.eg", "role": "manager" },
    "subscription": {
      "id": "sub_6", "plan": "pro", "price": 9500,
      "status": "trial", "seats": 0, "autoRenew": true,
      "startDate": "2026-10-28", "endDate": "2026-11-27"
    }
  }
}
```

**منطق الخادم:** transaction واحدة تنشئ `School` ثم `User(manager)` ثم `Subscription`، وتُسجّل حدث `create` في `AuditEntry`.

### 5.2 الاشتراكات

| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/subscriptions` | قائمة الاشتراكات + فلترة بالحالة |
| GET | `/subscriptions/summary` | MRR / ARR / تجديدات قريبة / توزيع الخطط |
| PATCH | `/subscriptions/:id` | تعديل الخطة/السعر/الحالة/المقاعد/التجديد |
| POST | `/subscriptions/:id/renew` | تجديد يدوي |
| GET | `/subscriptions/:id/invoices` | فواتير الاشتراك |
| GET | `/plans` | خطط الأسعار (عام) |

**مزامنة إلزامية:** عند تعديل الاشتراك يجب تحديث `School.plan` و`School.status` و`School.subscriptionEnd` و`School.monthlyPrice` في نفس المعاملة (مطابق لـ `updateSubscription` في الفرونت).

```json
// PATCH /subscriptions/sub_2
{
  "plan": "enterprise",
  "price": 18000,
  "status": "active",
  "endDate": "2027-10-28",
  "seats": 1200,
  "autoRenew": true
}
```

### 5.3 إحصائيات المنصة

`GET /analytics/platform?range=6m`

```json
{
  "success": true,
  "data": {
    "schools": 5,
    "activeSchools": 4,
    "students": 4210,
    "teachers": 214,
    "mrr": 43500,
    "arr": 522000,
    "renewalSoon": 2,
    "plans": { "basic": 1, "pro": 3, "enterprise": 1 },
    "monthlyRevenue": [
      { "label": "مايو", "value": 31000 },
      { "label": "يونيو", "value": 34500 }
    ]
  }
}
```

---

## 6. المستخدمون

### 6.1 الطلاب

| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/students` | manager, teacher | `?classId=&gradeLevelId=&q=&status=` |
| POST | `/students` | manager | إضافة طالب |
| GET | `/students/:id` | manager, teacher, parent(ابنه), student(نفسه) | ملف الطالب |
| PATCH | `/students/:id` | manager | تعديل |
| DELETE | `/students/:id` | manager | حذف |
| GET | `/students/:id/overview` | manager, teacher, parent, student | درجات + حضور + تقدم + نقاط |
| GET | `/students/:id/attempts` | manager, teacher, parent, student | محاولات الامتحانات |
| GET | `/students/:id/attendance` | manager, teacher, parent, student | `?from=&to=` |
| GET | `/students/:id/progress` | student, parent, teacher | مهارات + تطور أسبوعي + مستوى |

`POST /students`

```json
{
  "name": "يوسف سامي",
  "email": "student25@alnoor.edu.eg",
  "phone": "0100 123 4567",
  "classId": "c3",
  "parentId": "par_1",
  "password": "123456"
}
```

**الاستجابة `201`:**

```json
{
  "success": true,
  "data": {
    "id": "stu_25",
    "role": "student",
    "name": "يوسف سامي",
    "email": "student25@alnoor.edu.eg",
    "classId": "c3",
    "gradeLevelId": "g2",
    "parentId": "par_1",
    "code": "ST-2841",
    "points": 0,
    "level": 1,
    "average": 0,
    "attendanceRate": 100,
    "rank": 0,
    "schoolId": "sch_1",
    "status": "active",
    "createdAt": "2026-10-28"
  }
}
```

> يجب أن يزيد الخادم `SchoolClass.studentsCount` و`School.studentsCount` ويضيف `studentId` إلى `Parent.studentIds` داخل نفس المعاملة.

### 6.2 المعلمون

| Method | Endpoint | الصلاحية |
|---|---|---|
| GET | `/teachers` | manager, student, parent |
| POST | `/teachers` | manager |
| GET | `/teachers/:id` | الكل |
| PATCH | `/teachers/:id` | manager, teacher(نفسه) |
| DELETE | `/teachers/:id` | manager |
| GET | `/teachers/:id/profile` | الكل — يشمل المواد والفصول والريلز والامتحانات والتقييم |
| GET | `/teachers/:id/reels` | الكل |
| GET | `/teachers/:id/exams` | manager, teacher |

`POST /teachers`

```json
{
  "name": "أ. محمد العزب",
  "email": "mohamed2@alnoor.edu.eg",
  "phone": "0100 222 3344",
  "subjectIds": ["sub_2"],
  "classIds": ["c3", "c4"],
  "experienceYears": 7,
  "bio": "معلم رياضيات للصف الثاني الثانوي",
  "password": "123456"
}
```

### 6.3 أولياء الأمور

| Method | Endpoint | الصلاحية |
|---|---|---|
| GET | `/parents` | manager |
| POST | `/parents` | manager |
| GET | `/parents/:id` | manager, parent(نفسه) |
| PATCH | `/parents/:id` | manager, parent(نفسه) |
| DELETE | `/parents/:id` | manager |
| POST | `/parents/:id/link-student` | manager — `{ studentId }` |
| DELETE | `/parents/:id/link-student/:studentId` | manager |
| GET | `/parents/me/children` | parent — قائمة الأبناء مع ملخص كل ابن |

```json
// GET /parents/me/children
{
  "success": true,
  "data": [
    {
      "student": { "id": "stu_1", "name": "يوسف سامي", "level": 7, "points": 2450, "average": 88, "rank": 3 },
      "class": { "id": "c3", "name": "٢ / أ" },
      "gradeLevel": { "id": "g2", "name": "الصف الثاني الثانوي" },
      "attendance": { "present": 38, "absent": 2, "late": 1, "rate": 95 },
      "nextExam": { "id": "ex_2", "title": "امتحان التفاضل", "dueDate": "2026-11-02" }
    }
  ]
}
```

### 6.4 المديرون والسوبر أدمن

| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/managers` | سوبر أدمن |
| POST | `/managers` | إنشاء مدير لمدرسة موجودة |
| PATCH | `/users/:id/status` | تفعيل/تعليق أي مستخدم |
| POST | `/users/:id/reset-password` | إعادة تعيين كلمة المرور |

---

## 7. الفصول والمستويات والمواد

| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/grade-levels` | manager, teacher | قائمة المستويات |
| POST | `/grade-levels` | manager | إضافة مستوى |
| PATCH | `/grade-levels/:id` | manager | تعديل |
| DELETE | `/grade-levels/:id` | manager | حذف (إن لم يكن مرتبطًا بفصول) |
| GET | `/classes` | manager, teacher | `?gradeLevelId=` |
| POST | `/classes` | manager | إضافة فصل |
| GET | `/classes/:id` | manager, teacher | تفاصيل + طلاب + مشرف |
| PATCH | `/classes/:id` | manager | تعديل |
| DELETE | `/classes/:id` | manager | حذف |
| GET | `/classes/:id/students` | manager, teacher | طلاب الفصل |
| GET | `/classes/:id/attendance` | manager, teacher | `?date=YYYY-MM-DD` |
| POST | `/classes/:id/attendance` | manager, teacher | رصد الحضور |
| GET | `/subjects` | الكل | `?gradeLevelId=&teacherId=` |
| POST | `/subjects` | manager | إضافة مادة |
| PATCH | `/subjects/:id` | manager | تعديل |
| DELETE | `/subjects/:id` | manager | حذف |

`POST /classes`

```json
{ "name": "٢ / ج", "gradeLevelId": "g2", "room": "B-203", "supervisorId": "tch_3" }
```

`POST /classes/:id/attendance`

```json
{
  "date": "2026-10-28",
  "records": {
    "stu_1": "present",
    "stu_2": "absent",
    "stu_3": "late",
    "stu_4": "excused"
  }
}
```

**منطق الخادم:** Upsert لكل طالب على مفتاح `{ studentId, date }`، ثم إعادة حساب `Student.attendanceRate`، وإرسال إشعار لولي الأمر عند `absent` أو `late`.

---

## 8. الريلز التعليمية

| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/reels` | manager, teacher, student | `?subjectId=&teacherId=&q=&sort=-createdAt` |
| GET | `/reels/feed` | student | خلاصة مخصصة حسب فصله ومواده |
| POST | `/reels` | teacher | إنشاء ريل |
| GET | `/reels/:id` | الكل | تفاصيل |
| PATCH | `/reels/:id` | teacher(صاحبه), manager | تعديل |
| DELETE | `/reels/:id` | teacher(صاحبه), manager | حذف |
| POST | `/reels/:id/view` | student | زيادة المشاهدات |
| POST | `/reels/:id/like` | student | إعجاب/إلغاء إعجاب |
| POST | `/reels/:id/save` | student | حفظ/إلغاء حفظ |
| GET | `/reels/:id/comments` | الكل | التعليقات |
| POST | `/reels/:id/comments` | student, teacher | إضافة تعليق |

`POST /reels`

```json
{
  "title": "قانون نيوتن الثاني في ٤٠ ثانية",
  "description": "شرح مبسط مع مثال محلول",
  "subjectId": "sub_1",
  "videoUrl": "https://cdn.moallem.app/reels/newton.mp4",
  "thumbnailUrl": "https://cdn.moallem.app/reels/newton.jpg",
  "duration": 42,
  "emoji": "🚀",
  "gradient": "from-indigo-600 via-violet-600 to-fuchsia-500",
  "tags": ["فيزياء", "نيوتن", "ثاني ثانوي"]
}
```

**الاستجابة `201`:** كائن الريل كامل + زيادة `Teacher.reelsCount`.

> حد أقصى مقترح للفيديو: 100MB، والمدة 15–180 ثانية. استخدم FFmpeg لتوليد thumbnail إن لم تُرفع.

---

## 9. الامتحانات

| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/exams` | manager, teacher, student, parent | `?classId=&subjectId=&status=&teacherId=` |
| POST | `/exams` | teacher | إنشاء امتحان يدوي |
| GET | `/exams/:id` | manager, teacher, student(منشور), parent | تفاصيل |
| PATCH | `/exams/:id` | teacher(صاحبه) | تعديل (draft فقط) |
| DELETE | `/exams/:id` | teacher(صاحبه), manager | حذف |
| POST | `/exams/:id/publish` | teacher | نشر |
| POST | `/exams/:id/close` | teacher, manager | إغلاق |
| GET | `/exams/:id/attempts` | teacher, manager | محاولات الطلاب |
| GET | `/exams/:id/results` | teacher, manager | إحصائية النتائج + توزيع الدرجات |
| GET | `/exams/:id/take` | student | نسخة آمنة بدون `correctIndex` |
| POST | `/exams/:id/submit` | student | تسليم الإجابات |
| POST | `/exams/generate` | teacher | توليد أسئلة بالذكاء الاصطناعي |
| POST | `/exams/from-material` | teacher | رفع مادة وتوليد امتحان منها |

`POST /exams`

```json
{
  "title": "امتحان التفاضل — الوحدة الثانية",
  "description": "يشمل قواعد الاشتقاق وتطبيقاتها",
  "subjectId": "sub_2",
  "classId": "c3",
  "durationMin": 45,
  "source": "manual",
  "questions": [
    {
      "text": "ما هو مشتقة الدالة f(x) = x²؟",
      "type": "mcq",
      "options": ["2x", "x", "x²", "2"],
      "correctIndex": 0,
      "marks": 2,
      "difficulty": "easy",
      "skill": "قواعد الاشتقاق"
    }
  ]
}
```

**الخادم يحسب `totalMarks` تلقائيًا** ولا يثق بالقيمة القادمة من العميل.

### 9.1 أداء الامتحان

`GET /exams/:id/take` (طالب):

```json
{
  "success": true,
  "data": {
    "id": "ex_2",
    "title": "امتحان التفاضل",
    "durationMin": 45,
    "totalMarks": 20,
    "dueDate": "2026-11-02",
    "serverTime": "2026-10-28T10:15:00Z",
    "questions": [
      {
        "id": "q1",
        "text": "ما هو مشتقة الدالة f(x) = x²؟",
        "type": "mcq",
        "options": ["2x", "x", "x²", "2"],
        "marks": 2,
        "difficulty": "easy",
        "skill": "قواعد الاشتقاق"
      }
    ]
  }
}
```

`POST /exams/:id/submit`

```json
{
  "answers": { "q1": 0, "q2": 2, "q3": 1 },
  "timeSpentMin": 32
}
```

```json
{
  "success": true,
  "data": {
    "attemptId": "att_88",
    "score": 16,
    "total": 20,
    "percentage": 80,
    "correctCount": 8,
    "totalQuestions": 10,
    "newAverage": 84,
    "pointsEarned": 80,
    "weakSkills": ["التكامل", "المتتابعات"]
  }
}
```

**قواعد مهمة:**
- منع التسليم مرتين لنفس الامتحان (إلا إذا `allowRetake`).
- التحقق من `dueDate` و`status === 'published'`.
- حساب الدرجة على الخادم فقط.
- تحديث `Exam.attempts` و`Exam.averageScore` و`Student.average` و`Student.points` في معاملة واحدة.
- إنشاء إشعار للطالب وولي أمره.

### 9.2 توليد الأسئلة بالذكاء الاصطناعي

`POST /exams/generate`

```json
{
  "subjectId": "sub_2",
  "classId": "c3",
  "gradeLevelId": "g2",
  "count": 10,
  "difficulty": "medium",
  "types": ["mcq", "truefalse"],
  "skills": ["قواعد الاشتقاق", "تطبيقات المشتقة"],
  "materialText": "نص المادة المرفوعة أو ملخصها…",
  "materialUrl": "https://cdn.moallem.app/materials/calc-unit2.pdf"
}
```

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "ai_q1",
        "text": "…",
        "type": "mcq",
        "options": ["…", "…", "…", "…"],
        "correctIndex": 2,
        "marks": 1,
        "difficulty": "medium",
        "skill": "قواعد الاشتقاق"
      }
    ],
    "model": "gpt-4o-mini",
    "tokensUsed": 1832,
    "source": "ai"
  }
}
```

**توصيات:** حد أقصى 30 سؤالًا في الطلب، Rate limit (10 طلبات/ساعة/معلم)، وتخزين `materialText` مؤقتًا لا دائمًا، ومراجعة بشرية إلزامية قبل النشر.

### 9.3 تحليلات الامتحان

`GET /exams/:id/results`

```json
{
  "success": true,
  "data": {
    "attempts": 24,
    "average": 78,
    "highest": 98,
    "lowest": 42,
    "passRate": 83,
    "distribution": [
      { "label": "0–20", "value": 1 },
      { "label": "21–40", "value": 2 },
      { "label": "41–60", "value": 4 },
      { "label": "61–80", "value": 9 },
      { "label": "81–100", "value": 8 }
    ],
    "perQuestion": [
      { "questionId": "q1", "correct": 20, "wrong": 4, "successRate": 83 }
    ],
    "weakSkills": [{ "skill": "التكامل", "score": 48 }],
    "topStudents": [{ "studentId": "stu_1", "name": "يوسف سامي", "score": 19 }]
  }
}
```

---

## 10. النتائج والتقدم والتحليلات

| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/results/me` | student | كل نتائجي + المتوسط + الترتيب |
| GET | `/results/class/:classId` | teacher, manager | نتائج فصل |
| GET | `/results/exam/:examId` | teacher, manager | نتائج امتحان |
| GET | `/results/child/:studentId` | parent | نتائج الابن |
| GET | `/analytics/student/:id` | teacher, parent, student | مهارات/تطور/حضور/نقاط ضعف |
| GET | `/analytics/class/:id` | teacher, manager | متوسط الفصل + طلاب في خطر |
| GET | `/analytics/teacher/:id` | teacher, manager | أداء المعلم وامتحاناته |
| GET | `/analytics/school` | manager | إحصائيات المدرسة |
| GET | `/analytics/platform` | super_admin | إحصائيات المنصة |
| GET | `/leaderboard` | student, teacher, manager | `?classId=&gradeLevelId=&limit=10` |

`GET /analytics/student/:id`

```json
{
  "success": true,
  "data": {
    "average": 88,
    "rank": 3,
    "level": 7,
    "points": 2450,
    "nextLevelPoints": 2800,
    "attendanceRate": 95,
    "skills": [
      { "skill": "الفيزياء", "score": 92 },
      { "skill": "الرياضيات", "score": 85 }
    ],
    "weekly": [
      { "label": "الأسبوع ١", "value": 78 },
      { "label": "الأسبوع ٢", "value": 84 }
    ],
    "weaknesses": ["التكامل", "الكيمياء العضوية"],
    "strengths": ["الميكانيكا", "الجبر"],
    "recentAttempts": [
      { "examId": "ex_2", "title": "امتحان التفاضل", "score": 16, "total": 20, "submittedAt": "2026-10-27" }
    ]
  }
}
```

**نقاط المستوى:** `requiredPoints(level) = level * 350` (مطابق للفرونت).

---

## 11. الحضور والغياب

| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/attendance` | manager, teacher | `?classId=&date=&from=&to=` |
| POST | `/attendance/bulk` | manager, teacher | رصد فصل كامل |
| PATCH | `/attendance/:id` | manager, teacher | تعديل سجل |
| GET | `/attendance/summary` | manager, teacher | ملخص يومي/أسبوعي |
| GET | `/attendance/me` | student, parent | `?studentId=` للولي |
| GET | `/attendance/heatmap/:studentId` | teacher, parent, student | آخر ٤٢ يومًا |

`POST /attendance/bulk`

```json
{
  "classId": "c3",
  "date": "2026-10-28",
  "records": { "stu_1": "present", "stu_2": "absent" }
}
```

```json
{
  "success": true,
  "data": {
    "date": "2026-10-28",
    "classId": "c3",
    "saved": 24,
    "summary": { "present": 20, "absent": 2, "late": 1, "excused": 1 }
  }
}
```

---

## 12. الإعلانات والإشعارات

| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/announcements` | manager, teacher, student, parent | حسب الجمهور والمدرسة |
| POST | `/announcements` | manager | نشر إعلان |
| DELETE | `/announcements/:id` | manager | حذف |
| GET | `/notifications` | الكل | إشعارات المستخدم الحالي |
| GET | `/notifications/unread-count` | الكل | عدد غير المقروء |
| PATCH | `/notifications/:id/read` | الكل | تعليم كمقروء |
| POST | `/notifications/read-all` | الكل | تعليم الكل كمقروء |

`POST /announcements`

```json
{
  "title": "بدء مراجعات منتصف الفصل",
  "body": "تبدأ المراجعات يوم الأحد القادم…",
  "audience": "الطلاب"
}
```

**الخادم:** ينشئ `Announcement` + `Notification` لكل مستخدم مطابق للجمهور، ويُسجّل في `AuditEntry`.

---

## 13. رفع الملفات

| Method | Endpoint | الوصف |
|---|---|---|
| POST | `/uploads/image` | صورة (شعار، أفاتار) — `multipart/form-data` |
| POST | `/uploads/video` | فيديو ريل — حتى 100MB |
| POST | `/uploads/material` | PDF/Word لتوليد امتحان AI — حتى 20MB |
| POST | `/uploads/avatar` | صورة شخصية |

```json
// POST /uploads/image  (field: file)
{
  "success": true,
  "data": {
    "url": "https://cdn.moallem.app/uploads/1729-image.jpg",
    "key": "uploads/1729-image.jpg",
    "mime": "image/jpeg",
    "size": 245678
  }
}
```

**توصيات:** تحقق من MIME الحقيقي (magic bytes)، اسم عشوائي، تخزين S3/R2، وروابط موقّعة عند الحاجة.

---

## 14. سجل النشاط

| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/audit` | super_admin, manager | `?type=&actor=&from=&to=` |
| GET | `/audit/export` | super_admin | CSV/Excel |

`AuditEntry` تُنشأ تلقائيًا من Middleware عام عند كل `POST/PATCH/DELETE`، مع `actorId` و`schoolId` و`ip`.

---

## 15. خريطة ربط الفرونت بالـ API

| دالة الفرونت (`src/lib/store.tsx`) | Endpoint المقابل |
|---|---|
| `login(role)` | `POST /auth/login` (أو `/auth/demo-login`) |
| `logout()` | `POST /auth/logout` |
| `resetDemo()` | `POST /admin/demo/reset` (بيئة الديمو فقط) |
| `addSchool(data)` | `POST /schools` |
| `updateSchool(id, patch)` | `PATCH /schools/:id` |
| `addStudent(data)` | `POST /students` |
| `updateStudent(id, patch)` | `PATCH /students/:id` |
| `deleteStudent(id)` | `DELETE /students/:id` |
| `addTeacher(data)` | `POST /teachers` |
| `updateTeacher(id, patch)` | `PATCH /teachers/:id` |
| `deleteTeacher(id)` | `DELETE /teachers/:id` |
| `addParent(data)` | `POST /parents` |
| `updateParent(id, patch)` | `PATCH /parents/:id` |
| `deleteParent(id)` | `DELETE /parents/:id` |
| `addClass(data)` | `POST /classes` |
| `addGradeLevel(name)` | `POST /grade-levels` |
| `addSubject(data)` | `POST /subjects` |
| `addReel(data)` | `POST /reels` |
| `addExam(data)` | `POST /exams` |
| `publishExam(id)` | `POST /exams/:id/publish` |
| `deleteExam(id)` | `DELETE /exams/:id` |
| `submitAttempt(examId, answers, time)` | `POST /exams/:examId/submit` |
| `markAttendance(classId, date, records)` | `POST /classes/:classId/attendance` |
| `addAnnouncement(data)` | `POST /announcements` |
| `updateSubscription(id, patch)` | `PATCH /subscriptions/:id` |
| `notify(title, body)` | `POST /notifications` (أو Server-Side Event) |
| `markNotificationRead(id)` | `PATCH /notifications/:id/read` |
| `markAllNotificationsRead()` | `POST /notifications/read-all` |
| `db.reels` | `GET /reels` |
| `db.exams` | `GET /exams` |
| `db.attempts` | `GET /results/...` |
| `db.attendance` | `GET /attendance` |
| `db.notifications` | `GET /notifications` |
| `db.subscriptions` | `GET /subscriptions` |
| `db.auditLog` | `GET /audit` |
| `getTeacher/getStudent/getParent/getClass/getGrade/getSubject` | `GET /.../:id` أو تُشتق من الكاش المحلي |

### اقتراح طبقة API في الفرونت

```ts
// src/lib/api.ts
const BASE = import.meta.env.VITE_API_URL ?? 'https://api.moallem.app/api/v1'

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('moallem_token')
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  const json = await res.json()
  if (!res.ok || json.success === false) throw new ApiError(json.error)
  return json.data as T
}
```

> عند الربط الفعلي: استبدل البيانات الوهمية في `StoreProvider` بنداءات `api()` مع نفس أسماء الدوال، وأبقِ `localStorage` كطبقة كاش اختيارية (يُفضّل استخدام React Query).

---

## 16. الأمان والأداء

- **كلمات المرور:** bcrypt بـ `cost = 12`.
- **Rate limiting:** `/auth/*` 10 طلبات/دقيقة/IP، `/exams/generate` 10/ساعة/معلم.
- **Helmet + CORS** للنطاقات المسموحة فقط.
- **Validation:** `zod` أو `express-validator` على كل Body/Params/Query.
- **Sanitization:** منع حقن NoSQL عبر التحقق من الأنواع، و`express-mongo-sanitize`.
- **Indexes:** `schoolId` + `role`، `examId` + `studentId` (unique)، `studentId` + `date` (unique).
- **Transactions:** أي عملية تمس أكثر من collection (إنشاء مدرسة، تسليم امتحان، رصد حضور).
- **Pagination:** إلزامية على كل القوائم، وأقصى `limit = 100`.
- **Soft delete:** للمستخدمين والمدارس (`deletedAt`) بدل الحذف النهائي.
- **Audit:** لا يُسمح بتعديل أو حذف سجلات `AuditEntry`.
- **WebSockets/SSE:** للإشعارات الفورية (اختياري): `GET /events` مع `text/event-stream`.

---

## 17. متغيرات البيئة المقترحة

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://moallem.app
S3_ENDPOINT=...
S3_BUCKET=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
OPENAI_API_KEY=...
DEMO_MODE=false
```

---

## 18. هيكل مقترح للباك إند

```
server/
├─ src/
│  ├─ app.ts
│  ├─ server.ts
│  ├─ config/            # env, db, s3, logger
│  ├─ middlewares/       # auth, rbac, validate, audit, error
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ schools/
│  │  ├─ subscriptions/
│  │  ├─ users/          # students, teachers, parents, managers
│  │  ├─ classes/
│  │  ├─ subjects/
│  │  ├─ reels/
│  │  ├─ exams/
│  │  ├─ attendance/
│  │  ├─ announcements/
│  │  ├─ notifications/
│  │  ├─ analytics/
│  │  ├─ uploads/
│  │  └─ audit/
│  ├─ models/
│  ├─ utils/
│  └─ jobs/              # تذكير التجديد، حساب الترتيب، إشعارات
└─ tests/
```

كل Module يحتوي: `*.routes.ts`، `*.controller.ts`، `*.service.ts`، `*.model.ts`، `*.validation.ts`، `*.types.ts`.

---

## 19. خطة تنفيذ مقترحة

1. **الأساس:** Express + Mongo + JWT + RBAC + Error handler + Validation.
2. **المصادقة والمدارس:** `/auth`، `/schools`، `/subscriptions`.
3. **المستخدمون:** طلاب/معلمون/أولياء أمور + ربط الفصول والأبناء.
4. **الفصول والمواد والحضور.**
5. **الريلز + الرفع.**
6. **الامتحانات + التسليم + النتائج + AI.**
7. **الإعلانات والإشعارات والسجل.**
8. **التحليلات + Leaderboard.**
9. **الأمان، الفهارس، الاختبارات، التوثيق النهائي (Swagger).**

---

## 20. ملاحظات توافق مع نسخة الديمو الحالية

- كل الحقول الموجودة في `src/types.ts` مغطاة أعلاه، وأي حقل إضافي (مثل `videoUrl`) اختياري ومتوافق للخلف.
- `Notification.role` في الديمو عام لكل دور؛ في الباك إند الحقيقي يُفضّل `userId` محدد، مع إبقاء `role` للتوافق.
- `Announcement.audience` نص حر في الديمو (`'الجميع' | 'الطلاب' | … | 'فصل ١/أ'`)؛ في الباك إند يُفضّل إضافة `audienceType` (`all | role | class`) و`audienceRef` (role أو classId).
- `markAttendance` في الديمو يستبدل سجلات الفصل/اليوم بالكامل؛ في الباك إند استخدم Upsert لكل طالب لتفادي فقدان السجلات.
- `resetDemo` وبيانات الحسابات التجريبية تعمل فقط عندما `DEMO_MODE=true`.
