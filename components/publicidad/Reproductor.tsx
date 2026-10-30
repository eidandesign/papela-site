"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { CROSSFADE_MS, LIENZO, SALIDA_MS, type AnuncioPublico } from "@/lib/publicidad";
import AnuncioVista from "./AnuncioVista";
import LogoFijo from "./LogoFijo";
import AnimatedLogo from "@/components/site/AnimatedLogo";

// Reproductor en bucle. Cada cambio va en dos tiempos: primero la info del
// anuncio que se va sale (SALIDA_MS, ver coreografia.ts) y luego el crossfade
// de 800 ms: la capa que entra se monta encima con opacity 0→1 y la anterior
// se desmonta al terminar el fundido (solo se anima opacity). Mientras un anuncio corre, se precarga el medio del
// siguiente. Un medio que falla se salta y se sigue con el próximo.
//
// `anuncios` puede cambiar en caliente (versión nueva del admin): la lista
// nueva se aplica al pasar al siguiente anuncio, nunca a media reproducción.
// `antesDeAvanzar` deja que el padre haga algo entre anuncios (aplicar la
// lista pendiente, recargar la página cada 6 h).

type Capa = { key: number; anuncio: AnuncioPublico; entrando: boolean; saliendo?: boolean };

export default function Reproductor({ anuncios, antesDeAvanzar }: { anuncios: AnuncioPublico[]; antesDeAvanzar?: () => "recargar" | void }) {
  const reduced = !!useReducedMotion();
  const listaRef = useRef(anuncios);
  const indiceRef = useRef(0);
  const keyRef = useRef(0);
  const [capas, setCapas] = useState<Capa[]>(() => (anuncios.length ? [{ key: 0, anuncio: anuncios[0], entrando: false }] : []));
  const [visibleKey, setVisibleKey] = useState(0);

  // Lista nueva: se guarda y se aplica en el siguiente avance. Si la lista
  // estaba vacía (pantalla en reposo) arranca de inmediato.
  useEffect(() => {
    listaRef.current = anuncios;
    if (!capas.length && anuncios.length) {
      indiceRef.current = 0;
      keyRef.current += 1;
      const k = keyRef.current;
       
      setCapas([{ key: k, anuncio: anuncios[0], entrando: false }]);
      setVisibleKey(k);
    }
    if (capas.length && !anuncios.length) {
      setCapas([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anuncios]);

  // Antes de cambiar, la info del anuncio visible sale (SALIDA_MS) con la foto
  // todavía detrás; después entra la capa nueva con el crossfade. `cambiando`
  // evita que un onFin/onError repetido dispare dos cambios.
  const cambiando = useRef(false);
  const estadoRef = useRef({ capas, visibleKey });
  useEffect(() => {
    estadoRef.current = { capas, visibleKey };
  }, [capas, visibleKey]);

  const cambiar = useCallback(() => {
    cambiando.current = false;
    if (antesDeAvanzar?.() === "recargar") {
      window.location.reload();
      return;
    }
    const lista = listaRef.current;
    if (!lista.length) {
      setCapas([]);
      return;
    }
    const { capas: actuales, visibleKey: vk } = estadoRef.current;
    const actual = actuales.find((c) => c.key === vk)?.anuncio;
    const idxActual = actual ? lista.findIndex((a) => a.id === actual.id) : -1;
    const siguiente = (idxActual >= 0 ? idxActual + 1 : indiceRef.current + 1) % lista.length;
    indiceRef.current = siguiente;
    keyRef.current += 1;
    const k = keyRef.current;
    setCapas((prev) => [...prev.filter((c) => c.key === vk), { key: k, anuncio: lista[siguiente], entrando: true }]);
    // Dos frames después, la capa nueva pasa a opacity 1 (transición CSS).
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setVisibleKey(k);
        setCapas((prev) => prev.map((c) => (c.key === k ? { ...c, entrando: false } : c)));
      }),
    );
    setTimeout(() => setCapas((prev) => prev.filter((c) => c.key === k)), CROSSFADE_MS + 50);
  }, [antesDeAvanzar]);

  const avanzar = useCallback(() => {
    if (cambiando.current) return;
    cambiando.current = true;
    const vk = estadoRef.current.visibleKey;
    setCapas((prev) => prev.map((c) => (c.key === vk ? { ...c, saliendo: true } : c)));
    setTimeout(cambiar, reduced ? 250 : SALIDA_MS);
  }, [cambiar, reduced]);

  // Precarga del siguiente medio.
  useEffect(() => {
    const lista = listaRef.current;
    if (!lista.length) return;
    const actual = capas.find((c) => c.key === visibleKey)?.anuncio;
    const idx = actual ? lista.findIndex((a) => a.id === actual.id) : -1;
    const sig = lista[(idx + 1) % lista.length];
    if (!sig || sig.id === actual?.id || !sig.fondo.url) return;
    if (sig.fondo.tipo === "imagen") {
      const img = new Image();
      img.src = sig.fondo.url;
    } else if (sig.fondo.poster) {
      // Del video solo se precarga el póster. Antes se creaba un <video>
      // suelto con preload="auto": en la pantalla de la tienda (Samsung
      // Tizen, un solo decodificador de video) ese elemento se quedaba con
      // el decodificador y el <video> real del anuncio nunca arrancaba.
      const p = new Image();
      p.src = sig.fondo.poster;
    }
  }, [capas, visibleKey]);

  if (!capas.length) return <Reposo />;

  return (
    <div className="absolute inset-0" style={{ width: LIENZO.ancho, height: LIENZO.alto }}>
      {/* `isolation` encierra los zIndex de las capas (crecen con cada anuncio)
          para que el logo fijo siempre quede encima. */}
      <div className="absolute inset-0" style={{ isolation: "isolate" }}>
        {capas.map((c) => (
          <div
            key={c.key}
            className="absolute inset-0"
            style={{ opacity: c.entrando ? 0 : 1, transition: `opacity ${reduced ? 150 : CROSSFADE_MS}ms ease-in-out`, zIndex: c.key }}
          >
            <AnuncioVista anuncio={c.anuncio} activo={c.key === visibleKey} saliendo={!!c.saliendo} onFin={avanzar} onError={avanzar} reduced={reduced} contexto={anuncios} />
          </div>
        ))}
      </div>
      <LogoFijo />
    </div>
  );
}

/** Sin anuncios publicados (o sin red y sin caché): fondo de marca, nada roto. */
function Reposo() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-verde)]" style={{ width: LIENZO.ancho, height: LIENZO.alto }}>
      <AnimatedLogo className="w-[520px] h-[520px]" mirada="aleatoria" />
    </div>
  );
}
