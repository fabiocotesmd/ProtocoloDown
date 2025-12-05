# Lógica de Procesos - Cumplimiento Protocolo Down

**Manual de Procesos y Especificación Funcional**

Versión: 1.0
Autores: Dr. Víctor Mora & Dr. Fabio Cotes

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Flujos Principales](#flujos-principales)
3. [Lógica de Grupos Etarios](#lógica-de-grupos-etarios)
4. [Proceso de Identificación del Paciente](#proceso-de-identificación-del-paciente)
5. [Proceso de Evaluación de Cumplimiento](#proceso-de-evaluación-de-cumplimiento)
6. [Categorización de Evaluaciones](#categorización-de-evaluaciones)
7. [Cálculo de Métricas de Cumplimiento](#cálculo-de-métricas-de-cumplimiento)
8. [Generación de Informes](#generación-de-informes)
9. [Reglas de Validación](#reglas-de-validación)
10. [Estructura de Datos](#estructura-de-datos)

---

## Introducción

### Propósito del Sistema

La aplicación **Cumplimiento Protocolo Down** es un sistema de seguimiento del protocolo médico pediátrico para pacientes con Síndrome de Down. El sistema:

- Registra información demográfica del paciente
- Determina automáticamente qué evaluaciones médicas corresponden según la edad
- Rastrea el cumplimiento de 20 evaluaciones médicas diferentes
- Calcula métricas de cumplimiento puntual y global
- Genera informes en PDF con recomendaciones priorizadas

### Alcance del Protocolo

- **Edades cubiertas:** Desde recién nacido hasta 18 años
- **Grupos etarios:** 15 rangos de edad
- **Evaluaciones:** 20 tipos de evaluaciones médicas
- **Categorías:** Obligatorias, Opcionales, No Indicadas

---

## Flujos Principales

### Flujo General del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    INICIO DE SESIÓN                         │
│              (formulario_identificacion.html)               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │  ¿Nuevo paciente o búsqueda?       │
          └────────────────────────────────────┘
                 │                    │
          [Nuevo]                [Buscar]
                 │                    │
                 │                    ▼
                 │         ┌──────────────────────┐
                 │         │ Búsqueda de Registro │
                 │         │ - Por ID             │
                 │         │ - Por Nombre         │
                 │         │ - Últimas 5 visitas  │
                 │         └──────────────────────┘
                 │                    │
                 │                    │ [Cargar]
                 │                    │
                 ▼                    ▼
          ┌────────────────────────────────────┐
          │   Captura de Datos del Paciente    │
          │   - Identificación                 │
          │   - Nombre completo                │
          │   - Fecha de nacimiento            │
          │   - Edad actual                    │
          │   - Datos del acudiente            │
          │   - Fecha inicio protocolo         │
          └────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │   Cálculo Automático de Edad       │
          │   - Edad actual en años/meses      │
          │   - Edad al inicio del protocolo   │
          │   - Determinación de grupo etario  │
          └────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │   Guardar Registro                 │
          │   - Crear UUID                     │
          │   - Guardar JSON                   │
          │   - Almacenar en sessionStorage    │
          └────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           EVALUACIÓN DE CUMPLIMIENTO                        │
│           (formulario_cumplimiento.html)                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │   Cargar Registro desde Storage    │
          │   Cargar Protocolo (variables.json)│
          └────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │   Filtrado de Evaluaciones         │
          │   - Obligatorias (edad actual)     │
          │   - Opcionales (edad actual)       │
          │   - Atrasadas (edades previas)     │
          │   - Vencidas (ya no indicadas)     │
          │   - Próxima sesión                 │
          └────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │   Registro de Estados              │
          │   - Realizado (Verde)              │
          │   - No Disponible (Amarillo)       │
          │   - No Realizado (Rojo)            │
          └────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │   Cálculo de Métricas              │
          │   - Cumplimiento Puntual (%)       │
          │   - Cumplimiento Global (%)        │
          └────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │   Guardar Estado de Evaluaciones   │
          │   Actualizar registro JSON         │
          └────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              GENERACIÓN DE INFORME                          │
│              (nuevo_informe.html)                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │   Preparar Datos del Informe       │
          │   - Información del paciente       │
          │   - Métricas de cumplimiento       │
          │   - Tabla de protocolo completa    │
          │   - Recomendaciones priorizadas    │
          └────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │   Generar PDF                      │
          │   - Renderizar HTML                │
          │   - Crear PDF en temp              │
          │   - Abrir en visor                 │
          └────────────────────────────────────┘
                           │
                           ▼
                      [FIN]
```

---

## Lógica de Grupos Etarios

### Concepto Fundamental

El **grupo etario** es el elemento central que determina qué evaluaciones médicas corresponden al paciente. La edad se convierte en un código numérico que representa el rango de edad.

### Algoritmo de Cálculo

**Entrada:** Edad del paciente en años y meses

**Proceso:**
1. Convertir edad a meses totales: `totalMeses = (años × 12) + meses`
2. Aplicar tabla de rangos para determinar código de grupo etario

**Tabla de Clasificación:**

| Edad (meses) | Código | Etiqueta | Descripción |
|--------------|--------|----------|-------------|
| < 1 | 1 | RN | Recién Nacido |
| 1 - 6 | 6 | 1 a 6 meses | Lactante menor |
| 7 - 12 | 12 | 7 a 12 meses | Lactante mayor temprano |
| 13 - 18 | 18 | 1 año y medio | Lactante mayor |
| 19 - 24 | 24 | Dos años | Preescolar temprano |
| 25 - 36 | 36 | Tres años | Preescolar |
| 37 - 48 | 48 | Cuatro años | Preescolar tardío |
| 49 - 60 | 60 | Cinco años | Transición a escolar |
| 61 - 72 | 72 | Seis años | Escolar temprano |
| 73 - 84 | 84 | Siete años | Escolar |
| 85 - 96 | 96 | Ocho años | Escolar medio |
| 97 - 108 | 108 | Nueve años | Escolar medio-tardío |
| 109 - 120 | 120 | Diez años | Preescolar |
| 121 - 156 | 156 | 11 a 13 años | Adolescencia temprana |
| > 156 | 216 | 14 a 18 años | Adolescencia |

### Regla del Código

**Regla General:** El código del grupo etario representa el límite superior en meses del rango.

**Excepciones:**
- **Código 1 (RN):** No sigue la regla, representa < 1 mes
- **Código 216 (14-18 años):** Representa todas las edades desde 157 meses hasta 216 meses (18 años)

### Ejemplo de Cálculo

```
Paciente: 3 años y 7 meses

Cálculo:
  totalMeses = (3 × 12) + 7 = 43 meses

Aplicación de regla:
  43 meses está en el rango 37-48

Resultado:
  Código: 48
  Etiqueta: "Cuatro años"
  Evaluaciones: Se aplican las del grupo etario código 48
```

---

## Proceso de Identificación del Paciente

### Objetivo

Capturar la información demográfica del paciente y calcular automáticamente su grupo etario para determinar las evaluaciones correspondientes.

### Datos Capturados

#### 1. Información del Formulario

**Fecha de Diligenciamiento:**
- Auto-completada con fecha actual
- Solo lectura
- Obligatoria

#### 2. Datos del Paciente

**Identificación:**
- Número de documento
- Validación: Mínimo 6 dígitos
- Solo acepta números
- Formato visual con separadores de miles

**Nombre Completo:**
- Texto libre
- No hay restricción de caracteres

**Fecha de Nacimiento:**
- Formato: YYYY-MM-DD
- Opcional si se ingresa edad manual
- Usado para cálculo automático de edad

**Edad Actual:**
- Puede ser calculada automáticamente desde fecha de nacimiento
- O ingresada manualmente (años y meses)
- Rango válido: 0-18 años, 0-12 meses

#### 3. Datos del Acudiente

**Información Opcional:**
- Nombre completo
- Correo electrónico
- Teléfono

#### 4. Datos del Protocolo

**Fecha de Inicio:**
- Fecha en que se inició el seguimiento del protocolo
- Permite calcular edad al inicio
- Opcional

### Cálculo de Edad

#### Método 1: Automático desde Fecha de Nacimiento

**Fórmula:**
```
Entrada:
  - fechaNacimiento (YYYY-MM-DD)
  - fechaReferencia (fecha actual o fecha de inicio protocolo)

Cálculo:
  años = fechaReferencia.año - fechaNacimiento.año
  meses = fechaReferencia.mes - fechaNacimiento.mes

  Si (meses < 0):
    años = años - 1
    meses = meses + 12

  Si (fechaReferencia.día < fechaNacimiento.día):
    meses = meses - 1
    Si (meses < 0):
      años = años - 1
      meses = meses + 12

Salida:
  { años: número, meses: número }
```

**Ejemplo:**
```
Fecha de Nacimiento: 2021-05-15
Fecha Actual: 2025-11-08

Cálculo:
  años = 2025 - 2021 = 4
  meses = 11 - 5 = 6
  día actual (8) < día nacimiento (15): meses = 6 - 1 = 5

Resultado: 4 años, 5 meses
```

#### Método 2: Entrada Manual

El usuario ingresa directamente:
- Años (0-18)
- Meses (0-12)

En este caso, la fecha de nacimiento queda vacía.

### Determinación del Grupo Etario

Una vez calculada la edad, el sistema:

1. Convierte a meses totales
2. Busca el grupo etario correspondiente
3. Guarda el código y etiqueta

**Ejemplo:**
```
Edad: 4 años, 5 meses
Total: 53 meses
Grupo: Código 60 - "Cinco años"
```

### Funcionalidad de Búsqueda

#### Criterios de Búsqueda

**1. Por Número de Identificación:**
```
Busca en todos los registros JSON
Compara campo paciente.identificacion.numero
Permite búsqueda parcial o exacta
```

**2. Por Nombre del Paciente:**
```
Busca en campo paciente.nombreCompleto
Búsqueda insensible a mayúsculas/minúsculas
Permite coincidencia parcial
```

**3. Últimas 5 Visitas:**
```
Lee todos los archivos en carpeta registros/
Ordena por fecha de última modificación (más reciente primero)
Retorna los primeros 5
```

#### Proceso de Carga de Registro Existente

```
1. Usuario selecciona criterio de búsqueda
2. Sistema busca en archivos JSON
3. Muestra resultados con:
   - Nombre del paciente
   - Identificación
   - Edad actual
   - Fecha última modificación
4. Usuario selecciona un registro
5. Sistema carga datos en formulario
6. Recalcula edad actual desde fecha de nacimiento
7. Actualiza grupo etario si cambió
8. Marca registro como "actualización" (no nueva creación)
```

### Persistencia del Registro

#### Registro Nuevo

**Proceso:**
```
1. Generar UUID único (ej: "a1b2c3d4-e5f6-...")
2. Crear nombre archivo: "registro-{UUID}.json"
3. Preparar estructura de datos
4. Guardar en carpeta userData/registros/
5. Guardar en sessionStorage para siguiente pantalla
```

#### Actualización de Registro Existente

**Proceso:**
```
1. Usar mismo UUID del registro cargado
2. Usar mismo nombre de archivo
3. Actualizar campos modificados
4. Incrementar versión en auditoria.versionRegistro
5. Actualizar fecha en metadata.lastModified
6. Agregar entrada al historial
7. Sobrescribir archivo JSON
```

### Indicadores de Completitud

El formulario muestra indicadores visuales de completitud por sección:

**Sección Paciente - Completa si:**
- Identificación tiene mínimo 6 dígitos
- Nombre no está vacío
- Fecha de nacimiento está diligenciada

**Sección Acudiente - Completa si:**
- Nombre del acudiente no está vacío
- Y al menos uno de: correo o teléfono está diligenciado

**Sección Protocolo - Completa si:**
- Fecha de inicio está diligenciada

**Nota:** Ninguna sección bloquea el guardado. Son solo indicadores visuales.

---

## Proceso de Evaluación de Cumplimiento

### Objetivo

Registrar el estado de cumplimiento de las evaluaciones médicas del protocolo según el grupo etario del paciente.

### Carga de Datos Inicial

Al abrir el formulario de cumplimiento:

```
1. Cargar datos del paciente desde sessionStorage
   - Información demográfica
   - Grupo etario calculado
   - Archivo de registro asociado

2. Cargar protocolo desde variables.json
   - 20 evaluaciones médicas
   - 15 grupos etarios
   - Categorización por edad

3. Si existe registro previo:
   - Cargar estados de evaluaciones guardadas
   - Sino, inicializar todas como "No Disponible" (estado 1)
```

### Estados de Evaluación

Cada evaluación puede tener uno de tres estados:

| Estado | Valor | Color | Significado |
|--------|-------|-------|-------------|
| Realizado | 2 | Verde | La evaluación fue completada |
| No Disponible | 1 | Amarillo | Información no disponible |
| No Realizado | 0 | Rojo | La evaluación está pendiente |

**Estado por Defecto:** Todas las evaluaciones inician en estado 1 (No Disponible)

### Las 20 Evaluaciones Médicas

1. **Cariotipo** - Estudio genético
2. **Consultoría Genética** - Evaluación genética
3. **TSH al Nacer** - Prueba tiroides neonatal
4. **Cuadro Hemático Completo y Frotis** - Examen de sangre
5. **TSH y T4 Libre** - Pruebas función tiroidea
6. **Valoración Endocrinología** - Consulta especializada
7. **Ecocardiograma** - Evaluación cardiaca
8. **Potenciales Evocados Auditivos** - Prueba auditiva objetiva
9. **Audiometría e Impedanciometría** - Pruebas auditivas
10. **Control Otorrinolaringología** - Consulta ORL
11. **Polisomnograma** - Estudio del sueño
12. **Rayos X de Cadera** - Imagen displasia cadera
13. **Radiografía Dinámica Cervical** - Evaluación columna cervical
14. **Tamizaje Enfermedad Celíaca** - Prueba celiaquía
15. **Vacunas PAI** - Vacunas del esquema regular
16. **Vacunas No PAI** - Vacunas adicionales
17. **Valoración Oftalmológica** - Evaluación visual
18. **Valoración Odontológica** - Evaluación dental
19. **Valoración Pediátrica** - Consulta pediatría
20. **Valoración Neuropediátrica** - Consulta neurología pediátrica

---

## Categorización de Evaluaciones

### Categorías según Edad

Para cada grupo etario, las evaluaciones se clasifican en:

#### 1. Evaluaciones Obligatorias

**Definición:** Evaluaciones que DEBEN realizarse en el grupo etario actual del paciente.

**Fuente:** Campo `evaluacion_obligatoria` del grupo etario en variables.json

**Ejemplo para grupo etario 48 (4 años):**
```json
"evaluacion_obligatoria": [
  "cuadro_hematico",
  "tsh_t4_libre",
  "tamizaje_celiaca",
  "vacunas_pai",
  "valoracion_oftalmologica",
  "valoracion_odontologica",
  "valoracion_pediatrica"
]
```

**Uso:** Estas evaluaciones se usan para calcular el cumplimiento puntual.

#### 2. Evaluaciones Opcionales

**Definición:** Evaluaciones recomendadas pero no obligatorias para la edad actual.

**Fuente:** Campo `evaluacion_opcional` del grupo etario

**Ejemplo:**
```json
"evaluacion_opcional": [
  "valoracion_endocrinologia",
  "audiometria_impedanciometria",
  "valoracion_neuropediatrica"
]
```

**Uso:** Se muestran al usuario pero NO se cuentan en métricas de cumplimiento.

#### 3. Evaluaciones No Indicadas

**Definición:** Evaluaciones que no corresponden a la edad actual.

**Fuente:** Campo `evaluacion_no_indicada` del grupo etario

**Ejemplo:**
```json
"evaluacion_no_indicada": [
  "tsh_nacer",
  "potenciales_auditivos",
  "rayos_x_cadera"
]
```

**Uso:** No se muestran en la vista principal, pero se rastrean para calcular "vencidas".

### Categorías Especiales

#### 4. Evaluaciones Atrasadas

**Definición:** Evaluaciones que debieron realizarse en un grupo etario anterior pero no se hicieron.

**Criterios de Identificación:**
```
Para cada evaluación:
  Para cada grupo etario anterior al actual:
    Si la evaluación era obligatoria u opcional en ese grupo
    Y NO está en ninguna categoría del grupo actual
    Y NO fue realizada (estado ≠ 2)
    → Es una evaluación atrasada
```

**Ordenamiento:** Se ordenan por grupo etario más reciente primero.

**Ejemplo:**
```
Paciente actual: Grupo 48 (4 años)
Evaluación "audiometría":
  - Era obligatoria en grupo 36 (3 años)
  - No aparece en grupo 48
  - Estado actual: No Disponible (1)
  → Se marca como ATRASADA del grupo 36
```

#### 5. Evaluaciones Vencidas

**Definición:** Evaluaciones que estaban indicadas en edades previas pero ahora están en "no indicada".

**Criterios de Identificación:**
```
Para cada evaluación en "evaluacion_no_indicada" del grupo actual:
  Si existe un grupo etario anterior donde:
    - La evaluación era obligatoria u opcional
    - El código de ese grupo < código actual
  → Es una evaluación vencida
```

**Diferencia con Atrasadas:**
- **Atrasadas:** Aún podrían realizarse, solo están retrasadas
- **Vencidas:** Ya no corresponden a la edad, se perdió la ventana de oportunidad

**Ejemplo:**
```
Evaluación "TSH al nacer":
  - Era obligatoria en grupo 1 (RN)
  - Ahora está en "no_indicada" del grupo 48
  → Está VENCIDA (ya no puede realizarse)
```

#### 6. Evaluaciones Próxima Sesión

**Definición:** Evaluaciones que deberían prepararse para la siguiente visita médica.

**Criterios de Selección:**
```
Incluir:
  1. Evaluaciones obligatorias del SIGUIENTE grupo etario
     - Que NO hayan sido realizadas todavía

  2. Evaluaciones atrasadas
     - De cualquier grupo anterior
     - Que NO hayan sido realizadas

Excluir:
  - Evaluaciones opcionales del grupo actual
```

**Lógica de Siguiente Grupo:**
```
grupos_ordenados = [1, 6, 12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120, 156, 216]
indice_actual = grupos_ordenados.indexOf(codigo_actual)
siguiente_grupo = grupos_ordenados[indice_actual + 1]

Si no hay siguiente grupo:
  siguiente_grupo = null
  evaluaciones_siguientes = []
```

**Ejemplo:**
```
Paciente: Grupo 48 (4 años)
Siguiente grupo: 60 (5 años)

Evaluaciones siguientes obligatorias del grupo 60:
  - Radiografía dinámica cervical (no realizada)

Evaluaciones atrasadas:
  - Audiometría del grupo 36 (no realizada)

Lista "Próxima Sesión":
  1. Radiografía dinámica cervical
  2. Audiometría (atrasada)
```

### Organización Visual

El formulario organiza las evaluaciones en secciones desplegables (acordeón):

```
┌─ Evaluaciones del Grupo Etario Actual ────────────────┐
│  [Mostrar evaluaciones del grupo actual]              │
│                                                        │
│  ▼ Evaluaciones Obligatorias (7)                      │
│    □ Cuadro hemático [Estado: dropdown]               │
│    □ TSH y T4 libre [Estado: dropdown]                │
│    ... (resto de obligatorias)                        │
│                                                        │
│  ▼ Evaluaciones Opcionales (3)                        │
│    □ Valoración endocrinología [Estado: dropdown]     │
│    ... (resto de opcionales)                          │
└────────────────────────────────────────────────────────┘

┌─ Evaluaciones Atrasadas ───────────────────────────────┐
│  [Evaluaciones de grupos anteriores no realizadas]     │
│                                                        │
│  ▼ Atrasadas (2)                                       │
│    □ Audiometría (del grupo: 3 años) [dropdown]       │
│    □ Control ORL (del grupo: 2 años) [dropdown]       │
└────────────────────────────────────────────────────────┘

┌─ Evaluaciones Próxima Sesión ─────────────────────────┐
│  [Para preparar en siguiente visita]                   │
│                                                        │
│  ▼ Próxima Sesión (3)                                  │
│    □ Radiografía cervical (siguiente grupo)           │
│    □ Audiometría (atrasada)                           │
│    □ Control ORL (atrasada)                           │
└────────────────────────────────────────────────────────┘

┌─ Evaluaciones Vencidas ────────────────────────────────┐
│  [Ya no corresponden a la edad actual]                 │
│                                                        │
│  ▼ Vencidas (1)                                        │
│    ⓘ TSH al nacer (correspondía a: RN)                │
│       [Solo informativo - no editable]                │
└────────────────────────────────────────────────────────┘
```

---

## Cálculo de Métricas de Cumplimiento

### Dos Tipos de Cumplimiento

El sistema calcula dos métricas independientes que miden aspectos diferentes del seguimiento del protocolo.

### 1. Cumplimiento Puntual

**Concepto:** Mide qué tan bien se está cumpliendo el protocolo EN LA EDAD ACTUAL del paciente.

**Pregunta que responde:** "¿Está el paciente al día con las evaluaciones de su edad?"

**Fórmula:**
```
evaluaciones_indicadas = evaluacion_obligatoria del grupo etario actual
evaluaciones_realizadas = cuántas de esas tienen estado = 2

cumplimiento_puntual = (evaluaciones_realizadas / evaluaciones_indicadas) × 100
```

**Ejemplo:**
```
Paciente: Grupo 48 (4 años)
Evaluaciones obligatorias del grupo 48: 7

Estados:
  - Cuadro hemático: Realizado (2) ✓
  - TSH y T4: Realizado (2) ✓
  - Tamizaje celíaca: No Disponible (1) ✗
  - Vacunas PAI: Realizado (2) ✓
  - Oftalmología: No Realizado (0) ✗
  - Odontología: Realizado (2) ✓
  - Pediatría: Realizado (2) ✓

Realizadas: 5 de 7

Cumplimiento Puntual = (5 / 7) × 100 = 71.4% → 71%
```

**Característica Importante:**
- Solo considera el grupo etario actual
- No penaliza por evaluaciones atrasadas de edades anteriores
- Se recalcula cada vez que el paciente cambia de grupo etario

### 2. Cumplimiento Global

**Concepto:** Mide qué tan bien se ha cumplido el protocolo DESDE EL NACIMIENTO hasta la edad actual.

**Pregunta que responde:** "¿Cuántas de todas las evaluaciones que debieron hacerse se han realizado?"

**Fórmula:**
```
Para cada grupo etario desde 1 hasta código actual:
  Agregar todas las evaluacion_obligatoria a un conjunto único

total_obligatorias = tamaño del conjunto
total_realizadas = cuántas de esas tienen estado = 2

cumplimiento_global = (total_realizadas / total_obligatorias) × 100
```

**Algoritmo Detallado:**
```
grupos_a_evaluar = grupos donde código ≤ codigo_actual

conjunto_evaluaciones = new Set()

for cada grupo in grupos_a_evaluar:
  for cada evaluacion in grupo.evaluacion_obligatoria:
    conjunto_evaluaciones.add(evaluacion)

total_obligatorias = conjunto_evaluaciones.size

contador_realizadas = 0
for cada evaluacion in conjunto_evaluaciones:
  if evaluacionesData[evaluacion] === 2:
    contador_realizadas++

cumplimiento_global = round((contador_realizadas / total_obligatorias) × 100)
```

**Ejemplo Completo:**
```
Paciente: Grupo 48 (4 años) - 53 meses

Grupos etarios recorridos:
  - Grupo 1 (RN): obligatorias = [cariotipo, consultoria_genetica, tsh_nacer]
  - Grupo 6: obligatorias = [cuadro_hematico, ecocardiograma, vacunas_pai]
  - Grupo 12: obligatorias = [potenciales_auditivos, valoracion_oftalmologica]
  - Grupo 18: obligatorias = [audiometria, control_orl, valoracion_pediatrica]
  - Grupo 24: obligatorias = [tsh_t4_libre, rayos_x_cadera]
  - Grupo 36: obligatorias = [audiometria, tamizaje_celiaca, odontologia]
  - Grupo 48: obligatorias = [cuadro_hematico, tsh_t4_libre, tamizaje_celiaca,
                              vacunas_pai, oftalmologia, odontologia, pediatria]

Conjunto único (sin duplicados): 15 evaluaciones diferentes
  [cariotipo, consultoria_genetica, tsh_nacer, cuadro_hematico,
   ecocardiograma, vacunas_pai, potenciales_auditivos,
   valoracion_oftalmologica, audiometria, control_orl,
   valoracion_pediatrica, tsh_t4_libre, rayos_x_cadera,
   tamizaje_celiaca, valoracion_odontologica]

Estados actuales:
  - Realizadas (estado 2): 9 evaluaciones
  - No realizadas (estado 0 o 1): 6 evaluaciones

Cumplimiento Global = (9 / 15) × 100 = 60%
```

**Diferencia con Cumplimiento Puntual:**
- Incluye TODAS las evaluaciones obligatorias desde el nacimiento
- Penaliza por evaluaciones atrasadas
- No cambia si se retrasa en cambiar de grupo etario
- Más representativo del seguimiento histórico

### Código de Colores para Cumplimiento

Ambas métricas usan el mismo código de colores:

| Porcentaje | Color | Barra | Significado |
|------------|-------|-------|-------------|
| 80% - 100% | Verde | `#4caf50` | Cumplimiento excelente |
| 60% - 79% | Naranja | `#ff9800` | Cumplimiento aceptable con rezagos |
| 0% - 59% | Rojo | `#f44336` | Cumplimiento deficiente |

**Visualización:**
```
Cumplimiento Puntual: 71%
[████████████████████░░░░░░░░] 71%

Cumplimiento Global: 60%
[██████████████░░░░░░░░░░░░░░] 60%
```

### Resumen de Evaluaciones

Además de los porcentajes, el sistema calcula:

```
total_evaluaciones = 20 (fijo)

por_estado = {
  no_realizado: count(estado === 0),
  no_disponible: count(estado === 1),
  realizado: count(estado === 2)
}

porcentaje_completitud_total = (por_estado.realizado / 20) × 100
```

**Nota:** Esta completitud total es diferente al cumplimiento global:
- **Completitud Total:** De las 20 evaluaciones totales, cuántas están realizadas
- **Cumplimiento Global:** De las evaluaciones que correspondían desde nacimiento hasta ahora, cuántas están realizadas

---

## Generación de Informes

### Objetivo

Crear un documento PDF con:
- Información completa del paciente
- Métricas de cumplimiento visuales
- Tabla del protocolo completo
- Recomendaciones priorizadas para próximas acciones

### Proceso de Generación

```
┌─────────────────────────────────────────────────────┐
│ Usuario hace clic en "Guardar y Crear Informe"     │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 1. Guardar estado actual de evaluaciones           │
│    - Actualizar registro JSON                       │
│    - Calcular métricas finales                      │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 2. Preparar datos completos para informe           │
│    - Paciente                                       │
│    - Acudiente                                      │
│    - Protocolo                                      │
│    - Evaluaciones (todos los estados)              │
│    - Métricas de cumplimiento                      │
│    - Configuración del protocolo (variables.json)  │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 3. Guardar en sessionStorage como 'datosInforme'   │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 4. Abrir ventana invisible (background)            │
│    - Cargar nuevo_informe.html                     │
│    - Esperar 2 segundos para renderizado completo  │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 5. Generar PDF usando printToPDF()                 │
│    - Tamaño: Letter                                │
│    - Orientación: Portrait                         │
│    - Márgenes personalizados                       │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 6. Guardar archivo temporal                        │
│    - Nombre: informe_{timestamp}.pdf               │
│    - Ubicación: Carpeta temporal del sistema       │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 7. Abrir PDF en visor predeterminado               │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 8. Cerrar ventana invisible                        │
└─────────────────────────────────────────────────────┘
```

### Estructura del Informe

El informe se divide en múltiples secciones:

#### Página 1: Información General y Métricas

**Encabezado:**
```
┌────────────────────────────────────────────────────┐
│  Informe de Cumplimiento del Protocolo Médico     │
│  para Niños y Adolescentes con Síndrome de Down   │
│                                                    │
│  Este informe es generado automáticamente y        │
│  debe ser revisado por personal médico calificado. │
└────────────────────────────────────────────────────┘
```

**Información del Paciente:**
```
Nombre Completo: [nombre]
Identificación: [número formateado]
Fecha de Nacimiento: [DD/MM/YYYY]
Edad Actual: [X años, Y meses]
Grupo Etario: [etiqueta del grupo]
```

**Información del Acudiente:**
```
Nombre: [nombre o "No registrado"]
Teléfono: [teléfono o "No registrado"]
Correo: [correo o "No registrado"]
```

**Información del Protocolo:**
```
Fecha de Diligenciamiento: [DD/MM/YYYY]
Fecha de Inicio Protocolo: [DD/MM/YYYY]
Edad al Inicio: [X años, Y meses]
```

**Métricas de Cumplimiento:**
```
┌─ Cumplimiento Puntual ─────────────────────────────┐
│  [████████████████░░░░░░] 71%                      │
│  Cumplidas: 5 de 7 evaluaciones indicadas         │
│  (Para el grupo etario actual)                     │
└────────────────────────────────────────────────────┘

┌─ Cumplimiento Global ──────────────────────────────┐
│  [██████████████░░░░░░░░░] 60%                     │
│  Cumplidas: 9 de 15 evaluaciones obligatorias     │
│  (Desde el nacimiento hasta la edad actual)        │
└────────────────────────────────────────────────────┘
```

#### Página 2: Tabla Completa del Protocolo

**Estructura:**
- Filas: 20 evaluaciones médicas
- Columnas: Solo hasta el grupo etario actual del paciente
- Celdas: Indicadores circulares de estado

**Leyenda de Indicadores:**
```
● Negro: Evaluación realizada
● Rojo: Evaluación pendiente (no realizada o no disponible)
  Fondo gris: No indicada para esa edad
```

**Ejemplo Visual:**
```
┌──────────────────┬────┬────┬────┬────┬────┬────┬────┐
│ Evaluación       │ RN │ 6m │ 12m│ 18m│ 24m│ 36m│ 48m│
├──────────────────┼────┼────┼────┼────┼────┼────┼────┤
│ Cariotipo        │ ●  │▓▓▓▓│▓▓▓▓│▓▓▓▓│▓▓▓▓│▓▓▓▓│▓▓▓▓│
│ Cuadro hemático  │▓▓▓▓│ ●  │ ●  │ ●  │ ○  │ ●  │ ●  │
│ Ecocardiograma   │▓▓▓▓│ ●  │▓▓▓▓│▓▓▓▓│▓▓▓▓│▓▓▓▓│▓▓▓▓│
│ ...              │    │    │    │    │    │    │    │
└──────────────────┴────┴────┴────┴────┴────┴────┴────┘

● = Realizado (negro)
○ = Pendiente (rojo)
▓ = No indicada (fondo gris, sin círculo)
```

**Lógica de Renderizado:**
```
Para cada evaluación:
  Para cada grupo etario hasta el actual:
    Si evaluación está en no_indicada:
      Mostrar celda gris sin círculo
    Sino:
      Si estado === 2:
        Mostrar círculo negro (realizada)
      Sino:
        Mostrar círculo rojo (pendiente)
```

#### Página 3: Recomendaciones Médicas

Esta es la sección más importante del informe, organizada en 3 categorías priorizadas:

**1. Evaluaciones para Próximo Grupo Etario**

```
┌─ Evaluaciones para Próxima Sesión (Grupo: Cinco años) ─┐
│                                                         │
│ Estas son las evaluaciones que se deben preparar       │
│ para cuando el paciente avance al siguiente rango.     │
│                                                         │
│ [Obligatorio] Radiografía Dinámica Cervical            │
│                                                         │
│ [Obligatorio] Polisomnograma                           │
│                                                         │
│ [Opcional] Valoración Neuropediátrica                  │
│   ✓ Ya realizada                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Lógica de Inclusión:**
```
siguiente_grupo = obtener_siguiente_grupo_etario(codigo_actual)

if siguiente_grupo existe:
  // Obligatorias del siguiente grupo
  para cada eval in siguiente_grupo.evaluacion_obligatoria:
    if estado !== 2:
      agregar a lista
    else:
      agregar a lista con marca "✓ Ya realizada"

  // Hasta 3 opcionales del siguiente grupo
  contador = 0
  para cada eval in siguiente_grupo.evaluacion_opcional:
    if contador < 3:
      if estado !== 2:
        agregar a lista
      else:
        agregar a lista con marca "✓ Ya realizada"
      contador++
```

**2. Evaluaciones Atrasadas**

```
┌─ Evaluaciones Atrasadas ────────────────────────────────┐
│                                                         │
│ ⚠ IMPORTANTE: Estas evaluaciones debieron realizarse   │
│ en grupos etarios anteriores y aún están pendientes.   │
│                                                         │
│ • Audiometría e Impedanciometría                       │
│   (Correspondía al grupo: Tres años)                   │
│                                                         │
│ • Control Otorrinolaringología                         │
│   (Correspondía al grupo: Dos años)                    │
│                                                         │
│ • Rayos X de Cadera                                    │
│   (Correspondía al grupo: Dos años)                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Lógica de Identificación:**
```
evaluaciones_atrasadas = []

para cada evaluacion in todas_las_evaluaciones:
  // Buscar si era obligatoria/opcional en grupos anteriores
  para cada grupo where grupo.codigo < codigo_actual:
    if evaluacion in (grupo.evaluacion_obligatoria OR grupo.evaluacion_opcional):
      // Verificar que no esté en categorías del grupo actual
      if evaluacion NOT IN (actual.obligatoria + actual.opcional + actual.no_indicada):
        if estado !== 2:
          evaluaciones_atrasadas.push({
            nombre: evaluacion,
            grupo_origen: grupo.etiqueta,
            codigo_grupo: grupo.codigo
          })
          break // Solo tomar el grupo más reciente

// Ordenar por grupo más reciente primero
evaluaciones_atrasadas.sort((a, b) => b.codigo_grupo - a.codigo_grupo)
```

**3. Evaluaciones Prioritarias del Grupo Actual**

```
┌─ Evaluaciones Pendientes del Grupo Actual ─────────────┐
│                                                         │
│ ⚠ PRIORIDAD ALTA: Evaluaciones obligatorias para       │
│ el grupo etario actual que aún no se han realizado.    │
│                                                         │
│ • Tamizaje Enfermedad Celíaca                          │
│   Estado: No disponible                                │
│                                                         │
│ • Valoración Oftalmológica                             │
│   Estado: No realizado                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Lógica de Inclusión:**
```
evaluaciones_pendientes = []

para cada eval in rangoActual.evaluacion_obligatoria:
  if estado !== 2:  // No realizada
    evaluaciones_pendientes.push({
      nombre: eval,
      estado: estado_legible  // "No disponible" o "No realizado"
    })
```

### Cálculo de Edad al Inicio del Protocolo (para informe)

**Contexto:** El informe debe mostrar la edad que tenía el paciente cuando inició el protocolo.

**Datos disponibles:**
- Edad actual en años y meses
- Fecha actual
- Fecha de inicio del protocolo

**Fórmula:**
```
meses_actuales = (años_actuales × 12) + meses_actuales

fecha_actual = hoy
fecha_inicio_protocolo = protocolo.fechaInicio

// Calcular meses transcurridos
meses_transcurridos = (fecha_actual.año - fecha_inicio.año) × 12 +
                      (fecha_actual.mes - fecha_inicio.mes)

// Ajustar si el día actual < día de inicio
if (fecha_actual.día < fecha_inicio.día):
  meses_transcurridos--

// Restar meses transcurridos de edad actual
meses_al_inicio = meses_actuales - meses_transcurridos

if (meses_al_inicio >= 0):
  años_inicio = floor(meses_al_inicio / 12)
  meses_inicio = meses_al_inicio % 12
else:
  años_inicio = 0
  meses_inicio = 0
```

**Ejemplo:**
```
Edad actual: 4 años, 5 meses (53 meses)
Fecha actual: 08/11/2025
Fecha inicio protocolo: 15/03/2024

Meses transcurridos:
  (2025 - 2024) × 12 = 12
  + (11 - 3) = 8
  = 20 meses

  Día actual (8) < día inicio (15): 20 - 1 = 19 meses

Edad al inicio:
  53 - 19 = 34 meses
  34 / 12 = 2 años
  34 % 12 = 10 meses

Resultado: "2 años, 10 meses"
```

### Descarga y Visualización

**Nombre del archivo:**
```
formato: informe_YYYYMMDD_HHmmss.pdf
ejemplo: informe_20251108_143045.pdf
```

**Ubicación temporal:**
```
Sistema operativo determina carpeta temp
Windows: %TEMP%\informe_[timestamp].pdf
```

**Acción posterior:**
- El PDF se abre automáticamente en el visor predeterminado
- Usuario puede guardarlo manualmente en la ubicación deseada
- El archivo temporal se elimina al cerrar el visor (comportamiento del SO)

---

## Reglas de Validación

### Formulario de Identificación

#### Validaciones de Formato

**1. Número de Identificación:**
```
Regla: Solo dígitos numéricos
Implementación: value.replace(/\D/g, '')

Regla: Mínimo 6 dígitos
Validación: valor.length >= 6
Mensaje: "La identificación debe tener mínimo 6 dígitos"

Formato visual: Separador de miles
  Ejemplo: 1234567 → "1.234.567"
```

**2. Fecha de Nacimiento:**
```
Regla: Formato válido YYYY-MM-DD
Validación: input type="date" del HTML5

Regla: No puede ser futura
Validación: fechaNacimiento <= hoy
```

**3. Edad Manual:**
```
Regla: Años entre 0 y 18
Validación: 0 <= valor <= 18

Regla: Meses entre 0 y 12
Validación: 0 <= valor <= 12
Nota: 12 meses es válido temporalmente durante entrada manual
```

**4. Correo Electrónico:**
```
Regla: Formato de email válido
Validación: input type="email" del HTML5
Patrón: caracteres@caracteres.dominio
```

**5. Teléfono:**
```
Regla: Solo dígitos
Implementación: value.replace(/\D/g, '')
Sin restricción de longitud (acepta celular o fijo)
```

#### Validaciones de Completitud

**Sección Paciente Completa:**
```
identificacion.length >= 6
AND nombreCompleto.trim() !== ""
AND fechaNacimiento !== ""
```

**Sección Acudiente Completa:**
```
nombreAcudiente.trim() !== ""
AND (correo.trim() !== "" OR telefono.trim() !== "")
```

**Sección Protocolo Completa:**
```
fechaInicio !== ""
```

#### Validaciones al Guardar

**Campos Obligatorios Mínimos:**
```
Solo es estrictamente obligatorio:
  - fechaDiligenciamiento (auto-completado)

Todos los demás campos son opcionales
El formulario permite guardar en estado incompleto
```

**Validación de Edad Coherente:**
```
Si fechaNacimiento existe:
  - Calcular edad automáticamente
  - Sobreescribir valores de entrada manual

Si fechaNacimiento vacía:
  - Usar valores de entrada manual
  - Validar que años <= 18
```

### Formulario de Cumplimiento

#### Estados Válidos

**Tres estados únicos:**
```
0: "No Realizado"
1: "No Disponible"
2: "Realizado"

Cualquier otro valor es inválido
Estado por defecto: 1
```

#### Cambios de Estado

**Transiciones permitidas:**
```
Desde cualquier estado → A cualquier otro estado
No hay restricciones de flujo
```

**Persistencia:**
```
Estados se guardan inmediatamente en memoria (evaluacionesData)
Se persisten a JSON solo al hacer clic en botones de guardado:
  - "Guardar"
  - "Guardar y Crear Informe"
```

#### Validaciones de Categorización

**Verificación de Grupo Etario:**
```
Si rangoEtario no existe:
  Mostrar error: "No se pudo determinar el grupo etario del paciente"
  Deshabilitar formulario

Si rangoEtario.codigo inválido:
  Usar código 1 (RN) por defecto
```

**Verificación de Protocolo:**
```
Si variables.json no carga:
  Mostrar error: "No se pudo cargar el protocolo médico"
  Deshabilitar formulario
```

### Generación de Informes

#### Validaciones Pre-generación

**Datos Completos:**
```
if (!registro.paciente):
  Error: "No hay información del paciente"

if (!registro.rangoEtario):
  Error: "No se ha determinado el grupo etario"

if (!registro.evaluaciones):
  Warning: "No hay evaluaciones registradas"
  Continuar con valores vacíos
```

**Datos del Protocolo:**
```
if (!datosConfiguracion):
  Intentar cargar desde variables.json
  Si falla:
    Error: "No se puede generar informe sin configuración del protocolo"
```

#### Validaciones Durante Generación

**Ventana de Informe:**
```
Timeout para carga: 2 segundos
Si no carga en ese tiempo:
  Continuar de todas formas (puede generar informe incompleto)
```

**Generación de PDF:**
```
Si printToPDF() falla:
  Capturar error
  Mostrar al usuario: "Error al generar PDF: [mensaje]"
  No cerrar ventana de informe (permitir debugging)
```

---

## Estructura de Datos

### Archivo de Registro JSON

#### Estructura Completa

```json
{
  "metadata": {
    "version": "1.0.0",
    "created": "2025-11-08T14:30:45.123Z",
    "lastModified": "2025-11-08T15:22:10.456Z",
    "application": "Protocolo Síndrome de Down - Electron App"
  },

  "codigoRegistro": "a1b2c3d4-e5f6-7890-abcd-1234567890ef",

  "paciente": {
    "identificacion": {
      "tipo": "CC",
      "numero": "1234567",
      "numeroFormateado": "1.234.567"
    },
    "nombreCompleto": "Juan Pérez García",
    "fechaNacimiento": "2021-06-15",
    "edadActual": {
      "años": 4,
      "meses": 5,
      "totalMeses": 53
    }
  },

  "acudiente": {
    "nombreCompleto": "María García",
    "correoElectronico": "maria.garcia@email.com",
    "telefono": "3001234567"
  },

  "protocolo": {
    "fechaInicio": "2024-03-15",
    "edadInicio": {
      "años": 2,
      "meses": 9
    },
    "fechaDiligenciamiento": "2025-11-08"
  },

  "rangoEtario": {
    "codigo": 60,
    "etiqueta": "Cinco años",
    "evaluacion_obligatoria": [
      "cuadro_hematico",
      "tsh_t4_libre",
      "radiografia_cervical",
      "tamizaje_celiaca",
      "vacunas_pai",
      "valoracion_oftalmologica",
      "valoracion_odontologica",
      "valoracion_pediatrica"
    ],
    "evaluacion_opcional": [
      "valoracion_endocrinologia",
      "polisomnograma",
      "valoracion_neuropediatrica"
    ],
    "evaluacion_no_indicada": [
      "tsh_nacer",
      "potenciales_auditivos",
      "rayos_x_cadera"
    ]
  },

  "evaluaciones": {
    "estadoActual": {
      "cariotipo": 2,
      "consultoria_genetica": 2,
      "tsh_nacer": 2,
      "cuadro_hematico": 2,
      "tsh_t4_libre": 1,
      "valoracion_endocrinologia": 0,
      "ecocardiograma": 2,
      "potenciales_auditivos": 2,
      "audiometria_impedanciometria": 0,
      "control_orl": 0,
      "polisomnograma": 1,
      "rayos_x_cadera": 1,
      "radiografia_cervical": 0,
      "tamizaje_celiaca": 1,
      "vacunas_pai": 2,
      "vacunas_no_pai": 2,
      "valoracion_oftalmologica": 2,
      "valoracion_odontologica": 2,
      "valoracion_pediatrica": 2,
      "valoracion_neuropediatrica": 1
    },

    "resumen": {
      "edadPaciente": {
        "años": 4,
        "meses": 5
      },
      "rangoEtario": "Cinco años",
      "totalEvaluaciones": 20,
      "noRealizadas": 4,
      "noDisponibles": 5,
      "realizadas": 11,
      "porcentajeCompletitud": 55
    },

    "fechaEvaluacion": "2025-11-08T15:22:10.456Z"
  },

  "cumplimiento": {
    "puntual": {
      "porcentaje": 75,
      "evaluacionesIndicadas": 8,
      "evaluacionesRealizadas": 6,
      "detalles": "Cumplimiento del grupo etario actual: Cinco años"
    },
    "global": {
      "porcentaje": 65,
      "totalObligatorias": 17,
      "totalRealizadas": 11,
      "detalles": "Cumplimiento acumulado desde el nacimiento"
    }
  },

  "historial": [
    {
      "fecha": "2025-11-08T14:30:45.123Z",
      "accion": "creacion_registro",
      "usuario": "Sistema",
      "detalles": "Registro inicial creado"
    },
    {
      "fecha": "2025-11-08T15:22:10.456Z",
      "accion": "actualizacion_registro",
      "usuario": "Sistema",
      "detalles": "Actualización de evaluaciones de cumplimiento"
    }
  ],

  "auditoria": {
    "creadoPor": "Sistema",
    "fechaCreacion": "2025-11-08T14:30:45.123Z",
    "ultimaModificacionPor": "Sistema",
    "fechaUltimaModificacion": "2025-11-08T15:22:10.456Z",
    "versionRegistro": 2
  }
}
```

### Archivo variables.json (Protocolo)

#### Estructura

```json
{
  "escala_edad": [
    {
      "codigo": 1,
      "etiqueta": "RN",
      "evaluacion_obligatoria": [
        "cariotipo",
        "consultoria_genetica",
        "tsh_nacer"
      ],
      "evaluacion_opcional": [],
      "evaluacion_no_indicada": []
    },
    {
      "codigo": 6,
      "etiqueta": "1 a 6 meses",
      "evaluacion_obligatoria": [
        "cuadro_hematico",
        "ecocardiograma",
        "vacunas_pai",
        "valoracion_pediatrica"
      ],
      "evaluacion_opcional": [
        "valoracion_oftalmologica"
      ],
      "evaluacion_no_indicada": [
        "tsh_nacer"
      ]
    }
    // ... resto de grupos etarios hasta código 216
  ],

  "intervenciones": {
    "cariotipo": {
      "1": "obligatoria",
      "6": "no_indicada",
      "12": "no_indicada",
      // ... (estado para cada grupo etario)
    },
    "cuadro_hematico": {
      "1": "no_indicada",
      "6": "obligatoria",
      "12": "obligatoria",
      // ...
    }
    // ... (todas las 20 evaluaciones)
  },

  "nombresEvaluaciones": {
    "cariotipo": "Cariotipo",
    "consultoria_genetica": "Consultoría Genética",
    "tsh_nacer": "TSH al Nacer",
    "cuadro_hematico": "Cuadro Hemático Completo y Frotis",
    "tsh_t4_libre": "TSH y T4 Libre",
    "valoracion_endocrinologia": "Valoración Endocrinología",
    "ecocardiograma": "Ecocardiograma",
    "potenciales_auditivos": "Potenciales Evocados Auditivos",
    "audiometria_impedanciometria": "Audiometría e Impedanciometría",
    "control_orl": "Control Otorrinolaringología",
    "polisomnograma": "Polisomnograma",
    "rayos_x_cadera": "Rayos X de Cadera",
    "radiografia_cervical": "Radiografía Dinámica Cervical",
    "tamizaje_celiaca": "Tamizaje Enfermedad Celíaca",
    "vacunas_pai": "Vacunas PAI",
    "vacunas_no_pai": "Vacunas No PAI",
    "valoracion_oftalmologica": "Valoración Oftalmológica",
    "valoracion_odontologica": "Valoración Odontológica",
    "valoracion_pediatrica": "Valoración Pediátrica",
    "valoracion_neuropediatrica": "Valoración Neuropediátrica"
  }
}
```

#### Códigos de Evaluación

**Claves de intervenciones:**
- `cariotipo`
- `consultoria_genetica`
- `tsh_nacer`
- `cuadro_hematico`
- `tsh_t4_libre`
- `valoracion_endocrinologia`
- `ecocardiograma`
- `potenciales_auditivos`
- `audiometria_impedanciometria`
- `control_orl`
- `polisomnograma`
- `rayos_x_cadera`
- `radiografia_cervical`
- `tamizaje_celiaca`
- `vacunas_pai`
- `vacunas_no_pai`
- `valoracion_oftalmologica`
- `valoracion_odontologica`
- `valoracion_pediatrica`
- `valoracion_neuropediatrica`

### SessionStorage

#### Entre formularios

**Clave: 'registroIdentificacion'**
```javascript
{
  paciente: { /* datos del paciente */ },
  acudiente: { /* datos del acudiente */ },
  protocolo: { /* datos del protocolo */ }
}
```

**Clave: 'registroArchivo'**
```javascript
"registro-a1b2c3d4-e5f6-7890-abcd-1234567890ef.json"
```

**Clave: 'estadosEvaluacionCargados'**
```javascript
{
  cariotipo: 2,
  consultoria_genetica: 2,
  tsh_nacer: 1,
  // ... estados de las 20 evaluaciones
}
```

**Clave: 'datosInforme'**
```javascript
{
  // Estructura completa del registro JSON
  // Usado para generar el informe PDF
}
```

---

## Resumen de Reglas de Negocio Clave

### 1. Cálculo de Edad

```
Entrada: fechaNacimiento, fechaReferencia
Salida: { años, meses }

Considera:
- Años completos
- Meses completos
- Ajuste por día del mes
```

### 2. Determinación de Grupo Etario

```
Entrada: { años, meses }
Proceso: Convertir a meses totales, aplicar tabla de rangos
Salida: { codigo, etiqueta }

El código determina qué evaluaciones aplican
```

### 3. Categorización de Evaluaciones

```
Obligatorias: Se cuentan en cumplimiento puntual
Opcionales: Se muestran pero no se cuentan
No Indicadas: Se ocultan en vista principal

Atrasadas: De grupos anteriores, no en categorías actuales
Vencidas: Ahora en "no indicada" pero antes estaban indicadas
```

### 4. Cumplimiento Puntual

```
Fórmula: (realizadas / obligatorias_grupo_actual) × 100
Solo considera grupo etario actual
Cambia al avanzar de grupo etario
```

### 5. Cumplimiento Global

```
Fórmula: (realizadas / todas_obligatorias_hasta_ahora) × 100
Considera historial completo desde nacimiento
Más estable que puntual
```

### 6. Estados de Evaluación

```
2 = Realizado (cuenta como cumplido)
1 = No Disponible (no cuenta como cumplido)
0 = No Realizado (no cuenta como cumplido)

Solo estado 2 incrementa cumplimiento
```

### 7. Recomendaciones del Informe

```
Prioridad 1: Pendientes del grupo actual (obligatorias no hechas)
Prioridad 2: Atrasadas (de grupos anteriores)
Prioridad 3: Siguientes (preparar para próximo grupo)
```

### 8. Persistencia

```
Nuevo registro: UUID nuevo, archivo nuevo
Actualización: Mismo UUID, mismo archivo, incrementar versión
Historial: Registrar cada operación con timestamp
```

---

## Glosario

**Grupo Etario:** Rango de edad que determina qué evaluaciones corresponden.

**Código de Grupo:** Número que identifica el grupo etario (generalmente el límite superior en meses).

**Evaluación Obligatoria:** Evaluación que DEBE hacerse en determinado grupo etario.

**Evaluación Opcional:** Evaluación recomendada pero no requerida.

**Evaluación No Indicada:** Evaluación que no corresponde a determinado grupo etario.

**Evaluación Atrasada:** Evaluación que debió hacerse en un grupo anterior y no se hizo.

**Evaluación Vencida:** Evaluación que ya no se puede hacer (pasó la ventana de edad).

**Cumplimiento Puntual:** Porcentaje de evaluaciones obligatorias completadas del grupo actual.

**Cumplimiento Global:** Porcentaje de todas las evaluaciones obligatorias completadas desde el nacimiento.

**Estado de Evaluación:** Indicador de si una evaluación fue realizada, no realizada, o no hay información disponible.

**UUID:** Identificador único universal para cada registro de paciente.

**SessionStorage:** Almacenamiento temporal del navegador para pasar datos entre pantallas.

---

**Fin del Documento**

---

*Este documento describe la lógica de negocio de la aplicación Cumplimiento Protocolo Down a alto nivel, enfocándose en los procesos, reglas y flujos de datos que implementan el protocolo médico pediátrico para pacientes con Síndrome de Down.*
