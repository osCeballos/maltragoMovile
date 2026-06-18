# Guía de Buenas Prácticas: Accesibilidad, Rendimiento (Lighthouse) y SEO
## Proyecto SPECIMEN (TokenCraft) — Vanilla JS & CSS con estética brutalista

Esta guía define los principios técnicos y las reglas concretas para construir una aplicación web que alcance la máxima puntuación en accesibilidad, rendimiento y visibilidad. Cada decisión de código, desde la estructura HTML hasta el último detalle CSS, debe estar alineada con estos criterios.

## 1. Semántica y Estructura HTML
Un esqueleto HTML lógico, sin sobrecarga de divs, es la base sobre la que se construye la accesibilidad, el SEO y la mantenibilidad. Los lectores de pantalla y los rastreadores dependen de él para interpretar la página.

### ✅ Qué hacer (Do's)
- **Usar HTML5 semántico y landmarks**: Todo el contenido debe residir dentro de zonas con significado.
  - `<header>` → cabecera y navegación principal.
  - `<nav>` → menús. Si hay más de uno, diferéncialos con `aria-label` (ej. `aria-label="Navegación principal"`).
  - `<main>` → contenido único de la página (solo uno).
  - `<aside>` → contenido complementario (sidebar de configuración, inspector).
  - `<footer>` → pie de página.
- **Jerarquía estricta de encabezados**: Un único `<h1>` por página. Los niveles inferiores (`h2`, `h3`…) deben ser secuenciales y nunca saltarse. Los encabezados forman la tabla de contenidos de una persona usuaria de lector de pantalla.
- **Enlace vs. botón nativo**:
  - Navegación a otra vista/recurso → `<a href="...">`.
  - Acción en la misma página → `<button type="button">` (sin `href`).
- **Enlace de salto al contenido**: Incluye un skip link visible al recibir el foco que permita omitir la navegación repetitiva y llegar directamente al `<main>`.
- **Texto alternativo para imágenes**: Toda imagen informativa debe tener `alt` descriptivo. Las imágenes decorativas deben llevar `alt=""` para que los lectores de pantalla las ignoren.

### ❌ Qué no hacer (Don'ts)
- **"Divitis"**: Evita `<div onclick="...">` como sustituto de un botón. Rompe el foco de teclado, el rol implícito y la activación con tecla.
- **Encabezados decorativos**: No elijas una etiqueta `h*` por su tamaño visual. Usa CSS para el estilo y mantén la semántica limpia.
- **Anidar elementos interactivos**: Nunca pongas un `<button>` dentro de un `<a>` o viceversa.

## 2. Accesibilidad (WCAG 2.1 / 2.2 y A11y)
El objetivo es que cualquier persona, independientemente de sus capacidades visuales, motoras o cognitivas, pueda operar la aplicación completamente con teclado o con tecnologías de asistencia.

### ✅ Qué hacer (Do's)
- **Contraste mínimo (Text y Non‑text)**:
  - Texto normal (< 18pt o < 14pt bold): relación 4.5:1 respecto al fondo.
  - Texto grande o íconos/bordes de input: 3:1.
  - En una estética brutalista, el alto contraste se logra con paletas extremas; verifica siempre con herramientas como el inspector de contraste de Chrome DevTools.
- **Navegación por teclado completa y sin trampas**:
  - Orden lógico de tab (coincidente con el orden visual).
  - Todos los controles deben ser activables con Enter y, para botones, también con Space.
  - Si una interacción abre algo (modal, menú), asegura que el foco se mueva dentro de ese nuevo contexto y que pueda cerrarse con Escape. Al cerrar, devuelve el foco al elemento que lo activó.
- **Indicador de foco visible y distintivo**:
  - Nunca elimines outline sin reemplazarlo. Usa `:focus-visible` para estilos como `outline: 3px solid #000; outline-offset: 2px;` (muy coherente con el brutalismo).
- **Formularios etiquetados siempre**:
```html
<label for="accent-color">Color de acento</label>
<input type="color" id="accent-color" name="accent-color">
```
  Si el label visible no es posible, usa `aria-label` o `aria-labelledby`. Para errores, asocia el mensaje con `aria-describedby`.
- **Actualizaciones dinámicas con aria-live**:
  - Si el contenido cambia sin recarga (ej. resultado de contraste, mensaje de copiado), usa regiones `aria-live="polite"` o `role="status"` para que el lector de pantalla anuncie el cambio sin interrumpir.
- **Respeto por las preferencias de movimiento**:
  - Añade `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }` para eliminar animaciones que puedan causar malestar.
- **Área interactiva suficiente**:
  - Botones y enlaces deben tener un tamaño mínimo de 44x44 px (WCAG 2.5.5) para facilitar el toque en pantallas táctiles, manteniendo una separación adecuada.

