# TP 9: Diseño e implementación de base de datos para EnvíoYa

Este trabajo práctico aplica la metodología de diseño en tres pasos (Análisis de Workload, Cardinalidad y Patrones de Diseño) para migrar la base de datos de la empresa de logística **EnvíoYa** a MongoDB.

---

# Parte A: Diseño e implementación de la base de datos
## Ejercicio 1: Relevamiento del workload

Definimos las diez operaciones principales de la aplicación priorizadas por tipo de acceso y frecuencia estimada:

| Operación | Tipo | Frecuencia | Justificación |
| :--- | :--- | :--- | :--- |
| **1. Consultar estado y seguimiento de un envío** | Lectura | Muy alta | Consulta principal realizada de forma constante por los clientes desde la web o la app. |
| **2. Registrar nuevo envío de paquete** | Escritura | Alta | Ingesta continua de pedidos tanto de particulares como de empresas corporativas. |
| **3. Registrar lectura GPS o escaneo** | Escritura | Muy alta | Ingesta masiva y automatizada generada por sensores de vehículos y lectores en sucursales. |
| **4. Listar envíos pendientes en sucursal** | Lectura | Alta | Consulta operativa recurrente para coordinar el despacho y armado de rutas diarias. |
| **5. Asignar envío a repartidor y vehículo** | Escritura | Alta | Asignación previa a la salida a reparto en cada zona. |
| **6. Consultar historial de envíos de un cliente** | Lectura | Baja | Consulta administrativa o del usuario sobre despachos anteriores. |
| **7. Generar reporte de desempeño por sucursal** | Lectura | Baja | Proceso periódico de consolidación para medir tiempos promedio de entrega. |
| **8. Consolidar facturación mensual corporativa** | Lectura / Escritura | Baja | Proceso de lote ejecutado una vez al mes por cada cuenta corporativa. |
| **9. Actualizar datos de contacto del cliente** | Escritura | Muy baja | Modificación infrecuente de datos maestros de usuario. |
| **10. Dar de baja o suspender cliente** | Escritura | Muy baja | Acción administrativa ocasional por mora o cancelación de cuenta. |

---

## Ejercicio 2: Entidades, relaciones y cardinalidad

| Relación | Cardinalidad | Justificación |
| :--- | :--- | :--- |
| **Cliente a Envíos** | One-to-Many | Un cliente corporativo puede generar cientos de envíos diarios; un particular genera menos de uno al mes. |
| **Envío a Paquetes** | One-to-Few | Un envío contiene un número pequeño y acotado de bultos (generalmente entre 1 y 5). |
| **Envío a Eventos de Tracking** | One-to-Many / Squillions | Cada envío produce entre 8 y 15 eventos, pero se guardan de forma indefinida para auditoría. |
| **Repartidor a Rutas** | Many-to-Many | Un repartidor cubre diferentes rutas según el día y una misma ruta puede ser asignada a varios repartidores. |
| **Sucursal a Envíos** | One-to-Many | Una sucursal procesa e intermedia miles de envíos a lo largo de su operación. |

---

## Ejercicio 3: Árbol de decisión (Embedding vs. Referencing)

### 1. Envío a Paquetes
* **¿Se consultan juntos?** Sí. Al consultar el envío se necesita el detalle de los bultos.
* **¿Es un array ilimitado?** No, el array es acotado (One-to-Few).
* **¿Los paquetes son compartidos por varios envíos?** No.
* **Decisión:** **Embeber** como un array de subdocumentos en la colección `envios`.

### 2. Envío a Cliente (Remitente)
* **¿Se consultan juntos?** Sí, se requiere el nombre y contacto para efectuar la entrega.
* **¿El cliente es compartido por varias entidades?** Sí, un cliente corporativo genera miles de envíos.
* **¿Los datos del cliente cambian con frecuencia?** No, sus datos maestros son estables.
* **Decisión:** **Referenciar** por `clienteId`, aplicando el patrón Extended Reference (duplicando únicamente `nombre` y `email` en `clienteResumen`).

