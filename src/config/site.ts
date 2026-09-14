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