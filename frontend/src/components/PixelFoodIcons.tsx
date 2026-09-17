import React from "react";

// Pixel art burger matching reference image (bun, sesame seeds, cheese, beef patty, lettuce, bottom bun)
export const PixelBurgerIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges">
    {/* Top Bun Top */}
    <rect x="7" y="5" width="10" height="2" fill="#E67E22" />
    <rect x="6" y="6" width="12" height="1" fill="#E67E22" />
    <rect x="5" y="7" width="14" height="2" fill="#F39C12" />
    {/* Sesame seeds */}
    <rect x="8" y="6" width="1" height="1" fill="#FEF9E7" />
    <rect x="12" y="6" width="1" height="1" fill="#FEF9E7" />
    <rect x="15" y="7" width="1" height="1" fill="#FEF9E7" />
    <rect x="9" y="8" width="1" height="1" fill="#FEF9E7" />
    {/* Bun shadow */}
    <rect x="5" y="9" width="14" height="1" fill="#D35400" />
    {/* Outline top */}
    <rect x="7" y="4" width="10" height="1" fill="#1C2833" />
    <rect x="5" y="5" width="2" height="2" fill="#1C2833" />
    <rect x="17" y="5" width="2" height="2" fill="#1C2833" />
    <rect x="4" y="7" width="1" height="3" fill="#1C2833" />
    <rect x="19" y="7" width="1" height="3" fill="#1C2833" />

    {/* Lettuce */}
    <rect x="4" y="10" width="16" height="1" fill="#2ECC71" />
    <rect x="5" y="11" width="3" height="1" fill="#27AE60" />
    <rect x="9" y="11" width="3" height="1" fill="#27AE60" />
    <rect x="13" y="11" width="3" height="1" fill="#27AE60" />
    <rect x="17" y="11" width="2" height="1" fill="#27AE60" />

    {/* Cheese (dripping point) */}
    <rect x="4" y="12" width="16" height="1" fill="#F1C40F" />
    <rect x="7" y="13" width="2" height="1" fill="#F1C40F" />
    <rect x="15" y="13" width="2" height="1" fill="#F1C40F" />

    {/* Meat Patty */}
    <rect x="5" y="13" width="14" height="2" fill="#78281F" />
    <rect x="6" y="14" width="12" height="1" fill="#512E2E" />

    {/* Bottom Bun */}
    <rect x="5" y="15" width="14" height="2" fill="#F39C12" />
    <rect x="6" y="17" width="12" height="1" fill="#D35400" />
    {/* Bottom Outline */}
    <rect x="4" y="13" width="1" height="4" fill="#1C2833" />
    <rect x="19" y="13" width="1" height="4" fill="#1C2833" />
    <rect x="6" y="18" width="12" height="1" fill="#1C2833" />
    <rect x="5" y="17" width="1" height="1" fill="#1C2833" />
    <rect x="18" y="17" width="1" height="1" fill="#1C2833" />
  </svg>
);

