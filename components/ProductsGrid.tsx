"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

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
        setProducts([]);
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

  return (
    <section id="catalogo" className="mx-auto max-w-7xl px-6 pb-12 pt-4">
      <div className="mb-12">
        <span className="rounded-2xl border border-[#d8cfc2] bg-white px-4 py-2 text-sm">
          🌿 Catálogo
        </span>

        <h2 className="mt-6 text-4xl font-bold">
          {activeCategory === "Todos"
            ? "Productos disponibles"
            : activeCategory === "Insumos"
            ? "Insumos disponibles"
            : `Plantas de ${activeCategory.toLowerCase()}`}
        </h2>

        <p className="mt-3 text-[#5b655f]">
          {loadingProducts
            ? "Cargando productos..."
            : `${filteredProducts.length} ${
                filteredProducts.length === 1
                  ? "producto disponible"
                  : "productos disponibles"
              }${
                activeCategory !== "Todos"
                  ? activeCategory === "Insumos"
                    ? " en insumos"
                    : ` para ${activeCategory.toLowerCase()}`
                  : ""
              }.`}
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
        <div className="grid justify-center gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}