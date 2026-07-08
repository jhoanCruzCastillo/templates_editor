# CONVENCIONES BASE

Estas convenciones especifican como deben estructurarse cada formato por lo que todos tendrán esta estructura base:

## 0. NIVEL GENERAL

**Para qué sirve:** Es el nodo raíz del documento JSON. Contiene los metadatos que identifican a qué formato oficial corresponde el documento completo, más el array `secciones`, que contiene todo el contenido del formulario.

```json
{
  "schema_version": "1.0",
  "formato": {
    "codigo": "06-A",
    "nombre": "Ficha Técnica General Simplificada",
    "fuente_archivo": "formato6a_directiva001_2019EF6301.xlsm",
    "tipo_version": "estructura",
    "nota_secciones": "..."
  },
  "secciones": [ ... ]
}
```

| Propiedad | Descripción |
|---|---|
| `schema_version` | Versión de la convención JSON usada en este documento. Permite que el parser sepa qué reglas de interpretación aplicar si la convención cambia en el futuro. |
| `formato.codigo` | Código oficial del formato según la normativa (en este ejemplo, `"06-A"`). Identifica qué ficha técnica representa todo el documento. |
| `formato.nombre` | Nombre legible del formato completo. Se usa para mostrarlo en la UI (títulos, breadcrumbs, listados). |
| `formato.fuente_archivo` | Nombre del archivo Excel original del cual se extrajo la posición de las celdas de todos los campos de este documento. Sirve de referencia/trazabilidad. |
| `formato.tipo_version` | Indica si este documento JSON completo es una `"estructura"` (cascarón vacío, plantilla sin datos) o un `"ejemplo"` (misma estructura con datos reales cargados en cada campo). |
| `formato.nota_secciones` | Campo de texto libre para observaciones internas del equipo (no se muestra al usuario final). |
| `secciones` | Array que contiene todos los nodos de tipo `"seccion"` del formato (ver punto 1). Es el punto de entrada del árbol de contenido. |

---

## 1. NIVEL SECCIONES

**Para qué sirve:** Un nodo de `tipo_nodo: "seccion"` representa una división principal del formulario — tal como se ve en el menú lateral de la UI (Sección 01, Sección 02...). Toda sección está anclada a **una sola hoja del archivo Excel**: es el nivel donde se declara explícitamente en qué pestaña del libro de Excel va a escribirse todo lo que cuelgue de ella (sus grupos y campos).

```json
{
  "id": "1",
  "nombre": "Datos generales del proyecto",
  "tipo_nodo": "seccion",
  "hoja": "DATOS GENERALES",
  "campos": [ ... ]
}
```

En este ejemplo: el nodo completo es una **sección** (`tipo_nodo: "seccion"`), con `id` `"1"`, cuyo nombre visible es *"Datos generales del proyecto"*, y toda ella está anclada a la pestaña de Excel llamada `"DATOS GENERALES"` (propiedad `hoja`).

| Propiedad | Descripción |
|---|---|
| `id` | Identificador jerárquico de la sección. Es el primer nivel del árbol (`"1"`, `"2"`, `"3"`...), usado también para ordenar las secciones en el menú lateral de la UI. |
| `nombre` | Nombre visible de la sección. Se muestra en el listado lateral del menú y como encabezado principal dentro del formulario. |
| `tipo_nodo` | Valor fijo `"seccion"`. Le indica al parser que este nodo es un contenedor de nivel superior — no es un grupo ni un campo. |
| `hoja` | Nombre exacto de la pestaña del archivo Excel donde se ubican físicamente **todos** los campos que pertenecen a esta sección, incluyendo los que están dentro de grupos anidados. Esta es la única fuente de verdad para la hoja de destino — no se vuelve a declarar en los niveles inferiores (grupo o campo). |
| `campos` | Array de nodos hijos directos de esta sección. Cada elemento de este array es, o bien un nodo de `tipo_nodo: "grupo"` (ver punto 2), o bien un nodo de `tipo_nodo: "campo"` (ver punto 3). |

---

## 2. NIVEL SUBSECCIONES (grupo)

