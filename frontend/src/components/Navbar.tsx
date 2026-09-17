"use client";

import React from "react";
import { MealWindow } from "@/types/menu";

interface NavbarProps {
  currentWindow: MealWindow;
  onWindowChange: (window: MealWindow) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentWindow,
  onWindowChange,
}) => {
  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="bg-gradient-to-b from-[#FDF1DF] via-[#FDF3E3] to-[#FAF8F5] pt-5 pb-5 px-5 rounded-b-[32px] border-b border-amber-100/50 shadow-xs space-y-4 select-none">
      {/* Top Bar: Campus Location Tag & Today's Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full border border-amber-200/50 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-extrabold text-neutral-800 tracking-tight">
            Infosys Mysore Campus
          </span>
        </div>

        <span className="text-[11px] font-bold text-neutral-500">
          {currentDateFormatted}
        </span>
      </div>

      {/* Main Hero Headline & Shortened Punchy Subtitle */}
      <div className="space-y-1 pt-0.5">
        <h1 className="text-[32px] sm:text-[34px] font-black text-[#15191E] tracking-tight leading-[1.12]">
          {currentWindow === "lunch" ? "Ready for lunch?" : "Ready for dinner?"}
        </h1>
        <p className="text-xs sm:text-[13px] text-[#69655F] font-medium tracking-normal">
          Today's campus food court menus
        </p>
      </div>

      {/* Lunch / Dinner Segmented Control */}
      <div className="bg-black/[0.05] p-1 rounded-2xl border border-black/[0.06] flex items-center shadow-inner">
        <button
          type="button"
          onClick={() => onWindowChange("lunch")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
            currentWindow === "lunch"
              ? "bg-white text-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] scale-[1.01]"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <span className="text-sm">☀️</span>
          <span>Lunch Menu</span>
        </button>

        <button
          type="button"
          onClick={() => onWindowChange("dinner")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
            currentWindow === "dinner"
              ? "bg-neutral-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.14)] scale-[1.01]"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <span className="text-sm">🌙</span>
          <span>Dinner Menu</span>
        </button>
      </div>
    </header>
  );
};
