"use client";
import Image from "next/image";

type Product = {
  id: string;
  name: string | null;
  description: string | null;
  price: number | null;
  category: string | null;
  image_url: string | null;
  environment: string | null;
  available: boolean;
  featured: boolean;
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const precioFormateado =
    product.price !== null
      ? new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
          maximumFractionDigits: 0,
        }).format(product.price)
      : "Consultar";

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-[#d8cbb7]/70 bg-[#fffaf1] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-64 overflow-hidden bg-[#efe3cf]">
        <Image
          src={product.image_url || "/placeholder-planta.png"}
          alt={product.name || "Producto del vivero"}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

        {product.featured && (
          <span className="absolute left-4 top-4 rounded-full bg-[#f6e7b8] px-4 py-2 text-xs font-semibold text-[#4b5d3a] shadow-sm">
            Destacado
          </span>
        )}

        <span
          className={`absolute right-4 top-4 rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${
            product.available
              ? "bg-[#dff3d7] text-[#315f2e]"
              : "bg-[#f3d7d7] text-[#7a2f2f]"
          }`}
        >
          {product.available ? "Disponible" : "Agotado"}
        </span>
      </div>

      <div className="p-6">
        {product.category && (
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[#7f8f68]">
            {product.category}
          </p>
        )}

        <h3 className="text-2xl font-semibold text-[#28351f]">
          {product.name || "Producto del vivero"}
        </h3>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#68715f]">
          {product.description || "Producto natural del vivero Frijolito."}
        </p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#8b927f]">Precio</p>
            <p className="text-xl font-bold text-[#2f6f4e]">
              {precioFormateado}
            </p>
          </div>

          <a
            href={`https://wa.me/569XXXXXXXX?text=${encodeURIComponent(
              `Hola, quiero consultar por el producto: ${product.name}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              product.available
                ? "bg-[#2f6f4e] text-white hover:bg-[#255c40]"
                : "pointer-events-none bg-[#c8c1b5] text-white/80"
            }`}
          >
            Consultar
          </a>
        </div>
      </div>
    </article>
  );
}