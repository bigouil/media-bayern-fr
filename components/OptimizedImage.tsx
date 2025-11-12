"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = "",
  sizes,
  quality = 85,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Placeholder LQIP (Low Quality Image Placeholder)
  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#E5E5E5" offset="20%" />
          <stop stop-color="#F0F0F0" offset="50%" />
          <stop stop-color="#E5E5E5" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#E5E5E5" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>
  `;

  const toBase64 = (str: string) =>
    typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);

  const blurDataURL = `data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`;

  if (hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-[#E21C2A] to-[#2C2C2C] flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-white text-6xl font-bold opacity-20">{alt.charAt(0)}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0.5 : 1 }}
      transition={{ duration: 0.3 }}
      className={fill ? "relative w-full h-full" : ""}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        className={`${className} ${isLoading ? "blur-sm" : "blur-0"} transition-all duration-300`}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </motion.div>
  );
}
