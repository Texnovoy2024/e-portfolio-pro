# Requirements Document

## Introduction

E-Portfolio Pro Upgrade — mavjud 5 ta HTML fayldan iborat (index.html, auth.html, teacher.html, student.html, portfolio-editor.html) localStorage-asosidagi elektron portfolio tizimini professional darajaga ko'tarish loyihasi. Tizim vanilla HTML/CSS/JS texnologiyalari va CDN kutubxonalari (Chart.js, html2canvas, jsPDF, QRCode.js) asosida ishlaydi. Backend va Firebase yo'q — barcha ma'lumotlar localStorage da saqlanadi.

Upgrade 9 ta asosiy yo'nalishni qamrab oladi: Teacher Analytics Dashboard, Student Profile Upgrade, Public Portfolio & Share, UI/UX Upgrade, Security & Auth, Search & Filter, Bulk Import, Notification System, va Portfolio Versioning.

---

## Glossary

- **System**: E-Portfolio Pro tizimi (barcha 5 ta HTML fayl majmuasi)
- **Teacher**: O'qituvchi — tizimga maxsus PIN bilan kiruvchi, studentlarni boshqaruvchi foydalanuvchi
- **Student**: O'quvchi — o'z ID si bilan tizimga kiruvchi, portfoliosini ko'ruvchi va tahrir qiluvchi foydalanuvchi
- **Portfolio**: Studentning barcha akademik ma'lumotlari, sertifikatlari, yutuqlari va faoliyatlarini o'z ichiga olgan raqamli hujjat
- **localStorage**: Brauzerning mahalliy saqlash mexanizmi — barcha ma'lumotlar shu yerda saqlanadi
- **Dashboard**: O'qituvchi uchun statistika va boshqaruv paneli
- **GPA**: Grade Point Average — o'rtacha akademik ball (1.0–5.0 shkala)
- **Portfolio_Score**: Portfolioning to'liqlik va sifat ko'rsatkichi (0–100%)
- **QR_Code**: Portfolio sahifasiga yo'naltiruvchi ikki o'lchamli shtrix-kod
- **Public_View**: Autentifikatsiyasiz ko'rish mumkin bo'lgan portfolio sahifasi
- **Share_Link**: Studentning public portfoliosiga yo'naltiruvchi noyob URL
- **Session**: Foydalanuvchining tizimga kirgan holati (localStorage da saqlanadi)
- **PIN**: Teacher uchun maxsus raqamli kirish kodi (4–6 xona)
- **CSV**: Comma-Separated Values — ko'p studentni bir vaqtda import qilish uchun fayl formati
- **Version**: Portfolio ma'lumotlarining vaqt tamg'asi bilan saqlangan nusxasi
- **Skill**: Studentning ko'nikmasi — nomi va foizli darajasi bilan ifodalanadi
- **Goal**: Studentning maqsadi — sarlavha, muddat va holat (bajarilgan/bajarilmagan) bilan ifodalanadi
- **Notification**: Tizim ichidagi eslatma xabari
- **Dark_Mode**: Qoʻngʻir/qora fon asosidagi interfeys rejimi
- **Sidebar**: Sahifaning chap tomonidagi navigatsiya paneli
- **Template**: Portfolio ko'rinishi uchun oldindan tayyorlangan dizayn varianti
- **Chart**: Chart.js kutubxonasi yordamida chizilgan statistik grafik
- **Bulk_Import**: CSV fayl orqali bir vaqtda ko'p student qo'shish funksiyasi
- **Auth_Module**: Autentifikatsiya va avtorizatsiya logikasi (auth.html)
- **Portfolio_Editor**: portfolio-editor.html — portfolio ma'lumotlarini tahrirlash sahifasi
- **Teacher_Panel**: teacher.html — o'qituvchi boshqaruv paneli
- **Student_Panel**: student.html — student portfolio ko'rish sahifasi

---

## Requirements

---