### 3. Envío a Eventos de seguimiento
* **¿Se consultan juntos?** La aplicación del cliente solo consulta los últimos movimientos, no todo el historial antiguo.
* **¿Es un array ilimitado?** Puede crecer indefinidamente si el envío se reintenta o se audita durante mucho tiempo.
* **Decisión:** **Referenciar / Patrón Subset**. Guardamos los últimos 3 eventos embebidos en el envío y el historial completo en la colección `eventos_seguimiento`.

### 4. Repartidor a Rutas
* **¿Es una relación compartida?** Sí, es una relación Many-to-Many.
* **Decisión:** **Referenciar** mediante un array de identificadores de rutas dentro de la colección `repartidores`.

---

## Ejercicio 4: Patrones de diseño aplicados

1. **Extended Reference:** En la colección `envios` duplicamos el nombre y el contacto del cliente y del repartidor. Así evitamos hacer un `$lookup` cada vez que alguien consulta el tracking público.
2. **Subset:** Embebemos un array con los últimos 3 eventos en el documento del envío para resolver la vista del cliente con una sola lectura.
3. **Attribute:** En los paquetes del envío, las características variables (como tipo, fragilidad o dimensiones) se guardan en un array de pares clave/valor `{ k: "atributo", v: "valor" }`.
4. **Bucket:** Los registros detallados de telemetría GPS y escaneos de tracking se agrupan en lotes dentro de la colección `eventos_seguimiento`.

---

## Ejercicio 5: Esquema completo de las colecciones

A continuación se presentan los documentos JSON de ejemplo que estructuran cada una de las colecciones de la base de datos `envioya`:

### Colección `clientes`
```json
{
  "_id": "CLI-001",
  "nombre": "Logística Cuyo S.A.",
  "email": "contacto@cuyo.com",
  "tipoCliente": "Corporativo"
}
```
### Colección sucursales
```JSON
{
  "_id": "SUC-001",
  "nombre": "Central Mendoza",
  "ciudad": "Mendoza"
}
```

### Colección repartidores
```JSON
{
  "_id": "REP-001",
  "nombre": "Juan Pérez",
  "vehiculo": "Camioneta Renault Kangoo",
  "activo": true
}
```

### Colección envios
```JSON
{
  "_id": "ENV-1001",
  "codigoSeguimiento": "EY-2026-001",
  "clienteId": "CLI-001",
  "clienteResumen": {
    "nombre": "Logística Cuyo S.A.",
    "email": "contacto@cuyo.com"
  },
  "repartidorId": "REP-001",
  "repartidorResumen": {
    "nombre": "Juan Pérez"
  },
  "sucursalOrigenId": "SUC-001",
  "estado": "En Reparto",
  "costoTotal": 12500,
  "paquetes": [
    {
      "bulto": 1,
      "pesoKg": 2.5,
      "caracteristicas": [
        { "k": "fragilidad", "v": "alta" }
      ]
    }
  ],
  "eventosRecientes": [
    { "fecha": "2026-10-10 08:00", "estado": "Despachado", "ubicacion": "Sucursal Central Mendoza" },
    { "fecha": "2026-10-10 10:30", "estado": "En Reparto", "ubicacion": "En camino a domicilio" }
  ]
}
```
### Colección eventos_seguimiento
```JSON
{
  "_id": ObjectId("6527a1b2c3d4e5f6a7b8c9d0"),
  "envioId": "ENV-1001",
  "evento": "Salida a reparto",
  "fecha": "2026-10-10 10:30"
}
```
---

## Ejercicio 6: Validación con JSON Schema
Definimos los validadores $jsonSchema para garantizar la integridad de los datos en las colecciones críticas:

```JavaScript
// Validador para la colección de clientes
db.createCollection("clientes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "email", "tipoCliente"],
      properties: {
        nombre: { bsonType: "string" },
        email: { bsonType: "string" },
        tipoCliente: { enum: ["Particular", "Corporativo"] }
      }
    }
  }
});

// Validador para la colección de envíos
db.createCollection("envios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["codigoSeguimiento", "clienteId", "estado", "costoTotal"],
      properties: {
        codigoSeguimiento: { bsonType: "string" },
        clienteId: { bsonType: "string" },
        estado: { 
          enum: ["Pendiente", "En Transito", "En Sucursal", "En Reparto", "Entregado", "Incidencia"] 
        },
        costoTotal: { bsonType: ["int", "double", "decimal"], minimum: 0 }
      }
    }
  }
});
```
---

