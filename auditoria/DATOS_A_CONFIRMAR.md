# Datos Operativos y de Negocio a Confirmar — 307 Techos

Durante la auditoría exhaustiva del sitio web y del contenido generado en \`dist/\`, se relevaron los siguientes puntos de consistencia de datos, políticas de servicio y configuraciones técnicas que requieren confirmación o definición:

---

## 1. Cupos Semanales (Discrepancia entre Home y Zonas)
- **Home (\`src/pages/index.astro\` línea 341)**:
  > *"Cupos semanales limitados: solo 6 turnos por semana en toda la cobertura para asegurar terminación de fábrica."*
- **Páginas de Zona (\`src/pages/[zona].astro\` línea 536)**:
  > *"Solo tomamos 2 turnos por semana por zona para garantizar dedicación exclusiva y terminación OEM."*
- **Interior de Buenos Aires (\`src/content/zonas/interior-buenos-aires.md\`)**:
  > Menciona *"Giras programadas por corredores (RN 7, RN 8, RN 5, RN 205/3, RP 226, RP 2)"*, sin número fijo de turnos.
- **Pregunta para el negocio**:
  ¿Se desea armonizar el copy para aclarar que son *"2 turnos semanales por zona, con un cupo máximo de 6 turnos por semana en toda la cobertura"* para evitar aparente contradicción entre la página principal y las landings locales?

---

## 2. Horarios de Atención y Grafía
- **Valor actual en footer y JSON-LD**: *"Lunes a Sabado, 8:00 a 19:00 hs"*
- **Observación lingüística**: La palabra *"Sabado"* carece de tilde ortográfica en el componente \`src/layouts/Layout.astro\` (línea 174) y en \`src/components/SEOHead.astro\` (línea 140).
- **Pregunta para el negocio**:
  Confirmar si los días y horarios reales de atención operativa y respuesta por WhatsApp son efectivamente de **Lunes a Sábado de 08:00 a 19:00 hs**, para proceder con la corrección ortográfica (*"Lunes a Sábado"*).

---

## 3. Plazo de Ejecución del Servicio
- **Valor consistente en todas las páginas**: *"Menos de 2 horas"* (o *"en menos de dos horas"*).
- **En variantes con techo solar**: Se menciona *"menos de 2 horas (según versión con o sin techo solar)"*.
- **Estado**: Totalmente alineado en los 27 archivos `.md`, en la home, en los artículos del blog y en los esquemas JSON-LD \`HowTo\` y \`FAQPage\`.

---

## 4. Garantía Escrita
- **Valor consistente en todas las páginas**: *"Garantía escrita por 12 meses"* (1 año).
- **Observación**: En los testimonios iniciales (\`src/data/reviews.ts\`), una de las reseñas mock históricas menciona *"garantia escrita de tres meses"*.
- **Pregunta para el negocio**:
  ¿Se debe actualizar el texto de dicha reseña mock a *"12 meses"* para mantener una consistencia absoluta del 100% en todo el sitio, o se conserva como testimonio de trabajo previo?

---

## 5. Número de WhatsApp y Contacto Telefónico
- **Número internacional E.164**: \`5492212269244\`
- **Visualización en footer**: \`+54 9 221 226-9244\`
- **Llamadas telefónicas**: \`tel:+5492212269244\`
- **Estado**: 100% consistente en los enlaces \`wa.me\` de botones principales, tarjetas de zona, enlaces del footer, header, scripts de tracking y marcado estructurado \`LocalBusiness\`.

---

## 6. Precios y Formas de Pago
- **Política actual**: No se publican valores fijos en pesos (ARS) para evitar desactualización por inflación y variaciones según el estado de la tela o versión del techo. Se utiliza el CTA: *"Envianos foto de tu techo • Respuesta en 15 min"*.
- **Medios de pago declarados**: Efectivo y transferencia bancaria (abonando al finalizar el trabajo a entera conformidad). En JSON-LD \`LocalBusiness\` figura *"Cash, Transferencia bancaria, Mercado Pago"*.
- **Pregunta para el negocio**:
  ¿Se acepta efectivamente Mercado Pago además de efectivo y transferencia bancaria? De ser así, ¿conviene agregarlo explícitamente en la FAQ visible del sitio?

---

## 7. Variable de Entorno \`PUBLIC_INDEXABLE\`
- **Situación técnica actual**: La variable \`PUBLIC_INDEXABLE\` no está implementada en el código fuente.
- **Comportamiento requerido**: Si \`PUBLIC_INDEXABLE === 'false'\`, todas las páginas deben emitir \`<meta name="robots" content="noindex, nofollow">\` y el servidor debe responder con cabecera HTTP \`X-Robots-Tag: noindex, nofollow\` para proteger entornos de staging y preview contra indexación accidental en Google.
- **Acción recomendada**: Implementar el soporte de esta variable en \`SEOHead.astro\` y en un archivo de cabeceras (\`_headers\` o configuración de hosting).
