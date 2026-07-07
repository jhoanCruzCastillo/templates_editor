# Proyecta Fácil — template-editor · Documento de contexto para el agente

> **Propósito de este documento.** Darte (agente de IA) el modelo mental completo del proyecto antes de construir el prototipo del frontend. Aquí está el qué, el porqué y las decisiones ya tomadas. Léelo entero antes de generar código. El "cómo construirlo" (stack, estructura de carpetas, requisitos de código) está al final.

---

## 1. Qué estamos construyendo

**Proyecta Fácil** es una plataforma que ayuda a profesionales peruanos (*formuladores*) a elaborar proyectos de inversión pública bajo el sistema **Invierte.pe** del Estado peruano. El producto final asistirá a usuarios con una IA que sugiere cómo llenar los formularios oficiales ("fichas técnicas").

**template-editor** es el módulo que tú vas a construir: el **panel de administración** donde expertos (perfil administrador) convierten esos formularios oficiales en plantillas digitales estructuradas, y cargan ejemplos resueltos que luego alimentarán a la IA.

Importante: **este módulo NO es la experiencia del usuario final.** Es la herramienta interna con la que los expertos preparan el conocimiento. El usuario final (que llena su propio proyecto con ayuda de IA) es otra fase, fuera de este prototipo.

- Nombre comercial: **Proyecta Fácil**
- Nombre técnico del módulo / repo: **template-editor**
- Stack backend (futuro, no es tu tarea ahora): CodeIgniter 4 + MySQL (BD `template_editor`)
- Stack frontend (tu tarea): React + Tailwind + Font Awesome + Framer Motion

---

## 2. Contexto del dominio (lo mínimo para que todo tenga sentido)

En Invierte.pe, para sustentar un proyecto de inversión pública se llena un **formato oficial** (una ficha técnica, archivo Excel del Ministerio de Economía y Finanzas, MEF).

- El formato base es la **Ficha Técnica General Simplificada**, código **6A**. Es la "ficha origen": todas las demás derivan de ella.
- Existe también la **6B** (Ficha para proyectos de baja y mediana complejidad), más extensa.
- Cada **sector** del Estado (Salud, Educación, Transportes, Saneamiento, etc.) puede tener sus propias fichas derivadas del 6A, pero alineadas a la metodología general del MEF.

No necesitas dominar la normativa. Solo necesitas saber que: hay **formatos** (plantillas que se llenan), agrupados por **sector**, y que cada formato se divide en **secciones**, y cada sección tiene **campos** de distintos tipos. El 6A tiene 14 secciones.

---

## 3. Conceptos arquitectónicos centrales (CRÍTICO)

Estos cuatro conceptos son el corazón del producto. Si los entiendes, entiendes el sistema.

### 3.1. Las tres versiones de cada plantilla

El mismo formato (ej. el 6A) existe en **tres versiones**, que comparten la misma estructura de secciones y campos pero cumplen roles distintos:

| Versión | Qué es | Cantidad |
|---|---|---|
| **Estructura** | El molde vacío: definición de secciones y campos, sin valores. | 1 por formato |
| **Ejemplo** | El mismo molde lleno con un caso resuelto de referencia. Alimenta el contexto de la IA. | N por formato (decenas/cientos) |
| **Proyecto** | El mismo molde llenado por el usuario final con SU caso real. Es lo que se exporta a Excel. | 1 por cada proyecto real |

En el editor, estas tres versiones se muestran como un **selector/pestañas** (Estructura | Ejemplos | Proyecto). En este prototipo, "Proyecto" se muestra **deshabilitada / solo lectura** (es del usuario final, no se edita aquí).

**Aclaración importante para textos de UI:** los ejemplos **alimentan el contexto** que se le pasa a la IA en el momento de la consulta; **NO reentrenan el modelo**. Debe haber un aviso visible que diga algo como "Estos ejemplos alimentan el contexto de la IA. No reentrenan el modelo."

### 3.2. Skills (.md) — la capa de metodología

Aparte de la estructura y los ejemplos, existe una capa de **conocimiento metodológico** (la guía general del MEF, parámetros, reglas por sector) que se guarda como archivos Markdown y se inyecta a la IA como contexto. Responden al "por qué se llena así". No forman parte de este prototipo de editor, pero tenlo presente como concepto del producto.