## Ejercicio 7: Antipatrones evitados

Evitamos el antipatrón de **Arrays ilimitados (Massive Arrays)** al no guardar el historial completo de eventos dentro del documento principal del envío. De esa forma prevenimos sobrepasar el límite BSON de 16 MB. También evitamos el **Abuso de `$lookup`** aplicando el patrón Extended Reference sobre datos de baja variabilidad, como nombres de clientes y repartidores.

---

## Ejercicio 8: Implementación y consultas de negocio

### Consultas de prueba ejecutadas

#### Consulta 1: Envíos activos de un cliente
```javascript
db.envios.find(
  { clienteId: "CLI-001", estado: { $ne: "Entregado" } },
  { codigoSeguimiento: 1, estado: 1, costoTotal: 1, "repartidorResumen.nombre": 1, _id: 0 }
);
```

<img width="1098" height="346" alt="image" src="https://github.com/user-attachments/assets/21d9a906-b645-4bf3-98a5-4e58007fafa4" />

---

#### Consulta 2: Repartidor con más envíos asignados
```javascript
db.envios.aggregate([
  { $group: { _id: "$repartidorResumen.nombre", totalEnvios: { $sum: 1 } } },
  { $sort: { totalEnvios: -1 } },
  { $limit: 1 }
]);
```
<img width="1102" height="117" alt="image" src="https://github.com/user-attachments/assets/5888c6f4-95cb-4a85-a216-cb645b0f3243" />

---

#### Consulta 3: Facturación acumulada por cliente corporativo
```javascript
db.envios.aggregate([
  { $match: { estado: { $in: ["Entregado", "En Reparto", "En Transito"] } } },
  { 
    $group: { 
      _id: "$clienteResumen.nombre", 
      totalFacturado: { $sum: "$costoTotal" },
      promedioPorEnvio: { $avg: "$costoTotal" }
    } 
  }
]);
```

<img width="1093" height="323" alt="image" src="https://github.com/user-attachments/assets/ecae790a-a3b6-4e83-8177-e76a6be84549" />

---

#### Consulta 4: Tracking usando el patrón Subset
```javascript
db.envios.find(
  { codigoSeguimiento: "EY-2026-001" },
  { codigoSeguimiento: 1, estado: 1, eventosRecientes: 1, _id: 0 }
);
```
<img width="1084" height="327" alt="image" src="https://github.com/user-attachments/assets/8b19409b-b29b-4790-a5a8-443ef32eddc8" />

---

#### Consulta 5: Envíos procesados por sucursal de origen
```javascript
db.envios.aggregate([
  {
    $lookup: {
      from: "sucursales",
      localField: "sucursalOrigenId",
      foreignField: "_id",
      as: "datosSucursal"
    }
  },
  { $unwind: "$datosSucursal" },
  {
    $group: {
      _id: "$datosSucursal.nombre",
      cantidadProcesada: { $sum: 1 }
    }
  }
]);
```
<img width="1105" height="99" alt="image" src="https://github.com/user-attachments/assets/3d79316f-bd09-4a32-a2ca-6c508417d7d4" />

---


# Parte B: Preguntas teóricas integradoras

## B.1 JSON y modelado de documentos

### 1. Diferencia entre JSON y BSON
JSON es un formato de texto plano pensado para intercambiar datos, pero se limita a tipos básicos como cadenas, números, booleanos, objetos y arrays. BSON es la representación binaria que usa MongoDB internamente para almacenar y procesar documentos de forma rápida. BSON agrega tipos de datos como `ObjectId`, `Date` y `Decimal128`. Esta diferencia es determinante al diseñar un esquema porque permite realizar operaciones numéricas de alta precisión y filtros eficientes por fecha directamente en el motor de la base de datos.

