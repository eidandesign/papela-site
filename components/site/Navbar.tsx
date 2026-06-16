"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import CartButton from "./CartButton";
import AnimatedLogo from "./AnimatedLogo";

const NAV_LINKS = [
  { href: "/productos", label: "Catálogo" },
  { href: "/talleres", label: "Talleres" },
  { href: "/clases", label: "Clases" },
  { href: "/nosotros", label: "Nosotros" },
];

const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
const FG = "#F3E6CF";

function AnimatedBurger({ isOpen, color = "currentColor" }: { isOpen: boolean; color?: string }) {
  const ease = `transform 0.38s ${EASE}`;
  return (
    <div style={{ width: 28, height: 19, position: "relative" }}>
      <span style={{
        position: "absolute", top: 0, left: 0,
        display: "block", height: "1.5px", width: 28, backgroundColor: color,
        transformOrigin: "center",
        transform: isOpen ? "translateY(8.75px) rotate(45deg)" : "translateY(0) rotate(0deg)",
        transition: ease,
      }} />
      <span style={{
        position: "absolute", top: "50%", left: 0, marginTop: "-0.75px",
        display: "block", height: "1.5px", width: 18, backgroundColor: color,
        opacity: isOpen ? 0 : 1,
        transform: isOpen ? "scaleX(0)" : "scaleX(1)",
        transition: "opacity 0.18s ease, transform 0.22s ease",
      }} />
      <span style={{
        position: "absolute", bottom: 0, left: 0,
        display: "block", height: "1.5px", width: 28, backgroundColor: color,
        transformOrigin: "center",
        transform: isOpen ? "translateY(-8.75px) rotate(-45deg)" : "translateY(0) rotate(0deg)",
        transition: ease,
      }} />
    </div>
  );
}

function IgIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke={FG} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" stroke={FG} strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill={FG} />
    </svg>
  );
}

function FbIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke={FG} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke={FG} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke={FG} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SOCIALS = [
  { href: "https://instagram.com/papela.atelier", label: "Instagram", Icon: IgIcon },
  { href: "https://facebook.com/papela.atelier", label: "Facebook", Icon: FbIcon },
  { href: "https://tiktok.com/@papela.atelier", label: "TikTok", Icon: TkIcon },
  { href: "https://wa.me/522211865590", label: "WhatsApp", Icon: WaIcon },
];