**Para qué sirve:** Un nodo de `tipo_nodo: "grupo"` es un nivel de agrupación visual y lógica **dentro de una sección**. No captura ningún dato por sí mismo ni tiene ubicación propia en el Excel — solo organiza campos relacionados bajo un mismo subtítulo. Un grupo puede contener otros grupos anidados, o contener directamente campos.

```json
{
  "id": "1.01",
  "nombre": "Institucionalidad",
  "tipo_nodo": "grupo",
  "campos": [ ... ]
}
```

En este ejemplo: el nodo completo es un **grupo** (`tipo_nodo: "grupo"`), con `id` `"1.01"`, cuyo nombre visible es *"Institucionalidad"*. Este grupo cuelga de la sección `"1"` ("Datos generales del proyecto", vista en el punto 1) — por eso su `id` extiende el de la sección padre. No declara `hoja` propia: hereda `"DATOS GENERALES"` de esa sección.

| Propiedad | Descripción |
|---|---|
| `id` | Identificador jerárquico que extiende el `id` de su nodo padre (sección o grupo) agregando un nuevo segmento con punto. Refleja la profundidad del grupo dentro del árbol. |
| `nombre` | Nombre visible del grupo. Se muestra como subtítulo dentro de la sección, en la UI del formulario. |
| `tipo_nodo` | Valor fijo `"grupo"`. Indica que este nodo organiza otros nodos hijos, pero no representa un dato capturable en sí mismo. |
| `campos` | Array de nodos hijos directos de este grupo. Cada elemento es, o bien otro nodo de `tipo_nodo: "grupo"` (si hay más niveles de anidamiento), o bien un nodo de `tipo_nodo: "campo"` (si ya se llegó al nivel de captura de datos). |

> **Regla de herencia de hoja:** un nodo `grupo` **nunca** declara la propiedad `hoja`. Su hoja de destino es siempre la de su ancestro más cercano de `tipo_nodo: "seccion"`. Esto aplica sin importar cuántos niveles de grupo haya entre el campo y su sección.

---

## 3. NIVEL CAMPO (hoja del árbol)

**Para qué sirve:** Un nodo de `tipo_nodo: "campo"` es el único tipo de nodo que representa un dato real capturable — es la hoja final del árbol, nunca tiene hijos. Une tres cosas: cómo se llama y de qué tipo de dato es (para la UI), en qué celda exacta del Excel se ubica (heredando la hoja de su sección ancestro), y cuál es su valor actual.

```json
{
  "id": "1.01.01",
  "nombre": "Nivel de gobierno",
  "tipo_nodo": "campo",
  "tipo": "texto_corto",
  "editable": true,
  "captura": { "hoja": "DATOS GENERALES", "columna": "R", "fila": 9, "abarca_columnas": 10, "abarca_filas": 1 },
  "valor": "Regional (ejemplo)"
}
```

En este ejemplo: el nodo completo es un **campo** (`tipo_nodo: "campo"`), con `id` `"1.01.01"`, cuyo nombre visible es *"Nivel de gobierno"*. Este campo cuelga del grupo `"1.01"` ("Institucionalidad", visto en el punto 2), el cual a su vez cuelga de la sección `"1"` ("Datos generales del proyecto", vista en el punto 1). Al no declarar `hoja` propia, este campo hereda `"DATOS GENERALES"` de esa sección — y se ubica físicamente en la celda `R9` de esa pestaña, combinada a lo largo de 10 columnas.

