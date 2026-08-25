"use client";

// Formulario "Comparte tu creación" (pantalla final de Dopamina): foto +
// nombre + instagram + nota → POST /api/dopamina/comparte, que la guarda y la
// manda por email a Papela para compartirla en redes.
//
// La foto se comprime en el cliente (canvas → JPEG máx 1600px): una foto de
// celular pesa 3-10MB y el body de la function topa en 4.5MB; comprimida queda
// en ~200-600KB y así también viaja como adjunto del email.

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CameraIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { eventoDopa } from "@/lib/dopamina/analitica";

const LADO_MAX = 1600;
const CALIDAD = 0.85;

async function comprimeFoto(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("sin canvas 2d");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", CALIDAD));
    if (!blob) throw new Error("toBlob null");
    return blob;
  } catch {
    // Si el navegador no puede decodificar (formato raro), va el original;
    // el server valida tipo y tamaño de todos modos.
    return file;
  }
}

const inputCls =
  "w-full rounded-xl bg-white/10 border border-[rgba(255,255,255,0.35)] px-4 py-3 font-sans text-[14px] text-white placeholder:text-white/45 focus:outline-none focus:border-white transition-colors";

export default function ComparteCreacion({ reto }: { reto: string }) {
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [estado, setEstado] = useState<"idle" | "enviando" | "gracias" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const eligeFoto = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErrorMsg("Ese archivo no es una imagen");
      return;
    }
    setErrorMsg("");
    setFoto(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const envia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!foto || estado === "enviando") return;
    setEstado("enviando");
    setErrorMsg("");
    try {
      const formEl = e.currentTarget;
      const datos = new FormData(formEl);
      const comprimida = await comprimeFoto(foto);
      datos.set("foto", comprimida, "creacion.jpg");
      datos.set("reto", reto);
      const res = await fetch("/api/dopamina/comparte", { method: "POST", body: datos });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "No se pudo enviar");
      eventoDopa("comparte_enviada");
      setEstado("gracias");
    } catch (err) {
      eventoDopa("comparte_error");
      setErrorMsg(err instanceof Error ? err.message : "No se pudo enviar. Intenta de nuevo.");
      setEstado("error");
    }
  };

  if (estado === "gracias") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.3)] bg-white/5 px-6 py-8 text-center"
      >
        <p className="font-serif italic text-[1.5rem] text-white mb-2">¡Gracias!</p>
        <p className="font-sans text-[13px] leading-relaxed text-white/85">
          Recibimos tu creación. Si nos encanta (seguro que sí), la verás en
          nuestras redes 💌
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={envia} className="w-full max-w-sm flex flex-col gap-3 text-left">
      {/* Honeypot anti-spam: invisible para humanos */}
      <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {/* Foto */}
      <input
        ref={fileRef}
        type="file"
        name="foto"
        accept="image/*"
        className="hidden"
        onChange={(e) => eligeFoto(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={`relative w-full overflow-hidden rounded-xl border border-dashed transition-colors ${
          preview
            ? "border-[rgba(255,255,255,0.4)]"
            : "border-[rgba(255,255,255,0.55)] hover:border-white"
        }`}
      >
        {preview ? (
          <span className="block relative w-full aspect-[4/3]">
            <Image src={preview} alt="Tu creación" fill unoptimized className="object-cover" />
            <span className="absolute bottom-2 right-2 rounded-full bg-black/45 px-3 py-1.5 font-sans text-[11px] font-semibold text-white">
              Cambiar foto
            </span>
          </span>
        ) : (
          <span className="flex flex-col items-center gap-2 py-8 px-4">
            <CameraIcon className="w-7 h-7 text-white/80" aria-hidden="true" />
            <span className="font-sans text-[13px] font-medium text-white">
              Sube la foto de tu dibujo
            </span>
            <span className="font-sans text-[11px] text-white/60">
              JPG, PNG o la que tome tu cámara
            </span>
          </span>
        )}
      </button>

      <input type="text" name="nombre" required minLength={2} maxLength={80} placeholder="Tu nombre" className={inputCls} />
      <input type="text" name="instagram" maxLength={60} placeholder="Tu Instagram (opcional)" className={inputCls} />
      <textarea name="nota" maxLength={600} rows={2} placeholder="¿Algo que quieras contarnos? (opcional)" className={`${inputCls} resize-none`} />

      {errorMsg && (
        <p role="alert" className="font-sans text-[12px] text-[#F0D9CC]">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!foto || estado === "enviando"}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-[var(--color-verde)] font-sans text-[14px] font-semibold px-7 py-3 hover:opacity-90 transition-opacity disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        {estado === "enviando" ? "Enviando…" : "Enviar mi creación"}
        {estado !== "enviando" && <PaperAirplaneIcon className="w-4 h-4" aria-hidden="true" />}
      </button>
      <p className="font-sans text-[11px] leading-relaxed text-white/55 text-center">
        Al enviar aceptas que compartamos tu creación en las redes de Papela,
        con crédito a tu nombre o Instagram.
      </p>
    </form>
  );
}
