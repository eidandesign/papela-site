import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { MINI_SITE_SLUG_RE, miniSiteTag } from "@/lib/mini-sites";
import { logger } from "@/lib/logger";

// Revalidación bajo demanda de un Mini Site (auditoría 2026-10-16, Fase 1 #12).
// /<slug> se sirve con ISR (60 s); el admin llama aquí al publicar, editar,
// renovar o borrar (lib/mini-sites/revalidar.ts) para que el cambio se vea al
// instante. Secreto compartido en MINI_SITES_REVALIDATE_SECRET.

export const dynamic = "force-dynamic";

function autorizado(req: NextRequest): boolean {
  const secret = process.env.MINI_SITES_REVALIDATE_SECRET;
  if (!secret) return false;
  const a = Buffer.from(req.headers.get("authorization") ?? "");
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!autorizado(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let slugs: unknown;
  try {
    slugs = (await req.json())?.slugs;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  if (!Array.isArray(slugs) || slugs.length === 0 || slugs.length > 20) {
    return NextResponse.json({ error: "slugs inválidos" }, { status: 400 });
  }

  const hechos: string[] = [];
  for (const s of slugs) {
    if (typeof s !== "string") continue;
    const slug = s.toLowerCase();
    if (!MINI_SITE_SLUG_RE.test(slug)) continue;
    revalidateTag(miniSiteTag(slug), "max");
    revalidatePath(`/${slug}`);
    hechos.push(slug);
  }
  logger.info("mini-sites: revalidados", { slugs: hechos });
  return NextResponse.json({ ok: true, revalidados: hechos });
}
