"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/productos", icon: "📚", label: "Catálogo" },
  { href: "/talleres", icon: "🎨", label: "Talleres" },
  { href: "/", icon: "home", label: "Home" },
  { href: "/clases", icon: "✏️", label: "Clases" },
  { href: "/nosotros", icon: "👥", label: "Nosotros" },
];

export default function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {!scrolled && (
          /* Original large navbar — only when NOT scrolled */
          <motion.header
            key="large-nav"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 inset-x-0 z-50 bg-transparent"
          >
            <nav className="w-full grid grid-cols-[1fr_auto_1fr] items-center px-10 h-[170px]">
              {/* Left links */}
              <div className="hidden md:flex items-center justify-end gap-32 pr-16">
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
                      className="font-sans text-[20px] font-medium tracking-wide text-[var(--color-cremita)]/80 hover:text-[var(--color-cremita)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Center logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Link href="/" className="flex flex-col items-center pt-4">
                  <Image
                    src="/site/logo.png"
                    alt="Papela Atelier"
                    width={281}
                    height={286}
                    priority
                    className="w-[130px] h-[130px] object-contain"
                  />
                </Link>
              </motion.div>

              {/* Right links */}
              <div className="hidden md:flex items-center justify-start gap-32 pl-16">
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
                      className="font-sans text-[20px] font-medium tracking-wide text-[var(--color-cremita)]/80 hover:text-[var(--color-cremita)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile hamburger */}
              <button className="md:hidden ml-auto text-[var(--color-cremita)]" aria-label="Menú">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </nav>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {scrolled && (
          /* Floating menu bar — Apple-style liquid glass, only when scrolled */
          <motion.nav
            key="floating-nav"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-6 py-3 rounded-full"
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(20px) saturate(200%)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Logo — home button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link href="/" className="flex items-center -mx-2">
                <Image
                  src="/site/logo.png"
                  alt="Papela"
                  width={281}
                  height={286}
                  priority
                  className="w-8 h-8 object-contain"
                  style={{
                    filter: "invert(1) brightness(1.1)",
                  }}
                />
              </Link>
            </motion.div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/20" />

            {/* Nav links — removed home, just categories */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.filter((item) => item.icon !== "home").map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={item.href}
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium tracking-wide"
                    title={item.label}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile menu icon */}
            <motion.button
              className="md:hidden text-white/80 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
