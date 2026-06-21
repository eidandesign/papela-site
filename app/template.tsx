// template.tsx se remonta en cada navegación (a diferencia de layout.tsx),
// así que la animación de entrada `page-enter` (definida en globals.css)
// dispara sola al cambiar de página. Es CSS puro: corre en el compositor
// (GPU), sin runtime de Framer Motion, y nunca deja el contenido invisible.
// Respeta prefers-reduced-motion. No necesita "use client".
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
