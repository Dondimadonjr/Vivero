"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard, { Product } from "./ProductCard";
import { supabase } from "@/lib/supabase";

type ProductsGridProps = {
  activeCategory: string;
};

export default function ProductsGrid({ activeCategory }: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando productos:", error);
        setError("No se pudieron cargar los productos.");
        setProducts([]);
      } else {
        setProducts((data || []) as Product[]);
      }

      setLoading(false);
    }

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return products;

    return products.filter(
      (product) =>
        product.category?.trim().toLowerCase() === activeCategory.toLowerCase()
    );
  }, [products, activeCategory]);

  return (
    <section
      id="catalogo"
      className="relative overflow-hidden bg-[#f8f3ea] px-5 pb-32 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-12"
    >
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#b7d7b0]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-[#e6c98f]/25 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-[#d7cab8] bg-white/70 px-5 py-2 text-sm font-black text-[#2f6f4e] shadow-sm backdrop-blur">
              🌿 Catálogo
            </span>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-[#26382b] sm:text-4xl">
              Nuestros productos
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#687264] sm:text-base">
              Explora las plantas disponibles del vivero y consulta directamente
              por WhatsApp.
            </p>
          </div>

          {!loading && !error && products.length > 0 && (
            <p className="rounded-full bg-white/70 px-5 py-2 text-sm font-bold text-[#687264] shadow-sm">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "producto encontrado"
                : "productos encontrados"}
            </p>
          )}
        </div>

        {loading && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[2rem] border border-[#d9cbb7]/70 bg-[#fffaf2] shadow-sm"
              >
                <div className="h-72 animate-pulse bg-[#eadfce]" />

                <div className="space-y-4 p-6">
                  <div className="h-6 w-2/3 animate-pulse rounded-full bg-[#eadfce]" />
                  <div className="h-5 w-1/3 animate-pulse rounded-full bg-[#eadfce]" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-[#eadfce]" />
                  <div className="h-4 w-5/6 animate-pulse rounded-full bg-[#eadfce]" />
                  <div className="h-11 w-full animate-pulse rounded-full bg-[#eadfce]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <h3 className="text-xl font-black text-red-700">
              Ocurrió un problema
            </h3>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-red-600 px-6 py-3 text-sm font-black text-white transition hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="mx-auto max-w-xl rounded-3xl border border-[#d9cbb7] bg-white/70 p-8 text-center shadow-sm">
            <h3 className="text-2xl font-black text-[#26382b]">
              Aún no hay productos
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#687264]">
              Cuando agregues productos desde el panel administrador, aparecerán
              automáticamente aquí.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          products.length > 0 &&
          filteredProducts.length === 0 && (
            <div className="mx-auto max-w-xl rounded-3xl border border-[#d9cbb7] bg-white/70 p-8 text-center shadow-sm">
              <h3 className="text-2xl font-black text-[#26382b]">
                No hay productos en esta categoría
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#687264]">
                Prueba seleccionando otra categoría del catálogo.
              </p>
            </div>
          )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}