"use client";

import React, { useState, useEffect } from "react";
import { MealWindow } from "@/types/menu";
import {
  PixelYouTubeIcon,
  PixelInstagramIcon,
  PixelGitHubIcon,
  PixelTwitterIcon,
  PixelLinkedInIcon,
} from "./PixelSocialIcons";

interface NavbarProps {
  currentWindow: MealWindow;
  onWindowChange: (window: MealWindow) => void;
  visitorCount?: number;
  onOpenCampusModal?: () => void;
}

const ROTATION_STATES = [
  {
    tag: "Mysore Campus",
    icons: [],
  },
  {
    tag: "Mysore",
    icons: ["yt", "insta", "gh"],
  },
  {
    tag: "Mysore",
    icons: ["insta", "x", "li"],
  },
  {
    tag: "Mysore",
    icons: ["gh", "li", "yt"],
  },
  {
    tag: "Mysore",
    icons: ["x", "yt", "gh"],
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentWindow,
  onWindowChange,
  visitorCount = 1,
  onOpenCampusModal,
}) => {
  const [activeCycle, setActiveCycle] = useState(0);

  // Rotate Mysore Campus element every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCycle((prev) => (prev + 1) % ROTATION_STATES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const currentRotation = ROTATION_STATES[activeCycle];

  const renderMiniIcon = (type: string, index: number) => {
    const delay = `${index * 80}ms`;
    switch (type) {
      case "yt":
        return (
          <div
            key={`yt-${activeCycle}-${index}`}
            className="w-3.5 h-3.5 flex items-center justify-center animate-icon-pop"
            style={{ animationDelay: delay }}
            title="YouTube (@dearcoderr)"
          >
            <PixelYouTubeIcon className="w-3 h-3" />
          </div>
        );
      case "insta":
        return (
          <div
            key={`insta-${activeCycle}-${index}`}
            className="w-3.5 h-3.5 flex items-center justify-center animate-icon-pop"
            style={{ animationDelay: delay }}
            title="Instagram (@simplecyberr)"
          >
            <PixelInstagramIcon className="w-3 h-3" />
          </div>
        );
      case "gh":
        return (
          <div
            key={`gh-${activeCycle}-${index}`}
            className="w-3.5 h-3.5 flex items-center justify-center animate-icon-pop"
            style={{ animationDelay: delay }}
            title="GitHub (@simplecyber)"
          >
            <PixelGitHubIcon className="w-3 h-3" />
          </div>
        );
      case "x":
        return (
          <div
            key={`x-${activeCycle}-${index}`}
            className="w-3.5 h-3.5 flex items-center justify-center animate-icon-pop"
            style={{ animationDelay: delay }}
            title="X / Twitter (@satyam_yadav_04)"
          >
            <PixelTwitterIcon className="w-2.5 h-2.5" />
          </div>
        );
      case "li":
        return (
          <div
            key={`li-${activeCycle}-${index}`}
            className="w-3.5 h-3.5 flex items-center justify-center animate-icon-pop"
            style={{ animationDelay: delay }}
            title="LinkedIn (@simplecyber)"
          >
            <PixelLinkedInIcon className="w-3 h-3" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-gradient-to-b from-[#FDF1DF] via-[#FDF3E3] to-[#FAF8F5] pt-5 pb-5 px-5 rounded-b-[32px] border-b border-amber-100/50 shadow-xs space-y-4 select-none flex-shrink-0">
      {/* Top Bar: Interactive Rotating Campus Location Tag & 24h Activity + Date */}
      <div className="flex items-center justify-between">
        {/* Animated Rotating Mysore Campus Pill Button */}
        <button
          type="button"
          onClick={onOpenCampusModal}
          className="flex items-center space-x-1.5 bg-white/90 hover:bg-white backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-200/60 hover:border-amber-300 shadow-2xs text-left cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] group"
          title="Click to view Infosys Mysore Campus & Creator Socials"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
          <span className="text-[11px] font-extrabold text-neutral-800 tracking-tight flex-shrink-0">
            {currentRotation.tag}
          </span>

          {/* Animated 2-3 icons coming in */}
          {currentRotation.icons.length > 0 && (
            <>
              <span className="w-[1px] h-2.5 bg-neutral-200 mx-0.5 flex-shrink-0"></span>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {currentRotation.icons.map((iconType, idx) =>
                  renderMiniIcon(iconType, idx)
                )}
              </div>
            </>
          )}
        </button>

        <div className="flex items-center space-x-2">
          {/* 24-hour clock visitor counter */}
          <div
            className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-200/60 shadow-2xs text-[11px] font-black text-amber-950 select-none"
            title="Total users in the last 24 hours"
          >
            <span className="text-xs">👤</span>
            <span>{visitorCount} / 24h</span>
          </div>

          <span className="text-[11px] font-bold text-neutral-500">
            {currentDateFormatted}
          </span>
        </div>
      </div>

      {/* Main Hero Headline & Subtitle */}
      <div className="space-y-1 pt-0.5">
        <h1 className="text-[28px] sm:text-[30px] font-black text-[#15191E] tracking-tight leading-[1.12]">
          Infosys Mysore Food Court
        </h1>
        <p className="text-xs sm:text-[13px] text-[#69655F] font-medium tracking-normal">
          {currentWindow === "lunch"
            ? "Today's campus food court menus"
            : "Tonight's campus food court menus"}
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
