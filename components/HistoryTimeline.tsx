"use client";

import { motion, useInView } from "framer-motion";
import { Trophy, Star, Users } from "lucide-react";
import { useRef } from "react";
import historyData from "@/lib/data/history.json";

interface HistoryEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  category: "foundation" | "trophy" | "european" | "legend";
  icon: string;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  user: Users,
};

const categoryColors = {
  foundation: "bg-blue-500",
  trophy: "bg-yellow-500",
  european: "bg-[#E21C2A]",
  legend: "bg-purple-500",
};

export function HistoryTimeline() {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />

      <div className="space-y-12">
        {(historyData as HistoryEvent[]).map((event, index) => (
          <TimelineItem key={event.id} event={event} index={index} />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ event, index }: { event: HistoryEvent; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isEven = index % 2 === 0;

  const Icon = iconMap[event.icon as keyof typeof iconMap] || Trophy;
  const colorClass = categoryColors[event.category];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`relative flex items-center ${
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      } flex-row`}
    >
      {/* Content */}
      <div
        className={`flex-1 ${
          isEven ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"
        } pl-16 md:pl-0`}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-[#E21C2A]">{event.year}</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{event.title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
        </motion.div>
      </div>

      {/* Icon in the center */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.4 }}
        className={`absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-16 h-16 rounded-full ${colorClass} flex items-center justify-center shadow-lg z-10`}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>

      {/* Empty space for the other side (desktop only) */}
      <div className="hidden md:block flex-1" />
    </motion.div>
  );
}
