"use client";
import Image from "next/image";

export default function FloatingWhatsApp() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56966913920";

  const message = encodeURIComponent(
    "Hola, quiero consultar por las plantas disponibles del vivero."
  );

  return (
    <a
  href={`https://wa.me/${phone}?text=${message}`}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Contactar por WhatsApp"
  className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#2f7d55] shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#256844] sm:h-16 sm:w-16"
>
  <img
    src="/whatsapp.png"
    alt="WhatsApp"
    className="h-8 w-8 object-contain sm:h-9 sm:w-9"
  />
</a>
  );
}