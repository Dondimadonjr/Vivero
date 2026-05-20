"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  image_url: string | null;
  images?: string[] | null;
  available: boolean | null;
  featured: boolean | null;
  care?: string | null;
  recommendations?: string | null;
  light?: string | null;
  watering?: string | null;
  difficulty?: string | null;
  created_at?: string;
};

type Props = {
  product: Product;
};

function formatPrice(price: number | null) {
  if (typeof price !== "number") return "Consultar precio";

  return price.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

export default function ProductCard({ product }: Props) {
  const [open, setOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const nombre = product.name || "Producto sin nombre";
  const descripcion =
    product.description || "Producto disponible en nuestro vivero.";
  const categoria = product.category || "Planta";
  const disponible = product.available !== false;
  const destacado = product.featured === true;
  const precioFormateado = formatPrice(product.price);

  const galeria = useMemo(() => {
    const imgs = [
      product.image_url,
      ...(Array.isArray(product.images) ? product.images : []),
    ]
      .filter((img): img is string => Boolean(img && img.trim() !== ""))
      .filter((img, index, array) => array.indexOf(img) === index);

    return imgs.length > 0 ? imgs : ["/logo_vivero_circular.png"];
  }, [product.image_url, product.images]);

  const imagenActual = galeria[activeImage] || galeria[0];

  const cuidado = product.care?.trim();
  const recomendaciones = product.recommendations?.trim();
  const luz = product.light?.trim();
  const riego = product.watering?.trim();
  const dificultad = product.difficulty?.trim();

  const mensajeWhatsApp = encodeURIComponent(
  `Hola, me interesa consultar por este producto: ${nombre}`
);

const whatsappUrl = `https://wa.me/56972086522?text=${mensajeWhatsApp}`;

  return (
    <>
      {/* CARD */}
      <article className="group relative overflow-hidden rounded-[2rem] border border-[#d9cbb7]/80 bg-[#fffaf2] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Imagen principal */}
        <div className="relative h-[325px] w-full overflow-hidden bg-[#efe3d2] sm:h-72">
          <Image
            src={galeria[0]}
            alt={nombre}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />

          {/* Badges solo desktop */}
          <div className="absolute left-4 right-4 top-4 hidden items-start justify-between gap-2 sm:flex">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#eadcff]/95 px-4 py-2 text-xs font-black text-[#6540a3] shadow-sm backdrop-blur">
                {categoria}
              </span>

              {destacado && (
                <span className="rounded-full bg-[#f4d35e]/95 px-4 py-2 text-xs font-black text-[#6a5200] shadow-sm backdrop-blur">
                  Destacado
                </span>
              )}
            </div>

            <span
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black shadow-sm backdrop-blur ${
                disponible
                  ? "bg-[#dff3dc]/95 text-[#2f6f4e]"
                  : "bg-[#f3dcdc]/95 text-[#9b2c2c]"
              }`}
            >
              {disponible ? "Disponible" : "No disponible"}
            </span>
          </div>

          {/* Miniaturas en card */}
          {galeria.length > 1 && (
            <div className="absolute bottom-4 left-4 flex max-w-[72%] gap-2 rounded-2xl bg-white/85 p-2 shadow-md backdrop-blur">
              {galeria.slice(0, 3).map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => {
                    setActiveImage(index);
                    setOpen(true);
                  }}
                  className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-[#d8d1c4] bg-white"
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${nombre} imagen ${index + 1}`}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {galeria.length > 1 && (
            <div className="absolute bottom-5 right-5 rounded-full bg-white/90 px-3 py-2 text-xs font-black text-[#26382b] shadow-md">
              1/{galeria.length}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-5 sm:p-6">
        {/* Badges solo móvil */}
        <div className="mb-4 flex flex-wrap gap-2 sm:hidden">
          <span className="rounded-full bg-[#eadcff] px-3 py-1.5 text-[11px] font-black text-[#6540a3]">
            {categoria}
          </span>

          {destacado && (
            <span className="rounded-full bg-[#f4d35e]/90 px-3 py-1.5 text-[11px] font-black text-[#6a5200]">
              Destacado
            </span>
          )}

          <span
            className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
              disponible
                ? "bg-[#dff3dc] text-[#2f6f4e]"
                : "bg-[#f3dcdc] text-[#9b2c2c]"
            }`}
          >
            {disponible ? "Disponible" : "No disponible"}
          </span>
        </div>
          <h3 className="line-clamp-2 text-[1.65rem] font-black leading-tight text-[#26382b] sm:text-2xl">
            {nombre}
          </h3>

          <p className="mt-2 text-2xl font-black text-[#2f6f4e]">
            {precioFormateado}
          </p>

          <p className="mt-5 border-b border-[#e4d8c5] pb-4 text-sm leading-7 text-[#5f665d] sm:line-clamp-3">
            {descripcion}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#7b8378]">
              {galeria.length}{" "}
              {galeria.length === 1 ? "foto disponible" : "fotos disponibles"}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveImage(0);
                setOpen(true);
              }}
              className="flex min-h-12 items-center justify-center rounded-full border border-[#d2c6b6] bg-white px-4 py-3 text-center text-sm font-black leading-tight text-[#26382b] shadow-sm transition hover:bg-[#f8f1e7]"
            >
              Ver detalle
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex min-h-12 items-center justify-center rounded-full px-4 py-3 text-center text-sm font-black leading-tight text-white shadow-sm transition ${
                disponible
                  ? "bg-[#2f6f4e] hover:bg-[#25583f]"
                  : "pointer-events-none bg-[#a8aaa6]"
              }`}
            >
              {disponible ? "Consultar" : "Agotado"}
            </a>
          </div>
        </div>
      </article>

      {/* MODAL SOLO INFORMATIVO */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/55 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
          onClick={() => setOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center sm:items-center">
            <div
              className="relative grid w-full max-w-7xl overflow-hidden rounded-[1.7rem] bg-[#fbf6ec] shadow-2xl md:max-h-[92vh] md:grid-cols-[0.95fr_1fr] md:rounded-[2rem]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cerrar */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl font-black text-[#26382b] shadow-md transition hover:scale-105"
                aria-label="Cerrar detalle"
              >
                ×
              </button>

              {/* LADO IZQUIERDO - GALERÍA */}
              <div className="flex flex-col bg-[#efe4d2] p-4 md:max-h-[92vh] md:p-5">
                {/* Imagen principal */}
                <div className="relative h-[330px] w-full overflow-hidden rounded-[1.5rem] bg-white shadow-sm sm:h-[440px] md:h-[650px]">
                  <Image
                    src={imagenActual}
                    alt={nombre}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-3"
                    priority={false}
                  />
                </div>

                {/* Miniaturas */}
                {galeria.length > 1 && (
                  <div className="mt-3 flex shrink-0 gap-3 overflow-x-auto pb-1">
                    {galeria.map((img, index) => {
                      const active = activeImage === index;

                      return (
                        <button
                          key={`${img}-${index}`}
                          type="button"
                          onClick={() => setActiveImage(index)}
                          className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition sm:h-24 sm:w-24 ${
                            active
                              ? "border-[#2f6f4e] ring-4 ring-[#2f6f4e]/10"
                              : "border-white hover:border-[#bfd0bc]"
                          }`}
                          aria-label={`Seleccionar imagen ${index + 1}`}
                        >
                          <Image
                            src={img}
                            alt={`${nombre} imagen ${index + 1}`}
                            fill
                            sizes="96px"
                            className="object-contain p-1"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* LADO DERECHO - INFO */}
              <div className="overflow-y-auto p-6 md:max-h-[92vh] md:p-8">
                <div className="flex flex-wrap gap-3 pr-16">
                  <span className="rounded-full bg-[#eadcff] px-4 py-2 text-xs font-black text-[#6540a3]">
                    {categoria}
                  </span>

                  {destacado && (
                    <span className="rounded-full bg-[#f4d35e]/80 px-4 py-2 text-xs font-black text-[#6a5200]">
                      Destacado
                    </span>
                  )}

                  <span
                    className={`rounded-full px-4 py-2 text-xs font-black ${
                      disponible
                        ? "bg-[#dff3dc] text-[#2f6f4e]"
                        : "bg-[#f3dcdc] text-[#9b2c2c]"
                    }`}
                  >
                    {disponible ? "Disponible" : "No disponible"}
                  </span>
                </div>

                <h2 className="mt-6 text-4xl font-black leading-tight text-[#26382b] sm:text-5xl md:text-6xl">
                  {nombre}
                </h2>

                <p className="mt-3 text-4xl font-black text-[#2f6f4e] sm:text-5xl md:text-6xl">
                  {precioFormateado}
                </p>

                {/* Descripción */}
                <section className="mt-8 rounded-[1.75rem] border border-[#e5dac8] bg-white/70 p-6 shadow-sm">
                  <h3 className="text-lg font-black text-[#26382b]">
                    Descripción
                  </h3>

                  <p className="mt-4 whitespace-pre-line text-base leading-9 text-[#5f665d]">
                    {descripcion}
                  </p>
                </section>

                {/* Datos rápidos */}
                <section className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-[#e5dac8] bg-white/70 p-5 shadow-sm sm:text-left">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3c4] text-xl">
                      ☀️
                    </div>

                    <p className="text-sm font-bold text-[#7b8378]">Luz recomendada</p>

                    <p className="mt-2 text-lg font-black text-[#26382b]">
                      {luz || "Luz indirecta"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[#e5dac8] bg-white/70 p-5 shadow-sm">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dff3ff] text-xl">
                      💧
                    </div>

                    <p className="text-sm font-bold text-[#7b8378]">Riego</p>

                    <p className="mt-2 text-lg font-black text-[#26382b]">
                      {riego || "Moderado"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[#e5dac8] bg-white/70 p-5 shadow-sm">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dff3dc] text-xl">
                      🌱
                    </div>

                    <p className="text-sm font-bold text-[#7b8378]">Dificultad</p>

                    <p className="mt-2 text-lg font-black text-[#26382b]">
                      {dificultad || "Fácil"}
                    </p>
                  </div>
                </section>

                {/* Cuidados */}
                {(cuidado || recomendaciones) && (
                  <section className="mt-6 rounded-[1.75rem] border border-[#e5dac8] bg-white/70 p-6 shadow-sm">
                    <h3 className="text-lg font-black text-[#26382b]">
                      Cuidado y recomendaciones
                    </h3>

                    {cuidado && (
                      <div className="mt-5 rounded-2xl border border-[#ece3d5] bg-[#fffdf8] p-5">
                        <p className="text-sm font-semibold text-[#7b8378]">
                          Cuidado
                        </p>

                        <p className="mt-3 whitespace-pre-line text-base leading-8 text-[#5f665d]">
                          {cuidado}
                        </p>
                      </div>
                    )}

                    {recomendaciones && (
                      <div className="mt-5 rounded-2xl border border-[#ece3d5] bg-[#fffdf8] p-5">
                        <p className="text-sm font-semibold text-[#7b8378]">
                          Recomendaciones
                        </p>

                        <p className="mt-3 whitespace-pre-line text-base leading-8 text-[#5f665d]">
                          {recomendaciones}
                        </p>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}