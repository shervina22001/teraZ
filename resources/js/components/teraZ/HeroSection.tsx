import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { Link } from '@inertiajs/react';

const colors = {
  primary: "#C97856",
  secondary: "#A8B89A",
  background: "#2C2420",
  text: "#F5F2EE",
  textMuted: "#E5E5E5",
  accent: "#E8D5C4",
};

const HeroSection = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="home"
      className="min-h-screen font-sans scroll-mt-28"
      style={{ backgroundColor: colors.background }}
    >
      {/* BG image */}
      <div className="relative min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/teraZ/background.png)",
            opacity: 0.5,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${colors.background}f5 0%, ${colors.background}dd 30%, ${colors.background}88 60%, ${colors.background}44 100%)`,
          }}
        />

        {/* NAV */}
        <div
          className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
          style={{
            backgroundColor: isScrolled ? colors.background : "transparent",
          }}
        >
          <Navbar />
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-10 h-screen flex flex-col justify-center">
          <div className="px-26 md:px-36 lg:px-54">
            <div className="max-w-4xl">
              {/* Title + Logo */}
              <div className="mb-10">
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                  <span
                    className="block text-9xl font-bold tracking-tight"
                    style={{
                      color: colors.text,
                      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
                    }}
                  >
                    Arzeta
                  </span>
                  <div className="transform rotate-12 rounded-full overflow-hidden flex-shrink-0 w-28 h-28 md:w-36 md:h-36 lg:w-46 lg:h-46 -ml-4">
                    <img
                      src="/teraZ/logo.png"
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span
                  className="block text-8xl font-bold tracking-tight -mt-6"
                  style={{
                    color: colors.secondary,
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  Co – Living
                </span>
              </div>

              <p
                className="text-2xl mb-2 font-medium"
                style={{ color: colors.text }}
              >
                Cari kost muslimah yang nyaman & strategis di Surabaya?
              </p>

              <p
                className="text-base mb-8 max-w-2xl"
                style={{ color: colors.textMuted }}
              >
                Kami hadir dengan kamar nyaman, lingkungan bersih, dan lokasi
                super strategis yang dekat dengan kampus.
              </p>

              {/* CTA */}
              <div className="flex gap-4">
                <Link
                  href="/login" 
                  className="rounded-lg px-8 py-3 font-semibold text-base transition-all hover:scale-110"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.text,
                    boxShadow: "2px 2px 6px rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Login
                </Link>
                <a
                  href="#contact"
                  className="rounded-lg px-8 py-3 font-semibold text-base transition-all hover:scale-110"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.background,
                    boxShadow: "2px 2px 6px rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </div>

          {/* FEATURES */}
          <div className="absolute bottom-26 left-0 right-0">
            <div className="px-26 md:px-36 lg:px-54">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                <div className="text-left">
                  <h4
                    className="text-xl font-bold mb-2"
                    style={{ color: colors.text }}
                  >
                    Lokasi Strategis
                  </h4>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    Dekat UPN & UT
                  </p>
                </div>

                <div className="text-left">
                  <h4
                    className="text-xl font-bold mb-2"
                    style={{ color: colors.text }}
                  >
                    Fasilitas Lengkap
                  </h4>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    Menunjang kenyamanan dan produktivitas
                  </p>
                </div>

                <div className="text-left">
                  <h4
                    className="text-xl font-bold mb-2"
                    style={{ color: colors.text }}
                  >
                    Harga Terjangkau
                  </h4>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    Dengan kualitas premium
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
