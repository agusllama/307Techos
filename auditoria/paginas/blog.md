# Auditoría de Página: /blog/

- **Slug**: `blog`
- **Archivo compilado**: `dist/blog/index.html`
- **Estado general**: ⚠️ Hallazgos identificados

## 1. Fase 2 — Textos y Copywriting

- **Title** (50 caracteres): "Guías y Soluciones: Techo Peugeot 307 | 307 Techos"
- **Meta Description** (143 caracteres): "Guías técnicas sobre techo caído Peugeot 307: diagnóstico, VTV y solución a domicilio en CABA, GBA, Costa Atlántica e Interior de Buenos Aires."
- **Voz / Tono**: Voseo rioplatense verificado y consistente.

- **Ortografía**: Sin faltas detectadas en el texto visible.

## 2. Fase 3 — Visual y Responsive (360px, 390px, 430px)

- **Scroll horizontal**: ✅ Ninguno (360px: OK, 390px: OK, 430px: OK)
- **Imágenes rotas**: ✅ 0 rotas
- **Capturas generadas**:
  - [360px](`../capturas/blog-360.png`)
  - [390px](`../capturas/blog-390.png`)
  - [430px](`../capturas/blog-430.png`)

### ⚠️ Áreas táctiles menores a 44x44px:
- Elemento `<a>`: "Inicio" (40×44px, href: `/`)

## 3. Fase 4 — SEO Técnico

- **H1** (1): "Guías y Preguntas: Techo Peugeot 307"
- **Canonical**: `https://307techos.com.ar/blog/` ✅
- **Robots**: `index, follow, max-image-preview:large`
- **Estructura de encabezados**:
  - `<h1>`: Guías y Preguntas: Techo Peugeot 307
  - `<h2>`: Artículos Técnicos Destacados
  - `<h3>`: ¿Rebotan la VTV por el techo caído del 307?
  - `<h3>`: Reparar el techo del Peugeot 307 en casa
  - `<h3>`: Techo solar del 307: tapizado y cuidados
  - `<h3>`: Por qué se cae el techo del Peugeot 307
  - `<h2>`: ¿La tela del techo de tu 307 ya empezó a colgar?

- **JSON-LD**: ✅ Válido (@graph unificado)

## 4. Fase 5 — Accesibilidad (axe-core WCAG 2.2 AA)

### ⚠️ Violaciones detectadas por axe-core:
- **[SERIOUS] label-content-name-mismatch**: Ensure that elements labelled through their content must have their visible text as part of their accessible name (1 nodo/s)
  - Ayuda: Elements must have their visible text as part of their accessible name ([Ref](https://dequeuniversity.com/rules/axe/4.14/label-content-name-mismatch?application=axeAPI))
- **[MODERATE] region**: Ensure all page content is contained by landmarks (1 nodo/s)
  - Ayuda: All page content should be contained by landmarks ([Ref](https://dequeuniversity.com/rules/axe/4.14/region?application=axeAPI))
