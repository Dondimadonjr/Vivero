import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56912345678";

  const whatsappMessage = encodeURIComponent(
    "Hola, quiero consultar por las plantas disponibles del vivero."
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7ddcf] bg-[#f8f3ea]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo_vivero_circular.png"
            alt="Logo vivero frijolito"
            width={64}
            height={64}
            priority
            className="h-20 w-20 rounded-full object-contain"
          />

          <div className="leading-[0.95]">
            <p className="text-2xl font-semibold tracking-tight text-[#1f2a24] sm:text-3xl">
              vivero
            </p>
            <p className="text-2xl font-semibold tracking-tight text-[#1f2a24] sm:text-3xl">
              frijolito
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <a
            href="#catalogo"
            className="hidden rounded-full border border-[#ddd0be] bg-white/80 px-7 py-3 text-base font-medium text-[#1f2a24] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:inline-flex"
          >
            Catálogo
          </a>

          <a
            href={`https://wa.me/${phone}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#2f7d55] px-7 py-3 text-base font-semibold text-white shadow-md shadow-[#2f7d55]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#286946] hover:shadow-lg"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}