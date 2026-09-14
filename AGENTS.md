# AGENTS.md — Reglas de arquitectura SEO/GEO y diseño
## Proyecto: Reparación de techos caídos Peugeot 307 (CABA / Zona Sur GBA)

## Contexto para el agente
Este es un sitio Astro (SSG) cuyo único objetivo de negocio es generar clics a WhatsApp
desde tráfico orgánico local. Casi todo ese tráfico va a entrar por celular — es un
servicio de urgencia que la gente busca desde la calle, el auto, o el living de su casa.
La arquitectura SEO/GEO, los Core Web Vitals y **el diseño mobile** descritos abajo son
el producto, no detalles de implementación. Un cambio que rompa cualquiera de los tres
silenciosamente (aunque el sitio "se vea bien" en desktop y compile) cuesta tráfico y
leads reales. El diseño no es la última capa que se agrega al final de una tarea: es
una prioridad de primer nivel en cada una, al mismo nivel que el rendimiento y el SEO —
un sitio técnicamente perfecto con una estética genérica convierte menos que uno bien
diseñado, y esta es una decisión comercial, no un detalle cosmético.

Antes de tocar cualquier archivo, releé este documento completo, no solo la sección que
creés relevante a tu tarea puntual.

## Diseño y mobile-first — no negociable
- Todo se diseña, se construye y se prueba primero en viewport mobile (375px de ancho).
  Desktop es una adaptación posterior, nunca el punto de partida.
- Las clases de Tailwind se escriben mobile-first en el sentido técnico, no solo
  conceptual: las clases sin prefijo son los valores para 375px, y cualquier ajuste
  para pantallas más grandes se agrega con `md:`/`lg:` encima — nunca al revés. Si
  estás por escribir un tamaño, spacing o altura pensando primero en cómo se ve en una
  pantalla grande, parás y lo escribís primero para mobile.
- Reportar "sin superposiciones" o "verificado en mobile" no alcanza. Antes de decir
  que algo está resuelto, comparás tu propia captura contra cada criterio pedido, uno
  por uno, explícitamente — no en general.
- Ningún elemento flotante o sticky (CTA, banners, headers) puede superponerse a texto
  principal (H1, subtítulos, precios, CTAs) en ningún punto del scroll — verificalo con
  scroll completo, no solo en el estado inicial de la página.
- Áreas táctiles de al menos 44x44px en cualquier botón o link interactivo.
- Prohibido explícitamente, salvo que el usuario lo pida a propósito:
  - Etiquetas "eyebrow" en mayúsculas arriba de un título.
  - Tarjetas genéricas con el mismo border-radius y la misma sombra gris suave en todo
    (el "kit SaaS").
  - Paletas default de diseño generado por IA (crema + terracota, casi-negro + un
    acento ácido único, azul marino corporativo genérico).
  - Chrome de plantilla que no aporta nada específico de este rubro: flechas "→" al
    final de botones, meta-strings unidos con puntos medios, labels tipo "PALABRA —
    fragmento".
- El diseño tiene que reflejar el rubro real: reparación automotriz a domicilio,
  confianza, evidencia visual concreta (fotos de antes/después, proceso real) — no una
  estética intercambiable con una landing de producto SaaS.
- El diseño se resuelve **dentro de** las reglas de rendimiento de la sección
  siguiente, nunca a costa de ellas. Una animación o efecto visual que obligue a romper
  la política de Core Web Vitals no es una opción — hay que lograr el mismo impacto
  visual sin violarla.
- Antes de dar por terminada cualquier tarea que toque el Hero, el layout o cualquier
  componente visual: mostrá una captura real en viewport mobile del resultado, con
  scroll completo, antes de decir que está listo.

## Nunca toques esto sin aprobación explícita del usuario
- La estructura del `@graph` en JSON-LD (LocalBusiness, Service, HowTo, FAQPage,
  BreadcrumbList) ni los `@id` que los conectan entre sí.
- Los slugs de las páginas de zona (`/reparacion-techo-peugeot-307/[zona]`). Cambiar un
  slug sin agregar un redirect 301 rompe el linking interno y borra indexación acumulada.
- Los campos del schema de Zod en la colección `zonas`. Agregar campos opcionales está
  bien; borrar o renombrar campos existentes rompe el contenido ya cargado.