### 2. Criterio general para decidir entre embeber y referenciar
La decisión depende de cómo la aplicación accede a los datos. Se prefiere embeber cuando los datos relacionados se consultan juntos de forma habitual y la relación es acotada (One-to-Few). Se prefiere referenciar cuando los subdocumentos pertenecen a entidades con ciclo de vida independiente, cuando la relación puede crecer sin límite (One-to-Many o One-to-Squillions), o cuando el registro es compartido por varios documentos distinto.

### 3. Antipatrón de array ilimitado (Massive array)
Aparece cuando se agregan subdocumentos de forma continua dentro de un array sin poner un límite máximo de elementos. Esto impacta en el rendimiento de lectura y escritura a medida que el array crece y puede provocar que el documento supere el límite físico de 16 MB de MongoDB, lo que rechaza cualquier nueva escritura.

---

## B.2 JSON Schema y validación

### 4. Problema que resuelve JSON Schema
JSON no impone reglas sobre qué claves o valores debe contener un objeto. JSON Schema soluciona esa falta de estructura permitiendo definir un contrato de datos en el servidor (campos obligatorios, tipos de datos, valores permitidos y rangos). De este modo se evita que entren datos corruptos o incompletos a la base de datos.

### 5. Diferencias entre JSON Schema estándar y el validator de MongoDB
1. MongoDB incorpora la clave `bsonType` en lugar del `type` tradicional para validar tipos de datos específicos de BSON como `objectId`, `date` o `decimal`.
2. La validación se ejecuta directamente en el motor de almacenamiento de MongoDB al definir la colección con el operador `$jsonSchema`.

### 6. `validationAction: "error"` vs. `validationAction: "warn"`
Con `"error"`, el motor rechaza de inmediato cualquier documento que no cumpla las reglas de validación. Con `"warn"`, el documento se guarda igual, pero el servidor registra una advertencia en sus logs. El modo `"warn"` es útil al migrar sistemas en producción donde se necesita auditar datos inconsistentes sin interrumpir la operación.

---

## B.3 Mongo Shell y Compass

### 7. Comportamiento de `use` y `show dbs`
MongoDB aplica creación perezosa (*lazy creation*). El comando `use` posiciona el contexto en una base de datos, pero los archivos en disco se generan recién al realizar la primera operación de escritura (`insertOne` o `createCollection`). Por eso `show dbs` ignora las bases de datos vacías.

### 8. Compass vs. Mongo Shell
* **Compass es mejor para:**
  1. Explorar estructuras de documentos anidados y validar esquemas visualmente.
  2. Diseñar pipelines de agregación paso a paso con vista previa en tiempo real.
* **Mongo Shell es mejor para:**
  1. Correr scripts de automatización o cargas masivas de datos.
  2. Administrar servidores remotos o entornos donde no hay interfaz gráfica.

### 9. Información del comando `db.stats()`
Muestra métricas generales de la base de datos: cantidad de colecciones, total de documentos, espacio ocupado en disco, tamaño gastado en índices y el promedio de peso por documento.

---

## B.4 Operaciones de alta

### 10. `insertMany()` con `ordered: true` vs. `ordered: false`
En modo `ordered: true` (comportamiento por defecto), MongoDB procesa el lote en orden correlativo y se detiene ante el primer error de clave duplicada (`E11000`), dejando sin insertar los registros siguientes. En modo `ordered: false`, el motor intenta insertar todos los documentos del lote sin importar los fallos puntuales, omitiendo los duplicados y reportando los errores al finalizar el proceso.

### 11. Write Concern (`w: 1` vs. `w: "majority"`)
El *write concern* establece cuántos nodos deben confirmar una escritura para considerarla exitosa. `w: 1` se conforma con la respuesta del nodo primario. `w: "majority"` exige que la mayoría de los nodos del replica set confirmen la operación antes de dar el OK. En un servidor standalone de desarrollo no hay diferencia práctica, pero en producción con replica set evita perder datos si el primario se cae antes de replicar.