### 3.3. Catálogos — listas de valores precargadas

Algunos campos se llenan eligiendo de listas oficiales cerradas (ej. el "Clasificador de Responsabilidad Funcional", la lista de ubicaciones geográficas/UBIGEO, naturalezas de intervención). Estos **catálogos** se precargan una vez como datos maestros y se referencian desde cualquier campo que los use. En el editor, un campo puede ser de tipo "catálogo" y apuntar a una fuente de catálogo.

### 3.4. Exportación determinista (concepto futuro, no en este prototipo)

El entregable final que recibe la autoridad es el Excel oficial lleno. La IA llena los datos, pero **la exportación a Excel es determinista (sin IA)**: cada campo tiene un ID que mapea 1:1 a una celda del Excel. Esto no se construye en este prototipo, pero por eso cada campo lleva un `id` lógico estable: es la llave que une estructura, ejemplo, proyecto y celda.

---

## 4. Modelo de datos

Jerarquía de contención:

```
Sector (1) ──< Plantilla (N) ──< Sección (N) ──< Campo (N)
                   │
                   └──< Ejemplo (N)   (valores que llenan la estructura)
```

### Entidades

- **Sector**: agrupa plantillas por ámbito del Estado. Campos: `id`, `nombre`, `codigo_corto`, `icono`, `color_acento`, `descripcion`, `tipo` (Sectorial | General), `estado` (activo/inactivo). Los contadores (nº de plantillas, nº de ejemplos) son **calculados**, no almacenados.
- **Plantilla** (formato/ficha): `id`, `codigo` (6A, 6B, FS-1…), `nombre`, `descripcion`, `sector_id`, `deriva_de` (opcional, apunta a la plantilla base de la que deriva), fechas.
- **Sección**: `id`, `plantilla_id`, `numero`, `nombre`, `orden`.
- **Campo**: `id`, `seccion_id`, `id_logico` (ej. "1.01.1"), `etiqueta`, `tipo`, `editable` (bool), `descripcion`, `orden`, y un objeto **`config`** (JSON) para lo que varía según el tipo (columnas de una tabla, fuente de catálogo, niveles de cadena, fórmula, etc.).
- **Ejemplo**: `id`, `plantilla_id`, `nombre` (ej. "I.E. N° 50123 — Wanchaq, Cusco"), y un mapa `id_logico → valor` con los datos del caso resuelto.

### Decisión clave: el sector "General (MEF)"

El 6A y el 6B **no pertenecen a ningún sector específico** (son transversales del MEF). Para mantener el modelo limpio (**una plantilla siempre pertenece a exactamente un sector**, relación 1:N sin excepciones), se crea un sector especial llamado **"General (MEF)"** con `tipo = General`, donde viven el 6A y el 6B. Los demás sectores son `tipo = Sectorial`.

Regla confirmada: una plantilla NO pertenece a más de un sector. No hay fichas duplicadas entre sectores; sí comparten un esqueleto estructural común (todas derivan del 6A), lo que justifica el campo opcional `deriva_de`.

---

## 5. Tipos de campo (los widgets a soportar)

Cada campo tiene un `tipo` que define su widget e ícono. Soporta visualmente estos tipos:

| Tipo | Widget | Notas |
|---|---|---|
| `texto_corto` | input de una línea | |
| `texto_largo` | textarea | diagnósticos, descripciones |
| `numero` | input numérico | montos, cantidades |
| `fecha` | date picker | |
| `catalogo_simple` | desplegable | apunta a una `fuente_catalogo` |
| `catalogo_encadenado` | desplegables dependientes | ej. Función → División funcional → Grupo funcional → Sector responsable → Tipología. Cada nivel filtra al siguiente; algún nivel puede autocompletarse. |
| `seleccion_marcar` | radio / opción única | |
| `tabla` | grilla editable | tres subtipos (ver abajo) |
| `tabla_jerarquica` | grilla con filas padre e hijas indentadas | ej. Causa Directa → Causas Indirectas; Componente → Acción → Tarea |
| `calculado` | solo lectura, con candado y fondo gris | resultado de una fórmula; no editable |
| `imagen` | área de carga de imagen | ej. croquis del área de estudio |
| `firma` | nombre + cargo + colegiatura (texto) y espacio de rúbrica | la firma manuscrita se completa al imprimir |

