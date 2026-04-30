# Vercel'ga Deploy qilish yo'riqnomasi

## Usul 1: GitHub orqali (Tavsiya etiladi)

### 1. GitHub repository yarating
1. [GitHub](https://github.com) ga kiring
2. "New repository" tugmasini bosing
3. Repository nomi: `e-portfolio-pro`
4. Public yoki Private tanlang
5. "Create repository" bosing

### 2. Loyihani GitHub'ga yuklang
```bash
# Git'ni ishga tushiring (agar hali qilmagan bo'lsangiz)
git init

# Barcha fayllarni qo'shing
git add .

# Commit qiling
git commit -m "Initial commit: E-Portfolio Pro"

# GitHub repository'ni qo'shing (o'zingizning URL'ingizni kiriting)
git remote add origin https://github.com/YOUR_USERNAME/e-portfolio-pro.git

# Push qiling
git branch -M main
git push -u origin main
```

### 3. Vercel'ga deploy qiling
1. [Vercel](https://vercel.com) ga kiring (GitHub akkaunt bilan)
2. "Add New Project" tugmasini bosing
3. GitHub repository'ni tanlang: `e-portfolio-pro`
4. "Import" bosing
5. Sozlamalar:
   - **Framework Preset:** Other
   - **Root Directory:** ./
   - **Build Command:** (bo'sh qoldiring)
   - **Output Directory:** ./
6. "Deploy" tugmasini bosing
7. 1-2 daqiqada deploy tugaydi!

### 4. Tayyor!
Vercel sizga havola beradi, masalan:
- `https://e-portfolio-pro.vercel.app`
- Yoki o'z domeningizni ulang

---

## Usul 2: Vercel CLI orqali

### 1. Vercel CLI'ni o'rnating
```bash
npm install -g vercel
```

### 2. Login qiling
```bash
vercel login
```

### 3. Deploy qiling
```bash
# Loyiha papkasida
vercel

# Savollar:
# - Set up and deploy? Y
# - Which scope? (o'zingizni tanlang)
# - Link to existing project? N
# - Project name? e-portfolio-pro
# - Directory? ./
# - Override settings? N
```

### 4. Production'ga deploy
```bash
vercel --prod
```

---

## Usul 3: Vercel Dashboard orqali (Drag & Drop)

### 1. Fayllarni zip qiling
Barcha HTML, JS, CSS fayllarni bir papkaga joylashtiring

### 2. Vercel Dashboard'ga kiring
1. [Vercel Dashboard](https://vercel.com/dashboard)
2. "Add New Project" → "Deploy from template" o'rniga
3. Fayllarni drag & drop qiling

### 3. Deploy
Avtomatik deploy boshlanadi!

---

## Muhim eslatmalar

### LocalStorage haqida
⚠️ **Diqqat:** Loyiha LocalStorage ishlatadi. Bu degani:
- Ma'lumotlar faqat brauzerda saqlanadi
- Har bir foydalanuvchi o'z kompyuterida alohida ma'lumotlarga ega
- Server yo'q, backend yo'q
- Bu demo/prototip uchun yaxshi, lekin production uchun backend kerak

### Production uchun tavsiyalar
Agar haqiqiy production uchun ishlatmoqchi bo'lsangiz:
1. Backend qo'shing (Node.js, Python, PHP)
2. Ma'lumotlar bazasi qo'shing (MongoDB, PostgreSQL, MySQL)
3. Authentication qo'shing (JWT, OAuth)
4. File upload uchun cloud storage (AWS S3, Cloudinary)

### Custom domen ulash
1. Vercel Dashboard → Project → Settings → Domains
2. O'z domeningizni kiriting
3. DNS sozlamalarini yangilang
4. Tayyor!

---

## Muammolar va yechimlar

### 404 xatolik
- `vercel.json` faylini tekshiring
- Routes to'g'ri sozlanganligini tekshiring

### LocalStorage ishlamayapti
- HTTPS ishlatilganligini tekshiring
- Browser console'da xatolarni tekshiring

### Fayllar yuklanmayapti
- Barcha fayllar to'g'ri joyda ekanligini tekshiring
- `.gitignore` da kerakli fayllar yo'qligini tekshiring

---

## Yordam

Muammo bo'lsa:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

Omad! 🚀
