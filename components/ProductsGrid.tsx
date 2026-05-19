"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string | null;
  description: string | null;
  price: number | null;
  category: string | null;
  image_url: string | null;
  available: boolean;
  featured: boolean;
};

type Props = {
  activeCategory: string;
};

function ProductSkeleton() {
  return (
    <article className="overflow-hidden rounded-[30px] border border-[#eadfce] bg-white shadow-lg">
      <div className="h-64 w-full animate-pulse bg-[#eadfce]" />

      <div className="space-y-4 p-6">
        <div className="h-5 w-24 animate-pulse rounded-xl bg-[#eadfce]" />
        <div className="h-8 w-3/4 animate-pulse rounded-xl bg-[#eadfce]" />
        <div className="h-5 w-full animate-pulse rounded-xl bg-[#eadfce]" />
        <div className="h-5 w-2/3 animate-pulse rounded-xl bg-[#eadfce]" />

        <div className="flex items-center justify-between border-t border-[#eadfce] pt-5">
          <div className="h-8 w-28 animate-pulse rounded-xl bg-[#eadfce]" />
          <div className="h-11 w-24 animate-pulse rounded-2xl bg-[#eadfce]" />
        </div>
      </div>
    </article>
  );
}

export default function ProductsGrid({ activeCategory }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function getProducts() {
      setLoadingProducts(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("available", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar productos:", error);
        setLoadingProducts(false);
        return;
      }

      setProducts(data || []);
      setLoadingProducts(false);
    }

    getProducts();
  }, []);

  const filteredProducts =
    activeCategory === "Todos"
      ? products
      : products.filter((product) => product.category === activeCategory);

  function getWhatsappUrl(product: Product) {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56912345678";

    const productName = product.name || "este producto";
    const productPrice = Number(product.price || 0).toLocaleString("es-CL");

    const message = `Hola, quiero consultar por ${productName} de $${productPrice}. ¿Está disponible?`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  return (
    <section id="catalogo" className="mx-auto max-w-7xl px-6 pb-12 pt-4">
      <div className="mb-12">
        <span className="rounded-2xl border border-[#d8cfc2] bg-white px-4 py-2 text-sm">
          🌿 Catálogo
        </span>

        <h2 className="mt-6 text-4xl font-bold">
          {activeCategory === "Todos" ? "Plantas disponibles" : activeCategory}
        </h2>

        <p className="mt-3 text-[#5b655f]">
          {loadingProducts
            ? "Cargando productos..."
            : `${filteredProducts.length} ${
                filteredProducts.length === 1
                  ? "producto disponible"
                  : "productos disponibles"
              }${activeCategory !== "Todos" ? ` en ${activeCategory}` : ""}.`}
        </p>
      </div>

      {loadingProducts ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-[#d8cfc2] bg-white/60 p-16 text-center">
          <p className="text-2xl font-semibold text-[#1f2a24]">
            No hay productos en esta categoría
          </p>

          <p className="mt-3 text-[#5b655f]">
            Pronto agregaremos nuevas plantas.
          </p>
        </div>
      ) : (
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-[30px] border border-[#eadfce] bg-white shadow-lg transition duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative overflow-hidden">
                {product.image_url ? (
                  <Image
                    width={500}
                    height={420}
                    src={product.image_url}
                    alt={product.name || "Producto del vivero"}
                    className="h-56 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-64"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-[#f5f1ea] text-[#5b655f] sm:h-64">
                    🌿 Producto sin imagen
                  </div>
                )}

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#2f6f4e] shadow-sm backdrop-blur">
                    {product.category || "Producto"}
                  </span>

                  {product.featured && (
                    <span className="rounded-full bg-[#fff7df]/95 px-3 py-1 text-xs font-semibold text-[#8a6500] shadow-sm backdrop-blur">
                      Destacado
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold leading-tight text-[#1f2a24] sm:text-2xl">
                  {product.name || "Producto sin nombre"}
                </h3>

                <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-[#5b655f]">
                  {product.description || "Sin descripción disponible."}
                </p>

                <div className="mt-6 flex flex-col gap-4 border-t border-[#eadfce] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#5b655f]">
                      Precio
                    </p>

                    <span className="mt-1 block text-2xl font-bold text-[#2f6f4e]">
                      ${Number(product.price || 0).toLocaleString("es-CL")}
                    </span>
                  </div>

                  <a
                    href={getWhatsappUrl(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl bg-[#2f6f4e] px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-[#2f6f4e]/20 transition hover:-translate-y-0.5 hover:bg-[#255c40]"
                  >
                    Consultar
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}