### Requirement 1: Teacher Analytics Dashboard

**User Story:** As a Teacher, I want to see statistical charts and class overview on my dashboard, so that I can monitor student progress and identify students who need attention.

#### Acceptance Criteria

1. WHEN the Teacher opens teacher.html, THE Teacher_Panel SHALL display a summary statistics section showing total student count, average class GPA, and average portfolio completion percentage.

2. WHEN the Teacher_Panel loads and at least one Student exists, THE Teacher_Panel SHALL render a GPA distribution bar chart using Chart.js CDN, grouping students into ranges: 1.0–2.9, 3.0–3.9, 4.0–4.4, 4.5–5.0.

3. WHEN the Teacher_Panel loads and at least one Student exists, THE Teacher_Panel SHALL render a portfolio completion rate doughnut chart using Chart.js CDN, showing the percentage of students with Portfolio_Score above 70% versus below.

4. WHEN the Teacher_Panel loads, THE Teacher_Panel SHALL display a "Top 5 Students" list sorted by Portfolio_Score in descending order, showing each student's name, GPA, and Portfolio_Score.

5. WHEN a Student's portfolio data changes and the Teacher refreshes teacher.html, THE Teacher_Panel SHALL recalculate and re-render all charts and statistics to reflect the updated data.

6. IF no Students exist in localStorage, THEN THE Teacher_Panel SHALL display a placeholder message instead of charts, stating that no data is available yet.

---

### Requirement 2: Student Profile Upgrade

**User Story:** As a Student, I want to upload a profile photo, add skills with progress bars, and set personal goals, so that my portfolio is more complete and visually informative.

#### Acceptance Criteria

1. WHEN the Student clicks the photo upload button in portfolio-editor.html, THE Portfolio_Editor SHALL open a file picker accepting image files (JPEG, PNG, WebP) with a maximum size of 2 MB.

2. WHEN the Student selects a valid image file, THE Portfolio_Editor SHALL convert the image to a base64 string and store it in the portfolio's localStorage entry under the key `photoBase64`.

3. IF the Student selects an image file larger than 2 MB, THEN THE Portfolio_Editor SHALL display an error message "Rasm hajmi 2 MB dan oshmasligi kerak" and SHALL NOT save the file.

4. WHEN the Student adds a Skill entry with a name and a proficiency level between 1 and 100, THE Portfolio_Editor SHALL render the skill as a labeled progress bar in the skills section.

5. WHEN the Student saves the portfolio, THE Portfolio_Editor SHALL persist all Skill entries (name and level) in localStorage under the key `skills` as a JSON array.

6. WHEN the Student adds a Goal with a title and a target date, THE Portfolio_Editor SHALL add the goal to the goals list with status "Bajarilmagan" (incomplete) by default.

7. WHEN the Student marks a Goal as complete, THE Portfolio_Editor SHALL update the goal's status to "Bajarilgan" (complete) and SHALL visually distinguish it from incomplete goals.

8. WHEN the Student saves the portfolio, THE Portfolio_Editor SHALL persist all Goal entries (title, targetDate, status) in localStorage under the key `goals` as a JSON array.

9. WHEN the Student views student.html, THE Student_Panel SHALL display the profile photo from `photoBase64`, skills with progress bars, and goals with their statuses.

10. WHEN the Student opens portfolio-editor.html, THE Portfolio_Editor SHALL offer at least 3 distinct portfolio template options (e.g., Classic, Modern, Minimal) that change the visual layout of the portfolio preview.

11. WHEN the Student selects a template, THE Portfolio_Editor SHALL save the selected template identifier in localStorage under the key `selectedTemplate` and SHALL apply the corresponding layout in student.html.

---

### Requirement 3: Public Portfolio & Share

**User Story:** As a Teacher or Student, I want each student to have a shareable public portfolio link, so that the portfolio can be viewed without logging in.

#### Acceptance Criteria

