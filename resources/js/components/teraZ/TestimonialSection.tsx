import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      id: 1,
      name: 'Shervina',
      subtitle: 'Mahasiswi',
      avatar: '/teraZ/testi1.png',
      text: '"Aku betah banget di sini karena fasilitasnya lengkap, semuanya serba digital. Bayar kos juga gampang, cukup lewat web. Cocok buat anak kuliahan yang nggak mau ribet."',
      bgColor: 'bg-[#414833]'
    },
    {
      id: 2,
      name: 'Reghina',
      subtitle: 'Mahasiswi',
      avatar: '/teraZ/testi2.png',
      text: '"Dapurnya bersih dan nyaman banget, enak dipakai masak bareng temen. Kalau mau nongkrong atau ngemil santai, tinggal pindah ke taman ruang bersama. Rasanya bener-bener kayak di rumah sendiri, bukan cuma kos biasa."',
      bgColor: 'bg-[#4B3D37]'
    },
    {
      id: 3,
      name: 'Tabina',
      subtitle: 'Freelancer',
      avatar: '/teraZ/testi3.png',
      text: '"WiFi-nya kencang + stabil banget, kerja remote nggak terhambat tanpa gangguan. Suasananya tenang dan nyaman, jadi buat fokus kerja kalem suntuk, tinggal di kamar belakang buat nyegerin kepala."',
      bgColor: 'bg-[#955236]'
    }
  ];

  return (
    <section
      id="testimonial"
      className="bg-gradient-to-b from-[#E5E0D8] via-[#C2C0AF] to-[#A5A58D] py-20 px-4 scroll-mt-28"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title with Star Icon */}
        <div className="flex flex-col items-end mb-20 relative">
          <div className="flex items-center gap-20 mb-10">
            <div className="w-18 h-18 bg-[#7A2B1E] transform rotate-12 rounded-lg flex items-center justify-center shadow-lg">
              <Star className="w-18 h-18 text-[#7A2B1E] fill-[#E0DCD2]" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-[#7A2B1E]">
            Reviews from Our Roomies
          </h2>
        </div>

        {/* Testimonials - Organic Layout */}
        <div className="relative max-w-7xl mx-auto" style={{ minHeight: '700px' }}>
          {/* First testimonial - Top Left */}
          <div
            className="absolute left-0 top-0 w-full max-w-[340px] lg:max-w-[360px]"
            style={{ transform: 'rotate(-6deg)' }}
          >
            <div className={`${reviews[0].bgColor} rounded-full aspect-square p-12 lg:p-10 shadow-2xl relative`}>
              {/* Avatar */}
              <div className="absolute -top-8 -left-2 w-40 h-40 lg:w-42 lg:h-30 z-16">
                <img
                  src={reviews[0].avatar}
                  alt={reviews[0].name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="pt-14 px-3" style={{ transform: 'rotate(6deg)' }}>
                <div className="mb-3">
                  <h3 className="text-lg lg:text-xl font-bold text-white">{reviews[0].name}</h3>
                  <p className="text-white/90 text-sm lg:text-base">{reviews[0].subtitle}</p>
                </div>
                <p className="text-white text-xs lg:text-sm leading-relaxed text-justify">
                  {reviews[0].text}
                </p>
              </div>
            </div>
          </div>

          {/* Second testimonial - Top Right */}
          <div
            className="absolute right-20 top-8 lg:top-16 w-full max-w-[360px] lg:max-w-[380px]"
            style={{ transform: 'rotate(4deg)' }}
          >
            <div className={`${reviews[1].bgColor} rounded-full aspect-square p-10 lg:p-8 shadow-2xl relative`}>
              {/* Avatar */}
              <div className="absolute -top-6 -left-2 w-24 h-24 lg:w-28 lg:h-28 z-10">
                <img
                  src={reviews[1].avatar}
                  alt={reviews[1].name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="pt-14 px-3" style={{ transform: 'rotate(-4deg)' }}>
                <div className="mb-3">
                  <h3 className="text-lg lg:text-xl font-bold text-white">{reviews[1].name}</h3>
                  <p className="text-white/90 text-sm lg:text-base">{reviews[1].subtitle}</p>
                </div>
                <p className="text-white text-xs lg:text-sm leading-relaxed text-justify">
                  {reviews[1].text}
                </p>
              </div>
            </div>
          </div>

          {/* Third testimonial - Bottom Center-Left */}
          <div
            className="absolute left-[25%] lg:left-[30%] bottom-10 w-full max-w-[360px] lg:max-w-[380px]"
            style={{ transform: 'rotate(-2deg)' }}
          >
            <div className={`${reviews[2].bgColor} rounded-full aspect-square p-14 lg:p-10 shadow-2xl relative`}>
              {/* Avatar */}
              <div className="absolute -top-6 -left-0 w-24 h-24 lg:w-28 lg:h-28 z-10">
                <img
                  src={reviews[2].avatar}
                  alt={reviews[2].name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="pt-14 px-3" style={{ transform: 'rotate(2deg)' }}>
                <div className="mb-3">
                  <h3 className="text-lg lg:text-xl font-bold text-white">{reviews[2].name}</h3>
                  <p className="text-white/90 text-sm lg:text-base">{reviews[2].subtitle}</p>
                </div>
                <p className="text-white text-xs lg:text-sm leading-relaxed text-justify">
                  {reviews[2].text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
