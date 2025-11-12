"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirectTo") || "/admin";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Identifiants invalides");
      }

      window.location.href = redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
              <Image
                src="/logo.jpg"
                alt="Logo Media Bayern"
                fill
                sizes="64px"
                className="object-cover"
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Connexion admin</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Entrez vos identifiants pour accéder au panneau d&apos;administration.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-[#E21C2A] text-white font-semibold hover:bg-[#C0182A] transition disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Configurez vos admins dans <code>ADMIN_USERS</code> et <code>ADMIN_SESSION_SECRET</code>.
        </p>
      </div>
    </div>
  );
}
