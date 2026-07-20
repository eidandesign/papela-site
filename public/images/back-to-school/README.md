# Imágenes — Back to School

Assets extraídos del archivo de Figma (Website 2025, nodo 367-336) vía el MCP de Figma Dev Mode.
Son WebP (calidad 82) salvo `hero-ninos.png`, que se queda en PNG porque `opengraph-image.tsx`
lo embebe como data URI `image/png` para la preview del link.

| Archivo | Uso |
|---|---|
| `hero-ninos.png` | Hero — los dos niños (PNG con transparencia) |
| `paquete-basico.webp` | Tarjeta paquete Básico |
| `paquete-bts.webp` | Tarjeta paquete Back to School |
| `acabado-holografico.webp` | Acabado Holográfico |
| `acabado-vinil.webp` | Acabado Vinil contra agua |
| `acabado-arena.webp` | Acabado Arena |
| `acabado-estrellas.webp` | Acabado Estrellas |
| `acabado-corazon.webp` | Acabado Corazón |
| `acabado-lluvia.webp` | Acabado Lluvia holográfica |
| `planilla-lapices.webp` | Planilla lápices |
| `planilla-libros.webp` | Planilla libros y cuadernos |
| `planilla-minis.webp` | Planilla minis |
| `planilla-siluetas.webp` | Planilla grandes de siluetas |
| `planilla-circulares.webp` | Planilla circulares |
| `planilla-multiusos.webp` | Planilla multiusos |
| `planilla-dtf-agua.webp` | Planilla DTF contra agua |
| `planilla-dtf-textil.webp` | Planilla DTF textil |
| `bordado-nombre.webp` | Bordados — sudadera con nombre |
| `bordado-corazon.webp` | Bordados — prenda con corazón |
| `estilos.webp` | Sección "Diseños tan únicos" (collage de etiquetas) |
| `pizarron.webp` | Textura de pizarrón del hero — en escala de grises vía CSS (`grayscale`) + overlay soft-light sobre el verde base `#263834` del hero |
| `lista-utiles-ninos.webp` | Sección "Lista de útiles" — niños regresando a clases (generada con IA, no es foto del set de figuras) |

Para actualizar una imagen: reemplaza el archivo con el mismo nombre. La avioneta del hero es un
video de Cloudinary (ver `components/site/BackToSchoolPlane.tsx`), no un archivo local.
