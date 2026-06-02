import { useState } from 'react';
import { LifeBuoy, Mail, Phone, Send, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "Bagaimana cara kerja prediksi AI (LSTM Engine)?",
    answer: "Sistem AI kami menganalisis pola transaksi masa lalu Anda menggunakan algoritma Long Short-Term Memory (LSTM) untuk memprediksi probabilitas saldo Anda akan habis di akhir bulan, serta mendeteksi anomali pengeluaran."
  },
  {
    question: "Apakah data transaksi saya aman?",
    answer: "Tentu. Data Anda dienkripsi dan kami hanya memproses metadata yang diperlukan untuk pelatihan model AI spesifik pada akun Anda. Kami tidak membagikan data Anda kepada pihak ketiga."
  },
  {
    question: "Mengapa saya mendapatkan peringatan 'Pengeluaran Tinggi'?",
    answer: "Peringatan ini dipicu jika Anda menetapkan ambang batas tertentu pada pengaturan (contoh: Rp 500.000) dan transaksi tunggal atau akumulasi harian Anda melebihi batas tersebut."
  }
];

export function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const subject = encodeURIComponent("Tiket Kendala AI FinPredict");
    const body = encodeURIComponent(message);
    window.location.href = `mailto:saifulohyr@gmail.com?subject=${subject}&body=${body}`;
    
    setIsSent(true);
    setMessage('');
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <div className="bg-[#F5F5DC] min-h-screen font-sans text-black p-4 md:p-8">
      {/* Header */}
      <div className="mb-10 text-left">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 italic leading-none">Pusat Bantuan</h1>
        <p className="font-bold text-xs md:text-sm text-slate-800 uppercase italic">
          Solusi kendala teknis dan pertanyaan seputar AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
        
        {/* Left Column: FAQ Accordion */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 space-y-6">
          <h2 className="text-2xl font-black uppercase flex items-center gap-3">
            <LifeBuoy size={28} /> FAQ
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 flex justify-between items-center text-left hover:bg-[#FFFF00] transition-colors"
                  >
                    <span className="font-black uppercase text-sm md:text-base">{faq.question}</span>
                    {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </button>
                  {isOpen && (
                    <div className="p-4 border-t-4 border-black bg-[#D9D9D7]">
                      <p className="font-bold text-sm italic leading-relaxed text-slate-800">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Contact Form & Info */}
        <div className="col-span-1 md:col-span-12 lg:col-span-5 space-y-8">
          
          {/* Form */}
          <div className="bg-[#4ade80] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase mb-4 italic">Hubungi Tim AI</h2>
            
            {isSent ? (
              <div className="bg-black text-[#4ade80] p-6 border-4 border-black font-black uppercase text-center text-lg animate-pulse">
                PESAN TERKIRIM!
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase border-2 border-black bg-white px-2 py-0.5 ml-3 -mb-2 relative z-20 w-fit">
                    Pesan Kendala
                  </label>
                  <textarea 
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border-4 border-black p-4 font-bold text-sm focus:bg-yellow-50 outline-none resize-none" 
                    placeholder="Ceritakan kendala Anda di sini..."
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-white w-full border-4 border-black px-4 py-3 font-black uppercase text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-black hover:text-white transition-all"
                >
                  <Send size={20} /> Kirim Tiket
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] outline outline-4 outline-black outline-offset-4 border-dashed border-spacing-4">
            <h2 className="text-lg font-black uppercase mb-6">Kontak Darurat</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FFFF00] border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase">Email Dukungan</p>
                  <p className="font-bold text-sm italic">saifulohyr@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#D9D9D7] border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase">Hotline 24/7</p>
                  <p className="font-bold text-sm italic">+62 858 7506 1912</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
