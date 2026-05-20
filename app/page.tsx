"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ProductsGrid from "@/components/ProductsGrid";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Todos");

  return (
    <main className="min-h-screen bg-[#f8f3ea] text-[#1f2a24]">
      <Header />
      <Hero />

      <Categories
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <ProductsGrid activeCategory={activeCategory} />

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}