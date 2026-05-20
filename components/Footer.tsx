import Image from "next/image";
import { Camera, MessageCircle, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56912345678";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hola, quiero consultar por las plantas disponibles en Vivero Frijolito."
  )}`;

  return (
    <footer className="border-t border-black/5 bg-[#f3ede4] px-6 py-14">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="flex items-start gap-4">
          <Image
            src="/logo_vivero_circular.png"
            alt="Vivero Frijolito"
            width={56}
            height={56}
            className="h-12 w-12 shrink-0 rounded-full object-contain sm:h-14 sm:w-14"
          />

          <div>
            <h3 className="text-4xl font-bold tracking-tight text-[#1f2a24]">
              vivero frijolito
            </h3>

            <p className="mt-3 max-w-md text-lg leading-relaxed text-[#5b655f]">
              Amor, paciencia y hojas nuevas 💚 Plantas seleccionadas para
              llenar tu hogar de vida.
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#d8cfc2] bg-white/70 p-6">
          <h4 className="font-bold text-[#1f2a24]">Información</h4>

          <div className="mt-4 space-y-4 text-[#5b655f]">
            <div className="flex gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#2f6f4e]" />
              <div>
                <p className="font-medium text-[#1f2a24]">Ubicación</p>
                <p className="text-sm">Consulta por entregas y retiros.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-[#2f6f4e]" />
              <div>
                <p className="font-medium text-[#1f2a24]">Atención</p>
                <p className="text-sm">Escríbenos por WhatsApp o Instagram.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#d8cfc2] bg-white/70 p-6">
          <h4 className="font-bold text-[#1f2a24]">Contacto</h4>

          <p className="mt-3 text-sm leading-6 text-[#5b655f]">
            ¿Te gustó una planta? Escríbenos y te contamos disponibilidad,
            cuidados y formas de entrega.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="https://instagram.com/viverofrijolito"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#d8cfc2] bg-white px-4 py-3 text-sm font-medium text-[#1f2a24] transition hover:bg-[#edf5ef]"
              aria-label="Instagram"
            >
              <Camera size={18} />
              Instagram
            </Link>

            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#2f6f4e] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-[#2f6f4e]/20 transition hover:bg-[#275c41]"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
              WhatsApp
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-black/5 pt-6 text-sm text-[#5b655f] sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Vivero Frijolito. Todos los derechos
          reservados.
        </p>
        <p>Hecho con cariño para amantes de las plantas 🌱</p>
      </div>
    </footer>
  );
}