const HOVER_FG = "rgba(243,230,207,0.5)";
const socialDelay = 0.15 + NAV_LINKS.length * 0.08 + 0.1;

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  // `visible` is separate from `isOpen` so we can mount first, then animate in
  const [visible, setVisible] = useState(false);
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById("papela-hamburger-portal");
    if (!el) {
      el = document.createElement("div");
      el.id = "papela-hamburger-portal";
      document.body.appendChild(el);
    }
    portalRef.current = el;
    return () => {
      document.body.style.overflow = "";
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Intentional: opening mounts the portal before the enter animation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      document.body.style.overflow = "hidden";
      // Wait 2 frames so the DOM paints the initial clip-path before transitioning
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      );
    } else {
      setVisible(false);
      document.body.style.overflow = "";
      const t = setTimeout(() => setMounted(false), 700);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // portalRef holds the host node created in an effect; reading it to gate the
  // render is intentional for this createPortal pattern.
  // eslint-disable-next-line react-hooks/refs
  if (!mounted || !portalRef.current) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "var(--color-verde)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 8vw",
        boxSizing: "border-box",
        overflow: "hidden",
        clipPath: visible ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
        WebkitClipPath: visible ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
        transition: `clip-path 0.65s ${EASE}, -webkit-clip-path 0.65s ${EASE}`,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Logo top left */}
      <div style={{ position: "absolute", top: 16, left: 20, opacity: visible ? 1 : 0, transition: "opacity 0.3s ease 0.3s" }}>
        <Link href="/" onClick={onClose}>
          <Image src="/site/logo.png" alt="Papela" width={60} height={60} className="object-contain brightness-200 opacity-80" />
        </Link>
      </div>


      {/* Nav links */}
      <nav style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = HOVER_FG; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = FG; }}
            style={{
              display: "block",
              fontFamily: "PP Editorial New, serif",
              fontSize: "clamp(2.6rem, 13vw, 5rem)",
              fontWeight: 300,
              color: FG,
              textDecoration: "none",
              lineHeight: 1.15,
              paddingTop: 10,
              paddingBottom: 10,
              borderBottom: "1px solid rgba(243,230,207,0.18)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transition: [
                `opacity 0.5s ease ${0.15 + i * 0.08}s`,
                `transform 0.6s ${EASE} ${0.15 + i * 0.08}s`,
                "color 0.15s ease",
              ].join(", "),
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Social icons */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 28,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 0.5s ease ${socialDelay}s, transform 0.6s ${EASE} ${socialDelay}s`,
        }}
      >
        {SOCIALS.map(({ href, label, Icon }, i) => (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = FG;
              el.style.background = "rgba(243,230,207,0.1)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(243,230,207,0.3)";
              el.style.background = "transparent";
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "1px solid rgba(243,230,207,0.3)",
              textDecoration: "none",
              flexShrink: 0,
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              transition: "border-color 0.2s ease, background 0.2s ease",
            }}
          >
            <Icon />
          </a>
        ))}
      </div>

    </div>,
    // eslint-disable-next-line react-hooks/refs
    portalRef.current
  );
}

// Keep desktop NAV_ITEMS for floating bar
const NAV_ITEMS = [
  { href: "/productos", label: "Catálogo" },
  { href: "/talleres", label: "Talleres" },
  { href: "/clases", label: "Clases" },
  { href: "/nosotros", label: "Nosotros" },
];

export default function SiteNavbar() {
  const pathname = usePathname();
  const forceScrolled = pathname?.includes("/checkout");
  // Páginas con fondo claro (sin hero oscuro) → navbar en verde para contraste.
  const onLight = !!pathname && pathname.startsWith("/clases/");
  const linkClass = onLight
    ? "text-[var(--color-verde)]/85 hover:text-[var(--color-verde)]"
    : "text-[var(--color-cremita)]/80 hover:text-[var(--color-cremita)]";
  const iconColor = onLight ? "#12535C" : FG;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isScrolled = forceScrolled || scrolled;

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <MobileMenu isOpen={menuOpen} onClose={closeMenu} />

      <AnimatePresence mode="wait">
        {!isScrolled && (
          <motion.header
            key="large-nav"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 inset-x-0 bg-transparent"
            style={{ zIndex: menuOpen ? 100001 : 50 }}
          >
            <nav className="w-[96%] mx-auto relative flex items-center justify-center px-6 md:px-10 h-[140px] md:h-[170px]">
              {/* Desktop: centered cluster — links flank the logo near the middle */}
              <div className="flex items-center justify-center gap-8 lg:gap-12">
                {/* Left links */}
                <div className="hidden md:flex items-center gap-8 lg:gap-10">
                  {[
                    { href: "/productos", label: "Catálogo" },
                    { href: "/talleres", label: "Talleres" },
                  ].map((l, i) => (
                    <motion.div
                      key={l.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                    >
                      <Link
                        href={l.href}
                        className={`font-sans text-[20px] font-medium tracking-wide ${linkClass} transition-colors`}
                      >
                        {l.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Center logo — hidden when menu is open */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: menuOpen ? 0 : 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{ pointerEvents: menuOpen ? "none" : "auto" }}
                >
                  <Link href="/" aria-label="Papela Atelier" className="flex flex-col items-center translate-y-5 md:translate-y-7">
                    <AnimatedLogo
                      color={onLight ? "var(--color-verde)" : "var(--color-cremita)"}
                      className="w-[100px] h-[100px] md:w-[130px] md:h-[130px]"
                    />
                  </Link>
                </motion.div>

                {/* Right links */}
                <div className="hidden md:flex items-center gap-8 lg:gap-10">
                  {[
                    { href: "/clases", label: "Clases" },
                    { href: "/nosotros", label: "Nosotros" },
                  ].map((l, i) => (
                    <motion.div
                      key={l.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                    >
                      <Link
                        href={l.href}
                        className={`font-sans text-[20px] font-medium tracking-wide ${linkClass} transition-colors`}
                      >
                        {l.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Cart — desktop, stays in the corner */}
              <div className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2">
                <CartButton color={iconColor} />
              </div>

              {/* Mobile: cart + hamburger */}
              <div
                className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3"
                style={{ zIndex: menuOpen ? 100001 : "auto" }}
              >
                <CartButton color={iconColor} />
                <button
                  onClick={menuOpen ? closeMenu : openMenu}
                  aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                  className="p-2"
                  style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
                >
                  <AnimatedBurger isOpen={menuOpen} color={iconColor} />
                </button>
              </div>
            </nav>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isScrolled && (
          <motion.nav
            key="floating-nav"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-5 md:bottom-auto md:top-5 left-1/2 -translate-x-1/2 w-max max-w-[calc(100vw-2rem)] flex items-center gap-4 md:gap-6 px-5 md:px-6 py-3 rounded-full"
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(20px) saturate(200%)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              zIndex: menuOpen ? 100000 : 50,
            }}
          >
            {/* Logo */}
            <motion.div className="shrink-0" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Link href="/" aria-label="Papela" className="flex items-center -mx-1">
                <AnimatedLogo color="var(--color-cremita)" className="w-11 h-11" />
              </Link>
            </motion.div>

            <div className="shrink-0 w-px h-6 bg-white/20" />

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={item.href} className="text-white/80 hover:text-white transition-colors text-sm font-medium tracking-wide">
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Cart icon — always visible */}
            <CartButton color="rgba(255,255,255,0.9)" />

            {/* Mobile hamburger */}
            <motion.button
              onClick={menuOpen ? closeMenu : openMenu}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              className="md:hidden p-1"
              whileTap={{ scale: 0.95 }}
              style={{
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                position: "relative",
                zIndex: menuOpen ? 100001 : "auto",
              }}
            >
              <AnimatedBurger isOpen={menuOpen} color="rgba(255,255,255,0.9)" />
            </motion.button>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
