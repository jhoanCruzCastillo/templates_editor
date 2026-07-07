# Proyecta Fácil — template-editor

Panel de administración donde expertos convierten fichas técnicas oficiales de inversión pública (Invierte.pe, Perú) en plantillas digitales estructuradas, y cargan ejemplos resueltos que alimentan el contexto de una IA asistente. Este módulo NO es la experiencia del usuario final.

Leer `contexto template editor.md` para el modelo mental completo del dominio.

## Stack

- React 19 + TypeScript (Vite)
- Tailwind CSS v4 (configuración en `src/index.css` con `@theme`)
- Font Awesome (`@fortawesome/react-fontawesome`)
- Framer Motion (animaciones)
- React Router v7
- Persistencia: localStorage (claves `pf_sectores`, `pf_plantillas`, `pf_ejemplos`, `pf_actividad`)
- Sin backend. Backend futuro: CodeIgniter 4 + MySQL

## Comandos

```bash
npm install    # instalar dependencias
npm run dev    # servidor de desarrollo
npm run build  # build de producción (tsc + vite build)
```

## Modelo de dominio

```
Sector (1) ──< Plantilla (N) ──< Sección (N) ──< Subsección (N) ──< Campo (N)
                   │
                   └──< Ejemplo (N)   (valores que llenan la estructura)
```

Cada plantilla existe en 3 versiones: **Estructura** (molde vacío), **Ejemplos** (molde lleno con casos resueltos), **Proyecto** (deshabilitada en este módulo — es del usuario final).

### Tipos de campo soportados

`texto_corto`, `texto_largo`, `numero`, `fecha`, `catalogo_simple`, `catalogo_encadenado`, `seleccion`, `tabla`, `tabla_jerarquica`, `calculado`, `imagen`, `firma`.

Los campos tipo `tabla` y `tabla_jerarquica` tienen una propiedad `configTabla: ConfigTabla` con:
- `subtipo`: `filas_dinamicas` | `matriz_por_periodos` | `jerarquica`
- `columnas: ColumnaTabla[]` — cada columna tiene `tipo` (texto, numero, catalogo, catalogo_encadenado, fecha, calculado, auto_numerico) y opcionalmente `nivel` (padre/hijo para tablas jerárquicas)
- Encadenamiento entre columnas: `encadenaA` apunta al ID de la columna dependiente

Todas las interfaces están en `src/types/index.ts`. Léelo antes de crear o modificar entidades.

## Estructura de carpetas

```
src/
├── types/index.ts        ← Interfaces del dominio (LEER PRIMERO)
├── data/                 ← Datos mock (seed inicial para localStorage)
├── lib/
│   ├── store.ts          ← Lectura/escritura a localStorage + migración de esquema
│   ├── context.tsx        ← AppProvider: estado global + CRUD de todas las entidades
│   ├── hooks.ts          ← Hooks de lectura (useSectores, usePlantilla, etc.)
│   └── icons.ts          ← Mapeo centralizado de íconos FA por tipo de campo/columna/sector
├── components/           ← UI reutilizable sin lógica de dominio
│   ├── Sidebar.tsx
│   ├── Breadcrumbs.tsx
│   ├── VersionTabs.tsx
│   ├── ResizeHandle.tsx   ← Handle de arrastre para paneles resizables
│   ├── Toast.tsx          ← Sistema de notificaciones (ToastProvider + useToast)
│   ├── IconPicker.tsx     ← Selector de ícono para sectores
│   └── ColorPicker.tsx    ← Selector de color de acento
├── layouts/              ← MainLayout (sidebar + outlet)
├── routes/AppRouter.tsx  ← Todas las rutas
└── features/
    ├── dashboard/        ← Página de inicio
    ├── sectores/         ← Grid de sectores + NuevoSectorModal
    ├── plantillas/       ← Tabla de plantillas + NuevaPlantillaModal
    └── editor/           ← Editor de plantilla (vista, edición, ejemplos)
        ├── PlantillaViewPage.tsx     ← Modo lectura (2 paneles resizables)
        ├── PlantillaEditPage.tsx     ← Modo edición (3 paneles resizables)
        ├── EditorTopBar.tsx          ← Barra superior del editor
        ├── SectionIndex.tsx          ← Índice de secciones (scroll-spy)
        ├── SectionContent.tsx        ← Contenido de sección con campos
        ├── FieldCard.tsx             ← Tarjeta de campo con tipo, ejemplo, tabla inline
        ├── FieldPropertiesPanel.tsx  ← Panel derecho de propiedades del campo
        ├── TableColumnsEditor.tsx    ← Editor de config de tabla (subtipo + columnas)
        ├── TablePreview.tsx          ← Tabla interactiva para configurar columnas
        ├── ColumnDetailEditor.tsx    ← Detalle de una columna (tipo, catálogo, nivel)
        ├── ExampleSelector.tsx       ← Dropdown de ejemplo activo + búsqueda
        ├── NuevoEjemploModal.tsx     ← Modal para crear ejemplo nuevo
        ├── ExampleTableEditor.tsx    ← Editor de tabla para valores de ejemplo
        └── useScrollSpy.ts           ← Hook de IntersectionObserver bidireccional
```