// Pixel art pizza slice matching reference image (crust, red sauce, cheese, pepperonis)
export const PixelPizzaIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges">
    {/* Crust outline and fill */}
    <rect x="6" y="4" width="12" height="1" fill="#1C2833" />
    <rect x="5" y="5" width="1" height="1" fill="#1C2833" />
    <rect x="18" y="5" width="1" height="1" fill="#1C2833" />
    <rect x="6" y="5" width="12" height="2" fill="#D35400" />
    <rect x="7" y="5" width="10" height="1" fill="#E67E22" />

    {/* Pizza Body - Stepping down into triangle */}
    <rect x="6" y="7" width="12" height="1" fill="#E74C3C" />
    <rect x="6" y="8" width="12" height="1" fill="#F39C12" />
    <rect x="7" y="9" width="10" height="1" fill="#F1C40F" />
    <rect x="7" y="10" width="10" height="1" fill="#F39C12" />
    <rect x="8" y="11" width="8" height="1" fill="#F1C40F" />
    <rect x="8" y="12" width="8" height="1" fill="#F39C12" />
    <rect x="9" y="13" width="6" height="1" fill="#F1C40F" />
    <rect x="9" y="14" width="6" height="1" fill="#F39C12" />
    <rect x="10" y="15" width="4" height="1" fill="#F1C40F" />
    <rect x="10" y="16" width="4" height="1" fill="#F39C12" />
    <rect x="11" y="17" width="2" height="1" fill="#F1C40F" />
    <rect x="11" y="18" width="2" height="1" fill="#E74C3C" />
    <rect x="11" y="19" width="2" height="1" fill="#1C2833" />

    {/* Pepperoni Slices (Red circles in pixels) */}
    <rect x="8" y="8" width="2" height="2" fill="#C0392B" />
    <rect x="14" y="8" width="2" height="2" fill="#C0392B" />
    <rect x="11" y="11" width="2" height="2" fill="#922B21" />
    <rect x="8" y="12" width="1" height="1" fill="#C0392B" />
    <rect x="13" y="13" width="2" height="1" fill="#C0392B" />
    <rect x="10" y="14" width="1" height="1" fill="#922B21" />

    {/* Side outlines */}
    <rect x="5" y="7" width="1" height="2" fill="#1C2833" />
    <rect x="18" y="7" width="1" height="2" fill="#1C2833" />
    <rect x="6" y="9" width="1" height="2" fill="#1C2833" />
    <rect x="17" y="9" width="1" height="2" fill="#1C2833" />
    <rect x="7" y="11" width="1" height="2" fill="#1C2833" />
    <rect x="16" y="11" width="1" height="2" fill="#1C2833" />
    <rect x="8" y="13" width="1" height="2" fill="#1C2833" />
    <rect x="15" y="13" width="1" height="2" fill="#1C2833" />
    <rect x="9" y="15" width="1" height="2" fill="#1C2833" />
    <rect x="14" y="15" width="1" height="2" fill="#1C2833" />
    <rect x="10" y="17" width="1" height="2" fill="#1C2833" />
    <rect x="13" y="17" width="1" height="2" fill="#1C2833" />
  </svg>
);

// Pixel art coffee cup with steam lines matching reference image
export const PixelCoffeeIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges">
    {/* Steam lines above cup */}
    <rect x="7" y="4" width="1" height="2" fill="#718096" />
    <rect x="8" y="5" width="1" height="2" fill="#4A5568" />
    <rect x="7" y="7" width="1" height="1" fill="#718096" />

    <rect x="11" y="3" width="1" height="2" fill="#718096" />
    <rect x="12" y="4" width="1" height="2" fill="#4A5568" />
    <rect x="11" y="6" width="1" height="2" fill="#718096" />

    <rect x="15" y="4" width="1" height="2" fill="#718096" />
    <rect x="16" y="5" width="1" height="2" fill="#4A5568" />
    <rect x="15" y="7" width="1" height="1" fill="#718096" />

    {/* Cup Rim */}
    <rect x="5" y="9" width="13" height="1" fill="#1C2833" />
    <rect x="5" y="10" width="13" height="1" fill="#CBD5E0" />
    <rect x="6" y="10" width="11" height="1" fill="#4A3525" /> {/* Coffee inside */}

    {/* Cup Body */}
    <rect x="5" y="11" width="13" height="5" fill="#E2E8F0" />
    <rect x="5" y="11" width="2" height="5" fill="#CBD5E0" /> {/* Shadow */}
    <rect x="8" y="12" width="6" height="3" fill="#E53E3E" /> {/* Emblem/logo */}
    <rect x="6" y="16" width="11" height="1" fill="#CBD5E0" />

    {/* Cup Outline */}
    <rect x="4" y="10" width="1" height="6" fill="#1C2833" />
    <rect x="18" y="10" width="1" height="6" fill="#1C2833" />
    <rect x="6" y="17" width="11" height="1" fill="#1C2833" />

    {/* Cup Handle */}
    <rect x="18" y="11" width="3" height="1" fill="#1C2833" />
    <rect x="20" y="12" width="1" height="3" fill="#1C2833" />
    <rect x="18" y="14" width="3" height="1" fill="#1C2833" />
    <rect x="19" y="12" width="1" height="2" fill="#CBD5E0" />

    {/* Saucer / Plate */}
    <rect x="3" y="18" width="17" height="1" fill="#1C2833" />
    <rect x="4" y="19" width="15" height="1" fill="#CBD5E0" />
    <rect x="4" y="20" width="15" height="1" fill="#1C2833" />
  </svg>
);

