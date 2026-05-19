"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  image_url: string | null;
  available: boolean;
  featured: boolean;
  created_at?: string;
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Monsteras",
  image_url: "",
  available: true,
  featured: false,
};

const categories = [
  "Monsteras",
  "Philodendros",
  "Exóticas",
  "Insumos",
  "Filito",
];

function ProductSkeleton() {
  return (
    <article className="overflow-hidden rounded-[30px] border border-[#eadfce] bg-white shadow-lg">
      <div className="h-56 w-full animate-pulse bg-[#f1eadf]" />

      <div className="space-y-4 p-6">
        <div className="h-4 w-24 animate-pulse rounded-full bg-[#eadfce]" />

        <div className="h-7 w-3/4 animate-pulse rounded-full bg-[#eadfce]" />

        <div className="h-6 w-28 animate-pulse rounded-full bg-[#eadfce]" />

        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded-full bg-[#eadfce]" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-[#eadfce]" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#eadfce]" />
        </div>

        <div className="h-11 w-full animate-pulse rounded-2xl bg-[#eadfce]" />

        <div className="grid grid-cols-2 gap-3">
          <div className="h-11 animate-pulse rounded-2xl bg-[#eadfce]" />
          <div className="h-11 animate-pulse rounded-2xl bg-[#eadfce]" />
        </div>
      </div>
    </article>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [oldImageUrl, setOldImageUrl] = useState<string | null>(null);
  

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoadingSession(false);
    }

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      getProducts();
    }
  }, [session]);

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
    }

  async function getProducts() {
    setLoadingProducts(true);

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error al cargar productos:", error);
        alert(`Error al cargar productos: ${error.message}`);
        setLoadingProducts(false);
        return;
    }

    setProducts(data || []);
    setLoadingProducts(false);
    }

  async function uploadImage(file: File) {
    setUploading(true);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 3 * 1024 * 1024; // 3MB

    if (!allowedTypes.includes(file.type)) {
    alert("Formato no permitido. Usa JPG, PNG o WEBP.");
    return;
    }

    if (file.size > maxSize) {
    alert("La imagen es demasiado pesada. Máximo permitido: 3MB.");
    return;
    }

    const cleanName = file.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "");

    const fileName = `${Date.now()}-${cleanName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) {
        console.error("Error al subir imagen:", error);
        setUploading(false);
        alert(`Error al subir imagen: ${error.message}`);
        return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    setForm((current) => ({
      ...current,
      image_url: data.publicUrl,
    }));

    setUploading(false);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      alert("Ingresa un precio válido");
      return;
    }

    setSaving(true);

    const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        image_url: form.image_url,
        available: form.available,
        featured: form.featured,
    };

    if (editingId) {
        const { error } = await supabase
            .from("products")
            .update(productData)
            .eq("id", editingId);

        if (error) {
            console.error("Error al editar producto:", error);
            setSaving(false);
            alert(`Error al editar producto: ${error.message}`);
            return;
        }

        if (oldImageUrl && oldImageUrl !== form.image_url) {
            const oldImagePath = getStoragePathFromUrl(oldImageUrl);

            if (oldImagePath) {
            const { error: storageError } = await supabase.storage
                .from("product-images")
                .remove([oldImagePath]);

            if (storageError) {
                console.error("Error al eliminar imagen antigua:", storageError);
            }
            }
        }
        } else {
      const { error } = await supabase.from("products").insert(productData);

      if (error) {
        console.error("Error al agregar producto:", error);
        setSaving(false);
        alert(`Error al agregar producto: ${error.message}`);
        return;
      }
    }

    setForm(emptyForm);
    setEditingId(null);
    setOldImageUrl(null);
    setShowForm(false);
    await getProducts();

    setMessage(
    editingId
        ? "Los cambios fueron guardados correctamente."
        : "El producto fue agregado correctamente."
    );

    setSaving(false);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function clearForm() {
    if (hasFormChanges()) {
        const confirmClear = confirm(
        "¿Seguro que quieres limpiar el formulario? Se perderán los datos ingresados."
        );

        if (!confirmClear) return;
        }

        setForm(emptyForm);
        setEditingId(null);
        setOldImageUrl(null);
    }

    function removeImageFromForm() {
    if (!form.image_url) return;

    const confirmRemove = confirm(
        "¿Seguro que quieres quitar la imagen de este producto?"
    );

    if (!confirmRemove) return;

    setForm((current) => ({
        ...current,
        image_url: "",
    }));
    }

    function hasFormChanges() {
        return Boolean(
            form.name.trim() ||
            form.description.trim() ||
            form.price.trim() ||
            form.image_url ||
            form.category !== emptyForm.category ||
            form.available !== emptyForm.available ||
            form.featured !== emptyForm.featured
        );
    }

    function toggleForm() {
        if (showForm) {
            if (hasFormChanges()) {
            const confirmClose = confirm(
                "¿Seguro que quieres cerrar el formulario? Se perderán los datos no guardados."
            );

            if (!confirmClose) return;
            }

            setEditingId(null);
            setForm(emptyForm);
            setOldImageUrl(null);
            setShowForm(false);
            return;
        }

        setEditingId(null);
        setForm(emptyForm);
        setOldImageUrl(null);
        setShowForm(true);
    }

  function editProduct(product: Product) {
        setEditingId(product.id);
        setShowForm(true);
        setOldImageUrl(product.image_url || null);
        setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price ? String(product.price) : "",
        category: product.category || "Monsteras",
        image_url: product.image_url || "",
        available: product.available,
        featured: product.featured,
    });


    window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function getStoragePathFromUrl(url: string | null) {
    if (!url) return null;

    const parts = url.split("/product-images/");
    return parts[1] || null;
    }

  async function deleteProduct(product: Product) {
    if (
        !confirm(
        `¿Seguro que quieres eliminar "${product.name}"? Esta acción no se puede deshacer.`
        )
    ) {
        return;
    }

    const imagePath = getStoragePathFromUrl(product.image_url);

    if (imagePath) {
        const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove([imagePath]);

        if (storageError) {
        console.error("Error al eliminar imagen del storage:", storageError);
        }
    }

    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

    if (error) {
        console.error("Error al eliminar producto:", error);
        alert(`Error al eliminar producto: ${error.message}`);
        return;
    }

    await getProducts();

    setMessage("El producto fue eliminado correctamente.");

    setTimeout(() => {
        setMessage("");
    }, 3000);
    }

  async function toggleAvailability(product: Product) {
    const { error } = await supabase
      .from("products")
      .update({ available: !product.available })
      .eq("id", product.id);

    if (error) {
        console.error("Error al cambiar disponibilidad:", error);
        alert(`Error al cambiar disponibilidad: ${error.message}`);
        return;
    }

    await getProducts();
  }

  async function toggleFeatured(product: Product) {
    const { error } = await supabase
        .from("products")
        .update({ featured: !product.featured })
        .eq("id", product.id);

    if (error) {
        console.error("Error al cambiar destacado:", error);
        alert(`Error al cambiar destacado: ${error.message}`);
        return;
    }

    await getProducts();
    }

    const filteredProducts = products.filter((product) => {
  const searchText = search.toLowerCase();

  const productName = product.name?.toLowerCase() || "";
  const productCategory = product.category?.toLowerCase() || "";
  const productDescription = product.description?.toLowerCase() || "";

  const matchSearch =
    productName.includes(searchText) ||
    productCategory.includes(searchText) ||
    productDescription.includes(searchText);

  const matchStatus =
    statusFilter === "todos"
      ? true
      : statusFilter === "disponibles"
        ? product.available
        : statusFilter === "agotados"
          ? !product.available
          : statusFilter === "destacados"
            ? product.featured
            : true;

  const matchCategory =
    categoryFilter === "todas" ? true : product.category === categoryFilter;

  return matchSearch && matchStatus && matchCategory;
});

  if (loadingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f3ed] px-6 text-[#1f2a24]">
        <div className="rounded-4xl bg-white px-8 py-6 shadow-xl">
          Verificando acceso...
        </div>
      </main>
    );
  }

        if (!session) {
        return null;
        }

  return (
    <main className="min-h-screen bg-[#f8f3ed] px-6 py-10 text-[#1f2a24]">
      <div className="mx-auto max-w-7xl">
        {message && (
            <div className="fixed right-6 top-6 z-999 max-w-sm rounded-3xl border border-[#cfe3d5] bg-white px-5 py-4 text-[#1f2a24] shadow-2xl shadow-black/10">
                <div className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#edf5ef] text-sm font-bold text-[#2f6f4e]">
                    ✓
                </span>

                <div>
                    <p className="font-semibold">Acción completada</p>
                    <p className="mt-1 text-sm text-[#5b655f]">{message}</p>
                </div>
                </div>
            </div>
        )}
        <div className="mb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                <h1 className="text-4xl font-bold text-[#102522]">
                    Panel administrador
                </h1>

                <p className="mt-2 text-[#5b655f]">
                    Productos cargados: {products.length}
                </p>
                </div>

                <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={toggleForm}
                    className={`rounded-2xl px-5 py-3 border border-[#2f6f4e] bg-white text-black font-medium shadow-lg transition shadow-[#c0392b]/20 hover:bg-[#255a3f] ${
                    showForm
                        ? "bg-[#1f2a24] text-black shadow-[#1f2a24]/20 hover:bg-[#111815]"
                        : "bg-[#2f6f4e] text-black shadow-[#2f6f4e]/20 hover:bg-[#255a3f]"
                    }`}
                >
                    {showForm ? "Cerrar formulario" : "+ Nuevo producto"}
                </button>

                <Link
                    href="/"
                    className="rounded-2xl border border-[#111815] bg-white px-5 py-3 transition hover:bg-[#edf5ef]"
                >
                    Ver sitio
                </Link>

                <button type="button" onClick={handleLogout} className={`rounded-2xl px-5 py-3 border border-[#c0392b] bg-white font-medium shadow-lg transition shadow-[#c0392b]/20 hover:bg-[#a93226]`}>
                Cerrar sesión
                </button>
                </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-2xl border border-[#eadfce] bg-white px-5 py-4 shadow-sm">
                    <div>
                    <p className="text-sm text-[#5b655f]">Disponibles</p>
                    <p className="text-xs text-[#8a918b]">Productos activos</p>
                    </div>

                    <p className="text-3xl font-bold text-[#2f6f4e]">
                    {products.filter((p) => p.available).length}
                    </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#eadfce] bg-white px-5 py-4 shadow-sm">
                    <div>
                    <p className="text-sm text-[#5b655f]">Agotados</p>
                    <p className="text-xs text-[#8a918b]">No disponibles</p>
                    </div>

                    <p className="text-3xl font-bold text-red-500">
                    {products.filter((p) => !p.available).length}
                    </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#eadfce] bg-white px-5 py-4 shadow-sm">
                    <div>
                    <p className="text-sm text-[#5b655f]">Destacados</p>
                    <p className="text-xs text-[#8a918b]">Prioridad alta</p>
                    </div>

                    <p className="text-3xl font-bold text-[#8a6500]">
                    {products.filter((p) => p.featured).length}
                    </p>
                </div>
                </div>
            </div>

        <div className="mb-8 rounded-[28px] border border-[#eadfce] bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <input
            type="text"
            placeholder="Buscar por nombre, categoría o descripción..."
            className="w-full rounded-2xl border border-[#d8cfc2] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#2f6f4e] focus:ring-4 focus:ring-[#2f6f4e]/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
                {[
                { label: "Todos", value: "todos", count: products.length },
                {
                    label: "Disponibles",
                    value: "disponibles",
                    count: products.filter((p) => p.available).length,
                },
                {
                    label: "Agotados",
                    value: "agotados",
                    count: products.filter((p) => !p.available).length,
                },
                {
                    label: "Destacados",
                    value: "destacados",
                    count: products.filter((p) => p.featured).length,
                },
                ].map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => setStatusFilter(filter.value)}
                        className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                            statusFilter === filter.value
                            ? "bg-[#2f6f4e] text-white"
                            : "bg-transparent text-[#5b655f] hover:bg-[#f8f3ed] hover:text-[#2f6f4e]"
                        }`}
                        >
                        <span>{filter.label}</span>
                        <span
                            className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                            statusFilter === filter.value
                                ? "bg-white/20 text-white"
                                : "bg-[#f8f3ed] text-[#5b655f]"
                            }`}
                        >
                            {filter.count}
                        </span>
                    </button>
                ))}
                </div>
        </div>

        <div className="mt-4 border-t border-[#eadfce] pt-4">
            <p className="mb-3 text-sm font-semibold text-[#1f2a24]">
            Filtrar por categoría
            </p>

            <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => setCategoryFilter("todas")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                categoryFilter === "todas"
                    ? "bg-[#1f2a24] text-white shadow-md shadow-[#1f2a24]/15"
                    : "bg-[#f8f3ed] text-[#5b655f] hover:bg-[#edf5ef] hover:text-[#2f6f4e]"
                }`}
            >
                Todas
            </button>

            {categories.map((category) => (
                <button
                key={category}
                type="button"
                onClick={() => setCategoryFilter(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    categoryFilter === category
                    ? "bg-[#1f2a24] text-white shadow-md shadow-[#1f2a24]/15"
                    : "bg-[#f8f3ed] text-[#5b655f] hover:bg-[#edf5ef] hover:text-[#2f6f4e]"
                }`}
                >
                {category}
                </button>
            ))}
            </div>
        </div>

        {(search || statusFilter !== "todos" || categoryFilter !== "todas") && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eadfce] pt-4">
            <p className="text-sm text-[#5b655f]">
                Filtros activos:{" "}
                <span className="font-semibold text-[#1f2a24]">
                {statusFilter === "todos"
                    ? "Todos"
                    : statusFilter === "disponibles"
                    ? "Disponibles"
                    : statusFilter === "agotados"
                        ? "Agotados"
                        : "Destacados"}
                </span>
                {" · "}
                <span className="font-semibold text-[#1f2a24]">
                {categoryFilter === "todas" ? "Todas las categorías" : categoryFilter}
                </span>
            </p>

            <button
                type="button"
                onClick={() => {
                setSearch("");
                setStatusFilter("todos");
                setCategoryFilter("todas");
                }}
                className="rounded-full border border-[#d8cfc2] px-4 py-2 text-sm font-medium text-[#1f2a24] transition hover:bg-[#edf5ef]"
            >
                Limpiar filtros
            </button>
            </div>
        )}
        </div>

        {showForm && (
        <form
            onSubmit={saveProduct}
            className="mb-12 overflow-hidden rounded-4xl bg-white shadow-xl"
            >
            <div className="border-b border-[#eadfce] bg-[#fbf7f1] px-8 py-6">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#2f6f4e]">
                Gestión de catálogo
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#1f2a24]">
                {editingId ? "Editar producto" : "Agregar nuevo producto"}
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-[#5b655f]">
                Completa la información del producto. Los campos con * son obligatorios.
                </p>
            </div>

            <div className="grid gap-8 p-8 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1f2a24]">
                    Nombre del producto *
                    </label>
                    <input
                    placeholder="Ej: Monstera Deliciosa"
                    className="w-full rounded-2xl border border-[#d8cfc2] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#2f6f4e] focus:ring-4 focus:ring-[#2f6f4e]/10"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1f2a24]">
                        Precio *
                    </label>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5b655f]">
                        $
                        </span>
                        <input
                        placeholder="12990"
                        type="number"
                        min="0"
                        className="w-full rounded-2xl border border-[#d8cfc2] bg-[#fffdf9] px-8 py-3 outline-none transition focus:border-[#2f6f4e] focus:ring-4 focus:ring-[#2f6f4e]/10"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        required
                        />
                    </div>

                    {form.price && (
                        <p className="mt-2 text-sm text-[#5b655f]">
                        Se mostrará como{" "}
                        <span className="font-semibold text-[#1f2a24]">
                            ${Number(form.price).toLocaleString("es-CL")}
                        </span>
                        </p>
                    )}
                    </div>

                    <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1f2a24]">
                        Categoría *
                    </label>
                    <select
                    className="w-full rounded-2xl border border-[#d8cfc2] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#2f6f4e] focus:ring-4 focus:ring-[#2f6f4e]/10"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                    {categories.map((category) => (
                        <option key={category} value={category}>
                        {category}
                        </option>
                    ))}
                    </select>
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1f2a24]">
                    Descripción *
                    </label>
                    <textarea
                    placeholder="Ej: Planta tropical de hojas grandes, ideal para interiores con luz indirecta..."
                    className="min-h-36 w-full resize-none rounded-2xl border border-[#d8cfc2] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#2f6f4e] focus:ring-4 focus:ring-[#2f6f4e]/10"
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                    required
                    />

                    <div className="mt-2 flex justify-between text-xs text-[#5b655f]">
                    <span>Describe cuidados, tamaño o uso recomendado.</span>
                    <span>{form.description.length} caracteres</span>
                    </div>
                </div>

                <div className="rounded-3xl border border-[#eadfce] bg-[#fbf7f1] p-5">
                    <label className="mb-3 block text-sm font-semibold text-[#1f2a24]">
                    Imagen del producto
                    </label>

                    <input
                   
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="block w-full cursor-pointer rounded-2xl border border-dashed border-[#cdbfae] bg-white px-4 py-4 text-sm text-[#5b655f] file:mr-4 file:rounded-full file:border-0 file:bg-[#2f6f4e] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:bg-[#fffdf9]"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file);
                    }}
                    />

                    <p className="mt-2 text-xs text-[#5b655f]">
                    Recomendado: JPG, PNG o WEBP.
                    </p>

                    {uploading && (
                    <div className="mt-4 rounded-2xl bg-[#edf5ef] px-5 py-4 text-sm font-medium text-[#2f6f4e]">
                        Subiendo imagen...
                    </div>
                    )}
                </div>
                </div>

                <aside className="space-y-5">
                <div className="rounded-3xl border border-[#eadfce] bg-[#fbf7f1] p-5">
                    <h3 className="text-lg font-bold text-[#1f2a24]">Vista previa</h3>
                    <p className="mt-1 text-sm text-[#5b655f]">
                    Así se verá la imagen principal del producto.
                    </p>

                    <div className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm">
                    {form.image_url ? (
                        <div className="relative">
                            <Image
                            src={form.image_url}
                            alt="Vista previa"
                            width={800}
                            height={600}
                            className="h-64 w-full object-cover"
                            />

                            <button
                            type="button"
                            onClick={removeImageFromForm}
                            className="absolute right-3 top-3 rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-red-600"
                            >
                            Quitar imagen
                            </button>
                        </div>
                    ) : (

                    <div className="p-5">
                        <p className="text-sm font-medium text-[#2f6f4e]">
                        {form.category || "Categoría"}
                        </p>

                        <h4 className="mt-1 text-xl font-bold text-[#1f2a24]">
                        {form.name || "Nombre del producto"}
                        </h4>

                        <p className="mt-2 line-clamp-3 text-sm text-[#5b655f]">
                        {form.description ||
                            "Aquí aparecerá la descripción que escribas para el producto."}
                        </p>

                        <p className="mt-4 text-lg font-bold text-[#1f2a24]">
                        {form.price
                            ? `$${Number(form.price).toLocaleString("es-CL")}`
                            : "$0"}
                        </p>
                    </div>
                    )}
                </div>
            </div>


                <div className="rounded-3xl border border-[#eadfce] bg-white p-5">
                    <h3 className="text-lg font-bold text-[#1f2a24]">Estado</h3>

                    <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#d8cfc2] bg-[#fffdf9] px-4 py-3">
                        <div>
                        <p className="font-semibold text-[#1f2a24]">Producto disponible</p>
                        <p className="text-sm text-[#5b655f]">
                            Si está desactivado, aparecerá como agotado.
                        </p>
                        </div>

                        <input
                        type="checkbox"
                        checked={form.available}
                        onChange={(e) =>
                            setForm({ ...form, available: e.target.checked })
                        }
                        className="h-5 w-5 accent-[#2f6f4e]"
                        />
                    </label>

                    <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#d8cfc2] bg-[#fffdf9] px-4 py-3">
                        <div>
                        <p className="font-semibold text-[#1f2a24]">Producto destacado</p>
                        <p className="text-sm text-[#5b655f]">
                            Úsalo para mostrar este producto con más prioridad.
                        </p>
                        </div>

                        <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) =>
                            setForm({ ...form, featured: e.target.checked })
                        }
                        className="h-5 w-5 accent-[#2f6f4e]"
                        />
                    </label>

                    <div
                        className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
                        form.available
                            ? "bg-[#edf5ef] text-[#2f6f4e]"
                            : "bg-red-50 text-red-600"
                        }`}
                    >
                        {form.available
                        ? "Este producto se mostrará como disponible."
                        : "Este producto se mostrará como agotado."}
                    </div>

                    {form.featured && (
                        <div className="mt-3 rounded-2xl bg-[#fff7df] px-4 py-3 text-sm font-medium text-[#8a6500]">
                        Este producto quedará marcado como destacado.
                        </div>
                    )}
                </div>
                </aside>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#eadfce] bg-[#fbf7f1] px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-[#5b655f]">
                {editingId
                    ? "Estás editando un producto existente. Puedes guardar cambios o cancelar la edición."
                    : "Estás creando un producto nuevo. Puedes limpiar el formulario si quieres empezar de nuevo."}
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={clearForm}
                        className="rounded-full border border-[#d8cfc2] bg-white px-6 py-3 font-medium text-[#1f2a24] transition hover:bg-[#edf5ef]"
                    >
                        Limpiar formulario
                    </button>

                    {editingId && (
                        <button
                        type="button"
                        onClick={() => {
                        setEditingId(null);
                        setForm(emptyForm);
                        setOldImageUrl(null);
                        setShowForm(false);
                        }}
                        className="rounded-full border border-[#d8cfc2] bg-white px-6 py-3 font-medium text-[#1f2a24] transition hover:bg-[#edf5ef]"
                        >
                        Cancelar edición
                        </button>
                    )}

                    <button
                        disabled={saving || uploading}
                        className="rounded-full bg-[#2f6f4e] px-7 py-3 font-medium text-white shadow-lg shadow-[#2f6f4e]/20 transition hover:bg-[#255a3f] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving
                        ? "Guardando..."
                        : editingId
                            ? "Guardar cambios"
                            : "Agregar producto"}
                    </button>
                 </div>
            </div>
        </form>
        )}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#2f6f4e]">
                Catálogo
                </p>
                <h2 className="mt-1 text-3xl font-bold text-[#1f2a24]">
                Productos registrados
                </h2>
                <p className="mt-1 text-sm text-[#5b655f]">
                Administra disponibilidad, edición y eliminación de productos.
                </p>
            </div>

            <p className="rounded-full bg-white px-4 py-2 text-sm text-[#5b655f] shadow-sm">
                Mostrando {filteredProducts.length} de {products.length}
            </p>
            </div>

            {loadingProducts && (
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                <ProductSkeleton key={index} />
                ))}
            </div>
            )}

            {!loadingProducts && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
                <article
                key={product.id}
                className="group overflow-hidden rounded-[30px] border border-[#eadfce] bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                >
                <div className="relative">
                    {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        width={600}
                        height={400}
                        className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    ) : (
                    <div className="flex h-48 items-center justify-center bg-[#f1eadf] text-[#5b655f]">
                    Sin imagen
                    </div>
                    )}

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#2f6f4e] shadow-sm backdrop-blur">
                        {product.category}
                    </span>

                    <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                        product.available
                        ? "bg-[#edf5ef]/95 text-[#2f6f4e]"
                        : "bg-red-50/95 text-red-600"
                    }`}
                    >
                    {product.available ? "Disponible" : "Agotado"}
                    </span>

                    {product.featured && (
                    <span className="rounded-full bg-[#fff7df]/95 px-3 py-1 text-xs font-semibold text-[#8a6500] shadow-sm backdrop-blur">
                        Destacado
                    </span>
                    )}
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold leading-tight text-[#1f2a24]">
                        {product.name}
                        </h3>

                        <p className="mt-2 text-lg font-bold text-[#2f6f4e]">
                        ${Number(product.price || 0).toLocaleString("es-CL")}
                        </p>
                    </div>
                    </div>

                    <p className="mt-4 line-clamp-3 min-h-18 text-sm leading-6 text-[#5b655f]">
                    {product.description || "Sin descripción disponible."}
                    </p>

                    <div className="mt-5 border-t border-[#eadfce] pt-4">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                            onClick={() => toggleAvailability(product)}
                            className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                                product.available
                                ? "bg-[#fff3f0] text-red-600 hover:bg-red-100"
                                : "bg-[#edf5ef] text-[#2f6f4e] hover:bg-[#dcece0]"
                            }`}
                            >
                            {product.available ? "Agotar" : "Activar"}
                            </button>

                            <button
                            onClick={() => toggleFeatured(product)}
                            className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                                product.featured
                                ? "bg-[#fff7df] text-[#8a6500] hover:bg-[#ffefbd]"
                                : "bg-[#f8f3ed] text-[#5b655f] hover:bg-[#fff7df] hover:text-[#8a6500]"
                            }`}
                            >
                            {product.featured ? "Quitar" : "Destacar"}
                            </button>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <button
                            onClick={() => editProduct(product)}
                            className="rounded-xl border border-[#d8cfc2] bg-white px-3 py-2.5 text-sm font-semibold text-[#1f2a24] transition hover:bg-[#edf5ef]"
                            >
                            Editar
                            </button>

                            <button
                            onClick={() => deleteProduct(product)}
                            className="rounded-xl bg-red-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                            >
                            Eliminar
                            </button>
                        </div>
                    </div>
                </div>
                </article>
            ))}
            </div>
            )}
        {!loadingProducts && filteredProducts.length === 0 && (
        <div className="rounded-[28px] bg-white p-8 text-center text-[#5b655f] shadow-lg">
            No se encontraron productos.
        </div>
        )}
      </div>
    </main>
  );
}