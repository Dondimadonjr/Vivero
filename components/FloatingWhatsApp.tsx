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
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#2f7d55] shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#256844]"
    >
      <Image
        src="/whatsapp.png"
        alt="WhatsApp"
        width={36}
        height={36}
        className="h-9 w-9 object-contain"
      />
    </a>
  );
}