- `robots.txt` y `llms.txt`: no los regeneres ni cambies los user-agents permitidos.
- Los valores dentro de `src/config/site.ts` (teléfono, dominio, nombre del negocio) —
  son la fuente única de verdad. Si un componente nuevo necesita el teléfono o el
  dominio, se importa de ahí. Nunca se vuelve a hardcodear.
- La integración `@astrojs/sitemap` en `astro.config.mjs` y la línea `Sitemap:` en
  `public/robots.txt` tienen que quedar sincronizadas entre sí.

## Rendimiento (Core Web Vitals) — no negociable
- La imagen del Hero mantiene `loading="eager"` + `fetchpriority="high"`. Ninguna otra
  imagen de la página lleva esos atributos.
- Toda imagen o ícono SVG declara `width`, `height` y `aspect-ratio`. Una imagen nueva
  sin esto no está terminada.
- Prohibido `client:load` en cualquier componente fuera del primer viewport. Para el
  resto: `client:visible` o `client:idle`.
- Google tag (gtag.js) cargado con `async` es la única excepción permitida a "cero
  scripts de terceros". No agregues otro script de terceros sin avisar primero.

## Contenido
- Cada página de zona necesita contenido propio y real, no el mismo párrafo con el
  nombre del barrio cambiado.
- No inventes `casoExitoLocal` con datos ficticios. En el frontmatter, un caso sin
  confirmar queda como `barrio: '[COMPLETAR]'` — pero ese corchete nunca llega al HTML
  renderizado ni al JSON-LD. Si no está confirmado, la sección de caso de éxito de esa
  zona se omite del render hasta tener el dato real.
- El mismo criterio aplica a cualquier dato operativo específico no confirmado
  (temperatura del adhesivo, tiempo de resolución, términos de garantía escrita): en el
  HTML visible y en el JSON-LD, un dato no confirmado se reemplaza por una redacción
  genérica pero real ("te confirmamos el tiempo exacto por WhatsApp"), nunca por el
  placeholder crudo. El texto literal `[COMPLETAR]` solo vive en frontmatter o
  comentarios de código, nunca en lo que efectivamente se renderiza.
- Las fotos de "antes y después" tienen que ser fotos reales de trabajos reales. Nunca
  generes ni uses una imagen sintética (IA) presentada como evidencia de un trabajo
  completado — es el mismo problema que fabricar `casoExitoLocal`, aplicado a una
  imagen. Si no hay fotos reales todavía, esa sección queda pendiente, no se rellena.
  Imágenes ilustrativas con fines informativos (ej. mostrar la diferencia entre techo
  panorámico y estándar, o una foto general de interior para el Hero) sí pueden ser
  generadas o de stock, siempre que no se presenten como el resultado de un trabajo
  específico realizado por el negocio.
- Un solo `<h1>` por página. `<h2>`/`<h3>` en orden jerárquico, sin saltar niveles.
- El primer párrafo debajo de cada `<h2>`/`<h3>` (40-55 palabras, responde la intención
  de búsqueda por sí solo) no se borra ni se resume al editar esa sección.

## Metadatos y conversión
- Las etiquetas Open Graph y Twitter Card en `SEOHead.astro` no se eliminan ni se dejan
  incompletas. `og:image` siempre es una URL absoluta (nunca relativa) de al menos
  1200x630px, o WhatsApp no arma la preview del link compartido.
- El evento `whatsapp_click` (despachado vía `src/lib/tracking.ts`) se dispara en todos
  los botones de contacto sin excepción. Un botón de WhatsApp nuevo llama a esa misma
  función — nunca una copia inline del evento.

## DOM y semántica
- Preferí elementos semánticos (`header`, `main`, `section`, `dl/dt/dd`,
  `details/summary`) antes que `div` + clases. Si vas a envolver algo en un `div` solo
  por estilo, primero evaluá si Tailwind lo resuelve sin el wrapper.
- Acordeones de FAQ: siempre `<details>/<summary>` nativo, nunca JS.
- No hay un número fijo de niveles de DOM permitido — la regla es "cero divs
  envolventes innecesarios", no una profundidad máxima. No sacrifiques la tabla
  comparativa, el breadcrumb o el acordeón para cumplir un número.

