import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata = {
  title: "Page non trouvée - 404",
  description: "La page que vous recherchez n&apos;existe pas.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center py-24">
      <div className="container mx-auto px-4 text-center">
        <ScrollReveal>
          {/* 404 avec motif chevrons */}
          <div className="relative mb-8">
            <div className="text-[200px] md:text-[300px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#E21C2A] to-[#C0182A] leading-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-white dark:bg-gray-900 shadow-2xl flex items-center justify-center">
                <span className="text-6xl md:text-8xl">⚽</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Oups ! Cette page est hors-jeu
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Il semblerait que cette page n&apos;existe pas ou ait été déplacée.
            Retournez sur le terrain principal pour continuer votre visite.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="group flex items-center gap-2 px-6 py-3 bg-[#E21C2A] text-white rounded-lg hover:bg-[#C0182A] transition-colors"
            >
              <Home className="w-5 h-5" />
              Retour à l&apos;accueil
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/recherche"
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
              Rechercher
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Pages populaires</h2>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { title: "Actualités", href: "/actualites", emoji: "📰" },
                { title: "Mercato", href: "/mercato", emoji: "💼" },
                { title: "Matchs", href: "/matchs", emoji: "⚽" },
                { title: "Compétitions", href: "/comps", emoji: "🏆" },
                { title: "Histoire", href: "/histoire", emoji: "📜" },
                { title: "Joueurs", href: "/joueurs", emoji: "👥" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:border-[#E21C2A] hover:shadow-lg transition-all"
                >
                  <div className="text-4xl mb-2">{link.emoji}</div>
                  <div className="font-semibold group-hover:text-[#E21C2A] transition-colors">
                    {link.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.5}>
          <div className="mt-16 p-6 bg-gradient-to-br from-[#E21C2A]/10 to-[#C0182A]/10 rounded-xl max-w-2xl mx-auto">
            <p className="text-gray-600 dark:text-gray-400">
              Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, n&apos;hésitez pas à{" "}
              <Link href="/contact" className="text-[#E21C2A] hover:underline font-semibold">
                nous contacter
              </Link>
              .
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
