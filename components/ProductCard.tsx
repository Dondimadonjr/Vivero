"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Product = {
  id: string;
  name: string | null;
  description: string | null;
  price: number | null;
  category: string | null;
  image_url: string | null;
  images?: string[] | null;
  available: boolean;
  featured: boolean;
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const productName = product.name || "Producto del vivero";
  const isInsumo = product.category === "Insumos";
  const isExotica = product.category === "Exóticas";

  const images = useMemo(() => {
    const allImages = [
      product.image_url,
      ...(product.images || []),
    ].filter(Boolean) as string[];

    return Array.from(new Set(allImages));
  }, [product.image_url, product.images]);

  const [activeImage, setActiveImage] = useState(images[0] || "/placeholder-planta.png");

  const precioFormateado =
    product.price !== null
      ? new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
          maximumFractionDigits: 0,
        }).format(product.price)
      : "Consultar";

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56912345678";
  

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    isInsumo
        ? `Hola, quiero consultar por el insumo: ${productName}. ¿Está disponible?`
        : `Hola, quiero consultar por la planta: ${productName}. ¿Está disponible?`
  )}`;

  return (
    <article className="group flex h-full w-full max-w-[420px] flex-col overflow-hidden rounded-[2rem] border border-[#d8cbb7]/70 bg-[#fffaf1] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-80 overflow-hidden bg-[#efe3cf]">
        <Image
          src={activeImage}
          alt={productName}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.category && (
            <span
                className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur ${
                isInsumo
                    ? "bg-[#fff1d6]/95 text-[#8a5a12]"
                    : isExotica
                    ? "bg-[#efe5ff]/95 text-[#5b3b8c]"
                    : "bg-white/90 text-[#2f6f4e]"
                }`}
            >
                {isInsumo ? "Insumo" : product.category}
            </span>
            )}

          {product.featured && (
            <span className="rounded-full bg-[#f6e7b8]/95 px-4 py-2 text-xs font-semibold text-[#7a5b00] shadow-sm backdrop-blur">
              Destacado
            </span>
          )}
        </div>

        <span
          className={`absolute right-4 top-4 rounded-full px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur ${
            product.available
              ? "bg-[#dff3d7]/95 text-[#315f2e]"
              : "bg-[#f3d7d7]/95 text-[#7a2f2f]"
          }`}
        >
          {product.available ? "Disponible" : "Agotado"}
        </span>

        {images.length > 1 && (
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div className="flex max-w-[75%] gap-2 rounded-2xl bg-white/75 p-2 shadow-lg backdrop-blur-md">
                {images.slice(0, 4).map((image, index) => {
                    const isActive = activeImage === image;

                    return (
                    <button
                        key={image}
                        type="button"
                        onClick={() => setActiveImage(image)}
                        className={`h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition hover:scale-105 ${
                        isActive
                            ? "border-[#2f6f4e] opacity-100"
                            : "border-white opacity-75 hover:opacity-100"
                        }`}
                        aria-label={`Ver imagen ${index + 1} de ${productName}`}
                    >
                        <Image
                        src={image}
                        alt={`${productName} imagen ${index + 1}`}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                        />
                    </button>
                    );
                })}

                {images.length > 4 && (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/50 text-xs font-bold text-white">
                    +{images.length - 4}
                    </span>
                )}
                </div>

                <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-[#1f2a24] shadow-lg backdrop-blur-md">
                {images.indexOf(activeImage) + 1}/{images.length}
                </span>
            </div>
            )}
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-semibold text-[#28351f]">
          {productName}
        </h3>

        <p className="mt-2 text-xl font-bold text-[#2f6f4e]">
          {precioFormateado}
        </p>

        <p className="mt-4 line-clamp-3 min-h-[72px] text-sm leading-6 text-[#68715f]">
        {product.description || "Producto natural del vivero Frijolito."}
        </p>

        <div className="mt-auto border-t border-[#eadfce] pt-5">
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-[#8b927f]">
                {images.length > 1
                    ? `${images.length} fotos disponibles`
                    : isInsumo
                    ? "Insumo para cuidado"
                    : "Foto de la planta"}
                </p>

                <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-full px-6 py-3 text-sm text-center font-semibold transition ${
                    product.available
                    ? "bg-[#2f6f4e] text-white hover:bg-[#255c40]"
                    : "pointer-events-none bg-[#c8c1b5] text-white/80"
                }`}
                >
                {isInsumo ? "Consultar insumo" : "Consultar"}
                </a>
            </div>
            </div>
      </div>
    </article>
  );
}