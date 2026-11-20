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

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('Técnico Especialista 307 Techos'),
    category: z.string().default('Guía Técnica'),
    readTime: z.string().default('4 min de lectura'),
    image: z.string().optional(),
  }),
});

export const collections = {
  zonas: zonasCollection,
  blog: blogCollection,
};