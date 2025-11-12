"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32 pattern-chevrons">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-bayern-red/30 bg-white/80 p-2 shadow-lg dark:bg-gray-900/80"
          >
            <Image
              src="/logo.jpg"
              alt="Logo Media Bayern"
              width={88}
              height={88}
              className="h-full w-full rounded-full object-cover"
              priority
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              Toute l&apos;actualité du{" "}
              <span className="text-bayern-red">Bayern Munich</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 text-balance"
          >
            Articles, mercato, matchs et compétitions du club le plus titré d&apos;Allemagne
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/actualites"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-bayern-red text-white rounded-lg font-semibold hover:bg-bayern-red/90 transition-colors"
            >
              Dernières actualités
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/matchs"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-border rounded-lg font-semibold hover:bg-secondary transition-colors"
            >
              Voir les matchs
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
    </section>
  );
}
