# Dokumentasi API FinPredict (Untuk Frontend)

Dokumen ini berisi panduan cara menghubungkan aplikasi Frontend (React) dengan Backend (Express) yang telah dibuat.
Base URL untuk semua request API adalah `http://localhost:5000/api` (atau sesuai konfigurasi di `.env`).

Di frontend, sudah disiapkan instance Axios di `src/lib/api.ts` yang otomatis menyisipkan Base URL dan Token JWT. Jadi, **gunakan `api` dari `src/lib/api.ts`** alih-alih menggunakan `axios` biasa atau `fetch`.

Contoh import:
```typescript
import api from '@/lib/api';
```

---

## 1. Endpoints Authentication (Auth)

### 1.1. Register Akun Baru
Mendaftarkan akun baru menggunakan email dan password ke Supabase Auth, sekaligus membuat data Profile di database kita.

- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Body Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "mypassword123",
    "full_name": "John Doe"
  }
  ```
- **Contoh Penggunaan di Frontend**:
  ```typescript
  const handleRegister = async () => {
    try {
      const response = await api.post('/auth/register', {
        email: 'user@example.com',
        password: 'mypassword123',
        full_name: 'John Doe'
      });
      console.log('Register sukses:', response.data);
      // response.data.data.access_token bisa disimpan untuk login otomatis
    } catch (error) {
      console.error('Register gagal:', error.response?.data?.message);
    }
  };
  ```

### 1.2. Login Akun (Manual)
Login menggunakan email dan password. Mengembalikan data profil dan token JWT.

- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Body Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "mypassword123"
  }
  ```
- **Contoh Penggunaan di Frontend**:
  ```typescript
  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', {
        email: 'user@example.com',
        password: 'mypassword123'
      });
      console.log('Login sukses:', response.data);
      
      const token = response.data.data.access_token;
      const user = response.data.data.user;
      
      // Simpan token ke localStorage atau Zustand store
      localStorage.setItem('token', token);
      localStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
      console.error('Login gagal:', error.response?.data?.message);
    }
  };
  ```

### 1.3. Get Current User Profile (Auto-Sync)
Mendapatkan data profil user yang sedang login. Endpoint ini **wajib mengirimkan token JWT** (sudah dihandle otomatis oleh `api.ts` jika token ada di `localStorage`).

- **Method**: `GET`
- **Endpoint**: `/auth/me`
- **Header**: `Authorization: Bearer <token>`
- **Contoh Penggunaan di Frontend**:
  ```typescript
  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      console.log('Data User:', response.data.data);
    } catch (error) {
      console.error('Gagal mengambil data user:', error.response?.data?.message);
    }
  };
  ```

### 1.4. Update Profile
Memperbarui informasi profil (nama lengkap, avatar).

- **Method**: `PUT`
- **Endpoint**: `/auth/profile`
- **Header**: `Authorization: Bearer <token>`
- **Body Request**:
  ```json
  {
    "full_name": "Nama Baru",
    "avatar_url": "https://example.com/new-avatar.png"
  }
  ```
- **Contoh Penggunaan di Frontend**:
  ```typescript
  const updateProfile = async () => {
    try {
      const response = await api.put('/auth/profile', {
        full_name: 'Nama Baru',
      });
      console.log('Profile diperbarui:', response.data.data);
    } catch (error) {
      console.error('Gagal update profile:', error.response?.data?.message);
    }
  };
  ```

---

## 2. Health Check Endpoint
Untuk mengecek apakah API backend sedang berjalan normal.

- **Method**: `GET`
- **Endpoint**: `/health`
- **Contoh Penggunaan**:
  ```typescript
  const checkHealth = async () => {
    const response = await api.get('/health');
    console.log(response.data);
  };
  ```

---

## Tips Integrasi di React (Menggunakan TanStack Query)

Sangat disarankan menggunakan `useMutation` (untuk POST/PUT) dan `useQuery` (untuk GET) dari `@tanstack/react-query` untuk menghandle *loading state* dan *error handling* dengan lebih rapi.

**Contoh fetch profil dengan useQuery:**
```typescript
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function ProfileComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.data;
    }
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Gagal memuat profil</p>;

  return <div>Halo, {data?.full_name}</div>;
}
```
