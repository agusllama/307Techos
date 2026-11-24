# Cobertura de Auditoría — 307 Techos

Este documento certifica la auditoría exhaustiva del **100% de las rutas** generadas en `dist/` (34 rutas regulares auditadas en profundidad y 28 redirecciones técnicas 301 verificadas).

Fecha de ejecución: 2026-11-24

## Resumen de Cobertura

- **Total de archivos HTML en dist/**: 62
- **Páginas regulares auditadas**: 34 (1 Home, 1 Error 404, 1 Blog Index, 4 Artículos de Blog, 27 Páginas de Zona)
- **Redirecciones 301 / Meta-refresh verificadas**: 28
- **Capturas visuales generadas (360px, 390px, 430px y 1280px)**: 103 capturas full-page en `/auditoria/capturas/`
- **Reportes individuales generados**: 34 archivos en `/auditoria/paginas/`

## Matriz de Cobertura por Ruta y Fases

| # | Ruta (`dist/`) | Tipo | Fase 0/1 (Integridad) | Fase 2 (Texto / Voseo / Tildes) | Fase 3 (Visual 360/390/430px) | Fase 4 (SEO Técnico / JSON-LD) | Fase 5 (Accesibilidad axe-core) | Detalle Individual |
|---|---|---|---|---|---|---|---|---|
| 1 | `/404.html` | Error 404 | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 2 violaciones | [Ver Reporte](paginas/404.md) |
| 2 | `/almirante-brown/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/almirante-brown.md) |
| 3 | `/avellaneda/` | Zona | ✅ OK | ⚠️ 6 tildes faltantes | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/avellaneda.md) |
| 4 | `/berazategui/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/berazategui.md) |
| 5 | `/blog/como-reparar-techo-peugeot-307-en-casa/` | Blog Post | ✅ OK | ✅ OK | ⚠️ 1 touch < 44px | ✅ 100% Válido | ⚠️ 4 violaciones | [Ver Reporte](paginas/blog__como-reparar-techo-peugeot-307-en-casa.md) |
| 6 | `/blog/` | Blog Index | ✅ OK | ✅ OK | ⚠️ 1 touch < 44px | ✅ 100% Válido | ⚠️ 2 violaciones | [Ver Reporte](paginas/blog.md) |
| 7 | `/blog/por-que-se-cae-techo-peugeot-307/` | Blog Post | ✅ OK | ✅ OK | ⚠️ 1 touch < 44px | ✅ 100% Válido | ⚠️ 4 violaciones | [Ver Reporte](paginas/blog__por-que-se-cae-techo-peugeot-307.md) |
| 8 | `/blog/techo-caido-peugeot-307-vtv/` | Blog Post | ✅ OK | ✅ OK | ⚠️ 1 touch < 44px | ✅ 100% Válido | ⚠️ 4 violaciones | [Ver Reporte](paginas/blog__techo-caido-peugeot-307-vtv.md) |
| 9 | `/blog/techo-solar-panoramico-peugeot-307-tapizado/` | Blog Post | ✅ OK | ✅ OK | ⚠️ 1 touch < 44px | ✅ 100% Válido | ⚠️ 4 violaciones | [Ver Reporte](paginas/blog__techo-solar-panoramico-peugeot-307-tapizado.md) |
| 10 | `/capital-federal/` | Zona | ✅ OK | ⚠️ 8 tildes faltantes | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/capital-federal.md) |
| 11 | `/esteban-echeverria/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/esteban-echeverria.md) |
| 12 | `/ezeiza-canning/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/ezeiza-canning.md) |
| 13 | `/florencio-varela/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/florencio-varela.md) |
| 14 | `/general-san-martin/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/general-san-martin.md) |
| 15 | `/` | Home | ✅ OK | ✅ OK | ⚠️ 3 touch < 44px | ✅ 100% Válido | ⚠️ 4 violaciones | [Ver Reporte](paginas/home.md) |
| 16 | `/interior-buenos-aires/` | Zona | ✅ OK | ⚠️ 1 tildes faltantes | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 4 violaciones | [Ver Reporte](paginas/interior-buenos-aires.md) |
| 17 | `/ituzaingo/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/ituzaingo.md) |
| 18 | `/la-matanza/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/la-matanza.md) |
| 19 | `/la-plata/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/la-plata.md) |
| 20 | `/lanus/` | Zona | ✅ OK | ⚠️ 1 tildes faltantes | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/lanus.md) |
| 21 | `/lomas-de-zamora/` | Zona | ✅ OK | ⚠️ 4 tildes faltantes | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/lomas-de-zamora.md) |
| 22 | `/mar-de-ajo/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/mar-de-ajo.md) |
| 23 | `/mar-del-plata/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/mar-del-plata.md) |
| 24 | `/moron/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/moron.md) |
| 25 | `/partido-de-la-costa/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/partido-de-la-costa.md) |
| 26 | `/pilar/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/pilar.md) |
| 27 | `/pinamar/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/pinamar.md) |
| 28 | `/quilmes/` | Zona | ✅ OK | ⚠️ 5 tildes faltantes | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/quilmes.md) |
| 29 | `/san-bernardo/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/san-bernardo.md) |
| 30 | `/san-isidro/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/san-isidro.md) |
| 31 | `/tigre/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/tigre.md) |
| 32 | `/tres-de-febrero/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/tres-de-febrero.md) |
| 33 | `/vicente-lopez/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/vicente-lopez.md) |
| 34 | `/villa-gesell/` | Zona | ✅ OK | ✅ OK | ✅ 0 scroll H | ✅ 100% Válido | ⚠️ 3 violaciones | [Ver Reporte](paginas/villa-gesell.md) |

## Redirecciones Legacy Verificadas (28 Rutas)

Todas las rutas bajo `/reparacion-techo-peugeot-307/*` fueron auditadas y confirmadas con redirección HTML meta-refresh a su correspondiente ruta plana moderna:

1. `/reparacion-techo-peugeot-307/` → `/#zonas`
2. 27 rutas de zona `/reparacion-techo-peugeot-307/[zona]/` → `/[zona]/` (cada una con canonical a la URL final y meta robots `noindex`).
