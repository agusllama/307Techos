# Plan de Corrección — Auditoría 307 Techos

Este plan establece la hoja de ruta para la **segunda pasada (fase de remediación)**.
Las tareas se encuentran organizadas en **4 categorías de trabajo independientes**, diseñadas para ejecutarse con **un commit por categoría**, validando compilación limpia (\`npm run build\`), tests unitarios (\`npm test\`), auditoría automatizada (\`npm run audit\`) y tests móviles Playwright (\`npm run test:mobile\`) tras cada una.

---

## Reglas de Trabajo para la Remediación
1. **Inmutabilidad de URLs**: Prohibido alterar slugs, nombres de carpetas o rutas canónicas existentes.
2. **Edición quirúrgica**: No reescribir componentes completos; aplicar diffs puntuales únicamente en las líneas marcadas como hallazgo.
3. **Verificación post-commit**: Cada categoría debe finalizar con build 100% limpio y 0 errores en los scripts de auditoría.

---

## Categoría 1: Accesibilidad y HTML Semántico (WCAG 2.2 AA)

### Objetivos
- Subsanar los 512 avisos de atributos ARIA prohibidos en elementos \`<div>\` genéricos.
- Corregir el criterio WCAG 2.5.3 (Label in Name) en todos los CTAs de WhatsApp.
- Subsanar el contraste visual de color insuficiente en el enlace de zonas de la Home.
- Enmarcar la barra flotante sticky dentro de un landmark semántico \`<aside>\`.

### Archivos a modificar
1. \`src/components/ReviewsMarquee.astro\`
   - Reemplazar \`<div aria-label="Calificación 4.9 de 5">\` por \`<div role="img" aria-label="Calificación 4.9 de 5">\`.
   - Reemplazar \`<div aria-label="X de 5 estrellas">\` por \`<div role="img" aria-label="X de 5 estrellas">\`.
2. \`src/pages/index.astro\`
   - En tabla comparativa (líneas 241, 245): agregar \`role="region"\` o \`role="img"\` al \`<div>\` con \`aria-label\`.
   - En enlace de zonas (línea 708): cambiar \`text-[#25D366]\` por \`text-[#15803d]\` (verde accesible con ratio 4.6:1 sobre blanco) o estructurar con píldora oscura.
   - En botón Hero WhatsApp: alinear o prescindir de \`aria-label\` redundante para cumplir con Label in Name.
3. \`src/pages/[zona].astro\`
   - En tabla comparativa (líneas 427, 431): agregar \`role="region"\` / \`role="img"\`.
   - En botones WhatsApp: retirar \`aria-label\` redundante.
4. \`src/layouts/Layout.astro\`
   - En botón flotante (líneas 243-261): cambiar contenedor a \`<aside id="mobile-sticky-bar" aria-label="Contacto flotante por WhatsApp" ...>\` y remover \`aria-label\` divergente en la etiqueta \`<a>\`.
5. \`src/pages/404.astro\`
   - Remover \`aria-label\` divergente en el CTA primario de WhatsApp.

### Nivel de Riesgo
**Bajo / Medio**: Solo modifica atributos HTML de accesibilidad y clases de color Tailwind sin alterar la lógica de negocio ni scripts.

---

## Categoría 2: SEO Técnico y Configuración de Infraestructura

### Objetivos
- Implementar el soporte para la variable de entorno \`PUBLIC_INDEXABLE\` para prevenir la indexación accidental de entornos preview/staging.
- Añadir archivo \`public/_redirects\` para soportar redirecciones HTTP 301 directas a nivel de servidor/edge.

### Archivos a modificar
1. \`src/components/SEOHead.astro\`
   - Leer \`import.meta.env.PUBLIC_INDEXABLE\`.
   - Si \`PUBLIC_INDEXABLE === 'false'\`, forzar \`noindex, nofollow\` en la etiqueta \`<meta name="robots">\`.
2. \`public/_redirects\` (Nuevo archivo)
   - Añadir directivas 301 estándar para los endpoints legacy:
     \`\`\`
     /reparacion-techo-peugeot-307 /#zonas 301
     /reparacion-techo-peugeot-307/:zona /:zona 301
     \`\`\`

### Nivel de Riesgo
**Bajo**: Protege entornos de despliegue sin alterar la indexación de producción.

---

## Categoría 3: Ortografía, Tildes y Marcado Estructurado

### Objetivos
- Restablecer las tildes faltantes en las landings de zona (\`src/content/zonas/*.md\`).
- Incorporar signos de apertura de interrogación (\`¿\`) y tildes en los esquemas JSON-LD (\`FAQPage\`, \`HowTo\`, \`LocalBusiness\`).
- Corregir las palabras del footer en \`src/layouts/Layout.astro\`.

### Archivos a modificar
1. \`src/content/zonas/avellaneda.md\`
   - Corregir: \`cercanía\`, \`vehículos\`, \`están\`, \`técnico\`, \`Pueyrredón\`, \`Bartolomé\`.
2. \`src/content/zonas/capital-federal.md\`
   - Corregir: \`mayoría\`, \`vehículos\`, \`exposición\`, \`combinación\`, \`intervención\`, \`vehículo\`, \`Núñez\`, \`Cristóbal\`.
3. \`src/content/zonas/lanus.md\`
   - Corregir: \`Hipólito\`.
4. \`src/content/zonas/lomas-de-zamora.md\`
   - Corregir: \`concentración\`, \`vehículos\`, \`técnico\`, \`Hipólito\`.
5. \`src/content/zonas/quilmes.md\`
   - Corregir: \`proporción\`, \`vehículos\`, \`contracción\`, \`térmica\`, \`metálica\`.
6. \`src/content/zonas/interior-buenos-aires.md\`
   - Corregir: \`técnico\`.
7. \`src/components/SEOHead.astro\`
   - FAQPage: Agregar \`¿\` y acentos en preguntas (*¿Cuánto tiempo demora el trabajo?*, *¿El adhesivo resiste el calor del verano?*, *¿Qué espacio se necesita en el domicilio?*, *¿El servicio cuenta con garantía?*, *¿Qué medios de pago aceptan?*, *¿Puedo usar el auto inmediatamente después?*).
   - Respuestas: Corregir *Sí*, *diseñado*, *garantía*.
   - HowTo: Corregir *remoción*, *aplicación*, *poliéster*, *reinstalación*, *iluminación*, *espátula*.
   - Service / LocalBusiness: Corregir *reparación*, *caído*, *caídos*.
8. \`src/layouts/Layout.astro\`
   - Corregir a: *"Retapizado y Reparación de Techo Caído a Domicilio"* (línea 152) y *"Lunes a Sábado, 8:00 a 19:00 hs"* (línea 174).

### Nivel de Riesgo
**Muy bajo**: Mejoras de redacción y ortografía estrictamente textuales.

---

## Categoría 4: Áreas Táctiles Móviles (Touch Target Sizing)

### Objetivos
- Garantizar que todos los elementos interactivos secundarios alcancen el estándar táctil mobile-first de 44×44px.

### Archivos a modificar
1. \`src/layouts/Layout.astro\`
   - Enlace *"Blog"* en header móvil: asegurar \`min-w-[44px]\` además de \`min-h-[44px]\`.
2. \`src/pages/blog/index.astro\`
   - Enlaces secundarios de artículos: ajustar padding a \`py-2.5\` y \`min-h-[44px]\`.

### Nivel de Riesgo
**Muy bajo**: Ajustes menores de espaciado táctil en viewport móvil.

---

## Protocolo de Cierre y Verificación
Tras completar las correcciones, se correrá la suite integral:
\`\`\`bash
npm run build        # Compilación SSG limpia de las 34 páginas
npm run audit        # Validación audit.cjs (0 errores, 0 warnings)
npm test             # Tests unitarios de reviews
npm run test:mobile  # Tests de Playwright a 375px (sin desborde, 1 H1, CTA flotante)
\`\`\`
