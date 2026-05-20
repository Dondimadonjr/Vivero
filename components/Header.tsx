"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56966913920";

  const whatsappMessage = encodeURIComponent(
    "Hola, quiero consultar por las plantas disponibles del vivero."
  );

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-500 ${
        scrolled
          ? "border-[#e7ddcf]/50 bg-[#f8f3ea]/55 shadow-sm backdrop-blur-2xl"
          : "border-[#e7ddcf] bg-[#f8f3ea]"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 transition-all duration-500 sm:px-6 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image
            src="/logo_vivero_circular.png"
            alt="Logo vivero frijolito"
            width={72}
            height={72}
            priority
            className={`shrink-0 rounded-full object-contain transition-all duration-500 ${
              scrolled ? "h-10 w-10 sm:h-12 sm:w-12" : "h-11 w-11 sm:h-16 sm:w-16"
            }`}
          />

          <div className="min-w-0 leading-[0.95]">
            <p
              className={`font-semibold tracking-tight text-[#1f2a24] transition-all duration-500 ${
                scrolled ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
              }`}
            >
              vivero
            </p>

            <p
              className={`font-semibold tracking-tight text-[#1f2a24] transition-all duration-500 ${
                scrolled ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
              }`}
            >
              frijolito
            </p>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const catalogo = document.getElementById("catalogo");

              if (!catalogo) return;

              const y = catalogo.getBoundingClientRect().top + window.scrollY - 50;

              window.scrollTo({
                top: y,
                behavior: "smooth",
              });
            }}
            className={`hidden rounded-full border border-[#ddd0be] bg-white/80 font-medium text-[#1f2a24] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md md:inline-flex ${
              scrolled ? "px-6 py-2.5 text-sm" : "px-7 py-3 text-base"
            }`}
          >
            Catálogo
          </button>

          <a
            href={`https://wa.me/${phone}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full bg-[#2f7d55] font-semibold text-white shadow-md shadow-[#2f7d55]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#286946] hover:shadow-lg ${
              scrolled
                ? "px-4 py-2 text-sm sm:px-6 sm:py-2.5"
                : "px-5 py-2.5 text-sm sm:px-7 sm:py-3 sm:text-base"
            }`}
          >
            WhatsApp
          </a>
          
        </nav>
      </div>
    </header>
  );
}