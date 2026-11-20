/**
 * src/lib/tracking.ts
 * Funcion unica de despacho del evento whatsapp_click.
 * TODOS los botones de WhatsApp del sitio llaman a esta funcion.
 * Nunca duplicar la logica de evento inline en un componente.
 *
 * Uso:
 *   import { trackWhatsappClick } from '../lib/tracking';
 *   <a href={url} onclick={trackWhatsappClick('Quilmes', 'Hatchback')}>...</a>
 *
 * En Astro (SSG), este modulo se usa en scripts de isla o en event handlers
 * definidos con <script> en el componente. Para botones estaticos sin JS
 * de cliente, el evento se despacha mediante un handler inline minimo.
 */

declare global {
  function gtag(...args: unknown[]): void;
}

/**
 * Dispara el evento whatsapp_click antes de que el navegador siga el link.
 * @param zona - Nombre de la zona geografica de la pagina (ej. "Quilmes")
 * @param variante - Variante de carroceria seleccionada (ej. "Hatchback 3p", "Hatchback 5p", "general")
 */
export function trackWhatsappClick(zona: string, variante: string = 'general'): void {
  if (typeof gtag === 'function') {
    gtag('event', 'whatsapp_click', {
      zona,
      variante,
      event_category: 'conversion',
      event_label: zona + ' - ' + variante,
    });
  }
}

/**
 * Devuelve el atributo onclick serializado para usar en markup estatico de Astro.
 * Uso: <a onclick={waClickHandler('Quilmes', 'Hatchback')}>
 */
export function waClickHandler(zona: string, variante: string = 'general'): string {
  return (
    "if(typeof gtag==='function'){gtag('event','whatsapp_click',{zona:'" +
    zona.replace(/'/g, "\\'") +
    "',variante:'" +
    variante.replace(/'/g, "\\'") +
    "',event_category:'conversion'})}"
  );
}