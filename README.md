# 🚀 FinPredict — AI-Powered Cash Flow Forecasting

<div align="center">

![FinPredict](https://img.shields.io/badge/FinPredict-Capstone_Project-D4FF00?style=for-the-badge&labelColor=000000)
![LSTM](https://img.shields.io/badge/Model-LSTM_37_Features-A85CF9?style=for-the-badge&labelColor=000000)
![Status](https://img.shields.io/badge/Status-Production-4ade80?style=for-the-badge&labelColor=000000)

**Aplikasi peramalan arus kas (*cash flow forecasting*) berbasis AI yang dirancang untuk generasi muda.**  
Memprediksi risiko *overspending* dalam 30 hari ke depan menggunakan model **LSTM** dengan **37 fitur keuangan**.

</div>

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Tech Stack](#-tech-stack)
- [AI/ML Pipeline](#-aiml-pipeline)
- [Struktur Proyek](#-struktur-proyek)
- [Instalasi & Setup](#-instalasi--setup)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Keamanan](#-keamanan)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 📊 Dashboard Real-Time
- Ringkasan pemasukan, pengeluaran, dan saldo bersih bulan berjalan
- Grafik **Proyeksi Saldo** yang memadukan data historis dan prediksi AI 30 hari ke depan
- Distribusi pengeluaran per kategori (Bar Chart)
- **Badge AI AKTIF** dengan skor akurasi model secara real-time

### 🤖 AI Analytics (Deep Analysis)
- Proyeksi arus kas *dual-line* (historis vs prediksi LSTM)
- Hasil analisis model: status **AMAN / BAHAYA**, probabilitas risiko, dan rekomendasi
- Distribusi pengeluaran per kategori
- Deteksi anomali transaksi dari notifikasi WARNING/DANGER
- Analisis pola pengeluaran (hari tertinggi) dan peluang menabung
- Wawasan perilaku keuangan dengan progress bar rasio pengeluaran/pemasukan
- Tombol **Generate AI** untuk memicu analisis ulang

### 🔔 Early Warning System (Peringatan Dini)
- Kartu **Peringatan Dini** di Dashboard jika proyeksi melebihi anggaran
- Notifikasi otomatis di Navbar saat AI mendeteksi risiko overspending
- Warning berbasis budget: notifikasi jika total proyeksi > total anggaran bulan ini
- Warning berbasis AI LSTM: notifikasi jika model memprediksi `prediksi_besok = 1` (BAHAYA)

### 💰 Manajemen Transaksi
- Catat transaksi pemasukan & pengeluaran
- Filter berdasarkan kategori, tipe, dan rentang tanggal
- Pagination dan riwayat lengkap
- **Impor CSV** untuk migrasi data massal
- Hapus transaksi individual

### ⚙️ Pengaturan Budget & Preferensi
- Alokasi anggaran bulanan per kategori
- Pemasukan tetap dan target tabungan (dengan validasi wajib isi)
- **Toggle Mode AI** (LSTM Engine ON/OFF) — tersimpan di database
- **Checkbox preferensi notifikasi** (Peringatan Pengeluaran Tinggi & Prediksi Saldo Rendah) — tersimpan di database
- Ekspor dataset transaksi ke JSON

### 👤 Profil Pengguna
- Edit nama lengkap
- Upload foto profil ke Supabase Storage
- Fallback avatar dengan **inisial nama** jika belum upload foto
- Ganti email & password dengan verifikasi password lama

---

## 🏗️ Arsitektur Sistem

```text
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                 │     │                  │     │                  │
│   Frontend      │────▶│   Backend API    │────▶│   AI Service     │
│   React + Vite  │     │   Express + TS   │     │   FastAPI + LSTM │
│   (Vercel)      │     │   (Railway)      │     │   (Railway)      │
│                 │     │                  │     │                  │
└─────────────────┘     └────────┬─────────┘     └──────────────────┘
                                 │
                        ┌────────▼─────────┐
                        │                  │
                        │   PostgreSQL     │
                        │   (Supabase)     │
                        │   + Auth + Storage│
                        │                  │
                        └──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Kegunaan |
|---|---|
| React 18 + Vite | Framework & Build Tool |
| TypeScript | Type Safety |
| Tailwind CSS | Styling (Neo-Brutalism Design) |
| TanStack Query (React Query) | Server State Management & Caching |
| Zustand | Client State Management (Auth) |
| Recharts | Grafik & Visualisasi Data |
| Framer Motion | Animasi & Transisi |
| Lucide React | Icon Library |
| Axios | HTTP Client |

### Backend
| Teknologi | Kegunaan |
|---|---|
| Node.js + Express 5 | REST API Server |
| TypeScript | Type Safety |
| Prisma ORM | Database Access & Migrations |
| PostgreSQL (Supabase) | Database |
| Supabase Auth | Autentikasi JWT |
| Supabase Storage | File Upload (Avatar) |
| Helmet | HTTP Security Headers |
| Express Rate Limit | Brute Force Protection |
| Swagger (OpenAPI) | API Documentation |
| Zod | Input Validation |

### AI Service
| Teknologi | Kegunaan |
|---|---|
| Python + FastAPI | AI Inference Server |
| TensorFlow/Keras | LSTM Model Runtime |
| scikit-learn | Scalers (MinMaxScaler) |
| NumPy + Pandas | Data Processing |

---

## 🧠 AI/ML Pipeline

### Model Architecture
```text
LSTM(64) → Dropout(0.2) → LSTM(32) → Dropout(0.2) → Dense(16) → Dense(1, sigmoid)
```

### Spesifikasi
| Parameter | Nilai |
|---|---|
| Sequence Length | 30 hari |
| Jumlah Fitur | 37 fitur keuangan |
| Threshold | 0.55 (optimized for Recall) |
| Output | P(BAHAYA) → Binary Classification |
| Model File | `model_lstm.h5` |
| Scaler File | `scalers_v8.pkl` |

### 37 Fitur Input LSTM

<details>
<summary>Klik untuk melihat daftar lengkap fitur</summary>

**Numerik Utama:**
`total_pengeluaran_harian`, `total_pemasukan_harian`, `saldo_berjalan`, `saldo_bersih_harian`, `total_wants_harian`, `rasio_wants`, `doom_spending_harian`, `shock_harian`, `pengeluaran_makanan`, `rasio_makanan`

**Temporal:**
`hari_dalam_bulan`, `hari_dalam_minggu`, `bulan`, `is_weekend`, `is_harbolnas`, `fase_bulan_encoded`

**Cyclical Encoding:**
`sin_doy`, `cos_doy`, `sin_dom`, `cos_dom`

**Lag Features:**
`pengeluaran_lag_1d`, `pengeluaran_lag_3d`, `pengeluaran_lag_7d`, `saldo_lag_1d`, `wants_lag_3d`, `doom_lag_7d`

**Rolling Statistics:**
`rolling_mean_7d`, `rolling_mean_14d`, `rolling_mean_30d`, `rolling_std_7d`, `rolling_max_7d`, `rolling_wants_7d`

**Derived & Interaksi:**
`days_to_ruin`, `interaksi_hedon_muda`, `kebiasaan_boros_harian`, `is_doom_spending`, `is_financial_shock`

**Profil User:**
`usia`, `tipe_user_encoded`

</details>

### Feature Engineering Pipeline
```text
Transaksi Historis (60 hari)
    ↓
buildDailyTimeSeries() → Agregasi harian per INCOME/EXPENSE
    ↓
buildFeatureSequence() → Hitung 37 fitur per hari
    ↓
Ambil 30 hari terakhir (SEQ_LEN = 30)
    ↓
Kirim ke AI Service via POST /predict
    ↓
LSTM Inference → P(BAHAYA), rekomendasi, status
    ↓
Simpan ke tabel ai_analysis_results & ai_predictions
```

---

## 📁 Struktur Proyek

```text
FinPredict/
├── frontend/                    # React + Vite (Deployed ke Vercel)
│   ├── src/
│   │   ├── components/          # Komponen reusable (Navbar, Sidebar)
│   │   ├── hooks/               # Custom hooks (useTransactions, usePredictions, useSettings, dll)
│   │   ├── lib/                 # Axios instance & utilities
│   │   ├── pages/               # Halaman utama
│   │   │   ├── Dashboard.tsx    # Dashboard dengan grafik & peringatan dini
│   │   │   ├── TransactionPage.tsx  # CRUD transaksi + impor CSV
│   │   │   ├── AIAnalyticsPage.tsx  # Analisis AI mendalam
│   │   │   ├── BudgetSettingsPage.tsx  # Pengaturan anggaran & preferensi
│   │   │   ├── ProfilePage.tsx  # Edit profil & ganti password
│   │   │   ├── LoginPage.tsx    # Login & Register
│   │   │   ├── LandingPage.tsx  # Landing page publik
│   │   │   └── SupportPage.tsx  # FAQ & Bantuan
│   │   └── store/               # Zustand auth store
│   └── vercel.json              # Konfigurasi deployment Vercel
│
├── backend/                     # Express.js API (Deployed ke Railway)
│   ├── prisma/
│   │   └── schema.prisma        # Database schema (7 model + 3 settings)
│   └── src/
│       ├── controllers/         # Request handlers
│       │   ├── auth.controller.ts       # Login, Register, Profile, Settings
│       │   ├── transaction.controller.ts # CRUD Transaksi + CSV Import
│       │   ├── budget.controller.ts     # Budget CRUD + Status
│       │   ├── prediction.controller.ts # Generate AI + Warning Status
│       │   ├── notification.controller.ts # Notifikasi
│       │   └── category.controller.ts   # Kategori Transaksi
│       ├── services/            # Business logic
│       │   └── prediction.service.ts    # Feature engineering 37 fitur + AI call
│       ├── routes/              # Express routes + OpenAPI docs
│       ├── middlewares/         # Auth middleware (JWT verification)
│       └── config/              # Prisma & Supabase client setup
│
├── ai-service/                  # Python FastAPI (Deployed ke Railway)
│   ├── main.py                  # FastAPI server + endpoints
│   ├── inference.py             # LSTM model loading & prediction
│   ├── model_lstm.h5            # Trained LSTM model
│   ├── model_gru.h5             # Backup GRU model
│   ├── model_rf.pkl             # Backup Random Forest model
│   ├── model_xgb.json           # Backup XGBoost model
│   ├── scalers_v8.pkl           # MinMaxScaler per fitur
│   └── requirements.txt         # Python dependencies
│
└── README.md
```

---

## 🚀 Instalasi & Setup

### Prerequisites
- **Node.js** v18+
- **Python** 3.10+ (untuk AI Service)
- **npm**
- Akun **Supabase** (PostgreSQL + Auth + Storage)

### 1. Clone Repository
```bash
git clone https://github.com/saifulohyr/FinPredict.git
cd FinPredict
```

### 2. Setup Backend
```bash
cd backend
npm install

# Buat file .env berdasarkan .env.example
cp .env.example .env
# Isi kredensial Supabase Anda

# Sinkronisasi schema ke database
npx prisma db push

# Jalankan server development
npm run dev
# Server berjalan di http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Buat file .env
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Jalankan development server
npm run dev
# App berjalan di http://localhost:5173
```

### 4. Setup AI Service (Opsional)
```bash
cd ai-service
pip install -r requirements.txt

# Jalankan FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000
# AI Service berjalan di http://localhost:8000
```

> **Note:** Backend akan tetap berjalan tanpa AI Service — fitur prediksi hanya tidak akan menghasilkan output LSTM.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres"

# Server
PORT=5000
NODE_ENV="production"

# Supabase Auth
SUPABASE_URL="https://[ref].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_JWT_SECRET="your-jwt-secret"

# CORS
ALLOWED_ORIGINS="https://your-frontend.vercel.app"

# AI Service (opsional)
AI_SERVICE_URL="https://your-ai-service.railway.app"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## ☁️ Deployment

| Layer | Platform | URL |
|---|---|---|
| Frontend | **Vercel** | Auto-deploy dari `main` branch |
| Backend | **Railway** | Auto-deploy dari `main` branch |
| AI Service | **Railway** | Auto-deploy dari `main` branch |
| Database | **Supabase** | Managed PostgreSQL |
| Auth | **Supabase Auth** | JWT-based authentication |
| Storage | **Supabase Storage** | Avatar file uploads |

---

## 📖 API Documentation

Backend menyediakan dokumentasi OpenAPI/Swagger yang dapat diakses di:

```text
https://your-backend-url/api-docs
```

### Endpoint Utama

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/register` | Registrasi akun baru |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Profil user saat ini |
| `PUT` | `/api/auth/profile` | Update nama & avatar |
| `PUT` | `/api/auth/credentials` | Ganti email/password |
| `GET` | `/api/auth/settings` | Ambil preferensi user |
| `PUT` | `/api/auth/settings` | Update preferensi (AI mode, notif) |
| `GET` | `/api/transactions` | Daftar transaksi (dengan filter) |
| `POST` | `/api/transactions` | Catat transaksi baru |
| `DELETE` | `/api/transactions/:id` | Hapus transaksi |
| `GET` | `/api/transactions/summary` | Ringkasan bulanan |
| `POST` | `/api/transactions/import` | Impor transaksi via CSV |
| `GET` | `/api/budgets` | Daftar budget |
| `POST` | `/api/budgets` | Buat/update budget |
| `GET` | `/api/budgets/status` | Status budget vs pengeluaran aktual |
| `POST` | `/api/predictions/generate` | Generate prediksi AI |
| `GET` | `/api/predictions` | Ambil prediksi terakhir |
| `GET` | `/api/predictions/warning` | Status peringatan dini |
| `GET` | `/api/predictions/ai-result` | Hasil analisis AI terakhir |
| `GET` | `/api/notifications` | Daftar notifikasi |
| `PUT` | `/api/notifications/:id/read` | Tandai notifikasi sudah dibaca |
| `GET` | `/api/categories` | Daftar kategori transaksi |

---

## 🔒 Keamanan

| Aspek | Implementasi |
|---|---|
| Autentikasi | JWT via Supabase Auth (access_token + refresh_token) |
| Authorization | Middleware `requireAuth` pada semua endpoint terproteksi |
| Password | Hashing via Supabase (bcrypt) |
| HTTP Headers | Helmet.js (X-Frame-Options, CSP, HSTS, dll) |
| Rate Limiting | Express Rate Limit (mencegah brute force) |
| CORS | Whitelist origin frontend saja |
| Secrets | `.env` + `.gitignore` (tidak masuk repository) |
| Input Validation | Zod schema validation di backend |

---

## 📊 Database Schema

```text
profiles          → User data + settings (ai_enabled, notif preferences)
categories        → Kategori transaksi (INCOME / EXPENSE)
transactions      → Transaksi keuangan pengguna
budgets           → Anggaran bulanan per kategori
ai_predictions    → Hasil prediksi 30 hari ke depan (chart data)
ai_analysis_results → Output analisis LSTM (status, probabilitas, rekomendasi)
notifications     → Peringatan dini & notifikasi sistem
```

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan **Capstone Project** pendidikan.

---

<div align="center">

Developed with ❤️ by [Saifuloh](https://github.com/saifulohyr)

</div>
