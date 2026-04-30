# Design Document: E-Portfolio Pro Upgrade

## Overview

E-Portfolio Pro Upgrade — mavjud 5 ta vanilla HTML/CSS/JS fayldan iborat localStorage-asosidagi elektron portfolio tizimini professional darajaga ko'tarish loyihasi. Tizim hech qanday backend yoki framework ishlatmaydi; barcha mantiq brauzerda ishlaydi va ma'lumotlar `localStorage`da saqlanadi.

Upgrade 10 ta yo'nalishni qamrab oladi:

1. **Teacher Analytics Dashboard** — Chart.js bilan statistik grafiklar
2. **Student Profile Upgrade** — foto, skills, goals, 3 ta template
3. **Public Portfolio & Share** — `public.html`, clipboard, QR code
4. **UI/UX Upgrade** — dark mode, sidebar, hamburger, animatsiyalar
5. **Security & Auth** — Teacher PIN, session timeout, parol/PIN o'zgartirish
6. **Search & Filter** — real-time qidiruv, GPA/score filter, sort
7. **Bulk Import CSV** — CSV parse, preview, validation, max 200 qator
8. **Notification System** — badge, dropdown, student banner
9. **Portfolio Versioning** — max 10 versiya, restore
10. **Data Integrity** — CSV parser validation, localStorage read/write safety

### Texnik cheklovlar