| Propiedad | Descripción |
|---|---|
| `id` | Identificador jerárquico final, extiende el `id` de su grupo o sección padre. Debe ser único en todo el documento — otros campos (por ejemplo, campos calculados) lo van a referenciar directamente para tomar su valor. |
| `nombre` | Etiqueta del campo. Se renderiza como label en la UI del formulario, junto al control de entrada de datos. |
| `tipo_nodo` | Valor fijo `"campo"`. Marca que este nodo es una hoja del árbol: no tiene la propiedad `campos` ni ningún nodo hijo. |
| `tipo` | Tipo de dato del campo (en este ejemplo, `"texto_corto"`). Determina qué control se renderiza en la UI (input de texto, selector, número, etc.) y qué propiedades adicionales aplican al campo. |
| `editable` | Booleano. `true` si el usuario puede escribir el valor directamente desde la UI; `false` si el valor se genera automáticamente a partir de otros campos (fórmulas, concatenaciones) y por tanto se muestra de solo lectura. |
| `captura` | Objeto que define la ubicación física de este campo dentro de la hoja de Excel heredada de su sección ancestro. Es el puente entre el dato lógico y su posición real en el archivo Excel. |
| `captura.columna` | Letra de columna de Excel donde inicia el campo (en este ejemplo, `"R"`). |
| `captura.fila` | Número de fila de Excel donde inicia el campo, como valor entero — no como string — para permitir cálculos de offset y crecimiento en niveles posteriores (por ejemplo, tablas). En este ejemplo, `9`. |
| `captura.abarca_columnas` | Cantidad de columnas que ocupa la celda combinada del campo en el Excel, contando desde `columna`. En este ejemplo, `10` (el campo ocupa de la columna R a la columna AA). Si el campo no está combinado, el valor es `1`. |
| `captura.abarca_filas` | Cantidad de filas que ocupa la celda combinada del campo en el Excel, contando desde `fila`. En este ejemplo, `1` (no hay combinación vertical). |
| `valor` | Valor actual del campo. En un documento de `tipo_version: "estructura"` suele ir vacío o con un valor por defecto de referencia; en un documento de `tipo_version: "ejemplo"` contiene el dato real capturado, como en este ejemplo (`"Regional (ejemplo)"`). |

---

Como ya se explicó en detalle la estructura base del nodo `campo` en el punto 3 (id, tipo_nodo, editable, captura, valor), aquí solo marco **qué cambia o qué propiedad extra necesita cada tipo** — no repito lo que ya es común a todos.

### 3.1 Tipos de dato simples

| Tipo | Valor de `tipo` | ¿Propiedad extra? |
|---|---|---|
| Texto corto | `"texto_corto"` | Ninguna (ya documentado en punto 3) |
| Texto largo | `"texto_largo"` | `max_caracteres` (opcional) |
| Número | `"numero"` | ninguna extra — siempre entero |
| Decimal | `"decimal"` | `decimales` (cantidad de dígitos después de la coma) |
| Fecha | `"fecha"` | `formato_fecha` |
| Booleano | `"booleano"` | `etiquetas` (cómo se muestran `true`/`false` en la UI) |
| Coordenadas | `"coordenadas"` | ninguna extra — `valor` es un objeto `{ lat, lng }` |

#### Ejemplos

**Texto largo**
```json
{
  "id": "2.03.01",
  "nombre": "Descripción del problema",
  "tipo_nodo": "campo",
  "tipo": "texto_largo",
  "editable": true,
  "max_caracteres": 2000,
  "captura": { "columna": "C", "fila": 45, "abarca_columnas": 8, "abarca_filas": 5 },
  "valor": ""
}
```

**Número**
```json
{
  "id": "3.02.04",
  "nombre": "Población beneficiaria",
  "tipo_nodo": "campo",
  "tipo": "numero",
  "editable": true,
  "captura": { "columna": "F", "fila": 60, "abarca_columnas": 3, "abarca_filas": 1 },
  "valor": 1250
}
```

**Decimal**
```json
{
  "id": "8.01.02",
  "nombre": "Costo total de inversión (S/)",
  "tipo_nodo": "campo",
  "tipo": "decimal",
  "editable": true,
  "decimales": 2,
  "captura": { "columna": "H", "fila": 12, "abarca_columnas": 4, "abarca_filas": 1 },
  "valor": 458300.75
}
```

**Fecha**
```json
{
  "id": "5.01.01",
  "nombre": "Fecha de inicio de horizonte de evaluación",
  "tipo_nodo": "campo",
  "tipo": "fecha",
  "editable": true,
  "formato_fecha": "DD/MM/YYYY",
  "captura": { "columna": "D", "fila": 30, "abarca_columnas": 3, "abarca_filas": 1 },
  "valor": "15/03/2026"
}
```

**Booleano**
```json
{
  "id": "12.01.03",
  "nombre": "¿Requiere certificación ambiental?",
  "tipo_nodo": "campo",
  "tipo": "booleano",
  "editable": true,
  "etiquetas": { "true": "Sí", "false": "No" },
  "captura": { "columna": "K", "fila": 22, "abarca_columnas": 2, "abarca_filas": 1 },
  "valor": true
}
```

