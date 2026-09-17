"use client";

import React, { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running as installed standalone PWA
    const isRunningStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isRunningStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check if user dismissed previously in this session
    if (sessionStorage.getItem("infosys_pwa_dismissed") === "true") {
      setIsDismissed(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Also listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      console.log("[PWA] App was installed successfully");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        console.log("[PWA] User accepted install prompt");
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSTip((prev) => !prev);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("infosys_pwa_dismissed", "true");
  };

  // Don't display if running as installed app or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  // Show if native install prompt captured or on iOS (where beforeinstallprompt isn't fired)
  const shouldDisplay = isInstallable || isIOS;
  if (!shouldDisplay) {
    return null;
  }

  return (
    <aside
      aria-label="Install application"
      className="fixed bottom-4 left-4 right-4 z-40 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm animate-fade-in"
    >
      <div className="bg-[#1A2E26]/95 backdrop-blur-md text-white rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-emerald-500/20 space-y-3">
        {/* Main Banner Row */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FEEDD7] flex items-center justify-center p-1.5 flex-shrink-0 shadow-xs">
            <img
              src="/icons/icon-192.png"
              alt="Infosys Food icon"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                Install Web App
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h4 className="text-xs font-black text-white truncate">
              Infosys Mysore Food Courts
            </h4>
            <p className="text-[11px] text-slate-300 truncate">
              Fast offline access right from your home screen
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center text-xs transition-colors flex-shrink-0"
            title="Dismiss"
          >
            ✕
          </button>
        </div>

        {/* iOS Specific Tip */}
        {showIOSTip && (
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 text-[11px] text-slate-200 space-y-1">
            <p className="font-bold flex items-center space-x-1">
              <span>📱</span>
              <span>How to install on iPhone/iPad:</span>
            </p>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              1. Tap the <span className="font-bold text-white">Share button</span> (square with arrow ↑) in Safari bottom bar.
              <br />
              2. Scroll down and select <span className="font-bold text-white">&apos;Add to Home Screen&apos;</span> ➕.
            </p>
          </div>
        )}

        {/* Actions Row */}
        <div className="flex items-center space-x-2 pt-0.5">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <span>📲</span>
            <span>{isIOS ? "How to Install" : "Install App"}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </aside>
  );
}
