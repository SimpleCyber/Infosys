"use client";

import React from "react";

interface MultiplexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiplexModal: React.FC<MultiplexModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const movies = [
    {
      title: "Interstellar",
      screen: "Screen 1 (Dome IMAX)",
      lang: "English • Sci-Fi / Drama",
      shows: ["Fri 6:30 PM", "Sat 9:30 PM"],
      badge: "Staff Pick",
    },
    {
      title: "Kantara: Chapter 1",
      screen: "Screen 2",
      lang: "Kannada (with Eng Subtitles) • Action / Myth",
      shows: ["Sat 3:00 PM", "Sun 6:30 PM"],
      badge: "Trending",
    },
    {
      title: "Dune: Part Two",
      screen: "Screen 3",
      lang: "English • Sci-Fi / Adventure",
      shows: ["Sat 6:30 PM", "Sun 3:00 PM"],
      badge: "Popular",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fade-in p-0 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-[36px] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Multiplex Dome Art */}
        <div className="relative bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 p-6 text-white">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-purple-200 backdrop-blur-sm">
              Infosys Dome Cinema
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          <h3 className="text-2xl font-black tracking-tight">Campus Multiplex</h3>
          <p className="text-xs text-purple-200/90 font-medium mt-1">
            Infosys Mysore Campus Geodesic Dome Theatre (Near GEC 2)
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Schedule Notice */}
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎟️</span>
              <div>
                <h4 className="text-xs font-black text-purple-950">
                  Weekend Screenings Active
                </h4>
                <p className="text-[11px] text-purple-800 font-medium">
                  Free admission for all Infosys trainees & employees
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
              Free Entry
            </span>
          </div>

          {/* Current Movies List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wider">
              Upcoming Showtimes This Weekend:
            </h4>

            {movies.map((movie, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-sm font-black text-neutral-900">{movie.title}</h5>
                    <p className="text-[11px] text-neutral-500 font-semibold">{movie.lang}</p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {movie.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-indigo-900">
                    📍 {movie.screen}
                  </span>
                  <div className="flex space-x-1.5">
                    {movie.shows.map((show, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-800 shadow-2xs"
                      >
                        {show}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Campus Theater Guidelines */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-black text-neutral-900 flex items-center space-x-1.5">
              <span>📋</span>
              <span>Important Multiplex Guidelines:</span>
            </h4>
            <ul className="text-[11px] text-neutral-600 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
              <li>Entry strictly via physical Infosys employee / trainee RFID badge.</li>
              <li>Doors open 20 minutes before showtime; entry closes when show begins.</li>
              <li>Outside food and open beverages are strictly prohibited inside.</li>
              <li>Seating is unreserved on a first-come, first-served basis.</li>
            </ul>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