**Coordenadas**
```json
{
  "id": "2.01.01",
  "nombre": "Ubicación del proyecto",
  "tipo_nodo": "campo",
  "tipo": "coordenadas",
  "editable": true,
  "captura": { "columna": "R", "fila": 18, "abarca_columnas": 6, "abarca_filas": 1 },
  "valor": { "lat": -13.531950, "lng": -71.967463 }
}
```

### 3.2 Tipo calculado

```json
{
  "id": "8.02.01",
  "nombre": "Costo unitario promedio (S/)",
  "tipo_nodo": "campo",
  "tipo": "calculado",
  "editable": false,
  "formula": "=(SUMA({8.01.02},{8.01.03}))/{3.02.04}",
  "fuentes": ["8.01.02", "8.01.03", "3.02.04"],
  "captura": { "columna": "H", "fila": 25, "abarca_columnas": 4, "abarca_filas": 1 },
  "valor": 409.92
}
```

| Propiedad | Descripción |
|---|---|
| `formula` | Fórmula en sintaxis de Excel, usando `{id}` como marcador de cada campo referenciado en vez de una celda directa (ej. `{8.01.02}` en vez de `H20`). El generador reemplaza cada `{id}` por la celda real de ese campo (resuelta vía su propio `captura`) al momento de escribir el archivo Excel. |
| `fuentes` | Array explícito de todos los `id` que aparecen dentro de `formula`. Aunque técnicamente se podrían extraer parseando el string de `formula`, mantenerlo como array separado sirve para: validar rápido que todas las referencias existen en el documento, y para que cualquier lógica de dependencias (por ejemplo, saber qué campos recalcular si cambia uno) no tenga que parsear texto. |

> **Nota de diseño pendiente:** aún no está decidido si el generador debe escribir en la celda de Excel la fórmula viva (para que Excel la recalcule si alguien cambia un valor manualmente después) o el valor ya resuelto como texto/número plano. Se resuelve más adelante, no bloquea la implementación — el `id` ya resuelve la ubicación completa (hoja + celda) de fuentes y destino vía `captura`.

---

## 4. NIVEL CAMPO — Tipo Tabla

**Para qué sirve:** Es el cuarto tipo de nodo (`tipo: "tabla"`), usado cuando un conjunto de datos se repite en filas — a diferencia del campo simple, que captura un solo valor. Toda tabla comparte un esqueleto común de 6 propiedades, y luego se especializa según cómo crecen sus filas (`planas` o `jerarquicas`), si sus columnas son fijas o se generan dinámicamente, y si sus filas se organizan bajo agrupadores.

```json
{
  "id": "...",
  "nombre": "...",
  "tipo": "tabla",
  "editable": true,
  "config": { "filas": "planas|jerarquicas", "columnas": "fijas|dinamicas", "agrupador": true|false },
  "captura": { "hoja": "...", "fila_inicial": 0, "filas_base": 0, "columnas": [ ... ] },
  "cabecera": [ ... ],
  "columnas": [ ... ],
  "valor": [ ... ]
}
```

| Propiedad | Descripción |
|---|---|
| `config.filas` | Cómo se organizan las filas: `"planas"` (lista simple de registros) o `"jerarquicas"` (registros anidados en niveles padre-hijo). |
| `config.columnas` | Si las columnas son `"fijas"` (número conocido, declaradas una por una) o `"dinamicas"` (una columna se repite un número variable de veces, según datos externos como años o periodos). |
| `config.agrupador` | Booleano. Indica si las filas se organizan bajo encabezados de grupo intermedios (ej. "Durante la Ejecución"). |
| `captura.hoja` | Pestaña de Excel donde vive físicamente la tabla. |
| `captura.fila_inicial` | Primera fila de Excel donde empieza el primer registro de datos (no la cabecera). |
| `captura.filas_base` | Cantidad de filas que ocupa la tabla en su estado base/ejemplo, antes de que el usuario agregue o quite registros. También es la referencia para calcular su crecimiento real (ver 4.7). |
| `captura.columnas` | Array que define la posición física de cada columna (`id`, `columna`, `abarca_columnas`). Es la única fuente de verdad para la ubicación — no se repite dentro de `columnas`. |
| `cabecera` | Array opcional que agrupa columnas bajo un título común de encabezado. Una columna que no aparece en ningún `hijos` de `cabecera` no tiene título padre, y ocupa verticalmente la misma altura que sus columnas vecinas. |
| `columnas` | Definición lógica de cada columna: `id`, `nombre`, `tipo`, y propiedades específicas del tipo. En tablas jerárquicas, este array se llama `niveles`. |
| `valor` | Los datos reales de la tabla. Su forma exacta depende de la combinación de `config`. |