### ❌ Qué no hacer (Don'ts)
- Nunca confiar solo en el color para transmitir estado. Acompaña siempre con texto o iconos (ej. “Contraste insuficiente” + círculo rojo).
- No usar tabindex positivo (valores >0) porque rompe el orden natural de navegación. El foco se maneja con el DOM y, a lo sumo, `tabindex="0"` o `-1` para control scriptado.
- No dejar imágenes sin alt en contenido relevante. Las imágenes decorativas deben tener explícitamente `alt=""` (nunca omitir el atributo).

## 3. Rendimiento (Lighthouse y Core Web Vitals)
SPECIMEN usa JavaScript vanilla y CSS nativo. Esta ventaja permite puntuaciones de Lighthouse cercanas a 100 y métricas de campo excelentes. Cada milisegundo de bloqueo o desplazamiento inesperado penaliza la experiencia y el SEO.

### ✅ Qué hacer (Do's)
- **Optimiza el Critical Rendering Path**:
  - CSS crítico inline en `<head>` para el contenido above the fold. El resto de CSS se carga de forma asíncrona (ej. con `media="print" onload="this.media='all'"`).
  - Scripts con `defer` (si dependen del DOM) o `async` (si son independientes). La etiqueta `<script>` va en `<head>` o al final de `<body>` para no bloquear el parseo HTML.
- **Preconexión y preload de recursos críticos**:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="/fonts/tu-fuente.woff2" as="font" type="font/woff2" crossorigin>
```
  - Fuentes con `font-display: swap` (y opcional `optional`) para evitar FOIT (flash de texto invisible). Las fuentes personalizadas se cargan sin bloquear el texto de respaldo.
- **Imágenes modernas y dimensionadas**:
  - Formatos: WebP o AVIF con compresión adecuada.
  - Siempre especifica `width` y `height` (o `aspect-ratio` en CSS) para reservar el espacio y evitar CLS (Cumulative Layout Shift).
  - Aplica `loading="lazy"` en imágenes fuera de la vista inicial.
  - Usa `srcset` y `sizes` para servir resoluciones adecuadas a cada dispositivo.
- **Evita el trabajo innecesario en el hilo principal**:
  - Delegación de eventos en lugar de múltiples listeners.
  - Para tareas costosas (cálculo de contraste en tiempo real), utiliza `requestAnimationFrame` o `debounce`.
  - Minimiza el tamaño del DOM; no montes cientos de nodos innecesarios.
- **Caché eficiente**:
  - Configura cabeceras de cache (por ejemplo, con un archivo `.htaccess` o configuración del servidor) para activos estáticos con versionado en el nombre (`styles.v2.css`). Así se puede usar `Cache-Control: public, max-age=31536000, immutable`.

### ❌ Qué no hacer (Don'ts)
- No incrustar imágenes enormes sin optimizar. Una captura de 4000px no debe enviarse directamente al navegador.
- No importar librerías CSS/JS completas si solo necesitas una funcionalidad mínima. Prefiere implementaciones nativas.
- No forzar sincronía: evita `document.write()`, importaciones de script síncronas en el `<head>` y bucles que bloqueen la interfaz. Los eventos `scroll` y `resize` deben estar debounced.
- No cambiar el layout de forma asíncrona después de la carga sin reservar espacio (cuidado con banners de cookies, anuncios o inserción dinámica de componentes).

## 4. CSS y Diseño Responsivo (Mobile‑First)
La estética brutalista no está peleada con una base robusta de CSS. Un layout flexible, predecible y respetuoso con las preferencias del usuario es parte integral del rendimiento (CLS) y la accesibilidad.

### ✅ Qué hacer (Do's)
- **Diseño mobile‑first con media queries progresivas**:
  - Define los estilos base para pantallas pequeñas y añade complejidad con `min-width`. Así el dispositivo menos potente solo procesa lo necesario.
- **Unidades relativas y layouts flexibles**:
  - Usa `rem`/`em` para tipografía y espaciados, `%` o `fr` para grids, y evita píxeles fijos para contenedores principales. Así se adapta al zoom y a distintos tamaños de fuente.
- **Evita el layout shift**:
  - Asigna `aspect-ratio` o dimensiones explícitas a contenedores de medios, iframes y componentes que se carguen de forma diferida.
  - Las fuentes de respaldo deben ocupar un espacio similar; con `size-adjust` en `@font-face` puedes minimizar el salto.
- **Animaciones y transiciones bajo control**:
  - Prefiere animaciones con `opacity` y `transform`, que no disparan layout ni pintado.
  - Respeta `prefers-reduced-motion` (mencionado antes).
  - Usa `will-change` con moderación y solo cuando una animación vaya a ocurrir de forma inminente.
- **Modo oscuro y alto contraste**:
  - Aprovecha la consulta `prefers-color-scheme` y `prefers-contrast` para adaptar la interfaz sin necesidad de JavaScript extra. La brutalista puede ser monocromática, pero debe seguir siendo legible en cualquier modo.

### ❌ Qué no hacer (Don'ts)
- No usar `!important` como muleta; genera una cascada impredecible.
- No maquetar con posiciones absolutas como regla general; rompe el flujo natural y la accesibilidad cuando el contenido crece o se aplica zoom.
- No fijar alturas en contenedores de texto (puede cortar contenido al aumentar el tamaño de fuente). Usa `min-height` en su lugar.

## 5. SEO (Motores de Búsqueda y Compartición Social)
Para que SPECIMEN aparezca en resultados relevantes y se comparta de forma atractiva en LinkedIn, Twitter o Slack, el documento debe proporcionar metadatos completos y una estructura que los bots puedan procesar sin ejecutar JavaScript pesado.

### ✅ Qué hacer (Do's)
- **Metadatos esenciales en `<head>`**:
```html
<title>SPECIMEN | Generador de Design Tokens y Validador WCAG</title>
<meta name="description" content="Crea, valida y exporta tokens de diseño accesibles en tiempo real.">
<!-- Open Graph (LinkedIn, Facebook) -->
<meta property="og:title" content="SPECIMEN – Design Tokens y Contraste WCAG">
<meta property="og:description" content="Herramienta brutalista para diseñar con accesibilidad.">
<meta property="og:image" content="https://tusitio.com/img/og-specimen.png">
<meta property="og:url" content="https://tusitio.com/">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
```
- **Datos estructurados (Schema.org)**:
  - Añade JSON‑LD para definir la aplicación y sus funcionalidades:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SPECIMEN",
  "description": "Generador de tokens de diseño accesibles",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Web"
}
</script>
```
- **URL canónica y configuración de rastreo**:
```html
<link rel="canonical" href="https://tusitio.com/">
```
  - Acompaña con un `robots.txt` limpio y, si es necesario, un `sitemap.xml`.