**Subtipos de tabla:**
- `filas_dinamicas`: el usuario agrega/quita filas (ej. localizaciones, alternativas).
- `matriz_por_periodos`: columnas generadas según un rango de años (ej. demanda/oferta/brecha por año).
- `jerarquica`: filas padre con sub-filas anidadas.

Toda esta riqueza se guarda en la columna `config` del campo; por eso `config` es flexible (JSON).

---

## 6. Navegación y pantallas

### Sidebar (solo dos destinos de primer nivel)

```
Proyecta Fácil · Editor de plantillas
NAVEGACIÓN
  🏠 Inicio
  📚 Sectores
··· (espacio libre)
👤 Usuario · Administrador · 🔔
```

Plantillas, editor y ejemplos NO son items del sidebar: se alcanzan navegando hacia dentro desde Sectores.

### Regla de coherencia navegación (IMPORTANTE)

- El **sidebar** lista puntos de entrada (dónde empiezo).
- El **breadcrumb** traza la ruta de contenido (dónde estoy), y **arranca en "Sectores"**, sin "Inicio ›" delante.
- El item resaltado del sidebar es **siempre el primer eslabón del breadcrumb actual**.

| Pantalla | Sidebar resalta | Breadcrumb |
|---|---|---|
| Inicio (dashboard) | Inicio | (ninguno) |
| Sectores | Sectores | `Sectores` |
| Plantillas de un sector | Sectores | `Sectores › Educación` |
| Editor de plantilla | Sectores | `Sectores › Educación › 6A` |
| Editor, pestaña Ejemplos | Sectores | `Sectores › Educación › 6A › Ejemplos` |

### Pantallas a construir

1. **Login** — pantalla suelta, sin sidebar (mock).
2. **Inicio / Dashboard** — saludo, 3 tarjetas de métricas (sectores activos, plantillas creadas, ejemplos cargados), accesos directos y panel de actividad reciente.
3. **Sectores** — grid de tarjetas (ícono, color de acento, nº plantillas, nº ejemplos, botón "Ver plantillas") + botón "Nuevo sector".
4. **Modal "Nuevo sector"** — campos: Nombre*, Código corto (autogenerado del nombre, editable), Ícono* (galería), Color de acento* (paleta predefinida), Descripción (opcional), Tipo de sector (Sectorial | General), Estado (toggle, default activo). NO incluir contadores de plantillas/ejemplos (son calculados).
5. **Plantillas de un sector** — tabla: código, nombre+descripción, nº secciones, nº ejemplos, fecha actualizado, acciones (Ver / Editar / Duplicar) + botón "Nueva plantilla".
6. **Editor — modo lectura** — selector de versión (Estructura/Ejemplos/Proyecto) + badge "Solo lectura"; índice de secciones a la izquierda; contenido a la derecha; botón "Editar".
7. **Editor — modo edición** — tres paneles: índice de secciones (izquierda), lista de campos de la sección (centro), propiedades del campo seleccionado (derecha). Barra superior con selector de versión, "Vista previa" y "Guardar".
8. **Editor — versión Ejemplos** — igual que el editor, pero cada campo muestra su "valor de ejemplo"; arriba, selector de "Ejemplo activo" con buscador (dropdown), botón "Nuevo ejemplo", y banner aclarando que los ejemplos alimentan el contexto de la IA (no reentrenan).

### Comportamiento del editor: scroll-spy

Las 14 secciones se renderizan en **una sola página vertical scrolleable**. El índice de secciones de la izquierda funciona en **dos direcciones**:
- Clic en una sección → scroll suave hasta ella.
- Scroll manual → se resalta sola la sección visible (la que tenga su encabezado más cerca del tope del viewport). Usar `IntersectionObserver`.

El **panel de propiedades** (derecha, modo edición) es **sticky**: se mantiene visible al hacer scroll.

El **índice de secciones** idealmente muestra estado por sección (nº de campos, o check si tiene ejemplo cargado en modo Ejemplos).

---

## 7. Alcance del prototipo

