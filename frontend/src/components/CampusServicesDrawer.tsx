"use client";

import React from "react";

interface CampusServicesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFoodCourts: () => void;
  onSelectRecreational: () => void;
  onSelectMultiplex: () => void;
}

export const CampusServicesDrawer: React.FC<CampusServicesDrawerProps> = ({
  isOpen,
  onClose,
  onSelectFoodCourts,
  onSelectRecreational,
  onSelectMultiplex,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-[36px] sm:rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden"></div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-neutral-900 tracking-tight">
              Campus Services
            </h3>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Select a facility on Infosys Mysore Campus
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* The 3 Campus Options */}
        <div className="mt-5 space-y-3">
          {/* 1. Food Courts */}
          <button
            onClick={() => {
              onSelectFoodCourts();
              onClose();
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 to-orange-50/70 border border-amber-200/80 hover:border-amber-400 flex items-center justify-between text-left transition-all hover:shadow-md group active:scale-98"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                🍽️
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-black text-neutral-900">Food Courts</h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Live Menus
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Daily lunch & dinner menus across all 8 campus food courts
                </p>
              </div>
            </div>
            <span className="text-neutral-400 group-hover:text-neutral-900 font-bold text-base pl-2">
              →
            </span>
          </button>

          {/* 2. Recreational Activities */}
          <button
            onClick={() => {
              onSelectRecreational();
              onClose();
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border border-emerald-200/80 hover:border-emerald-400 flex items-center justify-between text-left transition-all hover:shadow-md group active:scale-98"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                🏸
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-black text-neutral-900">
                    Recreational Activities
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Gym, swimming pool, badminton, bowling & campus rules
                </p>
              </div>
            </div>
            <span className="text-neutral-400 group-hover:text-neutral-900 font-bold text-base pl-2">
              →
            </span>
          </button>

          {/* 3. Multiplex */}
          <button
            onClick={() => {
              onSelectMultiplex();
              onClose();
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-50/90 to-indigo-50/70 border border-purple-200/80 hover:border-purple-400 flex items-center justify-between text-left transition-all hover:shadow-md group active:scale-98"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                🎬
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-black text-neutral-900">Multiplex</h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Cinema Dome
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Weekend movie screenings, schedules & campus guidelines
                </p>
              </div>
            </div>
            <span className="text-neutral-400 group-hover:text-neutral-900 font-bold text-base pl-2">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
