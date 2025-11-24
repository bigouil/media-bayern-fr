"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navigation = [
  { title: "Accueil", href: "/" },
  { title: "Mercato", href: "/mercato" },
  { title: "Matchs", href: "/matchs" },
  { title: "Joueurs", href: "/joueurs" },
  { title: "Histoire", href: "/histoire" },
];

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-md dark:bg-gray-950/95"
          : "bg-white dark:bg-gray-950"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
              <Image
                src="/logo.jpg"
                alt="Logo Media Bayern"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold"
              style={{ color: "#E21C2A" }}
            >
              Media Bayern
            </motion.div>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-[#E21C2A]"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="/recherche"
              className="p-2 hover:text-[#E21C2A] transition-colors"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </Link>

            <ThemeToggle />

            {/* Menu mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{ height: mobileMenuOpen ? "auto" : 0 }}
        className="md:hidden overflow-hidden border-t"
      >
        <nav className="container mx-auto px-4 py-4 space-y-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium hover:text-[#E21C2A] transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </motion.div>
    </motion.header>
  );
}