### SÍ incluir
- Las 8 pantallas de arriba, navegables, con datos mock realistas del dominio.
- Las tres versiones (Estructura / Ejemplos / Proyecto-deshabilitada).
- Todos los tipos de campo representados visualmente.
- Scroll-spy bidireccional, panel sticky, breadcrumbs y sidebar coherentes.
- Sector "General (MEF)" como una tarjeta más en el grid.

### NO incluir (fuera de alcance)
- Lógica de backend real, autenticación real, persistencia.
- La conversión Excel → JSON (es backend).
- El exportador determinista a Excel.
- La IA asistente de llenado para el usuario final.
- La gestión real de los skills `.md`.
- `localStorage` / `sessionStorage` (usar estado en memoria de React).

---

## 8. Stack y requisitos de código

### Stack
- **React** (con Vite), preferir **TypeScript**.
- **Tailwind CSS** para todo el estilado (tema centralizado en `tailwind.config`).
- **Font Awesome** (`@fortawesome/react-fontawesome`) para iconografía.
- **Framer Motion** para animaciones (precargas, modales, transiciones de sección).
- **React Router** para navegación.

### Estilo visual (replicar de las imágenes de referencia adjuntas)
- Verde primario aprox. `#16a34a` (acciones primarias).
- Azul oscuro de marca en el sidebar.
- Fondos gris muy claro, tarjetas blancas con bordes suaves.
- Tipografía legible, jerarquía clara: sección > grupo > campo.

### Arquitectura de código (escalable y mantenible)
- **Estructura por features**: `src/features/{dashboard,sectores,plantillas,editor}/`, más `src/components/` (UI reutilizable), `src/layouts/`, `src/routes/`, `src/lib/`, `src/types/`, `src/data/` (mock).
- **Componentes pequeños, de responsabilidad única.** Extraer al menos: `Sidebar`, `Breadcrumbs`, `SectorCard`, `NuevoSectorModal`, `PlantillaTable`, `SectionIndex`, `FieldCard`, `FieldPropertiesPanel`, `VersionTabs`, `ExampleSelector`, `MetricCard`, `ActivityFeed`.
- **Datos mock centralizados** en `src/data/` como archivos tipados, NUNCA hardcodeados dentro de los componentes.
- **Tipos** del dominio en `src/types/`: `Sector`, `Plantilla`, `Seccion`, `Campo`, `Ejemplo`.
- **Capa de acceso a datos** (`src/lib/api.ts` o hooks `useSectores`, `usePlantilla`, …) que hoy devuelve los mocks pero está lista para apuntar a una API REST. Los componentes NO acceden a los datos directamente. → Esto permite que, al conectar el backend CodeIgniter, solo se reemplace esta capa sin tocar componentes.
- **Iconos por tipo de campo** mapeados en un único lugar (ej. objeto `fieldTypeIcons`).
- Comentarios en español donde la lógica no sea obvia (scroll-spy, autogeneración de código de sector).
- Prioriza **claridad y mantenibilidad** sobre soluciones ingeniosas.

### Entrega
Proyecto React completo y ejecutable (`npm install && npm run dev`), con un `README.md` que explique la estructura de carpetas y cómo se reemplazaría la capa mock por la API real.

---

## 9. Glosario rápido

- **Ficha técnica / formato**: formulario oficial que se llena para sustentar un proyecto de inversión.
- **6A**: Ficha Técnica General Simplificada. La plantilla base, 14 secciones.
- **6B**: Ficha para proyectos de baja y mediana complejidad.
- **Sector**: ámbito del Estado que agrupa plantillas (Salud, Educación…). El sector "General (MEF)" alberga el 6A y 6B.
- **Sección**: bloque de una ficha (ej. "Datos generales", "Problema y objetivo").
- **Campo**: dato individual a llenar, con un `id_logico` (1.01.1), un tipo y una config.
- **Estructura / Ejemplo / Proyecto**: las tres versiones de una misma plantilla.
- **Catálogo**: lista de valores oficiales precargada (ej. responsabilidad funcional, UBIGEO).
- **Formulador**: el profesional que elabora el proyecto (el usuario final del producto, no de este editor).
- **MEF**: Ministerio de Economía y Finanzas (ente rector de Invierte.pe).