1. THE System SHALL generate a unique Share_Link for each Student in the format `public.html?id={studentId}` where `{studentId}` is the student's unique identifier.

2. WHEN the Teacher views a student card in teacher.html, THE Teacher_Panel SHALL display a "Ulashish" (Share) button that copies the Share_Link to the clipboard.

3. WHEN the Student views student.html, THE Student_Panel SHALL display a "Ulashish" button that copies the Share_Link to the clipboard.

4. WHEN a user opens a Share_Link (public.html?id={studentId}), THE System SHALL display the student's portfolio in read-only mode without requiring authentication.

5. IF a user opens a Share_Link with a non-existent studentId, THEN THE System SHALL display a "Portfolio topilmadi" (Portfolio not found) message.

6. WHEN the Student's portfolio is displayed in public.html, THE System SHALL render an enhanced QR_Code that encodes the full Share_Link URL, with a minimum size of 150×150 pixels.

7. WHEN the Share_Link is copied to the clipboard, THE System SHALL display a temporary success notification "Havola nusxalandi!" for 3 seconds.

8. THE Public_View SHALL display all portfolio sections (photo, personal info, skills, certificates, grades, achievements, activities, personal statement, goals) in read-only format.

---

### Requirement 4: UI/UX Upgrade

**User Story:** As a Teacher or Student, I want a modern interface with dark mode, sidebar navigation, and responsive mobile design, so that the system is comfortable to use on any device.

#### Acceptance Criteria

1. THE System SHALL provide a dark mode toggle button visible on all pages (teacher.html, student.html, portfolio-editor.html).

2. WHEN the user activates dark mode, THE System SHALL apply a dark color scheme (dark backgrounds, light text) to all visible elements on the current page.

3. WHEN the user activates or deactivates dark mode, THE System SHALL save the preference in localStorage under the key `ep_dark_mode` and SHALL apply it automatically on subsequent page loads.

4. WHEN the Teacher opens teacher.html, THE Teacher_Panel SHALL display a collapsible sidebar navigation containing links to: Student List, Analytics Dashboard, Bulk Import, and Settings sections.

5. WHEN the Student opens student.html, THE Student_Panel SHALL display a collapsible sidebar navigation containing links to: Portfolio View, Edit Portfolio, Share, and Settings sections.

6. WHEN the page width is less than 768 pixels, THE System SHALL collapse the sidebar automatically and display a hamburger menu icon to toggle it.

7. WHEN the Teacher_Panel or Student_Panel loads, THE System SHALL apply entrance animations (fade-in or slide-in) to dashboard cards and chart containers with a duration not exceeding 500 milliseconds.

8. THE System SHALL use a consistent design language across all pages: rounded corners (border-radius ≥ 12px), consistent color palette, and uniform button styles.

9. WHEN the user interacts with buttons, THE System SHALL provide visual hover and active state feedback (color change or scale transform) within 150 milliseconds.

---

### Requirement 5: Security & Authentication Upgrade

**User Story:** As a Teacher, I want to protect my account with a PIN and have session timeout, so that unauthorized users cannot access the teacher panel.

#### Acceptance Criteria

1. WHEN a new Teacher account is created for the first time, THE Auth_Module SHALL prompt the Teacher to set a 4-to-6-digit numeric PIN in addition to the existing password.

2. WHEN the Teacher logs in, THE Auth_Module SHALL require both the password and the PIN to grant access to teacher.html.

3. WHEN the Teacher has been inactive (no mouse movement, keyboard input, or click events) for 30 consecutive minutes, THE System SHALL automatically log out the Teacher and redirect to auth.html.

4. WHEN the session timeout occurs, THE System SHALL display a modal notification "Sessiya muddati tugadi. Qayta kiring." before redirecting.

5. WHEN the Teacher navigates to the Settings section, THE Teacher_Panel SHALL provide a "Parolni o'zgartirish" (Change Password) form requiring the current password and a new password of at least 6 characters.

