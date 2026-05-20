import Image from "next/image";
import Link from "next/link";
import { Camera, Clock, MapPin, MessageCircle } from "lucide-react";

export default function Footer() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56966913920";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hola, quiero consultar por las plantas disponibles en Vivero Frijolito."
  )}`;

  return (
    <footer className="border-t border-[#e7ddcf] bg-[#f4eee4] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr_1fr]">
          <div className="h-full rounded-[32px] border border-[#d8cfc2] bg-[#fffaf1]/70 p-8">
            <div className="flex items-center gap-4">
              <Image
                src="/logo_vivero_circular.png"
                alt="Logo Vivero Frijolito"
                width={72}
                height={72}
                className="h-16 w-16 rounded-full object-contain"
              />

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2f6f4e]">
                  Vivero
                </p>
                <h2 className="text-4xl font-semibold tracking-tight text-[#1f2a24]">
                  frijolito
                </h2>
              </div>
            </div>

            <p className="mt-7 max-w-md text-lg leading-8 text-[#5b655f]">
              Plantas con carácter, hojas nuevas y mucho cariño para llenar tu
              hogar de vida.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {["Interior", "Exterior", "Exóticas", "Insumos"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#d8cfc2] bg-white/80 px-4 py-2 text-sm font-medium text-[#2f6f4e]"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 border-t border-[#e4d8c8] pt-6">
              <p className="text-sm leading-6 text-[#5b655f]">
                Elegidas con cuidado para llegar sanas, bonitas y listas para
                acompañar tu espacio.
              </p>
            </div>
          </div>

          <div className="h-full rounded-[32px] border border-[#d8cfc2] bg-white/80 p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#1f2a24]">
              Información
            </h3>

            <div className="mt-7 space-y-6">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef6df] text-[#2f6f4e]">
                  <MapPin size={22} />
                </span>

                <div>
                  <p className="font-semibold text-[#1f2a24]">Ubicación</p>
                  <p className="mt-1 text-sm leading-6 text-[#5b655f]">
                    Consulta por entregas y retiros coordinados.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef6df] text-[#2f6f4e]">
                  <Clock size={22} />
                </span>

                <div>
                  <p className="font-semibold text-[#1f2a24]">Atención</p>
                  <p className="mt-1 text-sm leading-6 text-[#5b655f]">
                    Escríbenos por WhatsApp, Instagram o Facebook.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#f4eee4] px-5 py-4">
                <p className="text-sm leading-6 text-[#5b655f]">
                  Coordinamos cada entrega con calma para que tus plantas
                  lleguen en buenas condiciones.
                </p>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col rounded-[32px] border border-[#d8cfc2] bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#1f2a24]">Contacto</h3>

            <p className="mt-5 leading-7 text-[#5b655f]">
              ¿Te gustó una planta? Escríbenos y te contamos disponibilidad,
              cuidados y formas de entrega.
            </p>

            <div className="mt-auto pt-8">
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f6f4e] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#2f6f4e]/20 transition hover:-translate-y-0.5 hover:bg-[#275c41]"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
                WhatsApp
              </Link>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link
                  href="https://instagram.com/viverofrijolito"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8cfc2] bg-white px-4 py-3 text-sm font-medium text-[#1f2a24] transition hover:bg-[#edf5ef]"
                  aria-label="Instagram"
                >
                  <Camera size={18} />
                  Instagram
                </Link>

                <Link
                  href="https://facebook.com/TU_PAGINA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8cfc2] bg-white px-4 py-3 text-sm font-medium text-[#1f2a24] transition hover:bg-[#edf5ef]"
                  aria-label="Facebook"
                >
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1877F2] text-xs font-bold leading-none text-white">
                    f
                  </span>
                  Facebook
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#ded2c1] pt-7 text-sm text-[#5b655f] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Vivero Frijolito. Todos los derechos reservados.</p>
          <p>Hecho con cariño para amantes de las plantas.</p>
        </div>
      </div>
    </footer>
  );
}