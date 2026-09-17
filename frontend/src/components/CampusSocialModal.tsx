"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  PixelYouTubeIcon,
  PixelInstagramIcon,
  PixelGitHubIcon,
  PixelTwitterIcon,
  PixelLinkedInIcon,
} from "./PixelSocialIcons";

interface CampusSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SocialLinkItem {
  id: string;
  name: string;
  handle: string;
  url: string;
  description: string;
  icon: React.ReactNode;
  bgStyle: string;
  borderStyle: string;
  accentColor: string;
}

const SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: "youtube",
    name: "YouTube",
    handle: "@simplecyberr",
    url: "https://www.youtube.com/@simplecyberr",
    description: "Coding tutorials, DSA challenges & tech guides",
    icon: <PixelYouTubeIcon className="w-6 h-6" />,
    bgStyle: "bg-red-50/90 hover:bg-red-100/80",
    borderStyle: "border-red-200/80 hover:border-red-400",
    accentColor: "text-red-600",
  },
  {
    id: "instagram",
    name: "Instagram",
    handle: "@simplecyberr",
    url: "https://www.instagram.com/simplecyberr/",
    description: "Campus lifestyle, behind-the-scenes & dev reels",
    icon: <PixelInstagramIcon className="w-6 h-6" />,
    bgStyle: "bg-gradient-to-r from-pink-50/90 via-purple-50/70 to-orange-50/60 hover:from-pink-100/90 hover:to-purple-100/80",
    borderStyle: "border-pink-200/80 hover:border-pink-400",
    accentColor: "text-pink-600",
  },
  {
    id: "github",
    name: "GitHub",
    handle: "@simplecyber",
    url: "https://github.com/simplecyber",
    description: "Food court web app, repositories & open source code",
    icon: <PixelGitHubIcon className="w-6 h-6" />,
    bgStyle: "bg-neutral-50 hover:bg-neutral-100/90",
    borderStyle: "border-neutral-200/80 hover:border-neutral-400",
    accentColor: "text-neutral-900",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    handle: "@satyam_yadav_04",
    url: "https://x.com/satyam_yadav_04",
    description: "Engineering thoughts, tech banter & campus updates",
    icon: <PixelTwitterIcon className="w-6 h-6" />,
    bgStyle: "bg-slate-50 hover:bg-slate-100/90",
    borderStyle: "border-slate-200/80 hover:border-slate-400",
    accentColor: "text-slate-900",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "@simplecyber",
    url: "https://www.linkedin.com/in/simplecyber",
    description: "Professional networking, dev updates & career",
    icon: <PixelLinkedInIcon className="w-6 h-6" />,
    bgStyle: "bg-blue-50/90 hover:bg-blue-100/80",
    borderStyle: "border-blue-200/80 hover:border-blue-400",
    accentColor: "text-[#0A66C2]",
  },
];

export const CampusSocialModal: React.FC<CampusSocialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Set playback speed to 1.25x and enable audio by default when the modal opens
  useEffect(() => {
    if (!isOpen) return;

    const applyPlayerSettings = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: "unMute",
            args: [],
          }),
          "*"
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: "setVolume",
            args: [100],
          }),
          "*"
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: "setPlaybackRate",
            args: [1.25],
          }),
          "*"
        );
      }
    };

    // Staggered postMessage commands to ensure audio and speed are applied as soon as player initializes
    const t1 = setTimeout(applyPlayerSettings, 600);
    const t2 = setTimeout(applyPlayerSettings, 1200);
    const t3 = setTimeout(applyPlayerSettings, 2200);

    // Also attach YouTube IFrame API if available
    let player: any = null;
    const initPlayer = () => {
      if (!iframeRef.current || !(window as any).YT || !(window as any).YT.Player) return;
      try {
        player = new (window as any).YT.Player(iframeRef.current, {
          events: {
            onReady: (event: any) => {
              try {
                event.target.unMute();
                event.target.setVolume(100);
                event.target.setPlaybackRate(1.25);
                event.target.playVideo();
              } catch (e) {
                console.warn(e);
              }
            },
            onStateChange: (event: any) => {
              if (event.data === 1) {
                try {
                  event.target.unMute();
                  event.target.setPlaybackRate(1.25);
                } catch (e) {
                  console.warn(e);
                }
              }
            },
          },
        });
      } catch {
        // Handled by postMessage backup
      }
    };

    if (!(window as any).YT) {
      const existingScript = document.getElementById("yt-iframe-api");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (player && typeof player.destroy === "function") {
        try {
          player.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyHandle = (e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(handle);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fade-in p-0 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-[36px] sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <h3 className="text-base font-black text-neutral-900 tracking-tight leading-tight">
                Infosys Mysore Campus
              </h3>
              <p className="text-[11px] font-bold text-neutral-500 tracking-tight mt-0.5">
                @simplecyber
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Video Player Section at Top of Pop-up */}
        <div className="relative w-full aspect-video bg-black flex-shrink-0 group overflow-hidden">
          <iframe
            ref={iframeRef}
            src="https://www.youtube.com/embed/sefsdsL2J-8?autoplay=1&enablejsapi=1&rel=0&playsinline=1"
            title="Introduction"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          {/* Introduction Badge */}
          <div className="absolute top-2 left-2.5 pointer-events-none flex items-center space-x-1.5 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[10px] font-bold text-white tracking-wide">
              Introduction
            </span>
          </div>
        </div>

        {/* Profile Banner */}
        <div className="px-5 py-3 bg-gradient-to-b from-amber-50/50 to-white flex items-center border-b border-amber-100/40">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-200/80 shadow-xs flex-shrink-0 bg-neutral-100">
              <img
                src="/profilepic.png"
                alt="Satyam Yadav"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-xs font-black text-neutral-900 leading-tight">
                Satyam Yadav
              </h4>
              <p className="text-[10px] text-neutral-500 font-medium mt-0.5">
                Developer of Mysore Food Court App
              </p>
            </div>
          </div>
        </div>

        {/* Social Link Cards List */}
        <div className="p-4 space-y-2.5 overflow-y-auto no-scrollbar max-h-[40vh]">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full p-3.5 rounded-2xl ${link.bgStyle} border ${link.borderStyle} flex items-center justify-between text-left transition-all hover:shadow-md group active:scale-[0.99] cursor-pointer`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-white shadow-2xs border border-black/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  {link.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="text-xs font-black text-neutral-900">
                      {link.name}
                    </h5>
                    <span
                      onClick={(e) => handleCopyHandle(e, link.id, link.handle)}
                      className="text-[10px] font-mono text-neutral-500 hover:text-neutral-800 bg-white/70 px-1.5 py-0.5 rounded-md border border-neutral-200/50"
                      title="Click to copy handle"
                    >
                      {copiedId === link.id ? "✓ Copied!" : link.handle}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-medium line-clamp-1 mt-0.5">
                    {link.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center pl-2 flex-shrink-0">
                <span className="text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 font-bold text-base transition-all">
                  ↗
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Modal Footer Note */}
        <div className="p-3 bg-neutral-50 border-t border-slate-100 text-center select-none flex-shrink-0">
          <p className="text-[10px] text-neutral-400 font-medium">
            Click anywhere outside to close
          </p>
        </div>
      </div>
    </div>
  );
};
