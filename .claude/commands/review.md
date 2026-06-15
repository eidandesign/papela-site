# /review

Auditoría completa del código antes de hacer checkpoint. Limpia, revisa seguridad, consistencia y vulnerabilidades. Al final reporta lo que se corrigió y lo que queda pendiente.

## Pasos

### 1. Código muerto y limpieza
- Variables, imports, funciones y estados que se declaran pero nunca se usan
- Comentarios redundantes que solo describen lo que ya dice el nombre
- `console.log` / `console.error` de debug que no son intencionales
- Tipos TypeScript con `any` donde se puede inferir o tipar correctamente
- Código comentado que ya no tiene propósito

### 2. Seguridad (OWASP Top 10 + Next.js específico)
- **Inyección**: queries a Supabase que concatenan strings en vez de usar parámetros
- **XSS**: uso de `dangerouslySetInnerHTML` sin sanitizar, o interpolación directa de input del usuario en el DOM
- **Autenticación**: rutas API que no validan `usuario_id` o que asumen que el usuario está autenticado sin comprobarlo
- **Exposición de datos**: keys, secrets o tokens hardcodeados en el código fuente
- **CSRF**: mutaciones que aceptan requests sin validar origen
- **Redirección abierta**: `router.push()` con URLs que vienen directo del usuario sin validar
- **Dependencias**: imports de módulos que no están en `package.json`
- **`eval()` o `Function()`**: uso de ejecución dinámica de código

### 3. Consistencia con el Design System (DESIGN-SYSTEM.md)
- Colores fuera de paleta: `blue-*`, `purple-*`, `indigo-*`, `orange-*` en CTAs o elementos de marca
- `window.alert()` o `window.confirm()` — siempre reemplazar con `useToast` + `<Toast>` y `<ModalPortal>`
- `<select>` sin `appearance-none` (la clase `.input` lo incluye, verificar que usen `.input`)
- Más de un botón `.btn-primary` en la misma pantalla/modal
- Modales que no usan `<ModalPortal>` (riesgo de stacking context con el navbar)
- `window.confirm()` para confirmaciones destructivas en vez de modal dedicado
- Asterisco de campo requerido fuera de `text-[var(--color-terra)]`

### 4. Correctness y edge cases
- Fetch calls sin manejo de error (`try/catch` o `.catch()`)
- Estados de carga (`loading`) que nunca se resetean a `false` en el path de error
- Efectos (`useEffect`) con dependencias faltantes que pueden causar stale closures
- Formularios que permiten submit con campos vacíos o inválidos sin feedback al usuario
- Mutaciones que no refrescan el estado local después de una operación exitosa
- Números parseados con `parseInt`/`parseFloat` sin validar que el input sea un número

### 5. Performance
- Fetches dentro de loops o renders (cada render dispara un nuevo request)
- `useEffect` que se dispara en cada render por dependencias que son objetos/arrays creados inline
- Imágenes sin `width`/`height` explícitos cuando no usan `fill` (causa layout shift)
- Listas largas sin key estable (usar `id` del registro, no el índice del array)

### 6. Accesibilidad básica
- Botones `<button>` sin `type="button"` dentro de un `<form>` (se interpretan como submit)
- Imágenes sin atributo `alt`
- Inputs sin `label` asociado o `aria-label`
- Elementos interactivos que no tienen estado focus visible

## Output esperado

Al terminar, generar un reporte con este formato:

```
## Reporte de revisión

### ✅ Corregido automáticamente
- [lista de lo que se arregló con archivo:línea]

### ⚠️ Requiere decisión tuya
- [cosas que se detectaron pero que no se deben cambiar sin confirmación]

### 🟢 Sin problemas encontrados en
- [áreas que se revisaron y están bien]
```

Si no hay nada que corregir en alguna categoría, decirlo explícitamente. No hacer cambios sin reportarlos.
