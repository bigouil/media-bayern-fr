"use client";

import { Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { useBookmarks } from "@/lib/hooks/use-bookmarks";

interface BookmarkButtonProps {
  articleId: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function BookmarkButton({ articleId, size = "md", showLabel = false }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, mounted } = useBookmarks();

  if (!mounted) {
    return (
      <button
        className={`flex items-center gap-2 ${
          size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2"
        }`}
        aria-label="Bookmark"
      >
        <Bookmark className={size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"} />
      </button>
    );
  }

  const bookmarked = isBookmarked(articleId);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(articleId);
      }}
      className={`flex items-center gap-2 rounded-lg transition-colors ${
        bookmarked
          ? "text-[#E21C2A] hover:text-[#C0182A]"
          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      } ${size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2"}`}
      aria-label={bookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <motion.div
        initial={false}
        animate={{ scale: bookmarked ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Bookmark
          className={`${size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"}`}
          fill={bookmarked ? "currentColor" : "none"}
        />
      </motion.div>
      {showLabel && (
        <span className="text-sm font-medium">
          {bookmarked ? "Enregistré" : "Enregistrer"}
        </span>
      )}
    </motion.button>
  );
}
