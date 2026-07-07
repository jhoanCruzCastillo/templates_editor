# Proyecta Fácil — Editor de plantillas

Panel de administración para gestionar sectores, plantillas de fichas técnicas y ejemplos que alimentan el asistente de formulación de proyectos de inversión pública.

## Inicio rápido

```bash
npm install
npm run dev
```

## Stack

- **React 19** + TypeScript (Vite)
- **Tailwind CSS v4** — estilado completo sin CSS suelto
- **Font Awesome** (`@fortawesome/react-fontawesome`) — iconografía
- **Framer Motion** — animaciones de entrada, modales y transiciones
- **React Router v7** — navegación SPA

## Estructura de carpetas

```
src/
├── types/            # Interfaces del dominio: Sector, Plantilla, Seccion, Campo, Ejemplo
├── data/             # Datos mock tipados (JSON/TS). Fuente única de verdad para el prototipo
│   ├── sectores.ts
│   ├── plantillas.ts
│   ├── ejemplos.ts
│   └── actividad.ts
├── lib/              # Capa de acceso a datos y utilidades
│   ├── api.ts        # Funciones que hoy devuelven mocks (reemplazar por fetch)
│   ├── hooks.ts      # Hooks React (useSectores, usePlantilla, etc.)
│   └── icons.ts      # Mapeo centralizado de íconos FA por tipo de campo y sector
├── components/       # Componentes UI reutilizables
│   ├── Sidebar.tsx
│   ├── Breadcrumbs.tsx
│   └── VersionTabs.tsx
├── layouts/
│   └── MainLayout.tsx
├── routes/
│   └── AppRouter.tsx
└── features/         # Módulos por funcionalidad
    ├── dashboard/    # Página de inicio: métricas, accesos directos, actividad
    ├── sectores/     # Grid de sectores + modal "Nuevo sector"
    ├── plantillas/   # Tabla de plantillas de un sector
    └── editor/       # Editor de plantilla (vista, edición, ejemplos)
        ├── useScrollSpy.ts          # IntersectionObserver bidireccional
        ├── SectionIndex.tsx         # Índice lateral de secciones
        ├── SectionContent.tsx       # Contenido de una sección con campos
        ├── FieldCard.tsx            # Tarjeta de campo con ícono de tipo
        ├── FieldPropertiesPanel.tsx  # Panel derecho de propiedades
        ├── ExampleSelector.tsx      # Dropdown de ejemplo activo
        ├── PlantillaViewPage.tsx    # Modo lectura
        └── PlantillaEditPage.tsx    # Modo edición (3 paneles)
```

## Pantallas implementadas

| Ruta | Pantalla |
|------|----------|
| `/` | Dashboard — saludo, métricas, accesos directos, actividad reciente |
| `/sectores` | Grid de sectores con tarjetas |
| `/sectores/:id` | Detalle de sector — tabla de plantillas |
| `/sectores/:id/plantilla/:id` | Editor modo lectura (Estructura / Ejemplos) |
| `/sectores/:id/plantilla/:id/editar` | Editor modo edición — 3 paneles con propiedades |

## Cómo reemplazar la capa mock por la API real

La capa de datos está aislada en `src/lib/api.ts`. Cada función hoy importa datos estáticos de `src/data/`. Para conectar con el backend CodeIgniter:

1. Reemplazar el cuerpo de cada función en `api.ts` por un `fetch()` a la API REST:

```ts
// Antes (mock)
export function getSectores(): Sector[] {
  return sectoresMock;
}

// Después (API real)
export async function getSectores(): Promise<Sector[]> {
  const res = await fetch('/api/sectores');
  return res.json();
}
```

2. Actualizar los hooks en `hooks.ts` para manejar estado asíncrono (usar `useEffect` + `useState`, o una librería como React Query / SWR).

3. Los tipos en `src/types/` ya están alineados con las entidades del dominio. Si la API devuelve un esquema diferente, agregar funciones de mapeo en `api.ts`.

4. La carpeta `src/data/` se puede eliminar una vez conectada la API real.

## Tipos de campo soportados

Texto corto, texto largo, número, fecha, catálogo simple, catálogo encadenado, selección, tabla, tabla jerárquica, calculado (readonly), imagen/croquis, firma.

Cada tipo tiene su ícono y etiqueta mapeados en `src/lib/icons.ts` (objetos `fieldTypeIcons` y `fieldTypeLabels`).