## Rutas

| Ruta | Componente | Pantalla |
|---|---|---|
| `/` | DashboardPage | Inicio con métricas |
| `/sectores` | SectoresPage | Grid de sectores |
| `/sectores/:sectorId` | SectorDetallePage | Tabla de plantillas del sector |
| `/sectores/:sectorId/plantilla/:plantillaId` | PlantillaViewPage | Editor modo lectura |
| `/sectores/:sectorId/plantilla/:plantillaId/editar` | PlantillaEditPage | Editor modo edición (3 paneles) |

## Funcionalidades CRUD implementadas

### Sectores
- Crear sector (NuevoSectorModal): nombre, código auto-generado, ícono, color, tipo, estado
- Los sectores se listan como grid de tarjetas en `/sectores`

### Plantillas
- Crear plantilla (NuevaPlantillaModal): código, nombre, descripción → se crea con 0 secciones
- Duplicar plantilla (botón en tabla)
- Editar plantilla (editor de 3 paneles)
- Guardar persiste estructura + valores de ejemplo al localStorage

### Editor de estructura (tab Estructura)
- Agregar secciones (botón "+ Agregar sección" en el índice izquierdo)
- Agregar campos (botón "+ Agregar campo" por subsección, genera identificador automático)
- Editar propiedades del campo: identificador (editable), etiqueta, tipo, comportamiento, descripción, fuente catálogo
- Para campos tipo tabla: configurar subtipo, columnas con tipo inline, nivel padre/hijo

### Editor de ejemplos (tab Ejemplos)
- Crear ejemplo (NuevoEjemploModal): nombre, subtítulo, detalle
- Seleccionar ejemplo activo (ExampleSelector con búsqueda)
- Editar valores de ejemplo inline en cada campo
- **Campos tipo tabla**: editor de tabla completo inline (ExampleTableEditor)
  - Filas dinámicas: agregar/eliminar filas, inputs editables por celda
  - Jerárquica: navegación por selección de celda padre, botón "+" solo en la columna inmediata a la derecha
- Guardar persiste los valores del ejemplo activo

### Tabla jerárquica — interacción (IMPORTANTE)
- Solo la primera columna tiene botón "+ Item" debajo de la tabla (agrega grupo raíz)
- Al crear un grupo, se auto-crean celdas vacías en todas las columnas a la derecha (primer hijo por nivel)
- Al hacer **clic** en una celda → selecciona Y entra en modo edición directamente
- Al seleccionar una celda, aparece el botón "+" solo en la **columna inmediata a la derecha** (no en todas)
- Los items agregados pertenecen al padre seleccionado
- **Enter**: confirma edición, sale del input pero celda sigue seleccionada
- **Flechas**: navegan entre celdas (↑↓ hermanos, ←→ padre/hijo) — solo cuando no se está editando
- **Escape**: sale de edición o deselecciona
- Los datos se almacenan como árbol JSON en `Ejemplo.valores[identificador]`

## Reglas de código

### Arquitectura

- **Estructura por features.** Cada feature en su carpeta (`src/features/{nombre}/`). Componentes reutilizables sin lógica de dominio van en `src/components/`.
- **Componentes < 200 líneas.** Si un componente crece más, extraer subcomponentes.
- **Responsabilidad única.** Un componente = una cosa. No mezclar UI con lógica de datos.
- **Datos NUNCA hardcodeados en componentes.** Los componentes leen de hooks (`useSectores`, `usePlantilla`). Los hooks leen del contexto. El contexto lee/escribe a localStorage vía `src/lib/store.ts`.

### Capa de datos

- **`src/lib/context.tsx`** es la fuente de verdad. Todos los CRUD pasan por aquí (`addSector`, `updatePlantilla`, `addPlantilla`, `addEjemplo`, `updateEjemplo`, `duplicatePlantilla`, `pushActividad`, etc.).
- **`src/lib/hooks.ts`** son los puntos de lectura. Los componentes NUNCA importan `store.ts` directamente, excepto `generateId()`.
- **`src/lib/store.ts`** es la capa de persistencia. Hoy usa localStorage; para conectar la API REST de CodeIgniter solo se reemplaza este archivo.
- **Migración de esquema.** Si cambias la estructura de los datos mock, incrementa el número de versión en `store.ts` (`KEYS.initialized`) para forzar reinicialización del localStorage.

### Estilo visual

- **Verde primario:** `#16a34a` (definido como `--color-brand-600` en `@theme`).
- **Sidebar:** azul oscuro `#1e3a4f` (`--color-sidebar`).
- **Fondos:** gris claro `#f8fafc` (`--color-surface`), tarjetas blancas.
- Usar SOLO clases de Tailwind. Sin CSS suelto.
- Los colores de marca están centralizados en `src/index.css` bajo `@theme`. No repetir valores hex en componentes.

### Íconos

