import { PlayerComparator } from "@/components/PlayerComparator";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Users } from "lucide-react";

export const metadata = {
  title: "Comparateur de joueurs - FC Bayern Munich",
  description: "Comparez les statistiques et performances des joueurs du FC Bayern Munich.",
};

export default function JoueursPage() {
  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-12 h-12 text-[#E21C2A]" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Comparateur de Joueurs
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comparez les statistiques et performances de vos joueurs préférés du FC Bayern Munich.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <PlayerComparator />
        </ScrollReveal>
      </div>
    </div>
  );
}
