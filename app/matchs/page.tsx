import { LiveMatchCalendar } from "@/components/LiveMatchCalendar";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Calendrier des matchs en direct - FC Bayern Munich",
  description: "Suivez les matchs du FC Bayern Munich en temps réel avec scores et statistiques actualisés",
};

export default function MatchsPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <ScrollReveal>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-12 h-12 text-[#E21C2A]" />
            <h1 className="text-4xl md:text-6xl font-bold">
              Calendrier des Matchs
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Suivez tous les matchs du FC Bayern Munich en temps réel : résultats, calendrier et statistiques en direct.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <LiveMatchCalendar />
      </ScrollReveal>
    </div>
  );
}