- Todos los íconos de Font Awesome se mapean en `src/lib/icons.ts`.
- `fieldTypeIcons` / `fieldTypeLabels` → íconos por tipo de campo.
- `columnTypeIcons` / `columnTypeLabels` → íconos por tipo de columna de tabla.
- `sectorIcons` → íconos por sector.
- `subtipoTablaLabels` → etiquetas de subtipos de tabla.
- NO esparcir imports de `@fortawesome/free-solid-svg-icons` en componentes si el ícono ya está mapeado. Importar desde `icons.ts`.

### Animaciones

- Framer Motion para transiciones de entrada, modales, cambios de tab.
- Duraciones cortas: `0.1s–0.15s` para elementos, `0.12s` para modales.
- Delays de escalonamiento: `0.03s–0.04s` entre items de lista.
- NO usar `backdrop-blur` en overlays de modales (causa lag).
- Botones y elementos interactivos: `transition-colors duration-75` o `duration-100`, NUNCA `transition-all`.

### Navegación

- Sidebar tiene solo 2 destinos: Inicio y Sectores. Todo lo demás se navega desde Sectores.
- El breadcrumb arranca en "Sectores" (sin "Inicio ›" delante).
- El item resaltado del sidebar siempre corresponde al primer eslabón del breadcrumb.

### Editor de plantilla

- Las secciones se renderizan en UNA sola página vertical scrolleable.
- **Scroll-spy bidireccional** (`useScrollSpy.ts`): clic en índice = scroll suave; scroll manual = resalta sección visible (IntersectionObserver).
- Los 3 paneles del editor (índice, campos, propiedades) son **resizables** con `ResizeHandle`. Mínimos: izquierdo 180px, derecho 300px. Default derecho: 420px.
- Cuando un campo es tipo `tabla` o `tabla_jerarquica`, el panel de propiedades muestra `TableColumnsEditor` con la tabla interactiva (`TablePreview`).

### Configuración de tablas (panel de propiedades)

- Las columnas se agregan desde un botón `+` al lado derecho de la tabla preview.
- Para agregar: clic en `+` → escribir nombre → Enter. Por defecto tipo texto.
- Para cambiar el tipo: clic en el label del tipo debajo del nombre de columna → dropdown inline con los 7 tipos.
- Para configurar detalle (fuente catálogo, encadenamiento, fórmula, nivel padre/hijo): hover → ícono engranaje → ColumnDetailEditor.
- En tablas jerárquicas, cada columna tiene `nivel: 'padre' | 'hijo'`. Columnas padre fusionan celdas por grupo (rowspan). Soporta N columnas padre + M columnas hijo en cualquier combinación.

### Valores de ejemplo en tablas (ExampleTableEditor)

- **Filas dinámicas**: tabla editable con inputs por celda, botón "+ Agregar fila", botón eliminar por fila.
- **Jerárquica**: interacción por selección de celda padre → "+" solo en columna inmediata derecha.
- Al crear grupo nuevo, se auto-crean celdas vacías en cascada hasta la última columna.
- Clic en celda = seleccionar + editar directamente. Enter confirma. Flechas navegan.
- Datos almacenados como JSON en `Ejemplo.valores[campo.identificador]`: array de `TreeNode` para jerárquica, array de objetos para filas dinámicas.

## Formato 6A de referencia

El archivo `docs/formato6a_directiva001_2019EF6301.xlsm` contiene el formato oficial del MEF. Sus 14 secciones son:

1. Datos Generales (UF, cadena funcional, nombre PI, brecha)
2. Diagnóstico del Área de Estudio (localización tablas, croquis)
3. Diagnóstico de la Unidad Productora (nombre, código, localización, diagnóstico)
4. Problema/Objetivo (causas/efectos jerárquicos, medios/acciones, fines, alternativas)
5. Horizonte de Evaluación (períodos por alternativa)
6. Brecha de Servicio (demanda/oferta/brecha — tablas por períodos)
7. Análisis Técnico (tamaño, localización, tecnología)
8. Costos del Proyecto (estructura jerárquica multinivel, cronograma, O&M)
9. Evaluación Social (indicadores por alternativa)
10. Sostenibilidad (capacidad institucional, riesgos)
11. Gestión del Proyecto (plan Gantt, modalidad, financiamiento)
12. Impacto Ambiental (matriz impactos/medidas/costos)
13. Conclusiones (texto libre)
14. Firmas (formulador, responsable UF)

## Qué NO hacer

- No agregar `backdrop-blur` en overlays modales.
- No usar `transition-all` en botones interactivos.
- No hardcodear datos en componentes — siempre usar hooks.
- No crear archivos de más de 200 líneas sin extraer subcomponentes.
- No importar íconos FA directamente en componentes si ya están en `icons.ts`.
- No agregar lógica de backend, autenticación, o llamadas HTTP (el backend es futuro).
- No usar `localStorage` directamente — usar `store.ts` o el contexto.
- No agregar `sessionStorage`, cookies, ni persistencia fuera de localStorage.
- No usar emojis en la UI salvo donde ya existan.
- No poner botones "+" en TODAS las columnas al seleccionar una celda jerárquica — solo en la columna inmediata a la derecha.
