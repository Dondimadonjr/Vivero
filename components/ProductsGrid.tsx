"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

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

type Props = {
  activeCategory: string;
};

const PRODUCTS_PER_PAGE = 6;

function ProductSkeleton() {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-[#fffaf1] shadow-sm">
      <div className="h-80 w-full animate-pulse bg-[#eadfce]" />

      <div className="space-y-4 p-6">
        <div className="h-5 w-24 animate-pulse rounded-full bg-[#eadfce]" />
        <div className="h-8 w-3/4 animate-pulse rounded-xl bg-[#eadfce]" />
        <div className="h-6 w-32 animate-pulse rounded-xl bg-[#eadfce]" />
        <div className="h-5 w-full animate-pulse rounded-xl bg-[#eadfce]" />
        <div className="h-5 w-2/3 animate-pulse rounded-xl bg-[#eadfce]" />

        <div className="flex items-center justify-between border-t border-[#eadfce] pt-5">
          <div className="h-5 w-32 animate-pulse rounded-xl bg-[#eadfce]" />
          <div className="h-11 w-28 animate-pulse rounded-full bg-[#eadfce]" />
        </div>
      </div>
    </article>
  );
}

function getCatalogTitle(activeCategory: string) {
  if (activeCategory === "Todos") return "Productos disponibles";
  if (activeCategory === "Insumos") return "Insumos disponibles";
  if (activeCategory === "Exóticas") return "Plantas exóticas";

  return `Plantas de ${activeCategory.toLowerCase()}`;
}

function getCatalogDescription(count: number, activeCategory: string) {
  const productText = count === 1 ? "producto disponible" : "productos disponibles";

  if (activeCategory === "Todos") {
    return `${count} ${productText}.`;
  }

  if (activeCategory === "Insumos") {
    return `${count} ${productText} en insumos.`;
  }

  if (activeCategory === "Exóticas") {
    return `${count} ${productText} en plantas exóticas.`;
  }

  return `${count} ${productText} para ${activeCategory.toLowerCase()}.`;
}

export default function ProductsGrid({ activeCategory }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [page, setPage] = useState(1);

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

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return products;

    return products.filter((product) => product.category === activeCategory);
  }, [products, activeCategory]);

  const visibleCount = page * PRODUCTS_PER_PAGE;
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;
  const remainingProducts = filteredProducts.length - visibleCount;
  const nextProductsCount = Math.min(remainingProducts, PRODUCTS_PER_PAGE);

  return (
    <section
      id="catalogo"
      className="mx-auto max-w-7xl scroll-mt-32 px-6 pb-16 pt-10"
    >
      <div className="mb-12">
        <span className="rounded-2xl border border-[#d8cfc2] bg-white px-4 py-2 text-sm">
          🌿 Catálogo
        </span>

        <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#1f2a24] md:text-5xl">
          {getCatalogTitle(activeCategory)}
        </h2>

        <p className="mt-3 text-[#5b655f]">
          {loadingProducts
            ? "Cargando productos..."
            : getCatalogDescription(filteredProducts.length, activeCategory)}
        </p>
      </div>

      {loadingProducts ? (
        <div className="grid items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[#d8cfc2] bg-white/60 p-12 text-center md:p-16">
          <p className="text-2xl font-semibold text-[#1f2a24]">
            No hay productos en esta categoría
          </p>

          <p className="mt-3 text-[#5b655f]">
            Pronto agregaremos nuevas opciones al catálogo.
          </p>
        </div>
      ) : (
        <>
          <div className="grid items-stretch justify-center gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasMoreProducts && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                className="group rounded-full border border-[#d8cfc2] bg-white px-8 py-4 text-base font-semibold text-[#1f2a24] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#fffaf1] hover:shadow-md"
              >
                Mostrar más{" "}
                <span className="text-[#2f6f4e] transition group-hover:text-[#245c40]">
                  ({nextProductsCount})
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}