import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteUrl, whatsappNumber } from '../config/site';

const regiones = [
  {
    nombre: 'CABA y Zona Norte',
    slugs: ['capital-federal', 'vicente-lopez', 'san-isidro', 'general-san-martin', 'tigre', 'pilar'],
  },
  {
    nombre: 'Zona Oeste',
    slugs: ['la-matanza', 'moron', 'tres-de-febrero', 'ituzaingo'],
  },
  {
    nombre: 'Zona Sur y Gran La Plata',
    slugs: ['avellaneda', 'lanus', 'lomas-de-zamora', 'quilmes', 'berazategui', 'almirante-brown', 'esteban-echeverria', 'ezeiza-canning', 'florencio-varela', 'la-plata'],
  },
  {
    nombre: 'Costa Atlántica',
    slugs: ['partido-de-la-costa', 'san-bernardo', 'mar-de-ajo', 'pinamar', 'villa-gesell', 'mar-del-plata'],
  },
  {
    nombre: 'Interior de Buenos Aires',
    slugs: ['interior-buenos-aires'],
  },
];

export const GET: APIRoute = async () => {
  const zonas = await getCollection('zonas');
  const posts = await getCollection('blog');

  const displayPhone = whatsappNumber.replace(/^549(\d{3})(\d{3})(\d{4})$/, '+54 9 $1 $2-$3');

  const lines: string[] = [
    '# 307 Techos - Servicio Especializado en Peugeot 307',
    '',
    '## Descripción del Servicio',
    '',
    '307 Techos es un servicio especializado en reparación y retapizado a domicilio de techos caídos (headliner) de Peugeot 307.',
    'Opera en Ciudad Autónoma de Buenos Aires (CABA), Gran Buenos Aires (Zona Norte, Zona Oeste, Zona Sur), Gran La Plata, Costa Atlántica e Interior de la Provincia de Buenos Aires.',
    'El técnico especialista se desplaza a donde tengas el auto (en la calle, en el trabajo, cochera o estacionamiento). No se requiere trasladar el vehículo a un taller.',
    '',
    '---',
    '',
    '## Matriz de Compatibilidad de Modelos',
    '',
    '| Variante | Carrocería | Complejidad | Observaciones |',
    '|---|---|---|---|',
    '| Peugeot 307 Hatchback 3 puertas | 3 puertas (Hatch) | Estándar | Acceso por puertas delanteras; opciones estándar y techo solar |',
    '| Peugeot 307 Hatchback 5 puertas | 5 puertas (Hatch) | Estándar | Acceso desde las cuatro puertas; opciones estándar y techo solar |',
    '',
    'Nota importante: No se realizan trabajos para Peugeot 307 Sedán (4 puertas) ni Peugeot 307 SW (familiar/rural con techo panorámico).',
    '',
    '---',
    '',
    '## Proceso Técnico (4 pasos)',
    '',
    '1. **Desmontaje de accesorios y plafones**: Remoción de plafones, espejo retrovisor, parasoles y agarraderas con rotulado de piezas.',
    '2. **Remoción del residuo de espuma original**: Eliminación con espátula y solvente desengrasante del residuo de gomaespuma pulverizada adherida al sustrato rígido.',
    '3. **Aplicación de tela 100% fibra de poliéster con adhesivo de alta temperatura**: Adhesivo de contacto de grado automotriz para resistir la radiación solar.',
    '4. **Reinstalación y chequeo de fijaciones**: Reinstalación de accesorios y verificación del mecanismo en variantes con techo solar corredizo.',
    '',
    '---',
    '',
    '## Especificaciones del Material',
    '',
    '- Tipo de tela: 100% fibra de poliester automotriz (no foamizada, sin gomaespuma degradable)',
    '- Adhesivo: Contacto de alta temperatura especifico para tapiceria vehicular',
    '- Modalidad: Trabajo a domicilio o donde tengas el auto (calle, trabajo, cochera o estacionamiento)',
    '- Duracion del servicio: menos de 2 horas',
    '',
    '---',
    '',
    '## Cobertura Geografica',
    '',
    `Hub de zonas: ${siteUrl}/#zonas`,
    '',
  ];

  const slugsCubiertos = new Set<string>();
  for (const region of regiones) {
    lines.push(`### ${region.nombre}`, '');
    for (const slug of region.slugs) {
      const zona = zonas.find((z) => z.data.slug === slug);
      if (!zona) continue;
      slugsCubiertos.add(slug);
      const d = zona.data;
      lines.push(
        `#### ${d.nombreZona}`,
        `- Wikidata: https://www.wikidata.org/wiki/${d.wikidataId}`,
        `- Localidades incluidas: ${d.barriosCobertura.join(', ')}`,
        `- Tiempo de llegada: ${d.tiempoLlegadaEstimado}`,
        `- URL canonica: ${siteUrl}/${d.slug}/`,
        '',
      );
    }
  }

  // Red de seguridad: si se agrega una zona nueva sin actualizar las regiones,
  // igual queda listada en llms.txt.
  const zonasSinRegion = zonas.filter((z) => !slugsCubiertos.has(z.data.slug));
  if (zonasSinRegion.length > 0) {
    lines.push('### Otras zonas con cobertura', '');
    for (const zona of zonasSinRegion) {
      const d = zona.data;
      lines.push(
        `#### ${d.nombreZona}`,
        `- Wikidata: https://www.wikidata.org/wiki/${d.wikidataId}`,
        `- Localidades incluidas: ${d.barriosCobertura.join(', ')}`,
        `- URL canonica: ${siteUrl}/${d.slug}/`,
        '',
      );
    }
  }

  lines.push(
    '---',
    '',
    '## Información de Contacto',
    '',
    '- Servicio: Retapizado y reparación de techo caído Peugeot 307 a domicilio',
    `- Sitio web: ${siteUrl}/`,
    `- WhatsApp: ${displayPhone} (https://wa.me/${whatsappNumber})`,
    '- Zona: CABA, Gran Buenos Aires (Norte, Oeste, Sur), Gran La Plata, Costa Atlántica e Interior de la Provincia de Buenos Aires',
    '- Horario: Lunes a sábado, 8:00 a 19:00 hs',
    '- Moneda: ARS (Pesos argentinos)',
    '- Métodos de pago: Efectivo, transferencia bancaria, Mercado Pago',
    '',
    '---',
    '',
    '## Entidades en Wikidata',
    '',
    '- Peugeot 307: https://www.wikidata.org/wiki/Q215286',
  );

  for (const zona of zonas) {
    lines.push(`- ${zona.data.nombreZona}: https://www.wikidata.org/wiki/${zona.data.wikidataId}`);
  }

  lines.push(
    '',
    '---',
    '',
    '## Guías Técnicas y Blog',
    '',
    `- Índice del blog: ${siteUrl}/blog/`,
  );

  for (const post of posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())) {
    const postSlug = post.data.slug || post.id;
    lines.push(`- ${post.data.title}: ${siteUrl}/blog/${postSlug}/`);
  }

  lines.push(
    '',
    '---',
    '',
    '## Preguntas Frecuentes Principales',
    '',
    '**¿Cuánto tiempo demora el trabajo?**',
    'Menos de 2 horas (según versión con o sin techo solar). El vehículo queda listo para usar en el día.',
    '',
    '**¿El adhesivo resiste el calor del verano?**',
    'Sí. Se formula para soportar las altas temperaturas del habitáculo bajo el sol.',
    '',
    '**¿Qué espacio se necesita en el domicilio?**',
    'Espacio suficiente para abrir las puertas del vehículo y acceder cómodamente al interior. Se realiza donde tengas el auto: en la calle, en el trabajo, cochera o estacionamiento.',
    '',
    '**¿Se tapizan modelos Sedán o SW?**',
    'No. El servicio está especializado exclusivamente en la variante Hatchback (3 y 5 puertas), tanto con techo estándar como con techo solar corredizo.',
  );

  const content = lines.join('\n');

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
