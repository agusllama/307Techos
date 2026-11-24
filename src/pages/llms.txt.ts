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
    '## Descripcion del Servicio',
    '',
    '307 Techos es un servicio especializado en reparacion y retapizado a domicilio de techos caidos (headliner) de Peugeot 307.',
    'Opera en Ciudad Autonoma de Buenos Aires (CABA), Gran Buenos Aires (Zona Norte, Zona Oeste, Zona Sur), Gran La Plata, Costa Atlantica e Interior de la Provincia de Buenos Aires.',
    'El tecnico especialista se desplaza a donde tengas el auto (en la calle, en el trabajo, cochera o estacionamiento). No se requiere trasladar el vehiculo a un taller.',
    '',
    '---',
    '',
    '## Matriz de Compatibilidad de Modelos',
    '',
    '| Variante | Carroceria | Complejidad | Observaciones |',
    '|---|---|---|---|',
    '| Peugeot 307 Hatchback 3 puertas | 3 puertas (Hatch) | Estandar | Acceso por puertas delanteras; opciones estandar y techo solar |',
    '| Peugeot 307 Hatchback 5 puertas | 5 puertas (Hatch) | Estandar | Acceso desde las cuatro puertas; opciones estandar y techo solar |',
    '',
    'Nota importante: No se realizan trabajos para Peugeot 307 Sedan (4 puertas) ni Peugeot 307 SW (familiar/rural con techo panoramico).',
    '',
    '---',
    '',
    '## Proceso Tecnico (4 pasos)',
    '',
    '1. **Desmontaje de accesorios y plafones**: Remocion de plafones, espejo retrovisor, parasoles y agarraderas con rotulado de piezas.',
    '2. **Remocion del residuo de espuma original**: Eliminacion con espatula y solvente desengrasante del residuo de gomaespuma pulverizada adherida al sustrato rigido.',
    '3. **Aplicacion de tela 100% fibra poliester con adhesivo de alta temperatura**: Adhesivo de contacto de grado automotriz para resistir la radiacion solar.',
    '4. **Reinstalacion y chequeo de fijaciones**: Reinstalacion de accesorios y verificacion del mecanismo en variantes con techo solar corredizo.',
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
    '## Informacion de Contacto',
    '',
    '- Servicio: Retapizado y reparacion de techo caido Peugeot 307 a domicilio',
    `- Sitio web: ${siteUrl}/`,
    `- WhatsApp: ${displayPhone} (https://wa.me/${whatsappNumber})`,
    '- Zona: CABA, Gran Buenos Aires (Norte, Oeste, Sur), Gran La Plata, Costa Atlantica e Interior de la Provincia de Buenos Aires',
    '- Horario: Lunes a sabado, 8:00 a 19:00 hs',
    '- Moneda: ARS (Pesos argentinos)',
    '- Metodos de pago: Efectivo, transferencia bancaria, Mercado Pago',
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
    '## Guias Tecnicas y Blog',
    '',
    `- Indice del blog: ${siteUrl}/blog/`,
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
    '**Cuanto tiempo demora el trabajo?**',
    'Menos de 2 horas (segun version con o sin techo solar). El vehiculo queda listo para usar en el dia.',
    '',
    '**El adhesivo resiste el calor del verano?**',
    'Si. Se formula para soportar las altas temperaturas del habitaculo bajo el sol.',
    '',
    '**Que espacio se necesita en el domicilio?**',
    'Espacio suficiente para abrir las puertas del vehiculo y acceder comodamente al interior. Se realiza donde tengas el auto: en la calle, en el trabajo, cochera o estacionamiento.',
    '',
    '**Se tapizan modelos Sedan o SW?**',
    'No. El servicio esta especializado exclusivamente en la variante Hatchback (3 y 5 puertas), tanto con techo estandar como con techo solar corredizo.',
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
