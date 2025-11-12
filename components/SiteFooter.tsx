"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";

const footerSections = [
  {
    title: "À propos",
    links: [
      { title: "Qui sommes-nous ?", href: "/a-propos" },
      { title: "Contact", href: "/contact" },
      { title: "Mentions légales", href: "/mentions-legales" },
    ],
  },
  {
    title: "Contenus",
    links: [
      { title: "Actualités", href: "/actualites" },
      { title: "Mercato", href: "/mercato" },
      { title: "Matchs", href: "/matchs" },
      { title: "Compétitions", href: "/comps" },
    ],
  },
  {
    title: "Suivez-nous",
    links: [
      { title: "Twitter", href: "https://twitter.com/fcbayern" },
      { title: "Facebook", href: "https://facebook.com/fcbayern" },
      { title: "Instagram", href: "https://instagram.com/fcbayern" },
    ],
  },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
                <Image
                  src="/logo.jpg"
                  alt="Logo Media Bayern"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="text-2xl font-bold" style={{ color: "#E21C2A" }}>
                Media Bayern
              </div>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toute l&apos;actualité du FC Bayern Munich en français
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/fcbayern"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#E21C2A] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/fcbayern"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#E21C2A] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/fcbayern"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#E21C2A] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-[#E21C2A] transition-colors dark:text-gray-400"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} Media Bayern. Tous droits réservés.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/mentions-legales"
                className="text-gray-600 hover:text-[#E21C2A] transition-colors dark:text-gray-400"
              >
                Mentions légales
              </Link>
              <Link
                href="/confidentialite"
                className="text-gray-600 hover:text-[#E21C2A] transition-colors dark:text-gray-400"
              >
                Confidentialité
              </Link>
              <Link
                href="/api/rss"
                className="text-gray-600 hover:text-[#E21C2A] transition-colors dark:text-gray-400"
              >
                RSS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
