"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  image_url: string | null;
  images: string[] | null;
  available: boolean;
  featured: boolean;
  created_at?: string;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  images: string[];
  available: boolean;
  featured: boolean;
};

type CustomSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

const BUCKET_NAME = "product-images";
const MAX_IMAGE_SIZE_MB = 20;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const categories = ["Interior", "Exterior", "Insumos", "Exóticas"];

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  category: "Interior",
  image_url: "",
  images: [],
  available: true,
  featured: false,
};

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

function CustomSelect({ label, value, options, onChange }: CustomSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-semibold text-[#1f2a24]">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-2xl border border-[#d8cfc2] bg-[#fffdf9] px-4 py-3 text-left outline-none transition hover:border-[#2f6f4e]/60 focus:border-[#2f6f4e] focus:ring-4 focus:ring-[#2f6f4e]/10"
      >
        <span>{value || "Seleccionar"}</span>
        <span className={`transition ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#d8cfc2] bg-white shadow-xl">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`block w-full px-4 py-3 text-left text-sm transition ${
                value === option
                  ? "bg-[#edf5ef] font-semibold text-[#2f6f4e]"
                  : "text-[#1f2a24] hover:bg-[#f8f3ed]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatPrice(price: number | string | null) {
  const value = Number(price || 0);

  if (!value) return "Sin precio";

  return `$${value.toLocaleString("es-CL")}`;
}

function getProductImages(product: Product) {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];

  if (images.length > 0) return images;
  if (product.image_url) return [product.image_url];

  return [];
}

function getStoragePathFromUrl(url: string | null) {
  if (!url) return null;

  const marker = `/${BUCKET_NAME}/`;
  const [, path] = url.split(marker);

  return path || null;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export default function AdminPage() {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [oldImages, setOldImages] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        router.refresh();
        return;
      }

      setSession(session);
      setLoadingSession(false);
    }

    checkSession();
  }, [router]);

  useEffect(() => {
    if (session) {
      getProducts();
    }
  }, [session]);

  const filteredProducts = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return products.filter((product) => {
      const productName = product.name?.toLowerCase() || "";
      const productCategory = product.category?.toLowerCase() || "";
      const productDescription = product.description?.toLowerCase() || "";

      const matchSearch =
        !searchText ||
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
  }, [categoryFilter, products, search, statusFilter]);

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

    setProducts((data || []) as Product[]);
    setLoadingProducts(false);
  }

  async function uploadImages(files: File[]) {
    if (files.length === 0) return;

    const invalidFile = files.find((file) => !ALLOWED_IMAGE_TYPES.includes(file.type));

    if (invalidFile) {
      alert(`Formato no permitido en ${invalidFile.name}. Usa JPG, PNG o WEBP.`);
      return;
    }

    const tooHeavyFile = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);

    if (tooHeavyFile) {
      alert(
        `${tooHeavyFile.name} es demasiado pesada. Máximo permitido: ${MAX_IMAGE_SIZE_MB}MB por imagen.`
      );
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split(".").pop() || "webp";
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Error al subir imagen:", error);
          alert(`No se pudo subir ${file.name}: ${error.message}`);
          continue;
        }

        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }

      if (uploadedUrls.length === 0) return;

      setForm((currentForm) => {
        const newImages = uniqueStrings([...currentForm.images, ...uploadedUrls]);

        return {
          ...currentForm,
          images: newImages,
          image_url: currentForm.image_url || newImages[0] || "",
        };
      });
    } catch (error) {
      console.error("Error inesperado al subir imágenes:", error);
      alert("Ocurrió un error al subir las imágenes.");
    } finally {
      setUploading(false);
    }
  }

  async function removeImagesFromStorage(urls: string[]) {
    const paths = urls
      .map((url) => getStoragePathFromUrl(url))
      .filter((path): path is string => Boolean(path));

    if (paths.length === 0) return;

    const { error } = await supabase.storage.from(BUCKET_NAME).remove(paths);

    if (error) {
      console.error("Error al eliminar imágenes del storage:", error);
    }
  }

  async function saveProduct(e: FormEvent<HTMLFormElement>) {
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

    const cleanImages = uniqueStrings(form.images);
    const mainImage = form.image_url || cleanImages[0] || "";

    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      image_url: mainImage,
      images: cleanImages,
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

      const removedImages = oldImages.filter((oldImage) => !cleanImages.includes(oldImage));
      await removeImagesFromStorage(removedImages);
    } else {
      const { error } = await supabase.from("products").insert(productData);

      if (error) {
        console.error("Error al agregar producto:", error);
        setSaving(false);
        alert(`Error al agregar producto: ${error.message}`);
        return;
      }
    }

    const successMessage = editingId
      ? "Los cambios fueron guardados correctamente."
      : "El producto fue agregado correctamente.";

    setForm(emptyForm);
    setEditingId(null);
    setOldImages([]);
    setShowForm(false);
    await getProducts();

    setMessage(successMessage);
    setSaving(false);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function hasFormChanges() {
    return Boolean(
      form.name.trim() ||
        form.description.trim() ||
        form.price.trim() ||
        form.image_url ||
        form.images.length > 0 ||
        form.category !== emptyForm.category ||
        form.available !== emptyForm.available ||
        form.featured !== emptyForm.featured
    );
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setOldImages([]);
  }

  function clearForm() {
    if (hasFormChanges()) {
      const confirmClear = confirm(
        "¿Seguro que quieres limpiar el formulario? Se perderán los datos ingresados."
      );

      if (!confirmClear) return;
    }

    resetForm();
  }

  function toggleForm() {
    if (showForm) {
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      return;
    }

    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function setMainImage(url: string) {
    setForm((current) => ({
      ...current,
      image_url: url,
      images: uniqueStrings([url, ...current.images]),
    }));
  }

  function removeImageFromForm(url: string) {
    const confirmRemove = confirm("¿Seguro que quieres quitar esta imagen del producto?");

    if (!confirmRemove) return;

    setForm((current) => {
      const nextImages = current.images.filter((image) => image !== url);
      const nextMainImage = current.image_url === url ? nextImages[0] || "" : current.image_url;

      return {
        ...current,
        images: nextImages,
        image_url: nextMainImage,
      };
    });
  }

  function editProduct(product: Product) {
    const images = getProductImages(product);

    setEditingId(product.id);
    setShowForm(true);
    setOldImages(images);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ? String(product.price) : "",
      category: product.category || "Interior",
      image_url: product.image_url || images[0] || "",
      images,
      available: product.available,
      featured: product.featured,
    });
    setTimeout(() => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
}, 100);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(product: Product) {
    if (
      !confirm(
        `¿Seguro que quieres eliminar "${product.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    await removeImagesFromStorage(getProductImages(product));

    const { error } = await supabase.from("products").delete().eq("id", product.id);

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

  if (loadingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f3ed] px-6 text-[#1f2a24]">
        <div className="rounded-[28px] bg-white px-8 py-6 shadow-xl">
          Verificando acceso...
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f3ed] px-6 text-[#1f2a24]">
        <div className="rounded-[28px] bg-white px-8 py-6 shadow-xl">
          Redirigiendo al login...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f3ed] px-4 py-8 text-[#1f2a24] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        {message && (
          <div className="fixed right-6 top-6 z-[999] max-w-sm rounded-3xl border border-[#cfe3d5] bg-white px-5 py-4 text-[#1f2a24] shadow-2xl shadow-black/10">
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

        <section className="mb-8">
          
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#2f6f4e]">
                Vivero Frijolito
              </p>
              <h1 className="mt-2 text-4xl font-bold text-[#102522]">
                Panel administrador
              </h1>
              <p className="mt-2 text-[#5b655f]">
                Gestiona productos, imágenes, destacados y disponibilidad.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={toggleForm}
                className={`rounded-2xl px-5 py-3 font-semibold shadow-lg transition ${
                  showForm
                    ? "bg-[#1f2a24] text-white shadow-[#1f2a24]/20 hover:bg-[#111815]"
                    : "bg-[#2f6f4e] text-white shadow-[#2f6f4e]/20 hover:bg-[#255a3f]"
                }`}
              >
                {showForm ? "Cerrar formulario" : "+ Nuevo producto"}
              </button>

              <Link
                href="/"
                className="rounded-2xl border border-[#d8cfc2] bg-white px-5 py-3 font-semibold text-[#1f2a24] transition hover:bg-[#edf5ef]"
              >
                Ver sitio
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-[#f0c7c7] bg-white px-3 py-2.5 font-semibold text-[#c1121f] transition hover:-translate-y-0.5 hover:bg-[#fff1f1]"
              >
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
                {products.filter((product) => product.available).length}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[#eadfce] bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="text-sm text-[#5b655f]">Agotados</p>
                <p className="text-xs text-[#8a918b]">No disponibles</p>
              </div>
              <p className="text-3xl font-bold text-red-500">
                {products.filter((product) => !product.available).length}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[#eadfce] bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="text-sm text-[#5b655f]">Destacados</p>
                <p className="text-xs text-[#8a918b]">Prioridad alta</p>
              </div>
              <p className="text-3xl font-bold text-[#8a6500]">
                {products.filter((product) => product.featured).length}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[28px] border border-[#eadfce] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <div>
              <p className="text-sm font-semibold text-[#1f2a24]">
                Buscar y filtrar productos
              </p>
              <p className="text-xs text-[#5b655f]">
                {filteredProducts.length} resultado
                {filteredProducts.length === 1 ? "" : "s"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilters((current) => !current)}
              className="rounded-full border border-[#d8cfc2] bg-[#fffdf9] px-4 py-2 text-sm font-semibold text-[#2f6f4e] transition hover:bg-[#eef6df]"
            >
              {showMobileFilters ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <div
            className={`mt-4 grid gap-4 lg:mt-0 lg:grid lg:grid-cols-[1fr_auto] lg:items-center ${
              showMobileFilters ? "grid" : "hidden"
            }`}
          >
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
                  count: products.filter((product) => product.available).length,
                },
                {
                  label: "Agotados",
                  value: "agotados",
                  count: products.filter((product) => !product.available).length,
                },
                {
                  label: "Destacados",
                  value: "destacados",
                  count: products.filter((product) => product.featured).length,
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
        </section>

        {showForm && (
          <form
            ref={formRef}
            onSubmit={saveProduct}
            className="mb-12 overflow-hidden rounded-[32px] border border-[#eadfce] bg-white shadow-xl"
          >
            <div className="border-b border-[#eadfce] bg-[#fbf7f1] px-6 py-6 sm:px-8">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#2f6f4e]">
                Gestión de catálogo
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#1f2a24]">
                {editingId ? "Editar producto" : "Agregar nuevo producto"}
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-[#5b655f]">
                Puedes subir varias imágenes. La primera será la imagen principal del producto.
              </p>
            </div>

            <div className="grid gap-8 p-6 lg:grid-cols-[1.35fr_0.9fr] sm:p-8">
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
                  </div>

                  <CustomSelect
                    label="Categoría"
                    value={form.category}
                    options={categories}
                    onChange={(value) => setForm({ ...form, category: value })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1f2a24]">
                    Descripción
                  </label>
                  <textarea
                    placeholder="Describe cuidados, tamaño, características o recomendaciones."
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-[#d8cfc2] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#2f6f4e] focus:ring-4 focus:ring-[#2f6f4e]/10"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="rounded-3xl border border-dashed border-[#b7c9bb] bg-[#f7fbf7] p-5">
                  <label className="block text-sm font-semibold text-[#1f2a24]">
                    Imágenes del producto
                  </label>
                  <p className="mt-1 text-sm text-[#5b655f]">
                    JPG, PNG o WEBP. Puedes elegir más de una.
                  </p>

                  <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-[#d8cfc2] bg-white px-4 py-8 text-center transition hover:border-[#2f6f4e] hover:bg-[#fbfff8]">
                    <span className="text-3xl">📷</span>
                    <span className="mt-2 font-semibold text-[#2f6f4e]">
                      {uploading ? "Subiendo imágenes..." : "Subir imágenes"}
                    </span>
                    <span className="mt-1 text-xs text-[#8a918b]">
                      Selecciona una o varias fotos desde tu equipo.
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={uploading}
                      className="hidden"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const files = Array.from(e.target.files || []) as File[];
                        uploadImages(files);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  {form.images.length > 0 && (
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {form.images.map((image) => (
                        <div
                          key={image}
                          className={`overflow-hidden rounded-2xl border bg-white ${
                            form.image_url === image
                              ? "border-[#2f6f4e] ring-2 ring-[#2f6f4e]/20"
                              : "border-[#eadfce]"
                          }`}
                        >
                          <div className="relative h-28">
                            <img
                              src={image}
                              alt="Imagen del producto"
                              className="h-full w-full object-cover"
                            />
                            {form.image_url === image && (
                              <span className="absolute left-2 top-2 rounded-full bg-[#2f6f4e] px-2 py-1 text-[11px] font-bold text-white">
                                Principal
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-1 p-2">
                            <button
                              type="button"
                              onClick={() => setMainImage(image)}
                              className="rounded-xl bg-[#edf5ef] px-2 py-2 text-xs font-semibold text-[#2f6f4e] transition hover:bg-[#dceee2]"
                            >
                              Principal
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImageFromForm(image)}
                              className="rounded-xl bg-red-50 px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded-3xl border border-[#eadfce] bg-[#fbf7f1] p-5">
                  <h3 className="text-lg font-bold text-[#1f2a24]">Vista previa</h3>
                  <p className="mt-1 text-sm text-[#5b655f]">
                    Así se verá la tarjeta principal del producto.
                  </p>

                  <div className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm">
                    {form.image_url ? (
                      <img
                        src={form.image_url}
                        alt="Vista previa"
                        className="h-64 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center bg-[#efe7da] text-[#8b927f]">
                        Sin imagen principal
                      </div>
                    )}

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
                        {form.price ? formatPrice(form.price) : "$0"}
                      </p>
                    </div>
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
                      onChange={(e) => setForm({ ...form, available: e.target.checked })}
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
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
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

            <div className="flex flex-col gap-3 border-t border-[#eadfce] bg-[#fbf7f1] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
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
                      resetForm();
                      setShowForm(false);
                    }}
                    className="rounded-full border border-[#d8cfc2] bg-white px-6 py-3 font-medium text-[#1f2a24] transition hover:bg-[#edf5ef]"
                  >
                    Cancelar edición
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-full bg-[#2f6f4e] px-7 py-3 font-medium text-white shadow-lg shadow-[#2f6f4e]/20 transition hover:bg-[#255a3f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Guardando..."
                    : uploading
                      ? "Subiendo..."
                      : editingId
                        ? "Guardar cambios"
                        : "Agregar producto"}
                </button>
              </div>
            </div>
          </form>
        )}

        <section className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
        </section>

        {loadingProducts && (
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        )}

        {!loadingProducts && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const images = getProductImages(product);
              const mainImage = product.image_url || images[0] || "";

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[32px] border border-[#e7ddcf] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-64 overflow-hidden bg-[#efe7da]">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#8b927f]">
                        Sin imagen
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#2f6f4e] shadow-sm backdrop-blur">
                        {product.category || "Interior"}
                      </span>

                      {product.featured && (
                        <span className="rounded-full bg-[#fff1bf]/95 px-3 py-1 text-xs font-semibold text-[#7a5b00] shadow-sm backdrop-blur">
                          Destacado
                        </span>
                      )}

                      {images.length > 1 && (
                        <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
                          {images.length} fotos
                        </span>
                      )}
                    </div>

                    <div className="absolute right-4 top-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                          product.available
                            ? "bg-[#dff3d7]/95 text-[#315f2e]"
                            : "bg-[#f3d7d7]/95 text-[#7a2f2f]"
                        }`}
                      >
                        {product.available ? "Disponible" : "Agotado"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold tracking-tight text-[#1f2a24]">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-xl font-bold text-[#2f6f4e]">
                      {formatPrice(product.price)}
                    </p>

                    <p className="mt-4 line-clamp-3 min-h-[72px] text-sm leading-6 text-[#5b655f]">
                      {product.description || "Sin descripción."}
                    </p>

                <div className="my-5 h-px bg-[#eadfce]/80" />
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => editProduct(product)}
                            className="w-full rounded-2xl bg-[#2f6f4e] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#285f43] hover:shadow-md"
                        >
                            Editar producto
                        </button>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                            type="button"
                            onClick={() => toggleAvailability(product)}
                            className={`rounded-2xl px-3 py-2.5 text-xs font-semibold transition hover:-translate-y-0.5 ${
                                product.available
                                ? "bg-[#fff1f1] text-[#c1121f] hover:bg-[#ffe3e3]"
                                : "bg-[#eef6df] text-[#2f6f4e] hover:bg-[#dff3d7]"
                            }`}
                            >
                            {product.available ? "Agotar" : "Activar"}
                            </button>

                            <button
                            type="button"
                            onClick={() => toggleFeatured(product)}
                            className={`rounded-2xl px-3 py-2.5 text-xs font-semibold transition hover:-translate-y-0.5 ${
                                product.featured
                                ? "bg-[#fff6d8] text-[#8a6500] hover:bg-[#ffedb0]"
                                : "bg-[#f3eee6] text-[#5b655f] hover:bg-[#ebe2d5]"
                            }`}
                            >
                            {product.featured ? "Quitar" : "Destacar"}
                            </button>

                            <button
                            type="button"
                            onClick={() => deleteProduct(product)}
                            className="rounded-2xl border border-[#f0c7c7] bg-white px-3 py-2.5 text-xs font-semibold text-[#c1121f] transition hover:-translate-y-0.5 hover:bg-[#fff1f1]"
                            >
                            Eliminar
                            </button>
                        </div>
                        </div>
                  </div>
                </article>
              );
            })}
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
