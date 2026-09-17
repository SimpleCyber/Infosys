"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface FloatingNavProps {
  onOpenSearch?: () => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname === "/admin";

  return (
    <div className="fixed sm:absolute bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100/90 pt-3 pb-2 px-8 shadow-[0_-4px_25px_rgba(0,0,0,0.03)] select-none">
      {/* Exactly 3 active options at the bottom */}
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. Food Courts (Home) */}
        <Link
          href="/"
          className={`p-2 transition-transform active:scale-90 flex flex-col items-center justify-center ${
            isHome ? "text-[#1E4D3E]" : "text-slate-400 hover:text-slate-700"
          }`}
          title="Food Courts (Home)"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-[10px] font-black mt-0.5 tracking-tight">Food Courts</span>
        </Link>

        {/* 2. Search / Campus Services (Enabled: triggers 3 campus services) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="p-2 transition-transform active:scale-90 flex flex-col items-center justify-center text-slate-500 hover:text-[#1E4D3E] cursor-pointer"
          title="Campus Directory (Food Courts, Recreation, Multiplex)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.3"
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
          <span className="text-[10px] font-black mt-0.5 tracking-tight">Explore</span>
        </button>

        {/* 3. Manager Portal */}
        <Link
          href="/admin"
          className={`p-2 transition-transform active:scale-90 flex flex-col items-center justify-center ${
            isAdmin ? "text-[#1E4D3E]" : "text-slate-400 hover:text-slate-700"
          }`}
          title="Manager Upload Portal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.3"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-[10px] font-black mt-0.5 tracking-tight">Manager</span>
        </Link>
      </div>

      {/* iPhone Home Indicator Pill */}
      <div className="w-32 h-1 bg-black/90 rounded-full mx-auto mt-2.5 mb-1"></div>
    </div>
  );
};
