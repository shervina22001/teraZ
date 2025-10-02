import React from "react";
import { Head } from "@inertiajs/react";
import HeroSection from "../components/teraZ/HeroSection";
import AboutSection from "../components/teraZ/AboutSection";
import FacilitiesSection from "@/components/teraZ/FacilitiesSection";
import RoomSection from "@/components/teraZ/RoomSection";
import TestimonialSection from "@/components/teraZ/TestimonialSection";
import ContactSection from "@/components/teraZ/ContactSection";
import Footer from "@/components/teraZ/Footer";

export default function LandingPage() {
  return (
    <>
      <Head title="Landing Page" />
      <div className="min-h-screen">

        <HeroSection />
        <AboutSection />
        <FacilitiesSection />
        <RoomSection />
        <TestimonialSection />
        <ContactSection />
        <Footer />

      </div>
    </>
  );
}