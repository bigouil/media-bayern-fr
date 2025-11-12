"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      const initialTheme = savedTheme || systemPreference;
      setTheme(initialTheme);
      document.documentElement.classList.toggle("dark", initialTheme === "dark");
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return { theme, toggleTheme, mounted };
}
