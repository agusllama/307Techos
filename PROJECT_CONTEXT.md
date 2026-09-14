# PROJECT_CONTEXT.md

## 1. STACK Y CONFIGURACIÓN BASE (Literal)

### Dependencias (desde `package.json`)
```json
  "dependencies": {
    "@astrojs/sitemap": "^3.7.3",
    "astro": "^7.2.9"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "tailwindcss": "^4.3.3"
  }
```

### `src/config/site.ts`
```typescript
/**
 * src/config/site.ts
 * Fuente unica de verdad para constantes globales del sitio.
 * Todos los componentes que necesiten el telefono, dominio o nombre
 * del negocio DEBEN importar desde aqui. Nunca hardcodear.
 */

export const siteUrl = 'https://307techos.com.ar';

/** Numero en formato internacional E.164 sin el '+' (para wa.me y tel:) */
export const whatsappNumber = '5492212269244';

export const businessName = '307 Techos - Retapizado a Domicilio Peugeot 307';

/** ID de medicion de Google Analytics 4 */
export const gtagId = 'G-XXXXXXXXXX'; // [REEMPLAZAR con el ID real de GA4]
```

### `astro.config.mjs`
```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { siteUrl } from './src/config/site.ts';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  output: 'static',
  integrations: [
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

## 2. ÁRBOL REAL DE ARCHIVOS

### Estructura de `src/`
```text
C:\USERS\AGUSL\DESKTOP\DEV\307TECHOS\SRC
|   content.config.ts
+---components
|       SEOHead.astro
+---config
|       site.ts
+---content
|   \---zonas
|           avellaneda.md
|           capital-federal.md
|           lanus.md
|           lomas-de-zamora.md
|           quilmes.md
+---layouts
|       Layout.astro
+---lib
|       tracking.ts
+---pages
|   |   index.astro
|   |   llms.txt.ts
|   \---reparacion-techo-peugeot-307
|           [zona].astro
\---styles
        global.css
```

### Estructura de `public/`
```text
C:\USERS\AGUSL\DESKTOP\DEV\307TECHOS\PUBLIC
    favicon.ico
    favicon.svg
    robots.txt
```

## 3. FUENTE DE DATOS Y ESQUEMA (Literal)

### `src/content.config.ts`
```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const zonasCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/zonas' }),
  schema: z.object({
    nombreZona: z.string(),
    slug: z.string(),
    wikidataId: z.string(),
    tiempoLlegadaEstimado: z.string(),
    barriosCobertura: z.array(z.string()).min(5),
    viasAccesoPrincipales: z.array(z.string()),
    particularidadZona: z.string(),
    /**
     * Termino de busqueda objetivo para esta zona.
     * Evita que dos paginas compitan por la misma consulta.
     * Ej: "reparacion techo peugeot 307 quilmes"
     */
    keywordPrincipal: z.string().optional(),
    casoExitoLocal: z.object({
      modeloDetalle: z.string(),
      barrio: z.string(),
      problemaResuelto: z.string(),
      resultado: z.string(),
    }),
  }),
});

