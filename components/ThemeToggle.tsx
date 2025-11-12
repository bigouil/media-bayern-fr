"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/hooks/use-theme";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800" aria-label="Toggle theme" />
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 180 : 0, scale: theme === "dark" ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        <Sun className="w-5 h-5 text-yellow-500" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: theme === "light" ? -180 : 0, scale: theme === "light" ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        <Moon className="w-5 h-5 text-blue-400" />
      </motion.div>
    </motion.button>
  );
}
