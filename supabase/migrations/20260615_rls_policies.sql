-- ============================================================
-- PASO 0: AUDITORÍA — ejecutar primero para ver el estado actual
-- ============================================================
-- Qué tablas tienen RLS activado (relrowsecurity = true / false)
SELECT relname AS tabla, relrowsecurity AS rls_activo
FROM pg_class
WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
ORDER BY relname;

-- Qué políticas existen hoy
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


-- ============================================================
-- PASO 1: ACTIVAR RLS en todas las tablas públicas del sitio
-- ============================================================
ALTER TABLE public.productos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talleres        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clases          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clases_horarios ENABLE ROW LEVEL SECURITY;

-- Con RLS activo y SIN políticas, nadie puede leer ni escribir.
-- Las políticas de abajo abren solo lo necesario para el rol `anon`
-- (la anon key pública que usa el navegador y el servidor Next.js).


-- ============================================================
-- PASO 2: POLÍTICAS DE LECTURA PARA `anon`
-- Solo SELECT, solo registros activos/en stock.
-- No hay INSERT / UPDATE / DELETE para anon → escrituras bloqueadas.
-- ============================================================

-- productos: solo los que tienen stock > 0
CREATE POLICY "anon: leer productos en stock"
  ON public.productos
  FOR SELECT
  TO anon
  USING (stock > 0);

-- talleres: solo los marcados como activos
CREATE POLICY "anon: leer talleres activos"
  ON public.talleres
  FOR SELECT
  TO anon
  USING (activo = true);

-- clases: solo las marcadas como activas
CREATE POLICY "anon: leer clases activas"
  ON public.clases
  FOR SELECT
  TO anon
  USING (activa = true);

-- clases_horarios: solo los disponibles con cupo
CREATE POLICY "anon: leer horarios disponibles"
  ON public.clases_horarios
  FOR SELECT
  TO anon
  USING (estado = 'disponible' AND cupo_disponible > 0);


-- ============================================================
-- PASO 3: POLÍTICA PARA `authenticated` / `service_role`
-- El rol service_role omite RLS por defecto (es superuser de Supabase).
-- Si en el futuro agregas un usuario autenticado (admin panel), descomenta:
-- ============================================================
-- CREATE POLICY "authenticated: acceso total"
--   ON public.productos FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- (repetir para talleres, clases, clases_horarios)


-- ============================================================
-- PASO 4: VERIFICACIÓN FINAL — volver a auditar después de aplicar
-- ============================================================
SELECT relname AS tabla, relrowsecurity AS rls_activo
FROM pg_class
WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
ORDER BY relname;

SELECT tablename, policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