## Antes de dar por terminada cualquier tarea
1. `npm run build` sin errores ni warnings de la colección de contenido.
2. El JSON-LD sigue siendo un único `<script type="application/ld+json">` válido por
   página (verificalo en el validador de schema.org).
3. Los links de WhatsApp (`wa.me/...?text=...`) siguen generando el texto dinámico
   correcto con la zona y la variante de carrocería.
4. No se coló ningún `client:load` nuevo fuera del viewport inicial.
5. Si tocaste una página de zona: `barriosCobertura` sigue teniendo mínimo 5 elementos
   y el contenido no quedó duplicado con otra zona.
6. `og:image` resuelve a una URL absoluta válida (pegala directo en el navegador).
7. `sitemap-index.xml` se generó y `public/robots.txt` tiene la línea `Sitemap:`
   apuntando a él.
8. El evento `whatsapp_click` se dispara al hacer clic (confirmalo en consola).
9. Ningún `[COMPLETAR]` ni corchete de placeholder aparece en el HTML renderizado final
   ni en el JSON-LD — buscalo con grep sobre `dist/` antes de dar la tarea por cerrada.
10. Captura real en viewport mobile (375px), con scroll completo: ningún texto
    principal tapado, y el resultado no cae en ninguno de los patrones genéricos
    prohibidos en la sección de Diseño.

## Pedí confirmación antes de
- Cambiar cualquier slug o URL existente.
- Borrar o fusionar páginas de zona.
- Modificar valores en `src/config/site.ts`.
- Agregar un script o pixel de tracking nuevo, o reemplazar Google tag por otra
  herramienta.
- Cambiar el número de WhatsApp o el formato del link de conversión.
- Tocar `robots.txt` o `llms.txt`.

## Decisiones de producto (no reabrir sin pedir)
- No hay geolocalización por IP ni redirección automática por ubicación en ninguna
  página. La elección de zona es siempre manual, vía el selector al final de la home.
- El Hero de cada página y su CTA principal no comparten espacio con el selector de
  zonas ni con ningún otro elemento de decisión — se mantienen enfocados en una sola
  acción (WhatsApp).

## Sistema de diseño aprobado (no reabrir sin pedir)
- Concepto: "Taller Quirúrgico / Industrial Limpio" — técnico, práctico, sin estética
  SaaS/startup.
- Paleta (los únicos 5 colores del sitio):
  - Fondo base: `#F3F4F6`
  - Superficie/paneles: `#FFFFFF`
  - Texto principal: `#111827`
  - Secundario/técnico: `#4B5563`
  - Acción (único acento en todo el sitio, exclusivo de WhatsApp): `#25D366`
- Tipografía: `system-ui, sans-serif` en todo el sitio, sin webfonts. Títulos con
  `tracking-tighter font-black uppercase`. Escala mobile: H1 32px/1.1, H2 24px/1.2,
  H3 20px, body 16px/1.5, datos técnicos 14px.
- Cero drop-shadows (`shadow-lg`/`shadow-md`) — separación por línea de borde de 1px.
- Bordes rectos o `rounded-sm`, nunca `rounded-3xl` ni el kit de tarjeta SaaS.
- Fotos a sangre (100% del ancho del contenedor), tratadas como evidencia documental.
- El Hero es una imagen de fondo a pantalla completa (split antes/después) con H1,
  subtítulo y CTA superpuestos encima — no apilados arriba de la imagen. Lleva un
  scrim/gradiente oscuro funcional detrás del texto (excepción explícita a "sin
  gradientes mágicos": ese principio es contra decoración, este es para legibilidad).
  El CTA flotante persistente sigue sin poder superponerse a este bloque en ningún
  punto — confirmalo en mobile con el texto real en español antes de cerrar la tarea.
- El CTA flotante persiste (fixed, abajo) durante todo el scroll. El padding-bottom
  extra para que nunca tape contenido va solo en la última sección antes del footer,
  no en cada sección — no infles el scroll de todo el sitio por esto.
- La sección de comparación lleva las dos cosas: fotos de antes/después como evidencia
  visual, Y la tabla técnica `<table scope="col"/"row">` (Casera / Tradicional /
  Especializado) como pieza semántica separada — una no reemplaza a la otra.
