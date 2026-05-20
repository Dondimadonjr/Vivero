"use client";

import Image from "next/image";

const categories = [
  {
    name: "Todos",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Interior",
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Exterior",
    image:
      "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Insumos",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Exóticas",
    image:
      "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=1200&auto=format&fit=crop",
  },
];

type Props = {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
};

export default function Categories({
  activeCategory,
  setActiveCategory,
}: Props) {
  function handleCategoryClick(categoryName: string) {
    setActiveCategory(categoryName);

    const catalogo = document.getElementById("catalogo");

    if (catalogo) {
      const y = catalogo.getBoundingClientRect().top + window.scrollY - 70;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-2 pt-12">
      <div className="mb-8">
        <span className="rounded-2xl border border-[#d8cfc2] bg-white px-4 py-2 text-sm">
          🌿 Categorías
        </span>

        <h2 className="mt-6 text-4xl font-bold">Elige lo que necesitas</h2>

        <p className="mt-3 max-w-2xl text-[#5b655f]">
          Encuentra plantas ideales para interior, exterior e insumos para cuidar tu
          rincón verde.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto scroll-smooth pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => {
          const isActive = activeCategory === category.name;

          return (
            <button
              key={category.name}
              type="button"
              onClick={() => handleCategoryClick(category.name)}
              className="group min-w-20.5 rounded-[28px] p-1 transition hover:-translate-y-1 sm:min-w-23"
            >
              <div
                className={`h-20.5 w-20.5 shrink-0 overflow-hidden rounded-3xl border-4 shadow-lg transition duration-300 sm:h-23 sm:w-23 sm:rounded-[28px] ${
                  isActive
                  ? "scale-105 border-[#2f6f4e] shadow-xl shadow-[#2f6f4e]/20"
                  : "border-white hover:border-[#d8cfc2]"
                }`}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  width={120}
                  height={120}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-125"
                />
              </div>

              <p
                className={`mt-2 text-center text-xs font-semibold sm:mt-3 sm:text-sm ${
                  isActive ? "text-[#2f6f4e]" : "text-[#1f2a24]"
                }`}
              >
                {category.name}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}