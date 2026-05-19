"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    router.refresh();

    setTimeout(() => {
      router.replace("/admin");
    }, 300);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5efe6] px-6">
      <section className="w-full max-w-md rounded-4xl border border-[#d8cbb8] bg-white/80 p-8 shadow-xl backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#6f8f5f]">
            Vivero Frijolito
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-[#2f3b2f]">
            Acceso administrador
          </h1>

          <p className="mt-3 text-sm text-[#6b7168]">
            Ingresa con tu cuenta autorizada para gestionar productos.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#374237]">
              Correo
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@correo.com"
              className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 text-[#2f3b2f] outline-none transition focus:border-[#6f8f5f] focus:ring-4 focus:ring-[#6f8f5f]/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#374237]">
              Contraseña
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 text-[#2f3b2f] outline-none transition focus:border-[#6f8f5f] focus:ring-4 focus:ring-[#6f8f5f]/15"
            />
          </div>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#2f6f4e] px-6 py-3 font-medium text-white transition hover:bg-[#25583e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Entrar al panel"}
          </button>
        </form>
      </section>
    </main>
  );
}