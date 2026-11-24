# Resumen Ejecutivo de Auditoría — 307 Techos (307techos.com.ar)

**Rol del Auditor**: Senior QA, SEO Técnico, Accesibilidad y Copywriting (es-AR / Rioplatense).  
**Fecha de Ejecución**: 24 de Noviembre de 2026.  
**Alcance**: 100% de las rutas compiladas en \`dist/\` (34 páginas regulares + 28 redirecciones legacy 301).  
**Regla Principal Aplicada**: **SOLO AUDITORÍA**. Ningún archivo fuente del proyecto ha sido modificado. Toda la evidencia, capturas de pantalla, scripts de apoyo y reportes se encuentran confinados dentro del directorio \`/auditoria/\`.

---

## 1. Estado General del Proyecto

El sitio estático (Astro v7 + Tailwind v4 + SSG) presenta una **base técnica sólida y de alto rendimiento**, con una arquitectura mobile-first limpia, cero errores de compilación, 100% de enlaces internos y externos válidos, ausencia total de scroll horizontal en resoluciones estrechas (360px, 390px, 430px) y un comportamiento impecable de Core Web Vitals (CLS = 0, TBT = 0ms a 60ms, Performance Score mobile entre 83 y 99).

Sin embargo, la auditoría exhaustiva palabra por palabra y las pruebas automatizadas con herramientas especializadas (**axe-core**, **html-validate**, **cspell**, **Lighthouse** y **Playwright**) revelaron **10 hallazgos concretos** que requieren corrección:
- **Accesibilidad (WCAG 2.2 AA)**: 3 hallazgos relevantes (uso indebido de \`aria-label\` en elementos \`<div>\` genéricos en el componente de reseñas y tablas, discordancia entre el texto visible y el nombre accesible en botones de WhatsApp —criterio *Label in Name*—, y un ratio de contraste deficiente de 1.98:1 en el enlace de zonas de la Home).
- **SEO Técnico e Infraestructura**: 2 hallazgos (falta de implementación de la variable \`PUBLIC_INDEXABLE\` para prevenir indexación en entornos de staging/preview, y redirecciones legacy 301 operando solo por meta-refresh HTML en lugar de reglas de servidor/edge).
- **Ortografía y Copywriting**: 3 hallazgos (omisión de tildes en 6 landings de zona como *cercanía, vehículos, están, técnico, Pueyrredón, Bartolomé, mayoría, Núñez, Cristóbal, Hipólito, concentración, proporción, contracción, térmica, metálica*; omisión de signos de apertura \`¿\` y tildes en el esquema JSON-LD \`FAQPage\` y \`HowTo\`; y faltas en el bloque NAP del footer).
- **Diseño Táctil**: 1 micro-ajuste de área táctil menor a 44px en enlaces de navegación secundaria.
- **Datos de Negocio**: Discrepancia identificada en el cupo semanal de turnos (*"6 turnos por semana"* en Home vs *"2 turnos por semana"* en landings de zona).

---

## 2. Métricas Globales de Cobertura y Rendimiento

| Dimensión | Métrica Evaluada | Resultado | Estado |
|---|---|---|---|
| **Cobertura de Rutas** | Total de archivos HTML en \`dist/\` | **62 archivos** (34 regulares + 28 redirects) | ✅ 100% Cubierto |
| **Integridad de Enlaces** | Enlaces internos, externos y anclas | **825 enlaces verificados / 0 rotos** | ✅ Impecable |
| **Sitemap y Robots** | Sincronización sitemap-0.xml y robots.txt | **33 URLs indexables / 1 URL noindex (404)** | ✅ Sincronizado |
| **Voseo Rioplatense** | Coherencia en verbos y pronombres es-AR | **100% consistente** (*mandanos, escribinos, tenés, podés*) | ✅ Consistente |
| **Layout Móvil** | Desborde horizontal a 360px, 390px y 430px | **0px de scroll horizontal en las 34 rutas** | ✅ Perfecto |
| **Capturas Visuales** | Auditoría visual responsive multi-ancho | **103 capturas full-page generadas** en \`/auditoria/capturas/\` | ✅ Completo |
| **Estructura SEO** | Exactamente 1 H1 por página y jerarquía | **34/34 páginas conformes** (0 saltos de jerarquía) | ✅ Conforme |
| **Lighthouse Mobile** | Rendimiento en Home, Zonas y Blog | **Scores 83 - 99** (CLS = 0, TBT ≈ 0ms, LCP 1.6s - 4.3s) | ✅ Sobresaliente |

---

## 3. Distribución de Hallazgos por Severidad y Categoría

### Por Severidad
- **Crítico**: 0
- **Alto**: 4
- **Medio**: 4
- **Bajo**: 2
- **TOTAL**: **10 hallazgos**

### Por Categoría
- **Accesibilidad y HTML Semántico**: 4 hallazgos
- **SEO Técnico y Configuración**: 2 hallazgos
- **Ortografía y Marcado Estructurado**: 3 hallazgos
- **Diseño Táctil Móvil**: 1 hallazgo

---

## 4. Los 10 Hallazgos Más Importantes

1. **[ALTO] Atributo \`aria-label\` prohibido en elementos genéricos \`<div>\` (Violación ARIA 1.2 / axe-core \`aria-prohibited-attr\`)**
   - *Ubicación*: \`src/components/ReviewsMarquee.astro\` (líneas 119 y 137), \`src/pages/index.astro\` (línea 241), \`src/pages/[zona].astro\` (línea 427).
   - *Detalle*: Elementos \`<div aria-label="Calificación 4.9 de 5">\` y \`<div aria-label="X de 5 estrellas">\` violan la especificación WAI-ARIA 1.2 porque un \`<div>\` genérico no admite nombre accesible sin rol semántico.
   - *Solución*: Agregar \`role="img"\` a los contenedores o utilizar texto oculto para lectores de pantalla con \`sr-only\`.

2. **[ALTO] Discordancia entre etiqueta accesible y texto visible en botones de WhatsApp (WCAG 2.5.3 Label in Name)**
   - *Ubicación*: \`src/layouts/Layout.astro\` (línea 251), \`src/pages/index.astro\` (línea 78), \`src/pages/[zona].astro\` (línea 263).
   - *Detalle*: El botón muestra visiblemente *"Pedir presupuesto por WhatsApp — Envianos foto de tu techo"* pero tiene \`aria-label="Pedir presupuesto directo por WhatsApp"\`. Los usuarios de navegación por voz no pueden pulsar el botón al pronunciar el texto visible.
   - *Solución*: Remover el atributo \`aria-label\` redundante para que el nombre accesible se derive naturalmente del texto visible interior.

3. **[ALTO] Contraste de color deficiente en enlace de zonas de la Home (WCAG 1.4.3 Contrast Minimum)**
   - *Ubicación*: \`src/pages/index.astro\` (línea 708).
   - *Detalle*: El texto verde \`#25D366\` sobre fondo blanco \`#FFFFFF\` tiene un contraste de apenas **1.98:1** (y **1.80:1** en hover sobre \`#F3F4F6\`), violando el umbral mínimo WCAG AA de **4.5:1**.
   - *Solución*: Cambiar la clase de texto a un verde oscuro accesible de alto contraste (ej. \`text-[#15803d]\`, contraste > 4.6:1).

4. **[ALTO] Variable de entorno \`PUBLIC_INDEXABLE\` ausente en el código fuente**
   - *Ubicación*: \`src/components/SEOHead.astro\` (líneas 46, 61, 375).
   - *Detalle*: El proyecto no consulta \`import.meta.env.PUBLIC_INDEXABLE\`. Si se despliega en un entorno de staging/preview con \`PUBLIC_INDEXABLE=false\`, las páginas seguirán emitiendo \`index, follow\`, con riesgo de indexación no deseada y contenido duplicado.
   - *Solución*: Evaluar la variable en \`SEOHead.astro\` y emitir \`noindex, nofollow\` si es \`false\`.

5. **[MEDIO] Tildes omitidas en palabras clave de 6 páginas de zona**
   - *Ubicación*: \`src/content/zonas/*.md\` (\`avellaneda.md\`, \`capital-federal.md\`, \`lanus.md\`, \`lomas-de-zamora.md\`, \`quilmes.md\`, \`interior-buenos-aires.md\`).
   - *Detalle*: Se encontraron 19 ocurrencias de palabras sin tilde en el cuerpo markdown: *cercania, vehiculos, estan, tecnico, Pueyrredon, Bartolome, mayoria, exposicion, combinacion, intervencion, vehiculo, Nuñez, Cristobal, Hipolito, concentracion, proporcion, contraccion, termica, metalica*.
   - *Solución*: Restablecer las tildes ortográficas correspondientes.

6. **[MEDIO] Ausencia de signos de apertura (\`¿\`) y tildes en el marcado JSON-LD**
   - *Ubicación*: \`src/components/SEOHead.astro\` (líneas 226-271).
   - *Detalle*: En el esquema \`FAQPage\`, las preguntas carecen de signo \`¿\` (*Cuanto tiempo...?, Que espacio...?, El servicio cuenta con garantia...?, Puedo usar el auto inmediatamente despues...?*) y las respuestas usan *Si* en lugar de *Sí*.
   - *Solución*: Corregir la redacción en \`SEOHead.astro\` para asegurar Rich Snippets impecables en Google.

7. **[MEDIO] Barra flotante mobile fuera de regiones semánticas (axe-core \`region\`)**
   - *Ubicación*: \`src/layouts/Layout.astro\` (línea 242).
   - *Detalle*: El contenedor \`<div id="mobile-sticky-bar">\` está ubicado directamente en \`<body>\` fuera de cualquier landmark semántico.
   - *Solución*: Reemplazar por \`<aside id="mobile-sticky-bar" aria-label="Contacto flotante por WhatsApp" class="...">\`.

8. **[MEDIO] Redirecciones 301 solo por meta-refresh HTML en lugar de reglas de servidor**
   - *Ubicación*: \`astro.config.mjs\` (líneas 12-15) y \`public/\`.
   - *Detalle*: Las 28 rutas legacy emiten un HTML con meta refresh y status 200 temporal. Para hosting estático moderno (Cloudflare Pages, Vercel, Netlify) es recomendable acompañarlo con un archivo de reglas 301 nativo.
   - *Solución*: Crear el archivo \`public/_redirects\` con directivas 301.

9. **[BAJO] Omisión de tildes en el pie de página (NAP block)**
   - *Ubicación*: \`src/layouts/Layout.astro\` (líneas 152 y 174).
   - *Detalle*: Textos visibles en footer muestran *"Reparacion"*, *"Caido"* y *"Sabado"* sin acento.
   - *Solución*: Corregir a *"Reparación"*, *"Caído"* y *"Sábado"*.

10. **[BAJO] Áreas táctiles marginalmente menores a 44×44px en navegación secundaria**
    - *Ubicación*: \`src/layouts/Layout.astro\` (enlace *"Blog"* en header móvil mide 40×44px) y tarjetas secundarias en \`/blog/\`.
    - *Detalle*: El ancho o alto de ciertos elementos interactivos no alcanza el estándar de 44px por escasos píxeles.
    - *Solución*: Incorporar clases \`min-w-[44px]\` y \`min-h-[44px]\`.

---

## 5. Estado de las Entregas en \`/auditoria/\`

Todos los entregables solicitados se encuentran listos y disponibles:
1. `RESUMEN.md` (este documento).
2. `HALLAZGOS.md` (registro exhaustivo con severidad, ubicaciones exactas y soluciones).
3. `DATOS_A_CONFIRMAR.md` (análisis de cupos, horarios, garantía, precios y variables de entorno).
4. `cobertura.md` (matriz del 100% de las rutas auditadas con enlace a cada uno de los 34 reportes en `paginas/*.md`).
5. `PLAN_DE_CORRECCION.md` (plan de remediación ordenado en 4 categorías, 1 commit por categoría, con análisis de riesgo).
6. Carpeta `capturas/` con **103 capturas de pantalla full-page** (360px, 390px, 430px y 1280px).

---

## 6. Próximos Pasos

Esta pasada ha cumplido rigurosamente la regla de **SOLO AUDITORÍA**.  
**Quedo a la espera de tu aprobación formal del RESUMEN para proceder con la segunda pasada (Fase de Corrección por Categoría)**.
