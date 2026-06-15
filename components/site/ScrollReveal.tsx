"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "none";
  duration?: number;
  amount?: number;
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.6,
  amount = 0.15,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount });

  const hidden = reduced
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: direction === "up" ? 28 : 0,
        x: direction === "left" ? -20 : 0,
      };

  const visible = { opacity: 1, y: 0, x: 0 };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={hidden}
      animate={inView ? visible : hidden}
      transition={{ duration: reduced ? 0.2 : duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