6. WHEN the Teacher submits the Change Password form with a correct current password and a valid new password, THE Auth_Module SHALL update the password in localStorage and display a success message.

7. IF the Teacher submits the Change Password form with an incorrect current password, THEN THE Auth_Module SHALL display an error message "Joriy parol noto'g'ri" and SHALL NOT update the password.

8. WHEN the Teacher navigates to the Settings section, THE Teacher_Panel SHALL provide a "PIN ni o'zgartirish" (Change PIN) form requiring the current PIN and a new 4-to-6-digit numeric PIN.

9. WHILE the Student is logged in, THE System SHALL maintain the session for a maximum of 8 hours, after which THE System SHALL automatically log out the Student.

---

### Requirement 6: Search & Filter

**User Story:** As a Teacher, I want to search for students by name or ID and filter them by GPA or portfolio completion, so that I can quickly find specific students.

#### Acceptance Criteria

1. WHEN the Teacher types in the search input field in teacher.html, THE Teacher_Panel SHALL filter the displayed student cards in real time, showing only students whose name or ID contains the typed string (case-insensitive).

2. WHEN the Teacher selects a GPA range filter (e.g., "4.5–5.0", "4.0–4.4", "3.0–3.9", "1.0–2.9"), THE Teacher_Panel SHALL display only student cards whose GPA falls within the selected range.

3. WHEN the Teacher selects a portfolio completion filter (e.g., "70% dan yuqori", "50–70%", "50% dan past"), THE Teacher_Panel SHALL display only student cards whose Portfolio_Score falls within the selected range.

4. WHEN the Teacher selects a sort option ("GPA bo'yicha o'sish", "GPA bo'yicha kamayish", "Ism bo'yicha A–Z", "Portfolio Score bo'yicha"), THE Teacher_Panel SHALL re-render the student list in the selected order.

5. WHEN the search input is cleared and all filters are reset, THE Teacher_Panel SHALL display all students in the default order.

6. IF the search or filter combination returns no results, THEN THE Teacher_Panel SHALL display a "Natija topilmadi" (No results found) message.

---

### Requirement 7: Bulk Import via CSV

**User Story:** As a Teacher, I want to import multiple students at once using a CSV file, so that I can set up a class quickly without adding students one by one.

#### Acceptance Criteria

1. WHEN the Teacher clicks the "CSV import" button in teacher.html, THE Teacher_Panel SHALL open a file picker accepting only `.csv` files.

2. WHEN the Teacher selects a valid CSV file, THE System SHALL parse the file expecting the following column headers in the first row: `id`, `fullName`, `major`, `school`, `region`.

3. WHEN the CSV is parsed successfully, THE System SHALL display a preview table showing all rows before import, with a "Tasdiqlash" (Confirm) and "Bekor qilish" (Cancel) button.

4. WHEN the Teacher confirms the import, THE System SHALL create a Student account in localStorage for each valid CSV row, using the `id` column as the student identifier, and SHALL initialize an empty portfolio for each student.

5. IF a CSV row contains an `id` that already exists in localStorage, THEN THE System SHALL skip that row and SHALL report the skipped IDs in a summary message after import.

6. IF the CSV file is missing required column headers (`id` or `fullName`), THEN THE System SHALL display an error message "CSV fayl noto'g'ri formatda" and SHALL NOT import any rows.

7. WHEN the import is complete, THE System SHALL display a summary: "X ta student qo'shildi, Y ta o'tkazib yuborildi" (X students added, Y skipped).

8. THE System SHALL support CSV files with a maximum of 200 rows per import operation.

---

### Requirement 8: Notification System

**User Story:** As a Teacher, I want to see notifications about students who have not completed their portfolios, so that I can follow up with them.

#### Acceptance Criteria

1. WHEN the Teacher opens teacher.html, THE Teacher_Panel SHALL display a notification badge on the notification icon showing the count of students whose Portfolio_Score is below 50%.

