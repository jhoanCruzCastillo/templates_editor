# template-editor — Ampliación de la UI: soporte para "Perfiles" (instrumentos)

> **Para el agente.** Este documento describe qué agregar a la UI **ya existente** de Proyecta Fácil (template-editor) para soportar un segundo tipo de instrumento: el **Perfil**. Todo lo aquí descrito es **diseño de prototipo** (sin backend real; datos mock, estado en memoria). No rehagas lo existente: **extiende**. Junto a este documento recibes el **Anexo N° 07** (PDF oficial del MEF) con la estructura real del contenido de un perfil — úsalo como fuente para armar las secciones de la plantilla "Perfil".

---

## 1. Contexto: qué es un "instrumento" y por qué se agrega

La plataforma administra **plantillas** de documentos del sistema de inversión pública peruano (Invierte.pe). Hasta ahora todas las plantillas eran **Fichas Técnicas** (6A, 6B, sectoriales). Ahora se incorpora un segundo **tipo de instrumento**: el **Perfil**.

Los instrumentos son las grandes categorías de documento del sistema:
- **Ficha Técnica** (lo ya implementado): documento comprimido, muy pauteado, con campos y tablas de estructura rígida mapeada a un Excel.
- **Perfil** (lo nuevo): documento **abierto y extenso** (50–150 páginas), organizado por "contenidos mínimos". No es un formulario de celdas: es un índice de secciones donde cada una describe *qué debe contener*, y se llena mayormente con texto desarrollado, tablas y anexos.
- (Futuros, NO implementar ahora: IOARR, formatos 8A/8C, liquidaciones.)

**Idea rectora:** una plantilla ahora pertenece a un **sector** Y a un **instrumento**. El instrumento es un nuevo atributo de clasificación, no una nueva jerarquía de navegación.

---

## 2. Diferencia estructural clave entre Ficha y Perfil (IMPORTANTE para el diseño)

Esto define cómo se ve el editor de un Perfil frente al de una Ficha:

| | Ficha Técnica (existente) | Perfil (nuevo) |
|---|---|---|
| Naturaleza | Formulario rígido | Documento abierto |
| Campos | Tipos variados (catálogo, tabla, número, fecha, calculado…) con celdas de Excel | Mayormente **texto largo desarrollado** por cada punto de contenido |
| Estructura | 14 secciones con campos y coordenadas | Índice jerárquico de "contenidos mínimos" (numerales 1, 2, 2.1, 2.1.1…) |
| Qué define cada ítem | Un dato puntual y dónde va | **Qué debe contener** ese apartado (una pauta/guía) |
| Exportación | A celdas de Excel | A documento (Word/PDF), fuera de alcance del prototipo |

**Consecuencia de diseño:** el editor de un Perfil NO necesita el aparato de tipos de campo complejos, catálogos ni coordenadas de celda. Cada apartado del perfil es esencialmente **un bloque de contenido con: numeral + título + una "pauta" (qué debe contener) + espacio para el desarrollo/ejemplo en texto**. Es más simple que la ficha en tipos de campo, pero más profundo en jerarquía de secciones (numerales anidados: 2 → 2.1 → 2.1.1).

---

## 3. Cambios concretos en la UI

### 3.1. Modelo de datos (mock) — agregar atributo `instrumento`

A la entidad **Plantilla** (en `src/data` / `src/types`) agregar un campo:

```ts
instrumento: "ficha_tecnica" | "perfil"   // por defecto "ficha_tecnica"
```

Todas las plantillas actuales quedan como `"ficha_tecnica"`. Las nuevas de perfil serán `"perfil"`.

### 3.2. Lista de plantillas del sector (pantalla "Plantillas de un sector")

- Agregar un **badge de instrumento** en cada fila, junto al código: por ejemplo `Ficha` (color neutro/azulado) o `Perfil` (color distinto, ej. violeta/ámbar), para distinguirlos de un vistazo.
- Opcional: un **filtro/segmented control** arriba de la tabla ("Todos | Fichas | Perfiles") para filtrar la lista por instrumento. Útil cuando un sector tenga ambos.
- El botón "Nueva plantilla" ahora debe permitir elegir el instrumento (ver 3.3).

