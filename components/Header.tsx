"use client";

import Image from "next/image";

export default function Header() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56912345678";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hola, quiero consultar por las plantas disponibles en Vivero Frijolito."
  )}`;

  function scrollToCatalogo() {
    const catalogo = document.getElementById("catalogo");

    if (!catalogo) return;

    const y = catalogo.getBoundingClientRect().top + window.scrollY - 120;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f8f3ed]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo_vivero_circular.png"
            alt="Logo Vivero Frijolito"
            width={56}
            height={56}
            priority
            className="h-14 w-14 rounded-full object-contain shadow-sm"
          />

          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1f2a24] sm:text-2xl">
              vivero frijolito
            </h1>

            <p className="hidden text-sm text-[#5b655f] sm:block">
              Amor, paciencia y hojas nuevas 💚
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollToCatalogo}
            className="rounded-2xl border border-[#d8cfc2] bg-white px-4 py-2.5 text-sm font-medium text-[#1f2a24] transition hover:bg-[#edf5ef] sm:px-5 sm:py-3"
          >
            Catálogo
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-[#2f6f4e] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#2f6f4e]/20 transition hover:bg-[#255c40] sm:px-5 sm:py-3"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}