# SECURITY_CHECKLIST — revisiones manuales por panel

Complemento de `docs/AUDITORIA-2026-10-16.md`. Lo que aquí aparece **no se puede verificar desde el código**: hay que entrar a cada panel. Marca la fecha de la última revisión en la columna final.

Periodicidad sugerida: **M** = mensual · **T** = trimestral · **D** = al hacer deploy / cambio relacionado.

## Vercel (team `noflagbrand`)

| Per. | Revisión | Ruta en el panel | Esperado | Última |
|---|---|---|---|---|
| M | Plan del team | Settings → Billing | Pro (Hobby no permite uso comercial ni Spend Management) | |
| M | Spend Management | Settings → Spend Management | Tope mensual con **"Pause production deployment"** ON; alertas 50/80/100 % al correo del dueño | |
| M | Firewall | `papela-site` → Firewall / `papela-admin` → Firewall | Bot Protection ON; reglas de rate limit en `/api/checkout`, `/api/tienda/checkout`, `/api/talleres/checkout`, `/api/personalizacion` (site) y `/api/public/*` (admin); ubicación del botón **Attack Challenge Mode** | |
| D | Variables de entorno | Proyecto → Settings → Environment Variables | Ninguna sensible con `NEXT_PUBLIC_`; todas tipo *Sensitive* (no *encrypted* legacy); `MERCADOPAGO_ACCESS_TOKEN` de **test** en Preview | |
| T | Dominios / HSTS | Proyecto → Settings → Domains | HSTS con includeSubDomains + preload en `papela-atelier.com` | |
| M | Errores y uso | Proyecto → Observability / Logs; team → Usage | Sin picos anómalos de invocaciones, errores 5xx ni egress | |
| D | Protección de previews | Proyecto → Settings → Deployment Protection | Previews protegidas (Vercel Authentication) | |

## Supabase (proyecto Papela `qrrqptkcgezposfmkvqy`)

| Per. | Revisión | Ruta en el panel | Esperado | Última |
|---|---|---|---|---|
| M | Plan y respaldos | Org → Billing; Proyecto → Database → Backups | Pro con respaldos diarios (PITR opcional). En Free: `pg_dump` manual semanal guardado fuera | |
| M | Spend cap | Org → Billing → Cost Control | Spend Cap **ON** (solo Pro) | |
| T | Advisors | Proyecto → Advisors → Security / Performance | 0 ERROR; revisar WARN de SECURITY DEFINER y search_path | |
| D | RLS | Database → Policies | RLS ON en todas las tablas; `anon` solo SELECT de catálogo (`productos`, `talleres`, `clases` columnas acotadas, `clases_horarios`) y 0 policies INSERT para `anon` salvo `personalizacion_solicitudes`; borrados y tablas sensibles (`cortes`, `club_stickers`, `club_sticker_drops`, `precios_config`) solo `is_admin()` | |
| D | Storage | Storage → Policies | Escritura/borrado solo authenticated (admin para delete); sin listado anónimo | |
| T | Auth | Authentication → Providers → Email; Settings | "Allow new users to sign up" **OFF**; Leaked password protection ON; MFA en la cuenta admin; revisar lista de usuarios (`profiles.rol`) y bloquear cuentas de empleados que ya no estén | |
| M | Uso | Proyecto → Reports / Settings → Usage | DB < 500 MB, Storage < 1 GB, Egress < 5 GB (límites Free) sin tendencia a superarlos | |
| T | Claves | Settings → API | Rotar service role si alguna vez salió del servidor; anon/publishable es pública por diseño | |

## MercadoPago (cuenta Papela, México)

| Per. | Revisión | Ruta en el panel | Esperado | Última |
|---|---|---|---|---|
| D | Webhook | Tus integraciones → app → Webhooks | URL `https://www.papela-atelier.com/api/webhooks/mercadopago`, evento `Pagos`, secreto = `MERCADOPAGO_WEBHOOK_SECRET` | |
| M | Notificaciones fallidas | Webhooks → Historial | Sin 409/500 repetidos (= pago aprobado sin reserva registrada → atender manualmente) | |
| T | Credenciales | Tus integraciones → Credenciales | Rotar access token de producción; test en dev/preview | |
| M | Contracargos y reembolsos | Actividad | Cruzar con cupos/stock (el sistema aún no los repone solo) | |

## Meta / WhatsApp Business (si se usa para recordatorios)

| Per. | Revisión | Ruta en el panel | Esperado | Última |
|---|---|---|---|---|
| M | Envíos | business.facebook.com → WhatsApp Manager → Insights | Volumen acorde a reservas reales; ningún día con picos | |
| M | Límite de gasto | Business Settings → Payments / WhatsApp → Configuración | Método de pago con tope; alertas | |
| D | Plantillas y opt-in | WhatsApp Manager → Plantillas | Solo plantillas aprobadas; evidencia de consentimiento por alumno (fecha, origen, texto); baja respetada | |
| M | Mensaje semanal (`/w`) | Donde se redacte | Incluye cómo darse de baja; lista de bajas aplicada | |

## Google / Meta analítica

| Per. | Revisión | Ruta | Esperado | Última |
|---|---|---|---|---|
| T | GA4 | Admin → Data settings | Retención y señales acordes al aviso de privacidad | |
| T | Pixel | Events Manager | Sin parámetros con PII | |

## Repos (automatizable en CI, ver plan Fase 2)

| Per. | Revisión | Comando | Esperado | Última |
|---|---|---|---|---|
| D | Dependencias | `npm audit --omit=dev --audit-level=high` en ambos repos | 0 críticas/altas | |
| D | Secretos | `gitleaks detect` / grep de `APP_USR-`, `eyJhbGciOi`, `sb_secret`, `sk-ant-`, `AIza` | 0 hallazgos; `.env*` ignorados | |
| D | Accesibilidad | axe sobre `/`, `/productos`, `/talleres`, `/clases`, `/tienda/checkout` del preview | 0 critical | |
| T | Legal | `app/privacidad/page.tsx`, formularios | Aviso enlazado en cada formulario; fecha de actualización; revisión de abogado tras cambios de flujo | |
