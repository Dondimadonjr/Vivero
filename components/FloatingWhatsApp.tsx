import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56912345678";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hola, quiero consultar por las plantas disponibles en Vivero Frijolito."
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-8 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2f6f4e] text-white shadow-2xl shadow-[#2f6f4e]/30 transition hover:-translate-y-1 hover:bg-[#255c40] sm:bottom-10 sm:right-8 sm:h-16 sm:w-16"    >
      <MessageCircle size={26} />
    </a>
  );
}