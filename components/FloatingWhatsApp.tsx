"use client";

export default function FloatingWhatsApp() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56966913920";

  const message = encodeURIComponent(
    "Hola, quiero consultar por las plantas disponibles del vivero."
  );

  return (
  <a
    href="https://wa.me/56972086522"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#2f6f4e] shadow-xl transition hover:scale-105 sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
    aria-label="WhatsApp"
  >
    <img
      src="/whatsapp.png"
      alt="WhatsApp"
      className="h-7 w-7 object-contain sm:h-9 sm:w-9"
    />
  </a>
  );
}