- **Textos de enlace descriptivos**:
  - Nada de “Haz clic aquí”. Usa “Ver documentación de la API” o “Exportar tokens en JSON”.
- **Rendimiento como factor SEO**:
  - Google valora los Core Web Vitals. Todo lo cubierto en la sección de rendimiento impacta directamente en la posición en buscadores.

### ❌ Qué no hacer (Don'ts)
- No duplicar contenido entre distintas URLs. Si existen variantes (con parámetros, hash), gestiona la canónica y las redirecciones.
- No esconder texto relevante con `display: none` o posicionamiento fuera de pantalla sin una alternativa accesible, porque Google lo ignora o lo penaliza.
- No abusar del `noindex` en páginas que deberían ser descubiertas.

## Resumen de Reglas de Oro para SPECIMEN
| Área | Regla de oro | Impacto directo |
| --- | --- | --- |
| Semántica | Un `<main>` único, un `<h1>`, elementos nativos (`<button>`, `<a>`) y landmarks. | A11y y SEO |
| Accesibilidad | Foco visible, ratio ≥ 4.5:1, etiquetas `<label>`, soporte total de teclado y anuncio de cambios dinámicos. | Usabilidad universal |
| Rendimiento | CSS crítico inline, fuentes swap, imágenes dimensionadas (WebP), JS no bloqueante y cero frameworks. | Lighthouse 100 y CWV |
| CSS | Mobile‑first, unidades relativas, reserva de espacio (CLS) y respeto a `prefers-reduced-motion`. | Estabilidad visual e inclusión |
| SEO | Meta tags Open Graph, datos estructurados, enlaces descriptivos y canónica. | Visibilidad y compartición en redes |

## Checklist rápida de verificación
- [ ] El documento tiene un `<main>` y un único `<h1>`.
- [ ] Todos los controles funcionan con Tab, Enter, Space y Escape donde aplique.
- [ ] El foco es visible y nunca se elimina sin alternativa.
- [ ] Contraste de texto ≥ 4.5:1 (normal) y ≥ 3:1 (grande/iconos).
- [ ] Imágenes con `alt` (decorativas `alt=""`).
- [ ] Fuentes cargadas con `font-display: swap` y preload de WOFF2.
- [ ] Imágenes en WebP/AVIF, con `width`/`height` y `loading="lazy"`.
- [ ] CSS no bloqueante, scripts con `defer` o al final del body.
- [ ] Layout no salta al cargar (sin CLS).
- [ ] Animaciones se desactivan con `prefers-reduced-motion`.
- [ ] Metadatos OG, Twitter Card y datos estructurados presentes.
- [ ] URL canónica definida y sin contenido duplicado.