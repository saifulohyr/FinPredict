import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Save, User, Shield, Image as ImageIcon, Lock, Mail } from 'lucide-react';

export function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  
  // Basic Profile State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Credentials State
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI State
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isCredsLoading, setIsCredsLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [credsMessage, setCredsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setAvatarUrl(user.avatar_url || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Create local preview
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileMessage(null);
    try {
      let finalAvatarUrl = avatarUrl;

      // If a new file is selected, upload it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        
        const uploadRes = await api.post('/auth/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data.status === 'success') {
          finalAvatarUrl = uploadRes.data.data.avatar_url;
        }
      }

      // Update Profile Info
      const response = await api.put('/auth/profile', {
        full_name: fullName,
        avatar_url: finalAvatarUrl,
      });

      if (response.data.status === 'success') {
        setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        if (token) {
          setAuth({ ...user, full_name: fullName, avatar_url: finalAvatarUrl } as any, token);
        }
        setSelectedFile(null); // Clear selected file after success
      }
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memperbarui profil' });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCredsLoading(true);
    setCredsMessage(null);
    try {
      const payload: any = {};
      if (email !== user?.email) payload.email = email;
      if (newPassword) {
        payload.new_password = newPassword;
        payload.current_password = currentPassword;
      }

      if (Object.keys(payload).length === 0) {
        setCredsMessage({ type: 'error', text: 'Tidak ada perubahan yang dimasukkan.' });
        setIsCredsLoading(false);
        return;
      }

      const response = await api.put('/auth/credentials', payload);

      if (response.data.status === 'success') {
        setCredsMessage({ type: 'success', text: response.data.message });
        if (token) {
          setAuth(response.data.data, token);
        }
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (error: any) {
      setCredsMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memperbarui keamanan akun.' });
    } finally {
      setIsCredsLoading(false);
    }
  };

  return (
    <div className="bg-[#F0F0F0] min-h-screen font-sans text-black p-4 md:p-8 pb-20">
      {/* Header */}
      <div className="mb-10 text-left">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 italic leading-none">Profile Saya</h1>
        <p className="font-bold text-xs md:text-sm text-slate-800 uppercase italic">
          Kelola identitas dan keamanan akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
        
        {/* KOLOM KIRI: PROFIL DASAR */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 space-y-8">
          <div className="bg-white border-4 border-black rounded-2xl p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] outline outline-4 outline-black outline-offset-4">
            <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
              <User size={28} className="shrink-0" /> Informasi Dasar
            </h2>

            {profileMessage && (
              <div className={`mb-6 p-4 border-4 border-black rounded-2xl font-bold uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${profileMessage.type === 'success' ? 'bg-[#A85CF9] text-black' : 'bg-[#FF4D4D] text-white'}`}>
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 p-4 border-4 border-black rounded-2xl bg-[#D9D9D7]">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white shrink-0">
                  <img 
                    src={avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center items-center sm:items-start space-y-3 w-full">
                  <p className="font-black uppercase text-sm">Foto Profil</p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase italic text-center sm:text-left">Format JPG/PNG. Maks 2MB.</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto bg-black text-white border-2 border-black rounded-xl px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-[#D4FF00] hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <ImageIcon size={16} className="inline mr-2" />
                    Pilih File Foto
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase border-2 border-black rounded-xl bg-white px-2 py-0.5 ml-3 -mb-2 relative z-20 w-fit">
                  ID Akun
                </label>
                <div className="w-full border-4 border-black rounded-2xl p-4 font-black text-lg bg-gray-200 text-slate-500 outline-none cursor-not-allowed">
                  {user?.id || 'Tidak diketahui'}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase border-2 border-black rounded-xl bg-white px-2 py-0.5 ml-3 -mb-2 relative z-20 w-fit">
                  Nama Lengkap
                </label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border-4 border-black rounded-2xl p-4 font-black text-xl focus:bg-[#D4FF00] outline-none transition-colors" 
                  placeholder="Nama Lengkap Anda"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isProfileLoading}
                  className="bg-[#A85CF9] w-full border-4 border-black rounded-2xl px-8 py-4 font-black uppercase text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all disabled:opacity-50"
                >
                  <Save size={24} /> {isProfileLoading ? 'MENYIMPAN...' : 'SIMPAN PROFIL'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: KEAMANAN AKUN */}
        <div className="col-span-1 md:col-span-12 lg:col-span-5 space-y-8">
          <div className="bg-[#D4FF00] border-4 border-black rounded-2xl p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
              <Shield size={28} className="shrink-0" /> Keamanan
            </h2>

            {credsMessage && (
              <div className={`mb-6 p-4 border-4 border-black rounded-2xl font-bold uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${credsMessage.type === 'success' ? 'bg-white text-black' : 'bg-[#FF4D4D] text-white'}`}>
                {credsMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="space-y-6">
              
              <div>
                <label className="block text-[10px] font-black uppercase border-2 border-black rounded-xl bg-white px-2 py-0.5 ml-3 -mb-2 relative z-20 w-fit flex items-center gap-1">
                  <Mail size={12} /> Email Baru
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-4 border-black rounded-2xl p-4 font-black text-lg focus:bg-white outline-none transition-colors bg-[#F0F0F0]" 
                  placeholder="email@example.com"
                />
                <p className="text-[10px] font-bold mt-1 uppercase italic text-black/70">Perubahan email memerlukan verifikasi ke alamat lama & baru.</p>
              </div>

              <div className="pt-4 border-t-4 border-black border-dashed">
                <label className="block text-[10px] font-black uppercase border-2 border-black rounded-xl bg-black text-white px-2 py-0.5 ml-3 -mb-2 relative z-20 w-fit flex items-center gap-1">
                  <Lock size={12} /> Password Saat Ini
                </label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border-4 border-black rounded-2xl p-4 font-black text-lg focus:bg-white outline-none transition-colors bg-[#F0F0F0]" 
                  placeholder="Wajib diisi jika ganti password"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase border-2 border-black rounded-xl bg-black text-white px-2 py-0.5 ml-3 -mb-2 relative z-20 w-fit flex items-center gap-1">
                  <Lock size={12} /> Password Baru
                </label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border-4 border-black rounded-2xl p-4 font-black text-lg focus:bg-white outline-none transition-colors bg-[#F0F0F0]" 
                  placeholder="Kosongkan jika tidak ingin ganti"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isCredsLoading}
                  className="bg-black text-white w-full border-4 border-black rounded-2xl px-6 py-4 font-black uppercase text-base shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center gap-2 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all disabled:opacity-50 hover:bg-[#FF4D4D]"
                >
                  <Shield size={20} /> {isCredsLoading ? 'MEMPROSES...' : 'UPDATE KEAMANAN'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