export const collections = {
  zonas: zonasCollection,
};
```

### Frontmatter de las zonas (`src/content/zonas/`)
| Zona | Slug | Wikidata ID | Keyword Principal | Barrios de Cobertura | Vías de Acceso Principales |
|---|---|---|---|---|---|
| Avellaneda | `avellaneda` | `Q1031013` | `reparacion techo caido peugeot 307 avellaneda` | Avellaneda Centro, Pineyro, Crucecita, Sarandi, Villa Dominico, Wilde, Gerli | Puente Pueyrredon, Av. Bartolome Mitre, Av. Belgrano, Autopista Buenos Aires - La Plata |
| Capital Federal | `capital-federal` | `Q1486` | `reparacion techo caido peugeot 307 capital federal` | Palermo, Villa del Parque, Caballito, Flores, Boedo, San Cristobal, Parque Chacabuco, Mataderos, Villa Luro | Autopista 25 de Mayo (AU1), Autopista Perito Moreno (AU6), Av. Rivadavia, Av. Juan B. Justo |
| Lanús | `lanus` | `Q869792` | `reparacion techo caido peugeot 307 lanus` | Lanus Oeste, Lanus Este, Remedios de Escalada, Gerli, Valentin Alsina, Monte Chingolo | Av. Hipolito Yrigoyen (Pavon), Av. 25 de Mayo, Puente Valentin Alsina, Av. Remedios de Escalada de San Martin |
| Lomas de Zamora | `lomas-de-zamora` | `Q924670` | `reparacion techo caido peugeot 307 lomas de zamora` | Lomas Centro, Banfield, Temperley, Turdera, Llavallol, Villa Centenario, San Jose | Av. Hipolito Yrigoyen, Av. Alsina, Camino Presidente Peron (Camino Negro), Av. Eva Peron (Pasco) |
| Quilmes | `quilmes` | `Q863777` | `reparacion techo caido peugeot 307 quilmes` | Quilmes Centro, Quilmes Oeste, Don Bosco, San Francisco Solano, Bernal, Bernal Oeste, Ezpeleta, Quilmes Este | Autopista Buenos Aires - La Plata (AU6), Av. Calchaqui, Autopista Presidente Peron (Camino del Buen Ayre), Ruta Provincial 53 |

## 4. COMPONENTES Y RUTAS GENERADAS

### Rutas estáticas generadas (`dist/`)
```text
C:\USERS\AGUSL\DESKTOP\DEV\307TECHOS\DIST
|   favicon.ico
|   favicon.svg
|   index.html
|   llms.txt
|   robots.txt
|   sitemap-0.xml
|   sitemap-index.xml
+---images
|       hero-techo-peugeot-307.webp
|       servicio-domicilio-paso1.webp
|       servicio-domicilio-paso2.webp
|       servicio-domicilio-paso3.webp
|       techo-antes-caido.webp
|       techo-despues-restaurado.webp
+---reparacion-techo-peugeot-307
|   +---avellaneda
|   |       index.html
|   +---capital-federal
|   |       index.html
|   +---lanus
|   |       index.html
|   +---lomas-de-zamora
|   |       index.html
|   \---quilmes
|           index.html
\---_astro
        Layout.CNKlQSq2.css
```

### Resumen descriptivo de Componentes y Rutas
- **`src/layouts/Layout.astro`**: Define la estructura base HTML de la aplicación, el header, el footer (NAP y enlaces semánticos) y maneja de manera dinámica la generación de enlaces hacia WhatsApp (`wa.me`).
- **`src/components/SEOHead.astro`**: Administra todas las etiquetas `<head>` SEO/GEO, unificando los metadatos globales de sitio con los específicos por página, integrando la etiqueta `gtag`, el JSON-LD en `@graph` y la URL absoluta para `og:image`.
- **`src/pages/index.astro`**: Genera la página de inicio en `dist/index.html`. Obtiene dinámicamente las zonas vía `getCollection('zonas')` para renderizar el listado y sus enlaces en la sección de cobertura.
- **`src/pages/llms.txt.ts`**: Endpoint de API (archivo `.ts` en rutas de Astro) que genera un archivo de texto plano (`dist/llms.txt`) para rastreadores de Inteligencia Artificial (AI crawlers).
- **`src/pages/reparacion-techo-peugeot-307/[zona].astro`**: Plantilla de ruta dinámica. Renderiza el contenido de cada archivo `.md` de `src/content/zonas/` generando una página individual (ej. `/reparacion-techo-peugeot-307/quilmes/index.html`). Omite renderizar la sección de "casos de éxito" si sus campos contienen datos de prueba (placeholder `[COMPLETAR]`).

### Tracking y enlaces de WhatsApp (`src/lib/tracking.ts`)
- **`src/lib/tracking.ts`**: Contiene la función que despacha el evento `whatsapp_click` a Google Tag Manager / Analytics mediante el uso del script asíncrono de `gtag.js`.
- **Enlaces de WhatsApp**: Se arman en la interfaz vinculando a la API de WhatsApp (`wa.me`) e incluyen un texto pre-generado de forma dinámica que se nutre del nombre de la zona, la variante y los datos ingresados para iniciar la conversión. Al hacer clic, estos enlaces gatillan el evento gestionado por `tracking.ts`.

## 5. DIRECTIVAS DEL SISTEMA

Ver `AGENTS.md` en la raíz del proyecto — es la única fuente de verdad para las reglas
de comportamiento del agente, escalamiento y arquitectura SEO/GEO/diseño. No se
transcribe acá para evitar que las dos copias diverjan con el tiempo, que es
exactamente lo que había pasado con la versión anterior de este archivo.
