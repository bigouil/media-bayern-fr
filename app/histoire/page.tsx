import { HistoryTimeline } from "@/components/HistoryTimeline";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Trophy } from "lucide-react";

export const metadata = {
  title: "Histoire du FC Bayern Munich",
  description: "Découvrez l'histoire légendaire du FC Bayern Munich, de sa fondation en 1900 à aujourd'hui.",
};

export default function HistoirePage() {
  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-[#E21C2A]" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Notre Histoire
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Plus de 120 ans d&apos;excellence, de passion et de triomphes. Découvrez les moments
              qui ont forgé la légende du FC Bayern Munich.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-800">
              <div className="text-4xl font-bold text-[#E21C2A] mb-2">33</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Titres de Bundesliga</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-800">
              <div className="text-4xl font-bold text-[#E21C2A] mb-2">6</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ligues des Champions</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-800">
              <div className="text-4xl font-bold text-[#E21C2A] mb-2">20</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Coupes d&apos;Allemagne</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-800">
              <div className="text-4xl font-bold text-[#E21C2A] mb-2">1900</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Année de fondation</div>
            </div>
          </div>
        </ScrollReveal>

        <div className="mb-16">
          <HistoryTimeline />
        </div>

        <ScrollReveal>
          <div className="bg-gradient-to-br from-[#E21C2A] to-[#C0182A] text-white rounded-xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              L&apos;histoire continue...
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Chaque match, chaque victoire, chaque titre ajoute un nouveau chapitre à notre
              légende. Soyez témoins de l&apos;histoire en train de s&apos;écrire.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
