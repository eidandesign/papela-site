"use client";

import { useEffect, useState } from "react";

/**
 * Mockup animado de cómo funciona un Mini Site con menú: un celular que
 * recorre en bucle 5 pasos (abrir el menú → ver platillos → agregar → mandar
 * el pedido por WhatsApp con precios → revisar la data), con tooltips que
 * señalan lo que el negocio personaliza o gana en cada pantalla, y los pasos
 * numerados abajo. Lo usa la página de un Mini Site desactivado para vender
 * el servicio. El negocio, los platillos y los números son de EJEMPLO.
 * Con prefers-reduced-motion no avanza solo: los pasos se eligen a mano.
 */

const PASOS = [
  "Abre tu menú",
  "Ve los platillos",
  "Agrega lo que quiere",
  "Manda su pedido por WhatsApp",
  "Revisa quién te visita y qué piden",
] as const;
// ms por paso: el 1 y el 5 tienen más que leer
const DURACION = [4800, 3800, 4400, 3800, 5000];

type Tip = { texto: string; lado: "izq" | "der"; top: string; delay: number };
// Tooltips por paso (posición vertical en % del celular).
const TIPS: Tip[][] = [
  [
    { texto: "Tus colores", lado: "izq", top: "12%", delay: 300 },
    { texto: "Tu logo", lado: "der", top: "23%", delay: 900 },
    { texto: "Tus datos y redes", lado: "izq", top: "56%", delay: 1500 },
    { texto: "Tu propio link y QR", lado: "der", top: "74%", delay: 2100 },
  ],
  [
    { texto: "Agrega fotos de tus platillos", lado: "der", top: "30%", delay: 400 },
    { texto: "Cambia precios sin reimprimir el QR", lado: "der", top: "62%", delay: 1300 },
  ],
  [{ texto: "Suma el total solo", lado: "izq", top: "76%", delay: 600 }],
  [{ texto: "Directo a tu WhatsApp, sin comisiones", lado: "der", top: "58%", delay: 700 }],
  [
    { texto: "Lo más pedido", lado: "izq", top: "60%", delay: 500 },
    { texto: "Lo que buscan y no tienes", lado: "der", top: "80%", delay: 1300 },
  ],
];

// La "foto" es un degradado con emoji: no hay fotos reales de un cliente de ejemplo.
const PLATILLOS = [
  { nombre: "Tacos al pastor", desc: "Piña, cebolla y cilantro", precio: 22, emoji: "🌮", foto: "radial-gradient(circle at 30% 30%,#F6C27A,#D9784A)" },
  { nombre: "Gringa", desc: "Harina, queso y pastor", precio: 65, emoji: "🫓", foto: "radial-gradient(circle at 30% 30%,#F3D9A4,#C99555)" },
  { nombre: "Agua de horchata", desc: "Medio litro", precio: 30, emoji: "🥛", foto: "radial-gradient(circle at 30% 30%,#FFF6E6,#E4CFA8)" },
];
// En el paso 3 el pedido se arma de un toque a la vez, como en el menú real:
// pastor, pastor otra vez y una gringa. Cada toque sube la barra de abajo.
const SECUENCIA = [0, 0, 1]; // índices de PLATILLOS
const TOQUE_MS = [500, 1500, 2500]; // cuándo cae cada toque dentro del paso 3
const cantidadDe = (i: number, n: number) => SECUENCIA.slice(0, n).filter((x) => x === i).length;
const totalDe = (n: number) => SECUENCIA.slice(0, n).reduce((s, i) => s + PLATILLOS[i].precio, 0);
// Pedido final (pantalla de WhatsApp)
const PEDIDO = PLATILLOS.map((p, i) => ({ ...p, cant: cantidadDe(i, SECUENCIA.length) })).filter((p) => p.cant > 0);
const TOTAL = totalDe(SECUENCIA.length);

// Data de ejemplo (paso 5)
const KPIS = [
  { label: "Visitas", valor: "1,284", delta: "+18%" },
  { label: "Pedidos por WhatsApp", valor: "96", delta: "+24%" },
];
const SEMANA = [38, 52, 45, 61, 70, 92, 84]; // altura relativa de las barras
const POPULARES = [
  { nombre: "Tacos al pastor", n: 312 },
  { nombre: "Gringa", n: 148 },
  { nombre: "Agua de horchata", n: 97 },
];

