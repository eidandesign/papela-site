# Pantalla Samsung (Custom App)

La pantalla vertical de la tienda (Samsung Smart Signage, Tizen) usa una
**Custom App** que solo abre `https://papela-atelier.com/publicidad`.

- Paquete: `public/pantalla/PapelaSignage.wgt` (config.xml + index.html).
- `public/pantalla/sssp_config.xml`: `<size>` debe ser el tamaño EXACTO en
  bytes del .wgt. Si cambias el .wgt, actualiza `<size>` y sube `<ver>` para
  que la pantalla lo reinstale.
- En la pantalla: Home → App Management → URL `https://papela-atelier.com/pantalla/`.

El contenido se cambia desde el admin (Publicidad); no hace falta tocar el paquete.