2. WHEN the Teacher clicks the notification icon, THE Teacher_Panel SHALL display a dropdown list of notifications, each showing the student's name and their current Portfolio_Score.

3. WHEN a student's Portfolio_Score rises to 50% or above, THE System SHALL remove the corresponding notification from the Teacher's notification list on the next page load.

4. WHEN the Teacher clicks a notification item, THE Teacher_Panel SHALL navigate to that student's portfolio editor page (portfolio-editor.html?id={studentId}).

5. WHEN the Student opens student.html and their Portfolio_Score is below 70%, THE Student_Panel SHALL display an inline banner notification: "Portfolioingiz {score}% to'ldirilgan. To'liq to'ldirish uchun tahrirlang." where `{score}` is the current Portfolio_Score.

6. WHEN the Student's Portfolio_Score reaches 100%, THE Student_Panel SHALL display a congratulatory notification: "Tabriklaymiz! Portfolioingiz to'liq to'ldirildi."

7. THE System SHALL store dismissed notifications in localStorage under the key `ep_dismissed_notifications` so that dismissed notifications do not reappear on subsequent page loads.

---

### Requirement 9: Portfolio Versioning

**User Story:** As a Student or Teacher, I want each portfolio save to create a version history, so that previous versions can be reviewed or restored.

#### Acceptance Criteria

1. WHEN the Portfolio_Editor saves a portfolio (via the "Saqlash" button), THE System SHALL create a version snapshot containing all current portfolio data and a timestamp in ISO 8601 format.

2. THE System SHALL store version snapshots in localStorage under the key `portfolio_versions_{studentId}` as a JSON array, with the most recent version first.

3. THE System SHALL retain a maximum of 10 version snapshots per student; WHEN a new version is saved and the count exceeds 10, THE System SHALL delete the oldest version.

4. WHEN the Teacher or Student opens the version history panel for a student, THE System SHALL display a list of saved versions showing the version number, timestamp (formatted as "DD.MM.YYYY HH:mm"), and a summary of changes (e.g., "Sertifikat qo'shildi", "GPA yangilandi").

5. WHEN the Teacher or Student selects a version from the history list and clicks "Tiklash" (Restore), THE System SHALL display a confirmation modal: "Bu versiyani tiklashni xohlaysizmi? Joriy ma'lumotlar o'zgaradi."

6. WHEN the restore is confirmed, THE System SHALL overwrite the current portfolio data in localStorage with the selected version's data and SHALL reload the portfolio editor with the restored data.

7. IF localStorage quota is exceeded when saving a new version, THEN THE System SHALL delete the oldest version snapshot for that student and SHALL retry the save operation once.

8. THE System SHALL display the version count indicator (e.g., "5/10 versiya") in the portfolio editor so the user knows how many versions are stored.

---

### Requirement 10: Parser & Data Integrity (CSV and localStorage)

**User Story:** As a Teacher, I want the CSV import parser to reliably parse and validate data, so that corrupted or malformed data does not enter the system.

#### Acceptance Criteria

1. WHEN the CSV_Parser receives a CSV string, THE CSV_Parser SHALL parse it into a JavaScript array of objects where each object's keys correspond to the CSV header row values.

2. WHEN the CSV_Parser parses a valid CSV string and the result is serialized back to CSV format and parsed again, THE CSV_Parser SHALL produce an equivalent array of objects (round-trip property).

3. IF the CSV_Parser receives a string with inconsistent column counts across rows, THEN THE CSV_Parser SHALL skip malformed rows and SHALL include them in the skipped-rows report.

4. WHEN the System reads portfolio data from localStorage, THE System SHALL validate that required fields (`fullName`, `major`) are present; IF they are missing, THEN THE System SHALL display default placeholder values instead of throwing a JavaScript error.

5. WHEN the System writes portfolio data to localStorage, THE System SHALL serialize the data using `JSON.stringify` and SHALL verify that `JSON.parse(JSON.stringify(data))` produces an equivalent object before saving.

