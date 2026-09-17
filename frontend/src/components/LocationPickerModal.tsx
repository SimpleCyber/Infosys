"use client";

import React, { useState } from "react";

export interface LocationOption {
  id: string;
  postal: string;
  city: string;
  country: string;
  isCampus?: boolean;
}

export const PRESET_LOCATIONS: LocationOption[] = [
  { id: "venice", postal: "30122", city: "Venice", country: "Italy" },
  { id: "infosys", postal: "570027", city: "Infosys Mysore Campus", country: "Karnataka, India", isCampus: true },
  { id: "milan", postal: "20121", city: "Milan", country: "Italy" },
  { id: "florence", postal: "50122", city: "Florence", country: "Italy" },
  { id: "rome", postal: "00186", city: "Rome", country: "Italy" },
  { id: "paris", postal: "75001", city: "Paris", country: "France" },
];

interface LocationPickerModalProps {
  isOpen: boolean;
  selectedLocation: LocationOption;
  onSelect: (loc: LocationOption) => void;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  selectedLocation,
  onSelect,
  onClose,
}) => {
  const [filter, setFilter] = useState("");

  if (!isOpen) return null;

  const filtered = PRESET_LOCATIONS.filter(
    (l) =>
      l.city.toLowerCase().includes(filter.toLowerCase()) ||
      l.postal.toLowerCase().includes(filter.toLowerCase()) ||
      l.country.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden"></div>

        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Select your location
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Choose your dining city or campus food court
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Search input */}
        <div className="mt-4 relative">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search postal code or city..."
            className="w-full bg-slate-100 border border-slate-200/80 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
        </div>

        {/* Locations List */}
        <div className="mt-4 space-y-2 overflow-y-auto flex-1 pr-1">
          {filtered.map((loc) => {
            const isSelected = selectedLocation.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => {
                  onSelect(loc);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? "bg-emerald-50/80 border-emerald-500/80 text-emerald-950 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/60 text-slate-800"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                      loc.isCampus
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100/80 text-emerald-800"
                    }`}
                  >
                    {loc.isCampus ? "🏢" : "📍"}
                  </div>
                  <div>
                    <div className="text-sm font-bold flex items-center space-x-1.5">
                      <span>{loc.city}</span>
                      {loc.isCampus && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          Campus
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {loc.postal ? `${loc.postal}, ` : ""}{loc.country}
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <span className="text-emerald-700 font-bold text-sm">✓</span>
                ) : (
                  <span className="text-slate-400 text-xs font-bold">Select</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
