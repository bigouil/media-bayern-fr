"use client";

import { useState, useEffect } from "react";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      const saved = localStorage.getItem("bayern-bookmarks");
      if (saved) {
        try {
          setBookmarks(JSON.parse(saved));
        } catch (error) {
          console.error("Error loading bookmarks:", error);
          setBookmarks([]);
        }
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const addBookmark = (articleId: string) => {
    const updated = [...bookmarks, articleId];
    setBookmarks(updated);
    localStorage.setItem("bayern-bookmarks", JSON.stringify(updated));
  };

  const removeBookmark = (articleId: string) => {
    const updated = bookmarks.filter(id => id !== articleId);
    setBookmarks(updated);
    localStorage.setItem("bayern-bookmarks", JSON.stringify(updated));
  };

  const toggleBookmark = (articleId: string) => {
    if (bookmarks.includes(articleId)) {
      removeBookmark(articleId);
    } else {
      addBookmark(articleId);
    }
  };

  const isBookmarked = (articleId: string) => {
    return bookmarks.includes(articleId);
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    mounted
  };
}