### 4.1 Filas planas, columnas fijas, sin agrupador

**Para qué sirve:** La variante más simple — una lista de registros donde cada fila tiene el mismo conjunto de columnas, sin agrupaciones intermedias. `valor` es un array plano de objetos, uno por fila, con claves iguales al `id` de cada columna.

```json
{
  "id": "2.02",
  "nombre": "Localización del área de influencia del proyecto",
  "tipo": "tabla",
  "editable": true,
  "config": { "filas": "planas", "columnas": "fijas", "agrupador": false },
  "captura": {
    "hoja": "AREA DE ESTUDIO",
    "fila_inicial": 18,
    "filas_base": 3,
    "columnas": [
      { "id": "n",       "columna": "B", "abarca_columnas": 1 },
      { "id": "depto",   "columna": "C", "abarca_columnas": 4 },
      { "id": "prov",    "columna": "G", "abarca_columnas": 4 },
      { "id": "dist",    "columna": "K", "abarca_columnas": 4 },
      { "id": "loc",     "columna": "O", "abarca_columnas": 4 },
      { "id": "ubigeo",  "columna": "S", "abarca_columnas": 4 }
    ]
  },
  "cabecera": [],
  "columnas": [
    { "id": "n",      "nombre": "N°",                      "tipo": "numero" },
    { "id": "depto",  "nombre": "Departamento",             "tipo": "texto_corto" },
    { "id": "prov",   "nombre": "Provincia",                "tipo": "texto_corto" },
    { "id": "dist",   "nombre": "Distrito",                 "tipo": "texto_corto" },
    { "id": "loc",    "nombre": "Localidad/Centro poblado",  "tipo": "texto_corto" },
    { "id": "ubigeo", "nombre": "Ubigeo",                   "tipo": "texto_corto" }
  ],
  "valor": [
    { "n": 1, "depto": "Cusco", "prov": "Cusco", "dist": "Wanchaq",  "loc": "Wanchaq",  "ubigeo": "3435" },
    { "n": 2, "depto": "Cusco", "prov": "Cusco", "dist": "Santiago", "loc": "Santiago", "ubigeo": "5235" },
    { "n": 3, "depto": "Puno",  "prov": "Puno",  "dist": "Juliaca",  "loc": "Juliaca",  "ubigeo": "6343" }
  ]
}
```

### 4.2 Filas planas, columnas fijas, con agrupador

**Para qué sirve:** Igual que la anterior, pero las filas se organizan bajo encabezados de grupo. `valor` pasa de ser un array plano a un array de bloques `{ agrupador, valores }`, donde cada bloque representa un grupo con sus filas dentro.

```json
{
  "id": "12.01",
  "nombre": "Matriz de impacto ambiental",
  "tipo": "tabla",
  "editable": true,
  "config": { "filas": "planas", "columnas": "fijas", "agrupador": true },
  "captura": {
    "hoja": "IMPACTO AMBIENTAL",
    "fila_inicial": 8,
    "filas_base": 6,
    "columnas": [
      { "id": "imp_negativo",  "columna": "B", "abarca_columnas": 4 },
      { "id": "medidas_mitig", "columna": "F", "abarca_columnas": 3 },
      { "id": "costo",         "columna": "I", "abarca_columnas": 1 }
    ]
  },
  "cabecera": [],
  "columnas": [
    { "id": "imp_negativo",  "nombre": "IMPACTOS NEGATIVOS",     "tipo": "texto_corto" },
    { "id": "medidas_mitig", "nombre": "MEDIDAS DE MITIGACIÓN",  "tipo": "texto_corto" },
    { "id": "costo",         "nombre": "COSTO (S/)",             "tipo": "decimal" }
  ],
  "valor": [
    {
      "agrupador": { "inicia": "imp_negativo", "abarca_columnas": 4, "nombre": "Durante la Ejecución", "valores": {} },
      "valores": [
        { "imp_negativo": "Impacto 1", "medidas_mitig": "Medida A1", "costo": 232424 },
        { "imp_negativo": "Impacto 2", "medidas_mitig": "Medida A2", "costo": 532424 }
      ]
    },
    {
      "agrupador": { "inicia": "imp_negativo", "abarca_columnas": 4, "nombre": "Durante el Funcionamiento", "valores": {} },
      "valores": [
        { "imp_negativo": "Impacto 1", "medidas_mitig": "Medida B1", "costo": 232424 },
        { "imp_negativo": "Impacto 2", "medidas_mitig": "Medida B2", "costo": 532424 }
      ]
    }
  ]
}
```