// Pixel art bakery croissant / bread matching reference image
export const PixelBakeryIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges">
    {/* Croissant / Bread Roll Outline & Warm Golden Layers */}
    <rect x="9" y="7" width="6" height="1" fill="#1C2833" />
    <rect x="7" y="8" width="2" height="1" fill="#1C2833" />
    <rect x="15" y="8" width="2" height="1" fill="#1C2833" />

    {/* Top crust */}
    <rect x="9" y="8" width="6" height="1" fill="#D35400" />
    <rect x="7" y="9" width="10" height="2" fill="#E67E22" />
    <rect x="8" y="9" width="2" height="1" fill="#F39C12" />
    <rect x="12" y="9" width="3" height="1" fill="#F39C12" />

    {/* Bread body folds */}
    <rect x="5" y="11" width="14" height="2" fill="#F39C12" />
    <rect x="7" y="11" width="1" height="2" fill="#B9770E" />
    <rect x="11" y="11" width="1" height="2" fill="#B9770E" />
    <rect x="15" y="11" width="1" height="2" fill="#B9770E" />

    {/* Lower roll fold */}
    <rect x="4" y="13" width="16" height="2" fill="#E67E22" />
    <rect x="6" y="13" width="3" height="1" fill="#F5B041" />
    <rect x="11" y="13" width="4" height="1" fill="#F5B041" />
    <rect x="5" y="14" width="14" height="1" fill="#D35400" />

    {/* Bottom roll edges */}
    <rect x="4" y="15" width="4" height="2" fill="#D35400" />
    <rect x="16" y="15" width="4" height="2" fill="#D35400" />
    <rect x="7" y="16" width="10" height="1" fill="#BA4A00" />

    {/* Outer boundary lines */}
    <rect x="5" y="10" width="2" height="1" fill="#1C2833" />
    <rect x="17" y="10" width="2" height="1" fill="#1C2833" />
    <rect x="4" y="11" width="1" height="2" fill="#1C2833" />
    <rect x="19" y="11" width="1" height="2" fill="#1C2833" />
    <rect x="3" y="13" width="1" height="2" fill="#1C2833" />
    <rect x="20" y="13" width="1" height="2" fill="#1C2833" />
    <rect x="4" y="15" width="1" height="2" fill="#1C2833" />
    <rect x="19" y="15" width="1" height="2" fill="#1C2833" />
    <rect x="5" y="17" width="14" height="1" fill="#1C2833" />
  </svg>
);

// Pixel art Asian noodles
export const PixelAsianIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges">
    <rect x="14" y="4" width="6" height="1" fill="#884EA0" />
    <rect x="11" y="5" width="8" height="1" fill="#884EA0" />
    <rect x="8" y="7" width="8" height="1" fill="#F9E79F" />
    <rect x="7" y="8" width="10" height="2" fill="#F4D03F" />
    <rect x="9" y="8" width="2" height="2" fill="#27AE60" />
    <rect x="13" y="9" width="2" height="1" fill="#E74C3C" />
    <rect x="5" y="10" width="14" height="1" fill="#1C2833" />
    <rect x="5" y="11" width="14" height="4" fill="#9B59B6" />
    <rect x="6" y="15" width="12" height="1" fill="#884EA0" />
    <rect x="7" y="16" width="10" height="1" fill="#1C2833" />
    <rect x="9" y="17" width="6" height="1" fill="#1C2833" />
  </svg>
);