### 3.3. Modal "Nueva plantilla" — elegir instrumento

Al modal existente (Código, Nombre, Descripción) agregar **al inicio** un selector de **Tipo de instrumento**:
- Dos opciones tipo tarjeta o segmented control: **Ficha Técnica** | **Perfil**.
- Al elegir "Perfil", el texto de ayuda del modal cambia a algo como "Define la estructura de un estudio de preinversión a nivel de perfil".
- El instrumento elegido determina qué editor se abre después (ficha vs perfil) y qué secciones base trae.

### 3.4. Editor de Perfil — nueva variante del editor existente

Reutiliza el **mismo layout de tres zonas** del editor de fichas (índice de secciones a la izquierda, contenido al centro, propiedades a la derecha) y el **mismo patrón de navegación** (breadcrumb `Sectores › [Sector] › [Código] · [Nombre]`, sidebar resaltando "Sectores", selector de versión Estructura/Ejemplos/Proyecto, scroll-spy). NO inventes una navegación nueva.

Diferencias del editor de Perfil respecto al de Ficha:

**a) Índice de secciones jerárquico y más profundo.** El perfil se organiza en numerales anidados (1, 2, 2.1, 2.1.1, 2.1.2…). El índice izquierdo debe mostrar esa jerarquía con indentación (secciones y subsecciones colapsables). Usa el Anexo 07 para el árbol real de secciones (resumido en el punto 4).

**b) El "campo" por defecto es un bloque de contenido, no un campo de formulario.** Cada apartado del perfil se representa como un bloque con:
- Numeral (ej. "2.1.1") y título (ej. "La población afectada").
- **Pauta / contenido mínimo**: el texto del Anexo 07 que describe QUÉ debe contener ese apartado (mostrado como guía, en un recuadro tipo "ayuda").
- **Desarrollo**: un área de texto largo (en versión Estructura queda vacía/con la pauta; en Ejemplos lleva un caso desarrollado; en Proyecto lo llena el usuario final).

**c) Tipos de contenido admitidos dentro de un apartado.** Mayormente `texto_largo`. Pero algunos apartados admiten además **tablas** (ej. balance oferta-demanda, cronograma de costos, marco lógico) e **imágenes** (diseño preliminar, croquis). Reutiliza los tipos `tabla` e `imagen` que el editor de fichas ya soporta. No necesitas catálogos ni campos calculados con coordenadas de Excel aquí.

**d) Sin coordenadas de Excel.** El perfil no se mapea a celdas. Omite todo lo relativo a `captura`/celdas en el editor de perfil. (La exportación a Word/PDF es fuera de alcance.)

**e) Panel de propiedades** (derecha): para un apartado de perfil muestra numeral, título, y un toggle de tipo de contenido (Texto / Tabla / Imagen). Más simple que el de fichas.

### 3.5. Dashboard e Inicio

- En las métricas del dashboard, si es sencillo, diferenciar o al menos no romper el conteo: "Plantillas creadas" puede seguir siendo el total (fichas + perfiles). Opcionalmente, un desglose pequeño ("X fichas · Y perfiles").
- No agregues un ítem de sidebar para perfiles. El sidebar sigue siendo **Inicio / Sectores**. Los perfiles se alcanzan igual que las fichas: navegando al sector y abriendo la plantilla. El instrumento es un badge/atributo, NO un destino de navegación.

---

## 4. Estructura del Perfil (del Anexo 07) — secciones base de la plantilla

Usa el PDF del Anexo 07 adjunto como fuente. El árbol de contenidos mínimos del perfil es (resumen; toma del PDF el texto de la "pauta" de cada punto para el recuadro de contenido mínimo):

