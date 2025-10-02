export default function Footer() {
  return (
    <footer className="bg-[#49493A] text-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Grid utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          
          {/* Description */}
          <div className="space-y-3 text-justify">
            <h3 className="text-xl font-bold">
              Arzeta <span className="text-[#B3B792]">Co - Living</span>
            </h3>
            <p className="text-sm text-[#F1E0CB] leading-relaxed max-w-xs">
              Tempat tinggal nyaman dengan fasilitas lengkap dan layanan modern. 
              Bukan cuma kos, tapi rumah kedua untukmu.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-center">
            <div className="w-full max-w-[160px]">
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-3 text-left">
                <li>
                  <a
                    href="#home"
                    className="text-[#F1E0CB] hover:text-[white] transition-colors text-sm"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-[#F1E0CB] hover:text-white transition-colors text-sm"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#facilities"
                    className="text-[#F1E0CB] hover:text-white transition-colors text-sm"
                  >
                    Facilities & Room
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonial"
                    className="text-[#F1E0CB] hover:text-white transition-colors text-sm"
                  >
                    Testimonial
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-[#F1E0CB] hover:text-white transition-colors text-sm"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col items-center md:items-end">
            <div className="w-full max-w-xs">
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm text-[#F1E0CB] text-left">
                <li>WhatsApp: +62 812-3456-7890</li>
                <li>Email: arzetacolivin@gmail.com</li>
                <li>
                  <span className="block leading-relaxed">
                    Alamat: Jl. Medokan Asri Barat VII No.2. 
                    Kec. Rungkut, Surabaya, Jawa Timur
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#9D9482] pt-4">
          <p className="text-center text-xs text-[#9D9482]">
            © 2025 Arzeta Co - Living. Selalu hadir dengan dedikasi terbaik.
          </p>
        </div>
      </div>
    </footer>
  );
}