function Tooltip({ tip, activo }: { tip: Tip; activo: boolean }) {
  const izq = tip.lado === "izq";
  return (
    <div
      key={activo ? "on" : "off"}
      className={`demo-tip absolute z-30 w-max ${activo ? "demo-tip-on" : "opacity-0"}`}
      style={{
        top: tip.top,
        ...(izq ? { right: "calc(100% - 34px)" } : { left: "calc(100% - 34px)" }),
        animationDelay: `${tip.delay}ms`,
      }}
    >
      <div className="relative w-max max-w-[100px] md:max-w-[160px] rounded-xl bg-[var(--color-cremita)] text-[var(--color-verde)] px-2.5 py-1.5 text-[10.5px] md:text-[12px] font-semibold leading-tight shadow-[0_6px_18px_rgba(0,0,0,0.25)]">
        {tip.texto}
        <span
          className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-[var(--color-cremita)] ${izq ? "-right-1" : "-left-1"}`}
        />
      </div>
    </div>
  );
}

export default function MenuDemo() {
  const [paso, setPaso] = useState(0);
  const [auto, setAuto] = useState(true);
  const [reducido, setReducido] = useState(false);
  // Toques ya dados dentro del paso 3 (0..SECUENCIA.length)
  const [toques, setToques] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => { setAuto(false); setReducido(true); }, 0);
      return () => clearTimeout(t);
    }
  }, []);

  // Paso 3: va agregando platillo por platillo. Fuera de él no corre nada:
  // `agregados` se deriva (0 antes, todo después).
  useEffect(() => {
    if (paso !== 2) return;
    const ts = [setTimeout(() => setToques(0), 0)];
    if (reducido) ts.push(setTimeout(() => setToques(SECUENCIA.length), 0));
    else TOQUE_MS.forEach((ms, k) => ts.push(setTimeout(() => setToques(k + 1), ms)));
    return () => ts.forEach(clearTimeout);
  }, [paso, reducido]);

  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setPaso((p) => (p + 1) % PASOS.length), DURACION[paso]);
    return () => clearTimeout(t);
  }, [paso, auto]);

  // La pantalla del menú es la misma en los pasos 2 y 3 (cambia el pedido).
  const pantalla = paso === 2 ? 1 : paso;
  const capa = (i: number) =>
    `absolute inset-0 flex flex-col transition-all duration-500 ease-out ${
      pantalla === i ? "opacity-100 translate-x-0" : pantalla > i ? "opacity-0 -translate-x-6" : "opacity-0 translate-x-6"
    }`;
  const agregados = paso < 2 ? 0 : paso > 2 ? SECUENCIA.length : toques;
  const piezas = agregados;
  const total = totalDe(agregados);
  // Platillo que el "dedo" va a tocar ahora (solo en el paso 3)
  const siguiente = paso === 2 && toques < SECUENCIA.length ? SECUENCIA[toques] : -1;

  return (
    <div className="flex flex-col items-center w-full" aria-label="Así funciona un menú en línea de Papela">
      {/* Celular + tooltips (los tooltips sobresalen del celular, fuera del overflow de la pantalla) */}
      <div aria-hidden className="relative">
        {TIPS.map((tips, i) => tips.map((t) => <Tooltip key={`${i}-${t.texto}`} tip={t} activo={paso === i} />))}

        <div className="relative w-[220px] h-[440px] md:w-[240px] md:h-[480px] rounded-[38px] bg-[#1b1b1b] p-[9px] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-[#FBF6EE] text-left text-[#3d2a1e]">
            {/* Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-[18px] rounded-full bg-[#1b1b1b] z-20" />

            {/* 1 · Home del Mini Site */}
            <div className={capa(0)}>
              <div className="h-[92px] bg-[linear-gradient(135deg,#C4704A,#8C482A)]" />
              <div className="-mt-8 mx-auto w-16 h-16 rounded-full bg-[#FBF6EE] p-1">
                <div className="w-full h-full rounded-full bg-[#8C482A] flex items-center justify-center text-[#FBF6EE] font-serif text-xl">E</div>
              </div>
              <p className="text-center font-serif text-[17px] mt-2">Taquería La Esquina</p>
              <p className="text-center text-[10px] text-[#3d2a1e]/60 mb-4">Tacos de trompo desde 1998</p>
              <div className="px-4 flex flex-col gap-2">
                <div className="relative h-10 rounded-full bg-[#8C482A] text-[#FBF6EE] text-[12px] font-semibold flex items-center justify-center">
                  Ver menú
                  {paso === 0 && <span className="demo-tap absolute right-8 top-1/2" style={{ animationDelay: "2.8s" }} />}
                </div>
                {["WhatsApp", "Cómo llegar", "Instagram"].map((b) => (
                  <div key={b} className="h-10 rounded-full border border-[#8C482A]/30 text-[12px] font-semibold flex items-center justify-center">{b}</div>
                ))}
              </div>
              <p className="mt-auto mb-4 text-center text-[8.5px] text-[#3d2a1e]/45">papela-atelier.com/la-esquina</p>
            </div>

            {/* 2 y 3 · Menú (sin y con pedido) */}
            <div className={capa(1)}>
              <div className="pt-9 pb-2 text-center border-b border-[#3d2a1e]/10">
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#3d2a1e]/50">Taquería La Esquina</p>
                <p className="font-serif text-[18px]">Menú</p>
                <div className="flex gap-1.5 justify-center mt-2">
                  {["Tacos", "Especiales", "Bebidas"].map((c, i) => (
                    <span key={c} className={`text-[9px] px-2.5 py-1 rounded-full ${i === 0 ? "bg-[#8C482A] text-[#FBF6EE]" : "bg-[#8C482A]/10"}`}>{c}</span>
                  ))}
                </div>
              </div>
              <div className="flex-1 px-3 pt-1">
                {PLATILLOS.map((p, i) => {
                  const cant = cantidadDe(i, agregados);
                  return (
                    <div key={p.nombre} className="flex items-start gap-2.5 py-2.5 border-b border-[#3d2a1e]/8 demo-rise" style={{ animationDelay: `${i * 90}ms` }}>
                      {/* Igual que el menú real: título, precio y descripción; la foto a la derecha */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11.5px] font-semibold leading-tight">{p.nombre}</p>
                        <p className="text-[11px] font-semibold text-[#8C482A] mt-0.5">${p.precio}</p>
                        <p className="text-[9px] text-[#3d2a1e]/55 leading-tight mt-0.5">{p.desc}</p>
                      </div>
                      <div className="relative shrink-0">
                        <div
                          className="w-[54px] h-[54px] rounded-xl flex items-center justify-center text-[26px] shadow-[0_0_0_1px_rgba(127,127,127,.18),0_6px_14px_rgba(0,0,0,.14)]"
                          style={{ background: p.foto }}
                        >
                          {p.emoji}
                        </div>
                        {/* Control de agregar montado en la esquina de la foto */}
                        <div className="absolute -bottom-1.5 -right-1.5">
                          {cant > 0 ? (
                            <div key={`cant-${cant}`} className="flex items-center gap-0.5 rounded-full bg-[#8C482A] text-[#FBF6EE] text-[10px] font-semibold px-1 h-6 shadow-md demo-pop">
                              <span className="w-3.5 text-center">−</span>{cant}<span className="w-3.5 text-center">+</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-white border border-[#8C482A]/40 text-[#8C482A] text-[14px] leading-none flex items-center justify-center shadow-md">+</div>
                          )}
                          {siguiente === i && <span key={`tap-${toques}`} className="demo-tap absolute right-0 top-1/2" style={{ animationDelay: "0.05s", animationIterationCount: 1 }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Barra de abajo, como la del menú real: Volver + resumen del pedido */}
              <div className="absolute left-3 right-3 bottom-3.5 flex items-center gap-2">
                <div className="shrink-0 w-9 h-9 rounded-full bg-[#8C482A] text-[#FBF6EE] flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </div>
                <div
                  className={`flex-1 h-9 rounded-full bg-[#8C482A] text-[#FBF6EE] text-[10.5px] font-semibold flex items-center gap-2 pl-1.5 pr-3 shadow-lg transition-all duration-300 ${
                    piezas > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <span key={`n-${piezas}`} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold tabular-nums demo-pop">{piezas}</span>
                  <span className="flex-1 whitespace-nowrap">Ver pedido</span>
                  <span key={`t${total}`} className="tabular-nums demo-pop">${total}</span>
                </div>
              </div>
            </div>

            {/* 4 · WhatsApp */}
            <div className={capa(3)}>
              <div className="pt-8 pb-2.5 px-3 bg-[#075E54] text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#8C482A] flex items-center justify-center font-serif text-[13px]">E</div>
                <div>
                  <p className="text-[11px] font-semibold leading-tight">Taquería La Esquina</p>
                  <p className="text-[8px] opacity-75">en línea</p>
                </div>
              </div>
              <div className="flex-1 bg-[#ECE5DD] p-3 flex flex-col justify-end">
                <div className={`self-end max-w-[88%] rounded-xl rounded-tr-sm bg-[#DCF8C6] px-2.5 py-2 text-[9.5px] leading-[1.45] text-[#1f2c33] shadow-sm ${paso === 3 ? "demo-pop" : ""}`}>
                  <p>Hola, Taquería La Esquina 👋</p>
                  <p>Quiero pedir:</p>
                  {PEDIDO.map((p) => (
                    <p key={p.nombre}>• {p.cant} × {p.nombre} — ${p.cant * p.precio}</p>
                  ))}
                  <p className="font-semibold mt-1">Total: ${TOTAL}</p>
                  <p className="text-right text-[8px] text-[#1f2c33]/45 mt-0.5">12:30 ✓✓</p>
                </div>
              </div>
            </div>

            {/* 5 · Data del negocio */}
            <div className={`${capa(4)} bg-[#F4F1EC] text-[#2a2a2a]`}>
              <div className="pt-9 px-3.5 pb-2">
                <p className="font-serif text-[17px] leading-tight">Data</p>
                <p className="text-[9px] text-black/45">Últimos 7 días</p>
              </div>
              <div className="px-3 grid grid-cols-2 gap-1.5">
                {KPIS.map((k) => (
                  <div key={k.label} className="rounded-xl bg-white px-2.5 py-2">
                    <p className="text-[8.5px] text-black/50 leading-tight">{k.label}</p>
                    <p className="text-[16px] font-semibold leading-tight">{k.valor}</p>
                    <p className="text-[8.5px] font-semibold text-[#2E7D32]">{k.delta}</p>
                  </div>
                ))}
              </div>
              <div className="mx-3 mt-1.5 rounded-xl bg-white px-2.5 pt-2 pb-1.5">
                <p className="text-[8.5px] text-black/50 mb-1">Actividad</p>
                <div className="flex items-end gap-1 h-9">
                  {SEMANA.map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-[3px] ${paso === 4 ? "demo-bar" : ""} ${i === 5 ? "bg-[#12535C]" : "bg-[#12535C]/30"}`}
                      style={{ height: `${h}%`, animationDelay: `${i * 70}ms` }}
                    />
                  ))}
                </div>
              </div>
              <div className="mx-3 mt-1.5 rounded-xl bg-white px-2.5 py-2">
                <p className="text-[8.5px] text-black/50 mb-1">Platillos más populares</p>
                {POPULARES.map((p) => (
                  <div key={p.nombre} className="mb-1 last:mb-0">
                    <div className="flex justify-between text-[9px] leading-tight">
                      <span>{p.nombre}</span>
                      <span className="font-semibold">{p.n}</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#12535C]/10">
                      <div className={`h-full rounded-full bg-[#C4704A] origin-left ${paso === 4 ? "demo-grow" : ""}`} style={{ width: `${(p.n / POPULARES[0].n) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mx-3 mt-1.5 rounded-xl bg-white px-2.5 py-2">
                <p className="text-[8.5px] text-black/50 mb-1">Lo que buscan</p>
                <div className="flex items-center justify-between text-[9px]">
                  <span>“quesadilla”</span>
                  <span className="rounded-full bg-[#FEF3E2] text-[#B45309] px-1.5 py-0.5 text-[7.5px] font-semibold">23 · sin resultados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pasos: en celular solo el número + el texto del paso actual debajo */}
      <ol className="mt-7 grid grid-cols-5 gap-1.5 md:gap-2 w-full max-w-[300px] md:max-w-[660px]">
        {PASOS.map((p, i) => (
          <li key={p}>
            <button
              type="button"
              onClick={() => { setPaso(i); setAuto(false); }}
              aria-current={paso === i ? "step" : undefined}
              aria-label={`Paso ${i + 1}: ${p}`}
              className={`w-full h-full rounded-2xl px-2 md:px-3 py-2 md:py-2.5 text-center md:text-left text-[12px] leading-snug transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cremita)] ${
                paso === i ? "bg-[var(--color-cremita)] text-[var(--color-verde)]" : "bg-white/5 text-[var(--color-cremita)]/70 hover:bg-white/10"
              }`}
            >
              <span className="block font-serif text-[18px] leading-none md:mb-1">{i + 1}</span>
              <span className="hidden md:block">{p}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="md:hidden mt-3 text-[14px] text-[var(--color-cremita)]" aria-live="polite">{PASOS[paso]}</p>
    </div>
  );
}
