"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56966913920";

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
    <section className="relative overflow-hidden px-6 py-14 lg:py-10">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="rounded-2xl border border-[#d8cfc2] bg-white px-4 py-2 text-sm">
            🌿 Plantas de colección
          </span>

          <h2 className="mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-[#1f2a24] sm:text-5xl md:text-6xl lg:text-7xl">
            Plantas que transforman espacios.
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#5b655f]">
            Coleccionamos plantas hermosas y las compartimos contigo. Encuentra
            especies únicas, exóticas y llenas de vida para tu hogar.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <button
              type="button"
              onClick={scrollToCatalogo}
              className="rounded-2xl bg-[#2f6f4e] px-6 py-4 font-medium text-white shadow-lg shadow-[#2f6f4e]/20 transition hover:-translate-y-0.5 hover:bg-[#255c40]"
            >
              Explorar catálogo
            </button>

            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-[#d8cfc2] bg-white px-6 py-4 text-center font-medium text-[#1f2a24] transition hover:bg-[#edf5ef]"
            >
              Consultar por WhatsApp
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-2xl">
            <Image
              width={1200}
              height={800}
              src="https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=1200&auto=format&fit=crop"
              alt="Plantas de interior"
              priority
              className="h-[340px] w-full object-cover sm:h-[420px] md:h-[520px] lg:h-[560px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}