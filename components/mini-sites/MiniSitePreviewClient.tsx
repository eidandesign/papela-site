"use client";

import { useEffect, useState } from "react";
import MiniSiteRenderer from "./MiniSiteRenderer";
import { PREVIEW_ALLOWED_ORIGINS, PREVIEW_MSG_READY, PREVIEW_MSG_RENDER, type MiniSitePublic } from "@/lib/mini-sites";

// Escucha el borrador que manda el editor del admin y lo pinta con el
// MiniSiteRenderer real. Solo acepta mensajes del admin (y de localhost en dev).

function origenPermitido(origin: string): boolean {
  if (PREVIEW_ALLOWED_ORIGINS.includes(origin)) return true;
  return process.env.NODE_ENV === "development" && /^http:\/\/localhost(:\d+)?$/.test(origin);
}

function pareceMiniSite(v: unknown): v is MiniSitePublic {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return typeof s.id === "string" && typeof s.businessName === "string" && Array.isArray(s.blocks) && !!s.colors;
}

export default function MiniSitePreviewClient() {
  const [site, setSite] = useState<MiniSitePublic | null>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!origenPermitido(e.origin)) return;
      if (e.data?.type === PREVIEW_MSG_RENDER && pareceMiniSite(e.data.site)) setSite(e.data.site);
    }
    window.addEventListener("message", onMessage);
    // Avisar al editor que ya se puede mandar el borrador.
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: PREVIEW_MSG_READY }, "*");
    }
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[var(--color-muted)] px-6 text-center">
        Vista previa del Mini Site
      </div>
    );
  }
  return <MiniSiteRenderer site={site} mode="preview" />;
}
