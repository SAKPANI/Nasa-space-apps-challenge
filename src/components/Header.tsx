import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useTheme } from "../design/ThemeProvider";
import gsap from "gsap";

const links = [
  { to: "/explore", label: "Explore" },
  { to: "/continents", label: "Continents" },
  { to: "/layers", label: "Data Library" },
  { to: "/about", label: "About & Ethics" },
];

export function Header() {
  const { colors, spacing } = useTheme();
  const navRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Animate side navigation panel
  useEffect(() => {
    if (navRef.current) {
      gsap.to(navRef.current, {
        x: open ? 0 : "-100%",
        duration: 0.4,
        ease: "circ.out",
      });
    }
  }, [open]);

  return (
    <header className="topbar" style={{ background: colors.muted, color: colors.onSurface }}>
      <div className="shell bar" style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
        <NavLink to="/" className="brand" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
          <img src="/logo.png" alt="" style={{ height: "32px" }} />
          <span>
            <strong>TERRA SONORA</strong>
            <small style={{ marginLeft: spacing.xs, color: colors.accent }}>The Earth Information Jukebox</small>
          </span>
        </NavLink>
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{ background: "none", border: "none", color: colors.onSurface, cursor: "pointer" }}
        >
          {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          {open ? "Close" : "Menu"}
        </button>
        <nav
          ref={navRef}
          className={open ? "nav open" : "nav"}
          aria-label="Primary"
          style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: "250px", background: colors.background, padding: spacing.lg }}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              style={{ display: "block", marginBottom: spacing.sm, color: colors.onSurface, textDecoration: "none" }}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
