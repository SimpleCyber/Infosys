"use client";

import React from "react";
import { OutletMenu } from "@/types/menu";

interface MenuImageModalProps {
  menu: OutletMenu | null;
  onClose: () => void;
}

export const MenuImageModal: React.FC<MenuImageModalProps> = ({ menu, onClose }) => {
  if (!menu) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-black text-slate-900">{menu.outletName}</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                {menu.foodCourtName}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Updated: {menu.updatedAtFormatted || menu.updatedAt}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="overflow-auto flex-1 bg-slate-50 p-3 flex items-center justify-center">
          <img
            src={menu.imageUrl}
            alt={`${menu.outletName} menu`}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-md border border-slate-200/60"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white text-center text-xs font-semibold text-slate-400">
          Tap anywhere outside to return to menu feed
        </div>
      </div>
    </div>
  );
};
