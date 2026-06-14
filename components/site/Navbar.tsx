"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const LEFT_LINKS  = [
  { href: "/productos", label: "Catálogo" },
  { href: "/talleres",  label: "Talleres" },
];
const RIGHT_LINKS = [
  { href: "/clases",   label: "Clases" },
  { href: "/nosotros", label: "Nosotros" },
];

export default function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinkClass = scrolled
    ? "font-sans text-[20px] font-medium tracking-wide text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
    : "font-sans text-[20px] font-medium tracking-wide text-[var(--color-cremita)]/80 hover:text-[var(--color-cremita)] transition-colors";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-border)]"
          : "bg-transparent"
      }`}
    >
      {/* 3-column grid: links hug the logo from each side */}
      <nav
        className={`w-full grid grid-cols-[1fr_auto_1fr] items-center px-10 transition-all duration-300 ${
          scrolled ? "h-16" : "h-[170px]"
        }`}
      >
        {/* Left links — right-aligned so they sit close to the logo */}
        <div className="hidden md:flex items-center justify-end gap-32 pr-16">
          {LEFT_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={navLinkClass}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Center logo */}
        <Link href="/" className="flex flex-col items-center pt-4">
          <Image
            src="/site/logo.png"
            alt="Papela Atelier"
            width={281}
            height={286}
            priority
            className={`transition-all duration-300 object-contain ${
              scrolled ? "w-9 h-9" : "w-[130px] h-[130px]"
            }`}
          />
        </Link>

        {/* Right links — left-aligned so they sit close to the logo */}
        <div className="hidden md:flex items-center justify-start gap-16 pl-16">
          {RIGHT_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={navLinkClass}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden ml-auto ${scrolled ? "text-[var(--color-verde)]" : "text-[var(--color-cremita)]"}`}
          aria-label="Menú"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>
    </header>
  );
}