- Faqat vanilla HTML/CSS/JS (framework yo'q)
- `localStorage` (backend yo'q)
- CDN kutubxonalar: Chart.js, html2canvas, jsPDF, QRCode.js, Tailwind CSS, Font Awesome
- Mavjud fayllar: `index.html`, `auth.html`, `teacher.html`, `student.html`, `portfolio-editor.html`
- Yangi fayl: `public.html`

---

## Architecture

Tizim **Single-Page Application (SPA) pattern** ga yaqin, lekin multi-page HTML fayllar sifatida tashkil etilgan. Har bir sahifa o'z JavaScript logikasini o'z ichiga oladi. Sahifalar orasidagi ma'lumot almashinuvi `localStorage` orqali amalga oshiriladi.

```mermaid
graph TD
    A[index.html\nLanding Page] --> B[auth.html\nLogin/Register]
    B --> C[teacher.html\nTeacher Panel]
    B --> D[student.html\nStudent Panel]
    C --> E[portfolio-editor.html\nPortfolio Editor]
    D --> E
    E --> F[public.html\nPublic View]
    C --> F

    subgraph localStorage
        G[users]
        H[portfolios]
        I[portfolio_versions_{id}]
        J[ep_dark_mode]
        K[ep_dismissed_notifications]
        L[ep_logged_in / ep_user_id / ep_user_role / ep_session_start]
    end

    C --- G
    C --- H
    E --- H
    E --- I
    D --- H
    F --- H
    B --- G
    B --- L
```

### Arxitektura qarorlari

**1. Shared JS Module pattern (inline)**
Har bir HTML fayl o'z `<script>` blokida barcha logikani saqlaydi. Umumiy funksiyalar (modal, dark mode, session check) har bir faylga copy-paste qilinadi yoki `<script src="shared.js">` orqali ulashiladi. Loyiha hajmini hisobga olib, `shared.js` fayli yaratiladi.

**2. Event-driven UI updates**
Barcha UI yangilanishlari DOM manipulation orqali amalga oshiriladi. `localStorage` o'zgarishi `storage` event orqali emas, balki to'g'ridan-to'g'ri funksiya chaqiruvlari orqali boshqariladi.

**3. Defensive localStorage reads**
Har bir `localStorage.getItem()` chaqiruvi `try/catch` va `JSON.parse` xatolarini ushlab oladi. Yo'q yoki buzilgan ma'lumotlar uchun default qiymatlar qaytariladi.

---

## Components and Interfaces

### 1. Shared Module (`shared.js`)

Barcha sahifalarda ishlatiladigan umumiy funksiyalar:

```javascript
// Dark mode
function initDarkMode()
function toggleDarkMode()

// Session management
function checkSession(role)          // 'teacher' | 'student'
function refreshSession()
function logout()

// Modal system (mavjud)
function showAlert(message, title)
function showConfirm(message, title)

// Notification helpers
function getNotificationCount()
function getDismissedNotifications()
function dismissNotification(id)

// localStorage helpers
function safeGetItem(key, defaultValue)
function safeSetItem(key, value)
```

### 2. Teacher Analytics Module (`teacher.html`)

```javascript
// Statistics calculation
function calculateClassStats(students, portfolios)
// Returns: { totalCount, avgGPA, avgCompletion }

// Chart rendering
function renderGPAChart(students, portfolios)
function renderCompletionChart(students, portfolios)

// Top 5 students
function getTop5Students(students, portfolios)
// Returns: sorted array of max 5 students by Portfolio_Score

// GPA bucketing
function bucketGPAs(portfolios)
// Returns: { '1.0-2.9': n, '3.0-3.9': n, '4.0-4.4': n, '4.5-5.0': n }

// Completion classification
function classifyCompletion(portfolios)
// Returns: { above70: n, below70: n }

// Search & Filter
function filterStudents(students, portfolios, query, gpaRange, scoreRange, sortBy)
// Returns: filtered and sorted student ID array

// Bulk CSV Import
function parseCSV(csvString)
// Returns: { rows: Object[], errors: string[] }

function importStudents(rows, existingUsers)
// Returns: { added: number, skipped: string[] }

// Notification badge
function getTeacherNotifications(students, portfolios)
// Returns: { count: number, items: { id, name, score }[] }
```

### 3. Portfolio Editor Module (`portfolio-editor.html`)

```javascript
// Photo upload
function handlePhotoUpload(file)
// Returns: Promise<string> (base64) or throws if > 2MB

// Skills management
function addSkill(name, level)
function removeSkill(index)
function renderSkills(skills)

// Goals management
function addGoal(title, targetDate)
function toggleGoalStatus(index)
function renderGoals(goals)

// Template selection
function selectTemplate(templateId)
function applyTemplate(templateId)

// Portfolio versioning
function saveVersion(studentId, portfolioData)
// Returns: void, manages max 10 versions

function getVersions(studentId)
// Returns: VersionSnapshot[]

function restoreVersion(studentId, versionIndex)

// Portfolio score calculation (mavjud, kengaytiriladi)
function calculatePortfolioScore(portfolioData)
// Returns: number (0-100)
```

### 4. Public Portfolio Module (`public.html`)

```javascript
// URL parsing
function getStudentIdFromURL()
// Returns: string | null

// Share link generation
function generateShareLink(studentId)
// Returns: string (full URL)

// Clipboard copy
function copyToClipboard(text)
// Returns: Promise<void>

// QR code rendering
function renderQRCode(url, containerId, size)
```

### 5. Auth Module (`auth.html`)

```javascript
// PIN validation
function validatePIN(pin)
// Returns: boolean (4-6 digit numeric)

// Session timeout check
function isSessionExpired(role, sessionStart)
// Returns: boolean

// Password change
function changePassword(userId, currentPass, newPass)
// Returns: { success: boolean, error?: string }

// PIN change
function changePIN(userId, currentPIN, newPIN)
// Returns: { success: boolean, error?: string }
```

### 6. CSV Parser (`shared.js` yoki inline)

```javascript
// Core parser
function parseCSV(csvString)
// Returns: { headers: string[], rows: Object[], malformedRows: number[] }

// Serializer (round-trip uchun)
function serializeToCSV(rows, headers)
// Returns: string

// Validation
function validateCSVHeaders(headers, required)
// Returns: boolean

function validateCSVRow(row, headers)
// Returns: boolean
```

---

## Data Models

### localStorage Schema

#### `users` — Foydalanuvchilar

```typescript
type Users = {
  [userId: string]: {
    role: 'teacher' | 'student';
    password: string | null;   // null = birinchi login
    pin?: string;              // faqat teacher uchun, 4-6 raqam
  }
}
```

#### `portfolios` — Portfolio ma'lumotlari

```typescript
type Portfolios = {
  [studentId: string]: Portfolio
}

type Portfolio = {
  fullName: string;
  birthDate: string;           // ISO date string
  region: string;
  school: string;
  major: string;
  certificates: Certificate[];
  grades: Grade[];
  achievements: Achievement[];
  activities: Activity[];
  personalStatement: string;
  gpa: string;                 // "4.50" format
  photoBase64?: string;        // base64 encoded image
  skills: Skill[];
  goals: Goal[];
  selectedTemplate?: 'classic' | 'modern' | 'minimal';
}

type Certificate = {
  name: string;
  type: string;
  date: string;
  expiry: string;
  org: string;
}

type Grade = {
  name: string;
  grade: number;               // 1.0 - 5.0
  year: string;
}

type Achievement = {
  title: string;
  level: string;               // 'Maktab' | 'Viloyat' | 'Respublika' | 'Xalqaro'
  place: string;
}

type Activity = {
  title: string;
  desc: string;
}

type Skill = {
  name: string;
  level: number;               // 1 - 100
}

type Goal = {
  title: string;
  targetDate: string;          // ISO date string
  status: 'Bajarilmagan' | 'Bajarilgan';
}
```

#### `portfolio_versions_{studentId}` — Versiya tarixi

```typescript
type VersionHistory = VersionSnapshot[]  // max 10 ta, eng yangi birinchi

type VersionSnapshot = {
  timestamp: string;           // ISO 8601: "2026-01-15T14:30:00.000Z"
  data: Portfolio;             // to'liq portfolio nusxasi
  summary: string;             // "Sertifikat qo'shildi" | "GPA yangilandi" | ...
}
```

#### Session va preferences

```typescript
// localStorage keys
'ep_logged_in'              // "true" | "false"
'ep_user_id'                // string
'ep_user_role'              // "teacher" | "student"
'ep_session_start'          // ISO timestamp string
'ep_dark_mode'              // "true" | "false"
'ep_dismissed_notifications' // JSON array of notification IDs: string[]
```

### Portfolio Score Calculation

Portfolio score (0–100%) quyidagi formula asosida hisoblanadi:

| Komponent | Maks ball | Shart |
|-----------|-----------|-------|
| GPA | 30 | GPA ≥ 4.5 → 30, ≥ 4.0 → 20, > 0 → 10 |
| Sertifikatlar | 20 | ≥ 5 → 20, ≥ 3 → 15, > 0 → 8 |
| Yutuqlar | 20 | ≥ 3 → 20, > 0 → 10 |
| Faoliyatlar | 15 | ≥ 3 → 15, > 0 → 8 |
| Shaxsiy bayonot | 15 | ≥ 500 so'z → 15, ≥ 300 → 10, > 0 → 5 |
| **Jami** | **100** | |

### GPA Bucket Ranges

| Bucket | Range |
|--------|-------|
| `low` | 1.0 ≤ GPA < 3.0 |
| `mid` | 3.0 ≤ GPA < 4.0 |
| `good` | 4.0 ≤ GPA < 4.5 |
| `excellent` | 4.5 ≤ GPA ≤ 5.0 |

### Session Timeout Rules

| Role | Timeout |
|------|---------|
| Teacher | 30 daqiqa inaktivlik |
| Student | 8 soat (inaktivlikdan qat'i nazar) |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Class Statistics Correctness

*For any* non-empty array of student portfolio objects, `calculateClassStats()` SHALL return a `totalCount` equal to the array length, an `avgGPA` equal to the arithmetic mean of all GPA values, and an `avgCompletion` equal to the arithmetic mean of all Portfolio_Score values.

**Validates: Requirements 1.1**

---

### Property 2: GPA Bucketing Completeness

*For any* array of student portfolios, `bucketGPAs()` SHALL place every student into exactly one bucket, and the sum of all bucket counts SHALL equal the total number of students.

**Validates: Requirements 1.2**

---

### Property 3: Completion Classification Completeness

*For any* array of student portfolios, `classifyCompletion()` SHALL return `above70 + below70 === totalStudents`.

**Validates: Requirements 1.3**

---

### Property 4: Top-5 Ordering and Membership

*For any* array of students, `getTop5Students()` SHALL return at most 5 items, all items SHALL be from the original array, and the result SHALL be sorted in descending order by Portfolio_Score (i.e., `result[i].score >= result[i+1].score` for all valid `i`).

**Validates: Requirements 1.4**

---

### Property 5: Portfolio Data Round-Trip (localStorage)

*For any* valid `Portfolio` object `data`, `JSON.parse(JSON.stringify(data))` SHALL produce an object that is deeply equal to `data` — no fields lost, no type coercion.

**Validates: Requirements 2.5, 2.8, 10.5**

---

### Property 6: Skills and Goals Persistence Round-Trip

*For any* array of `Skill` objects and any array of `Goal` objects, saving the portfolio to localStorage and reading it back SHALL produce arrays that are deeply equal to the originals.

**Validates: Requirements 2.5, 2.8**

---

### Property 7: Template ID Persistence

*For any* valid template identifier (`'classic'`, `'modern'`, `'minimal'`), saving `selectedTemplate` to localStorage and reading it back SHALL return the same identifier.

**Validates: Requirements 2.11**

---

### Property 8: Share Link Contains Student ID

*For any* non-empty `studentId` string, `generateShareLink(studentId)` SHALL return a URL string that contains `studentId` as a query parameter value and ends with `public.html?id={studentId}`.

**Validates: Requirements 3.1**

---

### Property 9: Dark Mode Preference Persistence

*For any* boolean dark mode value, saving it to `localStorage['ep_dark_mode']` and reading it back SHALL return the same value after page reload simulation.

**Validates: Requirements 4.3**

---

### Property 10: PIN Validation

*For any* string input, `validatePIN(input)` SHALL return `true` if and only if the input consists entirely of digits and has length between 4 and 6 inclusive.

**Validates: Requirements 5.1, 5.8**

---

### Property 11: Session Expiry (Teacher and Student)

*For any* session start timestamp `t` and role `r`, `isSessionExpired(r, t)` SHALL return `true` if and only if the elapsed time since `t` exceeds the role's timeout threshold (30 minutes for `'teacher'`, 8 hours for `'student'`).

**Validates: Requirements 5.3, 5.9**

---

### Property 12: Search Filter Correctness

*For any* student list and non-empty search query `q`, `filterStudents()` with that query SHALL return only students whose `fullName` or `id` contains `q` as a case-insensitive substring. No student matching the query SHALL be omitted.

**Validates: Requirements 6.1**

---

### Property 13: GPA Range Filter Correctness

*For any* student list and GPA range `[min, max]`, `filterStudents()` with that range SHALL return only students whose GPA satisfies `min <= gpa <= max`. No student outside the range SHALL appear in results.

**Validates: Requirements 6.2**

---

### Property 14: Portfolio Score Filter Correctness

*For any* student list and score range `[min, max]`, `filterStudents()` with that range SHALL return only students whose Portfolio_Score satisfies `min <= score <= max`.

**Validates: Requirements 6.3**

---

### Property 15: Sort Ordering Invariant

*For any* student list and sort option, `filterStudents()` with that sort option SHALL return a list where the ordering invariant holds for all adjacent pairs: ascending GPA means `result[i].gpa <= result[i+1].gpa`, descending GPA means `result[i].gpa >= result[i+1].gpa`, A–Z name means `result[i].name <= result[i+1].name` lexicographically.

**Validates: Requirements 6.4**

---

### Property 16: CSV Parse Round-Trip

*For any* array of objects with string values, `parseCSV(serializeToCSV(rows, headers))` SHALL produce an array deeply equal to the original `rows` array (same keys, same values, same count).

**Validates: Requirements 7.2, 10.1, 10.2**

---

### Property 17: CSV Malformed Row Skipping

*For any* CSV string where some rows have a different column count than the header row, `parseCSV()` SHALL include those rows in `malformedRows` and SHALL NOT include them in the `rows` output. The count of valid rows plus malformed rows SHALL equal the total non-header line count.

**Validates: Requirements 10.3**

---

### Property 18: CSV Duplicate ID Skipping

*For any* CSV import where some rows have IDs already present in `existingUsers`, `importStudents()` SHALL skip those rows and report them in `skipped`. The count of `added + skipped` SHALL equal the total valid row count.

**Validates: Requirements 7.5**

---

### Property 19: Notification Badge Count

*For any* student list with portfolio scores, `getTeacherNotifications()` SHALL return a `count` equal to the number of students whose Portfolio_Score is strictly less than 50.

**Validates: Requirements 8.1**

---

### Property 20: Student Banner Condition

*For any* portfolio score value `s`, the student banner SHALL be shown if and only if `s < 70`. For `s >= 70`, no incomplete banner SHALL be displayed.

**Validates: Requirements 8.5**

---

### Property 21: Dismissed Notifications Persistence

*For any* set of dismissed notification IDs, saving them to `localStorage['ep_dismissed_notifications']` and reading back SHALL return an array containing all the same IDs.

**Validates: Requirements 8.7**

---

### Property 22: Version History Max-10 Invariant

*For any* sequence of portfolio saves for a given student, the version history stored in `localStorage['portfolio_versions_{id}']` SHALL never exceed 10 entries. After the 11th save, the oldest entry SHALL be removed and the 10 most recent entries SHALL be retained.

**Validates: Requirements 9.3**

---

### Property 23: Version Snapshot Data Fidelity

*For any* portfolio save operation, the created `VersionSnapshot.data` SHALL be deeply equal to the portfolio data at the time of saving (no fields lost or mutated).

**Validates: Requirements 9.1**

---

### Property 24: localStorage Read with Missing Fields Returns Defaults

*For any* portfolio object stored in localStorage that is missing `fullName` or `major`, reading it via the safe reader SHALL return default placeholder values (e.g., empty string or `"—"`) without throwing a JavaScript error.

**Validates: Requirements 10.4**

---

## Error Handling

### localStorage Errors

```javascript
function safeGetItem(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return defaultValue
    return JSON.parse(raw)
  } catch (e) {
    console.warn(`localStorage read error for key "${key}":`, e)
    return defaultValue
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    // QuotaExceededError
    if (e.name === 'QuotaExceededError') {
      handleQuotaExceeded(key, value)
    }
    return false
  }
}
```

### Versioning Quota Exceeded

Requirement 9.7 ga muvofiq: `portfolio_versions_{id}` uchun kvota oshib ketsa, eng eski versiya o'chiriladi va qayta uriniladi:

```javascript
function saveVersion(studentId, data) {
  const key = `portfolio_versions_${studentId}`
  let versions = safeGetItem(key, [])
  versions.unshift({ timestamp: new Date().toISOString(), data, summary: generateSummary(data) })
  if (versions.length > 10) versions = versions.slice(0, 10)
  
  const success = safeSetItem(key, versions)
  if (!success) {
    // Kvota oshdi — eng eskisini o'chirib qayta urinish
    versions = versions.slice(0, versions.length - 1)
    safeSetItem(key, versions)
  }
}
```

### Photo Upload Validation

```javascript
function handlePhotoUpload(file) {
  const MAX_SIZE = 2 * 1024 * 1024  // 2 MB
  if (file.size > MAX_SIZE) {
    showAlert("Rasm hajmi 2 MB dan oshmasligi kerak", "Xatolik")
    return null
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

### Session Timeout

```javascript
function checkSession(role) {
  const sessionStart = localStorage.getItem('ep_session_start')
  if (!sessionStart) { logout(); return }
  
  const elapsed = Date.now() - new Date(sessionStart).getTime()
  const limit = role === 'teacher' ? 30 * 60 * 1000 : 8 * 60 * 60 * 1000
  
  if (elapsed > limit) {
    showAlert("Sessiya muddati tugadi. Qayta kiring.").then(logout)
  }
}

// Teacher uchun inaktivlik kuzatish
let inactivityTimer
function resetInactivityTimer() {
  clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => {
    showAlert("Sessiya muddati tugadi. Qayta kiring.").then(logout)
  }, 30 * 60 * 1000)
}
['mousemove', 'keydown', 'click'].forEach(e =>
  document.addEventListener(e, resetInactivityTimer)
)
```

### CSV Parsing Errors

```javascript
function parseCSV(csvString) {
  const lines = csvString.trim().split('\n')
  if (lines.length < 2) return { headers: [], rows: [], malformedRows: [] }
  
  const headers = lines[0].split(',').map(h => h.trim())
  const rows = []
  const malformedRows = []
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (cols.length !== headers.length) {
      malformedRows.push(i)
      continue
    }
    const row = {}
    headers.forEach((h, j) => row[h] = cols[j].trim())
    rows.push(row)
  }
  
  return { headers, rows, malformedRows }
}
```

---

## Testing Strategy

### Dual Testing Approach

Ushbu loyiha uchun ikki qatlamli test strategiyasi qo'llaniladi:

1. **Unit / Example tests** — aniq misollar, edge case lar, UI xatti-harakatlar
2. **Property-based tests** — universal xususiyatlar, katta input maydoni

### Property-Based Testing Library

Vanilla JS loyihasi uchun **[fast-check](https://github.com/dubzzz/fast-check)** CDN orqali ishlatiladi:

```html
<script src="https://cdn.jsdelivr.net/npm/fast-check/lib/bundle/fast-check.min.js"></script>
```

Har bir property test **kamida 100 iteratsiya** bilan ishga tushiriladi.

### Test Tag Format

Har bir property test quyidagi format bilan belgilanadi:

```javascript
// Feature: eportfolio-pro-upgrade, Property N: <property_text>
fc.assert(fc.property(...), { numRuns: 100 })
```

### Unit Test Coverage

| Modul | Test turlari |
|-------|-------------|
| `calculateClassStats` | Property (1), Edge (bo'sh massiv) |
| `bucketGPAs` | Property (2), Edge (chegaraviy GPA qiymatlar) |
| `classifyCompletion` | Property (3) |
| `getTop5Students` | Property (4), Edge (< 5 student) |
| `validatePIN` | Property (10), Edge (bo'sh, harflar, 3 ta raqam, 7 ta raqam) |
| `isSessionExpired` | Property (11), Edge (aynan 30 daqiqa) |
| `filterStudents` | Property (12, 13, 14, 15), Edge (bo'sh qidiruv) |
| `parseCSV` / `serializeToCSV` | Property (16, 17, 18) |
| `generateShareLink` | Property (8) |
| `saveVersion` / `getVersions` | Property (22, 23) |
| `safeGetItem` | Property (24), Edge (null, buzilgan JSON) |
| `JSON round-trip` | Property (5, 6, 7) |
| `getTeacherNotifications` | Property (19) |
| `student banner condition` | Property (20) |
| `dismissed notifications` | Property (21) |

### Integration Test Coverage

| Scenario | Fayl |
|----------|------|
| Teacher login with PIN | `auth.html` |
| CSV import end-to-end | `teacher.html` |
| Portfolio save → version created | `portfolio-editor.html` |
| Public portfolio read-only view | `public.html` |
| Dark mode persists across pages | All pages |

### Smoke Tests

| Check | Fayl |
|-------|------|
| Chart.js CDN loads | `teacher.html` |
| QRCode.js CDN loads | `student.html`, `public.html` |
| html2canvas + jsPDF CDN loads | `student.html` |
| localStorage available | All pages |

### PBT Applicability Assessment

Bu loyiha PBT uchun mos, chunki:
- Ko'plab pure funksiyalar mavjud: `parseCSV`, `filterStudents`, `bucketGPAs`, `validatePIN`, `isSessionExpired`, `generateShareLink`, `calculateClassStats`
- Input maydoni katta: ixtiyoriy student massivlari, ixtiyoriy CSV stringlar, ixtiyoriy timestamp lar
- 100 iteratsiya chegaraviy qiymatlarni (GPA = 3.0, 4.0, 4.5; PIN uzunligi 3, 4, 6, 7) avtomatik topadi
- Barcha funksiyalar in-memory ishlaydi — tashqi chaqiruvlar yo'q
