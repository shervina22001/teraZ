import { MapPin, Mail, MessageCircle } from 'lucide-react';

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="bg-gradient-to-b from-[#A5A58D] to-[#868664] flex items-center justify-center px-4 pb-50 scroll-mt-28"
    >
      <div className="max-w-7xl w-full">
        {/* Title with Shadow Effect */}
        <div className="text-center mb-16 relative">
          <h2 
            className="text-4xl md:text-4xl font-black text-[#412E27] relative inline-block tracking-wide"
            style={{ textShadow: '2px 2px 2px rgba(232, 220, 200, 0.6)' }}
          >
            Get in Touch!
          </h2>
        </div>

        {/* Contact Cards Container */}
        <div className="flex flex-col lg:flex-row gap-18 items-center justify-center pt-16 max-w-8xl mx-auto ">
          {/* Alamat Card */}
          <div className="relative w-full lg:w-96 lg:self-start transition-transform duration-300 hover:scale-110 cursor-pointer">
            <div className="absolute -top-6 -left-6 bg-[#F1E0CB] rounded-full p-5 shadow-lg z-10">
              <MapPin className="w-9 h-9 text-[#412E27]" strokeWidth={2.5} />
            </div>
            <div className="bg-[#5D5145] rounded-3xl p-10 pt-12 shadow-xl min-h-[240px]">
              <h3 className="text-2xl font-medium text-[#F1E0CB] mb-3">Alamat</h3>
              <p className="text-[#F1E0CB] font-semibold text-base mb-4">
                Jl. Medokan Asri Barat VII No.2. Kec. Rungkut, Surabaya, Jawa Timur
              </p>
              <p className="text-[#C8B8A5] text-sm leading-relaxed">
                Datang langsung dan survey kosannya sendiri!
              </p>
            </div>
          </div>

          {/* WhatsApp Card */}
          <div className="relative w-full lg:w-96 lg:mt-32 transition-transform duration-300 hover:scale-110 cursor-pointer">
            <div className="absolute -top-6 -left-6 bg-[#F1E0CB] rounded-full p-5 shadow-lg z-10">
              <MessageCircle className="w-9 h-9 text-[#412E27]" strokeWidth={2.5} />
            </div>
            <div className="bg-[#5D5145] rounded-3xl p-10 pt-12 shadow-xl min-h-[240px]">
              <h3 className="text-2xl font-medium text-[#F1E0CB] mb-3">WhatsApp</h3>
              <p className="text-[#F1E0CB] font-semibold text-lg mb-1">
                +62 812-3456-7890
              </p>
              <p className="text-[#F1E0CB] text-base mb-5">(Ibu Seta)</p>
              <p className="text-[#C8B8A5] text-sm leading-relaxed">
                Butuh jawaban yang pasti dan cepat? WhatsApp kami selalu on buat kamu!
              </p>
            </div>
          </div>

          {/* Email Card */}
          <div className="relative w-full lg:w-96 lg:self-start transition-transform duration-300 hover:scale-110 cursor-pointer">
            <div className="absolute -top-6 -left-6 bg-[#F1E0CB] rounded-full p-5 shadow-lg z-10">
              <Mail className="w-9 h-9 text-[#412E27]" strokeWidth={2.5} />
            </div>
            <div className="bg-[#5D5145] rounded-3xl p-10 pt-12 shadow-xl min-h-[240px]">
              <h3 className="text-2xl font-medium text-[#F1E0CB] mb-3">Email</h3>
              <p className="text-[#F1E0CB] font-semibold text-base mb-5 break-all">
                arzetacolivin@gmail.com
              </p>
              <p className="text-[#C8B8A5] text-sm leading-relaxed">
                Sampaikan apapun kebutuhan kamu lewat email, pasti kami balas!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