| Propiedad | Descripción |
|---|---|
| `agrupador.inicia` | `id` de la columna donde empieza visualmente la fila de agrupación en el Excel. |
| `agrupador.abarca_columnas` | Cantidad de columnas que ocupa la fila de agrupación (fusionada), contando desde `inicia`. |
| `agrupador.nombre` | Texto del encabezado de grupo (ej. "Durante la Ejecución"). |
| `agrupador.valores` | Objeto vacío `{}` por defecto. Si el agrupador tuviera datos propios en otras columnas, se completa con `id_columna: valor`. |

### 4.3 Filas planas, columnas dinámicas, sin agrupador

**Para qué sirve:** Se usa cuando una columna debe repetirse un número variable de veces (periodos, años), cuya cantidad no se conoce de antemano en la estructura. Esa columna declara `columnas_base` (la lista de encabezados a generar), y en `valor` cada fila guarda un array plano relacionado **por posición** con `columnas_base` — la única excepción a la regla de referenciar todo por id.

```json
{
  "id": "6.02",
  "nombre": "Análisis de la demanda del servicio",
  "tipo": "tabla",
  "editable": true,
  "config": { "filas": "planas", "columnas": "dinamicas", "agrupador": false },
  "captura": {
    "hoja": "BRECHA DE SERVICIO",
    "fila_inicial": 15,
    "filas_base": 4,
    "columnas": [
      { "id": "servicio",           "columna": "B", "abarca_columnas": 1 },
      { "id": "descripcion",        "columna": "C", "abarca_columnas": 2 },
      { "id": "u_medida",           "columna": "E", "abarca_columnas": 1 },
      { "id": "columnas_dinamicas", "columna": "F", "abarca_columnas": 1, "columnas_base": ["Año 1", "Año 2", "Año 3", "....", "....", "....", "....", "Año n"] }
    ]
  },
  "cabecera": [],
  "columnas": [
    { "id": "servicio",           "nombre": "Servicio",         "tipo": "texto_corto" },
    { "id": "descripcion",        "nombre": "Descripción",      "tipo": "texto_corto" },
    { "id": "u_medida",           "nombre": "Unidad de Medida", "tipo": "texto_corto" },
    { "id": "columnas_dinamicas", "nombre": "irrelevante",      "tipo": "numero" }
  ],
  "valor": [
    { "servicio": "Servicio 1", "descripcion": "Descripción 01", "u_medida": "metros", "columnas_dinamicas": [4, 5, 6, 7, 8, 5, 4, 0] },
    { "servicio": "Servicio 2", "descripcion": "Descripción 02", "u_medida": "unidad", "columnas_dinamicas": [4, 5, 6, 7, 8, 5, 4, 0] },
    { "servicio": "Servicio 3", "descripcion": "Descripción 03", "u_medida": "unidad", "columnas_dinamicas": [4, 5, 6, 7, 8, 5, 4, 0] }
  ]
}
```

| Propiedad | Descripción |
|---|---|
| `columnas_base` | Array de encabezados generados dinámicamente para esta columna, en orden. Cada elemento se convierte en una columna real del Excel al generarlo. |
| `nombre` (columna dinámica) | No se usa — cada columna generada trae su propio nombre desde `columnas_base`. Se declara solo por consistencia de esquema. |
| `valor.[fila].columnas_dinamicas` | Array plano de valores, relacionado por **posición** con `columnas_base`: el índice 0 corresponde al primer elemento, etc. |

### 4.4 Filas planas, columnas dinámicas, con agrupador

