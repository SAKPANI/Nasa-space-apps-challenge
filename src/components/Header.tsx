import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Volume2, VolumeX, Eye, EyeOff } from "lucide-react";
import gsap from "gsap";

const links = [
  { to: "/explore", label: "Explorer" },
  { to: "/continents", label: "Continents" },
  { to: "/layers", label: "Bibliothèque" },
  { to: "/about", label: "À propos" },
];

export function Header() {
  const navRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReduced, setIsReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // Bascule du mode réduction de mouvement
  const toggleReducedMotion = () => {
    const next = !isReduced;
    setIsReduced(next);
    document.documentElement.classList.toggle("reduced-motion", next);
  };

  // Bascule du son global
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Dispatche un événement pour le moteur audio si nécessaire
    window.dispatchEvent(new CustomEvent("terra-sonora:mute", { detail: { muted: !isMuted } }));
  };

  // Animation fluide du menu mobile avec GSAP
  useEffect(() => {
    if (navRef.current) {
      gsap.to(navRef.current, {
        x: open ? 0 : "-100%",
        duration: isReduced ? 0 : 0.35,
        ease: "power2.out",
      });
    }
  }, [open, isReduced]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#14214D]/80 border-b border-white/10 transition-colors duration-300">
      <div className="shell flex items-center justify-between min-h-[4.25rem] px-4">
        {/* Brand Logo & Title */}
        <NavLink
          to="/"
          className="flex items-center gap-3 no-underline text-white group"
          onClick={() => setOpen(false)}
        >
          <img
            src="/logo.png"
            alt="Logo Terra Sonora"
            className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-display font-bold text-base md:text-lg tracking-[0.14em] text-white">
              TERRA SONORA
            </span>
            <span className="text-[0.68rem] tracking-wider text-[#FFCE00] font-mono uppercase">
              Earth Information Jukebox
            </span>
          </div>
        </NavLink>

        {/* Navigation centrée de bureau (style SpaceX / NASA) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Navigation principale">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-200 ${
                  isActive
                    ? "text-[#FFCE00] bg-white/10 shadow-[0_0_12px_rgba(255,206,0,0.25)]"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Boutons d'accessibilité visibles & Menu mobile */}
        <div className="flex items-center gap-2">
          {/* Bouton Réduire les animations */}
          <button
            type="button"
            onClick={toggleReducedMotion}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-[0.7rem] font-mono text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            title={isReduced ? "Activer les animations" : "Réduire les animations (mode accessible)"}
            aria-pressed={isReduced}
          >
            {isReduced ? <EyeOff size={13} className="text-[#FFCE00]" /> : <Eye size={13} />}
            <span className="hidden lg:inline">{isReduced ? "Animations réduites" : "Animations"}</span>
          </button>

          {/* Bouton Couper le son */}
          <button
            type="button"
            onClick={toggleMute}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-[0.7rem] font-mono text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            title={isMuted ? "Activer le son" : "Couper le son"}
            aria-pressed={isMuted}
          >
            {isMuted ? <VolumeX size={14} className="text-[#FF6B71]" /> : <Volume2 size={14} className="text-[#66CBAA]" />}
            <span className="hidden lg:inline">{isMuted ? "Muet" : "Son"}</span>
          </button>

          {/* Bouton Menu Mobile */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg border border-white/15 bg-white/5 text-white hover:bg-white/10"
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>

        {/* Panneau Mobile Glissant */}
        <nav
          ref={navRef}
          className="fixed top-0 left-0 h-screen w-72 backdrop-blur-2xl bg-[#14214D]/95 border-r border-white/15 p-6 flex flex-col gap-4 md:hidden z-50 shadow-2xl"
          style={{ transform: "translateX(-100%)" }}
          aria-label="Navigation mobile"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="font-display font-bold text-sm tracking-wider text-white">MENU</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-[#94A3B8] hover:text-white"
              aria-label="Fermer le menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "text-[#FFCE00] bg-white/10"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-2">
            <button
              type="button"
              onClick={toggleReducedMotion}
              className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/10 text-xs text-[#94A3B8]"
            >
              <span>Réduire les animations</span>
              {isReduced ? <EyeOff size={14} className="text-[#FFCE00]" /> : <Eye size={14} />}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
