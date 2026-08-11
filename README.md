# 🏫 Bogcham — Maktabgacha ta'lim boshqaruv tizimi

Bog'cha uchun to'liq, zamonaviy va biznesga tayyor boshqaruv tizimi. Telefon, planshet va kompyuterga moslashgan (responsive), tungi rejim (dark mode) bilan.

## ✨ Imkoniyatlar

- **Bosh sahifa** — jonli statistika: bugungi davomat, bolalar, guruhlar, oylik daromad, qarzlar, grafiklar
- **Bolalar** — qo'shish/tahrirlash/o'chirish, guruh va ota-ona bilan bog'lash, qidiruv va filtr
- **Ota-onalar** — reestr, telefon/email/manzil, nechta bolasi borligi, **portal loginini yaratish**
- **Tarbiyachilar** — lavozim, guruh, maosh, ishga kirgan sana
- **Guruhlar** — yosh oralig'i, sig'im, oylik to'lov, rang, to'ldirilganlik foizi
- **Davomat** — har kuni barcha bolalar uchun "Keldi / Kech / Kelmadi", **avtomatik saqlanadi** (tugma bosilishi bilan), oy bo'yicha hisobot
- **To'lovlar** — oylik to'lovni qayd qilish, kim to'lagan / qarzdor, jami yig'ma, tarix
- **Xarajatlar** — kategoriyalar, diagramma, oylik taqqoslash
- **Menyu** — kunlik ovqatlanish rejasi (nonushta, tushlik, choy) bir haftaga
- **Hisobot** — daromad/xarajat/foyda, davomat foizi, **Excel (CSV) va PDF eksport**
- **Xabarnoma** — to'lov qarzi va davomatsiz bolalar ota-onalariga tayyor SMS/Telegram matnlar
- **Zaxira (Backup)** — barcha ma'lumotlarni JSON faylga yuklab olish va qayta tiklash
- **Audit jurnali** — kim qachon nimani o'zgartirgani
- **Ota-ona portali** — ota-onalar o'z loginlari bilan kirib: bolalar profili va davomati, to'lov holati, **web orqali bank kartasi bilan onlayn to'lov** (admin tasdiqlaguncha "kutilmoqda", tasdiqlangach xabar keladi), haftalik ovqatlanish menyusi, xabarlar tarixi va **ariza/talabnoma** yuborish
- **Tarbiyachi paneli** — tarbiyachilar o'z guruhiga biriktirilgan bolalar ro'yxati va kunlik davomatni belgilaydi; admin "Tarbiyachilar" sahifasida login yaratadi
- **Arizalar** — ota-onalarning talabnomalari: qabul qilish va bajarilgan deb belgilash
- **Qidiruv** — har bir jadval sahifasida jonli qidiruv (bolalar, ota-onalar, guruhlar, tarbiyachilar, to'lovlar, xarajatlar, arizalar, portal xabarlari)
- **Foydalanuvchilar** — administrator, xodimlar, ota-onalar va tarbiyachilar, rol boshqaruvi
- **Sozlamalar** — muassasa nomi, manzil, telefon, email, pul birligi, parol, "Xavfli hudud" (ma'lumotlarni tozalash)

## 🚀 Ishga tushirish

```bash
npm install
npm start
```

Brauzerda oching: **http://localhost:3000**

> Boshlang'ich login: **mexriddin** (parol: **mexriddin123**)
> Operator: **operator** / **operator123**
> Tarbiyachi paneli: admin "Tarbiyachilar" sahifasida "Login yaratish" bosiladi (login — telefon raqami, standart parol — tarbiyachi123)

Ma'lumotlar avtomatik tarzda `data/bogcha.db` faylida saqlanadi (SQLite). Dastlab tizim **toza** holatda ishga tushadi — faqat `mexriddin` (admin) va `operator` foydalanuvchilari mavjud, hech qanday namuna ma'lumot yaratilmaydi.

Namuna (demo) ma'lumotlar bilan ishga tushirish va testlarni yugurtirish uchun:

```bash
set SEED_DEMO=1 && npm start   # Windows (PowerShell: $env:SEED_DEMO=1; npm start)
```

## ☁️ VPS serverga joylash (24/7 — noutbuk o'chganida ham ishlaydi)

Tizim **Docker + Caddy** bilan ishlaydi — HTTPS avtomatik (bepul sertifikat), ma'lumotlar saqlanib qoladi, server qayta yuklansa ham o'zi qayta ishga tushadi.

**1. VPS sotib oling** (Ubuntu 22.04/24.04, 1-2 GB RAM yetarli). Masalan: Hetzner, DigitalOcean, Vultr, Oracle Free, yoki O'zbekiston provayderlari.

**2. Domen oling** (masalan `bogcha.uz` — ~20 000 so'm/yil) va uni VPS IP manziliga (A-record) ulang. Dome `A` rekord → VPS IP.

**3. SSH orqali serverga kiring:**

```bash
ssh root@SIZNING_IP
```

**4. Loyihani yuklab oling** — Windows da papkaga kirib:

```bash
scp -r . root@SIZNING_IP:/root/bogcham
```

(Windows PowerShell: `scp -r "C:\Users\user\Downloads\Telegram Desktop\bogcham web sayt va mukammal" root@IP:/root/bogcham`)

**5. O'rnatish:**

```bash
cd /root/bogcham
chmod +x install.sh
./install.sh
```

Skript: domeningizni so'raydi, Docker va Caddy o'rnatadi, HTTPS bilan saytni ochadi.

**6. Natija:** saytingiz `https://domeningiz.uz` da 24/7 ochiq bo'ladi. Login: `mexriddin` / `mexriddin123`.

**7. Eski noutbukdagi ma'lumotlarni ko'chirish:** noutbukda tizimga kirib `Sozlamalar → Backup` dan JSON fayl yuklab oling, keyin VPS'dagi saytda `Sozlamalar → Tiklash` orqali yuklang.

> Eslatma: eski TryCloudflare bepul havola (`*.trycloudflare.com`) noutbuk o'chsa ishlamaydi — u faqat sinov uchun. VPS o'rnatishdan keyin doimiy domeningiz bo'ladi.

## 🛠 Texnologiyalar

- **Backend:** Node.js, Express, node:sqlite (Node 22+ ichidagi SQLite, qo'shimcha kompilyatsiya kerak emas)
- **Auth:** express-session + bcryptjs (parollar shifrlangan holda saqlanadi)
- **Frontend:** Vanilla JS SPA (bitta sahifa), responsiv CSS, dark mode

## 📁 Loyiha tuzilishi

```
bogcham/
├── server.js        # Server va REST API
├── db.js            # Ma'lumotlar bazasi (schema + seed)
├── public/
│   ├── index.html   # Ilova sahifasi (login + panel)
│   ├── style.css    # Dizayn (responsive, dark mode)
│   └── app.js       # Frontend mantiq
├── data/            # SQLite bazasi (avtomatik yaratiladi)
└── test-api.js      # API testlari
```

## 🧪 Testlar

Testlar namuna ma'lumotlarga tayanadi — avval serverni `SEED_DEMO=1` bilan ishga tushiring:

```bash
set SEED_DEMO=1 && npm start
npm test:api        # API endpoin'tlarini tekshiradi
npm test:ui         # Brauzer testlari (Edge/Chrome kerak)
npm test:mobile     # Telefon/planshet moslashuvini tekshiradi
```

## 🔒 Eslatma

Parolni o'zgartirishni unutmang (`Sozlamalar → Parolni o'zgartirish`). Tizimni internetda ishlatishdan oldin proksi-server (masalan Nginx) orqasida HTTPS bilan ishga tushiring va sessiya kalitini o'zgartiring.