**Para qué sirve:** Combina las dos variantes anteriores — filas agrupadas bajo encabezados de grupo, con una columna que se repite dinámicamente dentro de cada grupo.

```json
{
  "id": "8.04.04",
  "nombre": "Cronograma de inversión de metas financieras",
  "tipo": "tabla",
  "editable": true,
  "config": { "filas": "planas", "columnas": "dinamicas", "agrupador": true },
  "captura": {
    "hoja": "COSTO TOTAL",
    "fila_inicial": 85,
    "filas_base": 13,
    "columnas": [
      { "id": "accion",                   "columna": "B", "abarca_columnas": 3 },
      { "id": "activos",                  "columna": "E", "abarca_columnas": 2 },
      { "id": "tipo_factor_productivo",   "columna": "G", "abarca_columnas": 2 },
      { "id": "columnas_dinamicas",       "columna": "I", "abarca_columnas": 1, "columnas_base": ["1", "2", "3", "....", "....", "....", "....", "n"] },
      { "id": "costo_estimado_inversion", "columna": "Q", "abarca_columnas": 2 }
    ]
  },
  "cabecera": [
    { "titulo": "Acción sobre los activos", "hijos": ["accion", "activos"] },
    { "titulo": "Cronograma de Inversión",  "hijos": ["columnas_dinamicas"] }
  ],
  "columnas": [
    { "id": "accion",                   "nombre": "Componente /acción",        "tipo": "texto_corto" },
    { "id": "activos",                  "nombre": "Activos",                   "tipo": "texto_corto" },
    { "id": "tipo_factor_productivo",   "nombre": "Tipo de factor productivo", "tipo": "texto_corto" },
    { "id": "columnas_dinamicas",       "nombre": "irrelevante",               "tipo": "decimal" },
    { "id": "costo_estimado_inversion", "nombre": "Costo estimado de inversión a precios de mercado (Soles)", "tipo": "decimal" }
  ],
  "valor": [
    {
      "agrupador": { "inicia": "accion", "abarca_columnas": 3, "nombre": "Componente 1", "valores": {} },
      "valores": [
        { "accion": "Acción 1", "activos": "Activo 1", "tipo_factor_productivo": "Obra", "columnas_dinamicas": [200000, 250000, 198000], "costo_estimado_inversion": 648000 },
        { "accion": "Acción 2", "activos": "Activo 2", "tipo_factor_productivo": "Obra", "columnas_dinamicas": [40000, 32000, 0], "costo_estimado_inversion": 72000 }
      ]
    },
    {
      "agrupador": { "inicia": "accion", "abarca_columnas": 3, "nombre": "Componente 2", "valores": {} },
      "valores": [
        { "accion": "Acción 1", "activos": "Activo 3", "tipo_factor_productivo": "Equipo", "columnas_dinamicas": [0, 45000, 0], "costo_estimado_inversion": 45000 }
      ]
    }
  ]
}
```

### 4.5 Filas jerárquicas, columnas fijas, sin agrupador

**Para qué sirve:** Se usa cuando los datos forman un árbol real de profundidad fija (causa directa → sustento → causa indirecta). `columnas` se reemplaza por `niveles`, y `valor` es una estructura recursiva anidada vía `hijos`.

```json
{
  "id": "4.01.02",
  "nombre": "",
  "tipo": "tabla",
  "editable": true,
  "config": { "filas": "jerarquicas", "columnas": "fijas", "agrupador": false },
  "captura": {
    "hoja": "PROBLEMA-OBJETIVO",
    "fila_inicial": 11,
    "filas_base": 9,
    "columnas": [
      { "id": "causa_directa",   "columna": "B", "abarca_columnas": 4 },
      { "id": "sustento",        "columna": "F", "abarca_columnas": 4 },
      { "id": "causa_indirecta", "columna": "J", "abarca_columnas": 4 }
    ]
  },
  "cabecera": [],
  "niveles": [
    { "id": "causa_directa",   "nombre": "Causa Directa (CD)",    "tipo": "texto_largo", "combina_vertical": true },
    { "id": "sustento",        "nombre": "Sustento (evidencias)", "tipo": "texto_largo", "combina_vertical": true },
    { "id": "causa_indirecta", "nombre": "Causa Indirecta (CI)",  "tipo": "texto_largo" }
  ],
  "valor": [
    {
      "causa_directa": "Inadecuadas condiciones de la infraestructura educativa",
      "hijos": [
        {
          "sustento": "El 60% de aulas presentan rajaduras (informe de defensa civil 2024)",
          "hijos": [
            { "causa_indirecta": "Aulas construidas con material precario" },
            { "causa_indirecta": "Ausencia de mantenimiento preventivo" }
          ]
        }
      ]
    },
    {
      "causa_directa": "Limitada disponibilidad de mobiliario y equipos",
      "hijos": [
        {
          "sustento": "Ratio de 2 alumnos por pupitre (censo escolar 2024)",
          "hijos": [
            { "causa_indirecta": "Mobiliario deteriorado y obsoleto" }
          ]
        }
      ]
    }
  ]
}
```

