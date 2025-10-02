import React from 'react';
import { MapPin, Sparkles, Smartphone, HandHeart, Wallet, NotepadText } from 'lucide-react';

const AboutSection: React.FC = () => {
  const features = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Lokasi Super Strategis",
      description: "Dekat dengan kampus, perkantoran, minimarket, sampai tempat nongkrong favorit. Semua bisa dijangkau dengan mudah, jadi tidak perlu membuang waktu di jalan."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Fasilitas Lengkap & Terawat",
      description: "Mulai dari WiFi kencang, AC maupun kipas angin, hingga furnitur berkualitas. Semuanya sudah disiapkan biar kamu cukup bawa koper aja. Tinggal menjadi lebih praktis, nyaman, dan menyenangkan."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Sistem Digital",
      description: "Tidak perlu ribut bolak masuk ke web, laporan kerusakan kamar dan tim segera menanganinya. Penyewa juga bisa unggah bukti pembayaran dengan mudah, praktis, dan aman."
    },
    {
      icon: <HandHeart className="w-6 h-6" />,
      title: "Lingkungan Nyaman & Aman",
      description: "Bukan cuma tempat tinggal, tapi juga komunitas ramah dan asik yang bikin kamu betah. Plus, layanan perbaikan cepat dan dukungan kapan pun, membuatmu merasa nyaman setiap hari."
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Harga Ramah di Kantong",
      description: "Dengan semua fasilitas dan kenyamanan yang tersedia, harga tetap pas untuk mahasiswa maupun pekerja muda. Tanpa biaya tersembunyi, semuanya jelas sejak awal."
    },
    {
      icon: <NotepadText className="w-6 h-6" />,
      title: "Fleksibel Sesuai Kebutuhan",
      description: "Mau sewa bulanan biar lebih santai, atau tahunan biar langsung aman setahun penuh? Semua bisa diatur sesuai kenyamananmu, fleksibel menyesuaikan jadwal dan kebutuhan sehari-hari."
    }
  ];

  return (
    <section
      id="about"
      className="min-h-screen bg-gradient-to-b from-[#BAA79F] to-[#DDD3CF] py-16 px-4 sm:px-6 lg:px-8 scroll-mt-28"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-4xl font-medium text-[#412E27] mb-4">
            More Than a Place to Stay
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-[#7A2B1E] via-[#AB4B3B] to-[#DD7665] bg-clip-text text-transparent">
              It's Arzeta Co - Living
            </span>
          </h2>
          <p className="text-[#524039] text-base md:text-lg max-w-5xl mx-auto leading-relaxed">
            Di Arzeta Co-Living, kamu tidak hanya dapat kamar, tetapi juga pengalaman tinggal yang nyaman, aman, dan 
            pastinya bikin betah. Dengan fasilitas lengkap + layanan digital bikin hidup kamu lebih simple, no ribet, dan 
            tetap enjoy setiap hari. Bukan sekadar kos, tapi rumah kedua yang dukung gaya hidupmu!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-[#f5f0eb] rounded-lg p-6 shadow-md hover:shadow-xl hover:-translate-y-4 transition-all duration-300 ease-out"
            >
              <div className="w-12 h-12 bg-[#7A2B1E] rounded-lg flex items-center justify-center text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-[#412E27] mb-2">
                {feature.title}
              </h3>
              <p className="text-[#524039] text-sm leading-relaxed text-justify">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
