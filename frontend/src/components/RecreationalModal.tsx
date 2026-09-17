"use client";

import React, { useState } from "react";

interface RecreationalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecreationalModal: React.FC<RecreationalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"facilities" | "rules">("facilities");

  if (!isOpen) return null;

  const facilities = [
    {
      title: "Fitness Center & Gymnasium",
      icon: "🏋️‍♂️",
      timings: "6:00 AM – 9:00 AM & 5:00 PM – 9:30 PM",
      location: "Sports Complex (Near Arena)",
      note: "Fully equipped with cardio, free weights, and cross-fit gear.",
    },
    {
      title: "Olympic Swimming Pool",
      icon: "🏊‍♂️",
      timings: "6:00 AM – 8:30 AM & 5:30 PM – 9:00 PM",
      location: "Aquatic Center",
      note: "Temperature-controlled Olympic pool with certified lifeguards.",
    },
    {
      title: "Indoor Badminton & Squash",
      icon: "🏸",
      timings: "6:00 AM – 10:00 PM",
      location: "Main Sports Arena",
      note: "Wooden synthetic courts. Rackets and shuttles available on deposit.",
    },
    {
      title: "Bowling Alley & Arcade",
      icon: "🎳",
      timings: "5:00 PM – 10:30 PM",
      location: "Oasis Entertainment Zone",
      note: "4-lane automated bowling alley with lounge seating.",
    },
    {
      title: "Cricket & Football Ground",
      icon: "🏏",
      timings: "6:00 AM – 8:00 PM",
      location: "Central Sports Ground",
      note: "Floodlit turf field for weekend matches and tournament play.",
    },
  ];

  const rules = [
    {
      title: "1. Mandatory Campus ID Badge",
      desc: "All trainees and employees must swipe their physical Infosys RFID badge at the entrance turnstiles. Guest access is prohibited during peak hours.",
    },
    {
      title: "2. Dress Code & Footwear",
      desc: "Strictly sportswear only. Non-marking gum rubber sole shoes are mandatory for indoor wooden badminton and squash courts. Running or outdoor shoes are not permitted inside court areas.",
    },
    {
      title: "3. Swimming Pool Hygiene",
      desc: "Lycra or nylon swimwear and silicone swimming caps are compulsory. Pre-swim shower is required. Individuals with open wounds or infections are not permitted to enter the pool.",
    },
    {
      title: "4. Slot Timings & Fair Usage",
      desc: "Court slots are limited to 45 minutes per group when other members are waiting. Advanced online booking will be enabled soon via this portal.",
    },
    {
      title: "5. Equipment Responsibility",
      desc: "Borrowed sports equipment must be returned to the recreation desk before 10:00 PM. Any damage resulting from negligent handling must be reimbursed.",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fade-in p-0 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-[36px] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-b from-teal-50 to-white p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                Recreational Activities
              </h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Infosys Mysore Sports & Wellness Center
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex space-x-2">
          <button
            onClick={() => setActiveTab("facilities")}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "facilities"
                ? "bg-white text-neutral-900 shadow-xs border border-slate-200/80"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            🏟️ Facilities (Coming Soon)
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "rules"
                ? "bg-white text-neutral-900 shadow-xs border border-slate-200/80"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            📜 Rules & Guidelines
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {activeTab === "facilities" ? (
            <>
              {/* Coming Soon Notice Card */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-950 space-y-1">
                <div className="flex items-center space-x-1.5 font-extrabold text-xs">
                  <span>🚀</span>
                  <span>Live Slot Booking Coming Soon!</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  We are building real-time slot reservations for badminton, gym passes, and bowling. For now, walk-in access is available using your Infosys employee badge.
                </p>
              </div>

              {/* Facilities List */}
              <div className="space-y-2.5">
                {facilities.map((fac, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex items-start space-x-3"
                  >
                    <span className="text-2xl pt-0.5">{fac.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-neutral-900">{fac.title}</h4>
                      <p className="text-[11px] text-neutral-500 font-medium mt-0.5">{fac.note}</p>
                      <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] font-bold text-teal-800">
                        <span className="bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                          📍 {fac.location}
                        </span>
                        <span className="bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded-md">
                          ⏰ {fac.timings}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Rules Section */
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-100/80 text-xs font-bold text-slate-700">
                Official campus recreation code of conduct:
              </div>

              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-2xs"
                >
                  <h4 className="text-xs font-black text-neutral-900">{rule.title}</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    {rule.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
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