| Propiedad | Descripción |
|---|---|
| `niveles` | Reemplaza a `columnas` en tablas jerárquicas. Cada elemento define un nivel de profundidad del árbol, en el mismo orden en que aparecen las columnas físicas en el Excel. |
| `combina_vertical` | Booleano. Si es `true`, la celda de ese nivel se fusiona verticalmente cuando su valor se repite para varios hijos — es un efecto visual, no reduce la cantidad de filas físicas reales (ver 4.7). |
| `valor.[nodo].hijos` | Array recursivo: cada hijo es un objeto con la clave del siguiente nivel y, opcionalmente, su propio `hijos`. El último nivel del árbol no tiene `hijos`. |

> **Nota:** `filas jerárquicas + agrupador: true` no tiene ejemplo real documentado aún — el mecanismo esperado sería el mismo `agrupador`/`valores` de las variantes planas, aplicado al primer nivel del árbol.

### 4.6 Caso especial — Valores seleccionables (`etiquetas`)

**Para qué sirve:** No es una variante de tabla nueva, sino una propiedad adicional que puede llevar cualquier columna de tipo primitivo (`booleano`, `texto_corto`, `numero`, `decimal`...) para restringir su valor a una lista fija de opciones, funcionando como checkbox o selector dentro de la tabla.

```json
{
  "id": "11.02",
  "nombre": "Modalidad de ejecución de proyecto",
  "tipo": "tabla",
  "editable": true,
  "config": { "filas": "planas", "columnas": "fijas", "agrupador": false },
  "captura": {
    "hoja": "GESTIÓN",
    "fila_inicial": 41,
    "filas_base": 5,
    "columnas": [
      { "id": "tipo",   "columna": "B", "abarca_columnas": 5 },
      { "id": "marcar", "columna": "G", "abarca_columnas": 1 }
    ]
  },
  "cabecera": [],
  "columnas": [
    { "id": "tipo",   "nombre": "Tipo de ejecución", "tipo": "texto_corto" },
    { "id": "marcar", "nombre": "Marcar", "tipo": "booleano", "etiquetas": { "true": "Sí", "false": "No" } }
  ],
  "valor": [
    { "tipo": "Administración directa", "marcar": false },
    { "tipo": "Administración indirecta – por contrata", "marcar": true },
    { "tipo": "Administración indirecta – Asociación Público Privado (APP)", "marcar": false },
    { "tipo": "Administración indirecta – Núcleo Ejecutor", "marcar": false },
    { "tipo": "Administración indirecta – Ley 29230 (Obras por Impuestos)", "marcar": false }
  ]
}
```

| Propiedad | Descripción |
|---|---|
| `etiquetas` (en columna `booleano`) | Objeto con las claves fijas `true` y `false`, cuyo valor es el texto a mostrar en la UI (ej. "Sí"/"No"). |
| `etiquetas` (en cualquier otro tipo primitivo) | Array simple con la lista de valores permitidos (ej. `["Opción A", "Opción B"]`), restringiendo la entrada a un selector. |

### 4.7 Crecimiento y desplazamiento de filas

**Para qué sirve:** Cuando el usuario agrega más registros a una tabla de los que tenía en su estado base (`filas_base`), todo lo que esté ubicado *después* de esa tabla en la misma hoja debe desplazarse hacia abajo. Esta sección define cómo se calcula ese crecimiento y cómo se propaga.

**Cálculo del crecimiento de una tabla:**