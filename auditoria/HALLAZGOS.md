# Registro Completo de Hallazgos — Auditoría 307 Techos

Este documento compila todos los hallazgos técnicos, visuales, de accesibilidad y de copywriting identificados durante la auditoría integral sobre el código fuente y el sitio estático compilado en \`dist/\`.

Los hallazgos se encuentran ordenados por **severidad decreciente** (Crítico → Alto → Medio → Bajo).

---

## 1. Hallazgos de Severidad ALTA

### HALLAZGO-01: Uso indebido de \`aria-label\` en elementos genéricos \`<div>\` (Violación ARIA 1.2 / axe-core \`aria-prohibited-attr\`)
- **Ruta(s) afectada(s)**: \`/\` (Home) y las 27 páginas de zona (\`/[zona]/\`).
- **Ubicación exacta**:
  - \`src/components/ReviewsMarquee.astro\`: líneas 119 (\`aria-label="Calificación 4.9 de 5"\`) y 137 (\`aria-label="X de 5 estrellas"\`).
  - \`src/pages/index.astro\`: líneas 241 y 245 (tabla comparativa).
  - \`src/pages/[zona].astro\`: líneas 427 y 431 (tabla comparativa).
- **Valor actual**:
  \`\`\`html
  <div aria-label="Calificación 4.9 de 5">
  <div aria-label="5 de 5 estrellas">
  <div aria-label="Comparativa técnica de soluciones para techo Peugeot 307">
  \`\`\`
- **Por qué es un problema**: Según la especificación W3C WAI-ARIA 1.2 y la regla \`aria-prohibited-attr\` de axe-core, los elementos sin rol semántico interactivo o de landmark (como \`<div>\` y \`<span>\`) tienen rol genérico y tienen prohibido el uso de \`aria-label\`. Los lectores de pantalla ignoran el nombre accesible o emiten errores de conformidad WCAG.
- **Corrección propuesta**:
  Asignar \`role="img"\` cuando represente un gráfico o calificación visual:
  \`\`\`html
  <div role="img" aria-label="Calificación 4.9 de 5">
  <div role="img" aria-label="5 de 5 estrellas">
  \`\`\`
  O utilizar texto legible para lectores con la clase utilitaria \`sr-only\`.

---

### HALLAZGO-02: Discordancia entre etiqueta accesible y texto visible en CTAs de WhatsApp (WCAG 2.5.3 Label in Name / axe-core \`label-content-name-mismatch\`)
- **Ruta(s) afectada(s)**: Las 34 rutas del sitio (\`/\`, \`/404.html\`, \`/blog/\`, \`/blog/*\`, \`/[zona]/\`).
- **Ubicación exacta**:
  - \`src/layouts/Layout.astro\`: líneas 247-251 (botón flotante sticky mobile).
  - \`src/pages/index.astro\`: línea 78 (botón principal hero).
  - \`src/pages/[zona].astro\`: líneas 263 y 629 (botones hero y cierre).
  - \`src/pages/404.astro\`: línea 81 (botón de rescate 404).
- **Valor actual**:
  El enlace contiene texto visible (*"Pedir presupuesto por WhatsApp — Envianos foto de tu techo"*), pero se le añade un atributo \`aria-label\` que difiere del texto presentado visualmente:
  \`\`\`html
  <a ... aria-label="Pedir presupuesto directo por WhatsApp">
  <!-- o en sticky bar: -->
  <a ... aria-label="COTIZAR POR WHATSAPP — MANDÁ FOTO DEL TECHO">
  \`\`\`
- **Por qué es un problema**: El criterio de conformidad WCAG 2.5.3 (Nivel A) exige que cuando un componente tiene texto visual, el nombre accesible debe incluir exactamente la cadena visual. Si un usuario que navega por voz (Dragon, Voice Access de Android, Apple Voice Control) dice *"Hacer clic en Pedir presupuesto por WhatsApp"*, el software falla porque el nombre accesible registrado es distinto.
- **Corrección propuesta**:
  Eliminar el atributo \`aria-label\` redundante, permitiendo que el árbol de accesibilidad derive naturalmente el nombre accesible desde el texto HTML interno visible del botón, o hacer que el \`aria-label\` contenga exactamente la cadena visible.

---

### HALLAZGO-03: Contraste de color insuficiente en enlace de zonas de la Home (WCAG 1.4.3 Contrast Minimum / axe-core \`color-contrast\`)
- **Ruta(s) afectada(s)**: \`/\` (Home)
- **Ubicación exacta**: \`src/pages/index.astro\` línea 708
- **Valor actual**:
  \`\`\`html
  <span class="text-xs font-bold uppercase tracking-tight text-[#25D366]">Coordinar servicio a domicilio</span>
  \`\`\`
  Renderizado sobre el fondo blanco (\`bg-[#FFFFFF]\`) de la tarjeta y sobre \`#F3F4F6\` en estado \`hover\`.
- **Por qué es un problema**:
  El color verde marca WhatsApp \`#25D366\` sobre fondo blanco \`#FFFFFF\` tiene un ratio de contraste de **1.98:1** (y **1.80:1** sobre \`#F3F4F6\`). El estándar WCAG 2.2 Nivel AA exige un mínimo estricto de **4.5:1** para texto normal y **3:1** para texto grande. Resulta de muy difícil lectura y no pasa la validación de contraste.
- **Corrección propuesta**:
  Reemplazar el color de texto por un tono verde de alto contraste compatible con accesibilidad (ej. \`text-[#15803d]\` o \`text-[#166534]\`, con ratio > 4.6:1), o colocar el texto oscuro sobre una píldora con fondo verde.

---

### HALLAZGO-04: Variable de entorno \`PUBLIC_INDEXABLE\` ausente en el código fuente
- **Ruta(s) afectada(s)**: Todas las páginas en entornos que no sean producción final.
- **Ubicación exacta**: \`src/components/SEOHead.astro\` líneas 46, 61, 375
- **Valor actual**:
  \`\`\`ts
  noindex = false,
  // ...
  <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
  \`\`\`
- **Por qué es un problema**:
  La regla de negocio y de infraestructura especifica que la variable \`PUBLIC_INDEXABLE\` debe controlar si el sitio es indexable (\`false = noindex; true = indexable\`). Al no estar implementada, cualquier build de staging, rama de desarrollo o preview desplegado en Vercel/Netlify emitirá \`index, follow\` a los robots de búsqueda, generando riesgo crítico de canibalización y contenido duplicado en Google.
- **Corrección propuesta**:
  En \`src/components/SEOHead.astro\`:
  \`\`\`ts
  const isIndexableEnv = import.meta.env.PUBLIC_INDEXABLE !== 'false';
  const shouldNoindex = noindex || !isIndexableEnv;
  \`\`\`
  Y utilizar \`shouldNoindex\` para determinar la meta etiqueta \`robots\` y cabeceras asociadas.

---

## 2. Hallazgos de Severidad MEDIA

### HALLAZGO-05: Errores ortográficos por omisión de tildes en landings de zona
- **Ruta(s) afectada(s)**: 6 páginas de zona (\`/avellaneda/\`, \`/capital-federal/\`, \`/lanus/\`, \`/lomas-de-zamora/\`, \`/quilmes/\`, \`/interior-buenos-aires/\`).
- **Ubicación exacta**: Cuerpo markdown en \`src/content/zonas/*.md\`.
  - \`avellaneda.md\`: \`cercania\` (l.3), \`vehiculos\` (l.3), \`estan\` (l.3), \`tecnico\` (l.3), \`Pueyrredon\` (l.19), \`Bartolome\` (l.19).
  - \`capital-federal.md\`: \`mayoria\` (l.3), \`vehiculos\` (l.3), \`exposicion\` (l.3), \`combinacion\` (l.3), \`intervencion\` (l.3), \`vehiculo\` (l.3), \`Nuñez\` (l.11), \`Cristobal\` (l.11).
  - \`lanus.md\`: \`Hipolito\` (l.19).
  - \`lomas-de-zamora.md\`: \`concentracion\` (l.3), \`vehiculos\` (l.3), \`tecnico\` (l.3), \`Hipolito\` (l.19).
  - \`quilmes.md\`: \`proporcion\` (l.3), \`vehiculos\` (l.3), \`contraccion\` (l.3), \`termica\` (l.3), \`metalica\` (l.3).
  - \`interior-buenos-aires.md\`: \`tecnico\` (l.11).
- **Por qué es un problema**: Descuido ortográfico en el contenido principal descriptivo de cada localidad, visible tanto para los clientes como para los algoritmos semánticos de Google.
- **Corrección propuesta**:
  Corregir cada término incorporando su tilde correspondiente: *cercanía, vehículos, están, técnico, Pueyrredón, Bartolomé, mayoría, exposición, combinación, intervención, vehículo, Núñez, Cristóbal, Hipólito, concentración, proporción, contracción, térmica, metálica*.

---

### HALLAZGO-06: Falta de signos de apertura y tildes en esquema JSON-LD
- **Ruta(s) afectada(s)**: Todas las páginas con marcado estructurado (\`SEOHead.astro\`).
- **Ubicación exacta**: \`src/components/SEOHead.astro\` líneas 131, 156, 168, 194-213, 226-271.
- **Valor actual**:
  - En \`FAQPage\`: \`Cuanto tiempo demora el trabajo?\`, \`Que espacio se necesita en el domicilio?\`, \`El servicio cuenta con garantia?\`, \`Puedo usar el auto inmediatamente despues?\`.
  - En respuestas: \`Si.\`, \`disenado\`, \`garantia\`.
  - En \`HowTo\`: \`remocion\`, \`aplicacion\`, \`poliester\`, \`reinstalacion\`, \`iluminacion\`, \`espatula\`.
  - En \`LocalBusiness\` y \`Service\`: \`reparacion\`, \`caidos\`, \`caido\`.
- **Por qué es un problema**: Google consume los campos \`name\` y \`acceptedAnswer.text\` de los bloques JSON-LD para renderizar respuestas enriquecidas (Rich Snippets) en las SERPs. Un marcado sin signos de apertura (*¿*) o sin acentuación adecuada degrada el CTR y la imagen de marca.
- **Corrección propuesta**:
  Actualizar las cadenas del objeto \`jsonLd\` en \`SEOHead.astro\` con correcta ortografía española (*¿Cuánto...?, ¿Qué...?, ¿El servicio cuenta con garantía?, ¿Puedo... después?, Sí, diseñado, garantía, remoción, aplicación, poliéster, reinstalación, iluminación, espátula, reparación, caído*).

---

### HALLAZGO-07: Barra flotante mobile fuera de landmarks semánticos (axe-core \`region\`)
- **Ruta(s) afectada(s)**: Todas las 34 rutas.
- **Ubicación exacta**: \`src/layouts/Layout.astro\` línea 242.
- **Valor actual**:
  \`\`\`html
  <div id="mobile-sticky-bar" class="md:hidden fixed inset-x-3 bottom-[...] ...">
  \`\`\`
- **Por qué es un problema**: La regla de accesibilidad \`region\` estipula que todo contenido interactivo visible en la página debe estar contenido dentro de un landmark semántico (\`header\`, \`main\`, \`footer\`, o \`aside\` con nombre accesible).
- **Corrección propuesta**:
  Cambiar la etiqueta contenedora a \`<aside id="mobile-sticky-bar" aria-label="Contacto flotante por WhatsApp" class="...">\`.

---

### HALLAZGO-08: Redirecciones legacy operando mediante meta-refresh HTML en lugar de cabeceras HTTP del servidor
- **Ruta(s) afectada(s)**: Las 28 rutas bajo \`/reparacion-techo-peugeot-307/*\`.
- **Ubicación exacta**: \`astro.config.mjs\` líneas 12-15.
- **Valor actual**: Archivos HTML con \`<meta http-equiv="refresh" content="0;url=...">\`.
- **Por qué es un problema**: Aunque Astro crea estas páginas de redirección automáticamente en builds estáticos, los motores de búsqueda prefieren una respuesta HTTP 301 a nivel de protocolo (ej. archivo \`_redirects\` en Cloudflare Pages / Netlify). El meta-refresh retorna status 200 temporalmente antes de redirigir, lo que puede demorar la transferencia de autoridad SEO.
- **Corrección propuesta**:
  Generar un archivo \`public/_redirects\` con las directivas HTTP 301 directas:
  \`\`\`
  /reparacion-techo-peugeot-307 /#zonas 301
  /reparacion-techo-peugeot-307/:zona /:zona 301
  \`\`\`

---

## 3. Hallazgos de Severidad BAJA

### HALLAZGO-09: Tildes omitidas en el bloque NAP del Footer
- **Ruta(s) afectada(s)**: Todas las 34 páginas.
- **Ubicación exacta**: \`src/layouts/Layout.astro\` líneas 152 y 174.
- **Valor actual**:
  - Línea 152: *"Retapizado y Reparacion de Techo Caido a Domicilio"*
  - Línea 174: *"Lunes a Sabado, 8:00 a 19:00 hs"*
- **Por qué es un problema**: Omisión de tildes en *"Reparación"*, *"Caído"* y *"Sábado"* en el pie de página visible en todo el sitio.
- **Corrección propuesta**:
  Corregir la tipografía a:
  - *"Retapizado y Reparación de Techo Caído a Domicilio"*
  - *"Lunes a Sábado, 8:00 a 19:00 hs"*

---

### HALLAZGO-10: Tamaño táctil marginalmente menor a 44px en enlaces de navegación secundaria
- **Ruta(s) afectada(s)**: \`/\`, \`/blog/\`, páginas del blog.
- **Ubicación exacta**:
  - \`src/layouts/Layout.astro\` línea 123 (enlace *"Blog"* en header móvil mide 40×44px de ancho).
  - \`src/pages/blog/index.astro\` (enlaces tipo tarjeta compacta con altura de 43px en resoluciones estrechas).
- **Por qué es un problema**: Las pautas de diseño táctil móvil recomiendan un mínimo de 44×44px de área de impacto táctil para evitar pulsaciones fallidas.
- **Corrección propuesta**:
  Agregar \`min-w-[44px]\` y asegurar \`min-h-[44px]\` en los enlaces de navegación del header y en las tarjetas secundarias del blog.
