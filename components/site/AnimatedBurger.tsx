"use client";

// Hamburguesa animada del sitio: las tres líneas se cruzan en X al abrir.
// La usa el navbar (components/site/Navbar.tsx) y el menú de la tarjeta del
// Club — mismo gesto y mismo timing en los dos.

const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";

export default function AnimatedBurger({ isOpen, color = "currentColor" }: { isOpen: boolean; color?: string }) {
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