### 12. Estructura de un `ObjectId`
Es una clave única de 12 bytes formada por:
1. **4 bytes:** Marca de tiempo (*timestamp*) con la fecha exacta de creación.
2. **5 bytes:** Identificador aleatorio único generado por proceso y máquina.
3. **3 bytes:** Contador incremental inicializado al azar.

---

## B.5 CRUD y consultas

### 13. Riesgo de `updateOne()` sin `$set`
Si se pasa un documento simple como segundo argumento sin usar `$set`, MongoDB reemplaza todo el documento original por ese nuevo objeto, borrando todos los campos que no hayan sido incluidos. Es un error frecuente en quien llega desde bases relacionales pensando que funciona como un `UPDATE ... SET`.

### 14. Opción `{ upsert: true }`
Evalúa la condición del filtro: si encuentra un documento coincidente, lo actualiza; si no existe ninguno, crea un documento nuevo combinando las claves del filtro con la instrucción del update. Se aplica en casos como actualizar contadores o inventarios diarios donde el registro inicial puede no existir todavía.

### 15. `$lookup` vs. Patrón Extended Reference
`$lookup` hace una combinación (*join*) en tiempo de ejecución entre colecciones. Conviene reemplazarlo por el patrón Extended Reference en consultas muy frecuentes sobre datos que cambian poco (como incluir el nombre del cliente dentro del envío), evitando el costo de cómputo del join en cada lectura.

### 16. Índices compuestos vs. dos índices simples
Un índice compuesto guarda el orden combinado de dos o más campos dentro del mismo árbol B. Es necesario cuando las consultas filtran y ordenan por esa combinación específica de campos. Dos índices simples individuales no pueden sustituir a un índice compuesto para resolver esa ordenación conjunta.

### 17. Transacciones multi-documento
Garantizan atomicidad en operaciones que involucran modificar múltiples documentos o colecciones (se confirman todas las escrituras o se revierten todas). Exigen que la instancia del servidor corra configurada como un Replica Set o un clúster sharded.

---

## B.6 Diseño de bases de datos en MongoDB

### 18. "Los datos que se usan juntos, se guardan juntos"
Este principio busca resolver la consulta más frecuente de la aplicación leyendo la menor cantidad de documentos posible. A diferencia del modelo relacional, que busca eliminar toda redundancia normalizando tablas a costa de hacer joins, MongoDB prioriza el rendimiento de lectura permitiendo cierta duplicación de datos cuando el caso de uso lo justifica.

### 19. Pasos del método de diseño
1. **Describir el workload:** ¿Qué consultas y escrituras hace la aplicación, con qué frecuencia y prioridad?
2. **Mapear relaciones:** ¿Cómo se conectan las entidades y qué cardinalidad tienen (1:1, 1:N, N:M)?
3. **Aplicar patrones de diseño:** ¿Conviene embeber, referenciar o usar un patrón específico (Subset, Attribute, etc.) para cada colección?
### 20. Dos patrones de diseño del catálogo
* **Patrón Computed (Valores precalculados):** En un catálogo de productos se guarda el promedio de valoraciones y el total de reseñas directamente en el producto. Se recalcula solo al cargar una opinión nueva, evitando promediar miles de filas en cada visita.
* **Patrón Polymorphic (Polimórfico):** En un sistema de cobros se guardan distintos métodos de pago (tarjetas, transferencias, billeteras virtuales) dentro de una misma colección `medios_pago`, diferenciando sus campos mediante la clave `tipo`.

### 21. Tres antipatrones de diseño
1. **Massive Arrays:** Acumular listas sin límite degrada el tiempo de respuesta y arriesga superar los 16 MB por documento.
2. **Abuso de `$lookup`:** Abusar de joins en lecturas de alta frecuencia sobrecarga el procesador del servidor.
3. **Bloat de documentos:** Almacenar históricos viejos o datos sin uso en el documento activo encarece cada lectura innecesariamente.

### 22. Límites técnicos que condicionan el diseño
* **Tamaño máximo de documento (16 MB):** Impide guardar colecciones completas o arrays sin cota dentro de un solo documento.
* **Límite de índices por colección (64):** Evita crear índices "por las dudas" y obliga a indexar solo los campos requeridos por el workload.