1. **Resumen ejecutivo** (ver Apéndice del Anexo 07 para su sub-estructura A–I)
2. **Identificación**
   - 2.1 Diagnóstico
     - 2.1.1 La población afectada
     - 2.1.2 El territorio
     - 2.1.3 La Unidad Productora (solo si existe)
     - 2.1.4 Otros agentes involucrados
   - 2.2 Definición del problema, causas y efectos
   - 2.3 Planteamiento del proyecto
     - 2.3.1 Objetivo del proyecto
     - 2.3.2 Planteamiento de alternativas de solución
3. **Formulación**
   - 3.1 Horizonte de evaluación
   - 3.2 Análisis del mercado del servicio (3.2.1 demanda; brecha oferta-demanda)
   - 3.3 Análisis técnico (3.3.1 aspectos técnicos; 3.3.2 diseño preliminar; 3.3.3 metas físicas)
   - 3.4 Gestión del proyecto (3.4.1 ejecución; 3.4.2 funcionamiento)
   - 3.5 Costos del proyecto (3.5.1 inversión; 3.5.2 funcionamiento; 3.5.3 O&M incrementales)
4. **Evaluación**
   - 4.1 Evaluación social (beneficios, costos, criterios de decisión, análisis de incertidumbre)
   - 4.2 Evaluación privada
   - 4.3 Análisis de sostenibilidad
   - 4.4 Financiamiento
   - 4.5 Matriz de marco lógico
5. **Conclusiones**
6. **Recomendaciones** (fase de ejecución / fase de funcionamiento)
7. **Anexos**
+ **Apéndice**: orientaciones para el Resumen Ejecutivo (sub-puntos A–I)

Para cada nodo: el **título** sale de la lista de arriba; la **pauta/contenido mínimo** sale del párrafo correspondiente del Anexo 07 (el agente debe extraerlo del PDF y ponerlo como texto guía del apartado).

---

## 5. Reglas y límites (qué NO hacer)

- **No rehacer** el editor de fichas ni la navegación. Extender, reutilizar componentes.
- **No** agregar perfiles como ítem de sidebar. Es un atributo de plantilla (badge), no un nivel de navegación.
- **No** implementar exportación (ni a Excel ni a Word) — fuera de alcance.
- **No** meter coordenadas de Excel, catálogos ni campos calculados en el editor de perfil.
- **No** backend real, ni autenticación, ni `localStorage`. Datos mock, estado en memoria.
- Mantener **stack y estética actuales**: React + Tailwind + Font Awesome + Framer Motion; misma paleta (verde primario, azul de marca, fondos claros), mismos componentes reutilizables.
- Mantener las **tres versiones** (Estructura / Ejemplos / Proyecto) también para el perfil, con "Proyecto" deshabilitada/solo lectura como en fichas.

---

## 6. Datos mock sugeridos para demostrar

- Crear al menos **una plantilla de perfil** de ejemplo dentro de un sector (ej. en "General (MEF)" o en "Educación"): código `PERFIL-PI`, nombre "Estudio de Preinversión a nivel de Perfil", instrumento `"perfil"`, con las secciones del punto 4 cargadas y las pautas del Anexo 07.
- 1–2 ejemplos (versión Ejemplos) con algún apartado desarrollado en texto, para mostrar cómo se ve un perfil "lleno" frente a la estructura vacía.
- Mantener las fichas 6A/6B existentes intactas, ahora con badge "Ficha".

---

## 7. Resultado esperado

La UI actual, extendida para que:
1. Una plantilla pueda ser Ficha o Perfil (atributo `instrumento`, visible como badge).
2. El modal "Nueva plantilla" permita elegir el instrumento.
3. Exista un **editor de Perfil** que reutiliza el layout y navegación de fichas, pero con índice jerárquico profundo (numerales anidados), apartados tipo "contenido mínimo + desarrollo en texto", y sin el aparato de celdas/catálogos.
4. Todo navegable, con datos mock, demostrable en una reunión.
