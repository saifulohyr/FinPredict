# 🚀 FinPredict

**FinPredict** adalah aplikasi peramalan arus kas (cash flow forecasting) modern yang dirancang khusus untuk generasi muda. Aplikasi ini menggunakan teknologi AI (LSTM) untuk memprediksi kondisi keuangan pengguna dalam 30 hari ke depan.

## 🛠️ Tech Stack

### Backend
- **Core:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Security:** JWT, Bcrypt, Helmet, Express Rate Limit

### Frontend
- **Framework:** React (Vite), TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Data Fetching:** TanStack Query (React Query)
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Visualization:** Tremor Dashboard Components

## 📁 Project Structure

```text
├── backend/          # Express.js server files
├── frontend/         # React + Vite files
├── ai-service/       # Python FastAPI service (Placeholder)
└── README.md         # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm / pnpm
- Supabase Account (PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saifulohyr/FinPredict.git
   cd FinPredict
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create .env file based on .env.example and fill in your Supabase credentials
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   # Create .env file based on .env.example
   npm run dev
   ```

## 🔒 Security
Proyek ini telah melewati audit keamanan awal yang mencakup:
- Perlindungan rahasia via `.gitignore`
- Proteksi terhadap Brute Force via Rate Limiting
- Header keamanan via Helmet
- Validasi data end-to-end

## 📝 License
This project is for educational purposes as part of a Capstone Project.

---
Developed with ❤️ by [Saiful](https://github.com/saifulohyr)
