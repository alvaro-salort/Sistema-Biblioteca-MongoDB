
Este módulo cierra la secuencia integradora del sistema de biblioteca. Incorpora herramientas avanzadas de MongoDB: el *Aggregation Framework* para reportes estadísticos, el operador `$lookup` para resolver uniones (*joins*) entre colecciones relacionadas, índices de texto para búsquedas por contenido libre y transacciones multi-documento para garantizar la atomicidad en operaciones complejas.

---

## 1: Estadísticas por género con `$group`

Construimos un pipeline de agregación sobre la colección `libros` para calcular métricas agrupadas por género.

```javascript
db.libros.aggregate([
  {
    $group: {
      _id: "$genero",
      cantidadLibros: { $sum: 1 },
      promedioEjemplares: { $avg: "$ejemplaresDisponibles" }
    }
  },
  {
    $sort: { cantidadLibros: -1 }
  }
]);

```
<img width="1064" height="268" alt="image" src="https://github.com/user-attachments/assets/d3e03c8f-7f9a-4ca3-a71f-2d3568e0f4e5" />


### Explicación

* **Etapa `$group`:** Agrupa los documentos tomando como clave el campo `genero`. Calcula el acumulador `$sum: 1` para contar los libros de cada categoría y `$avg` para obtener el promedio de ejemplares disponibles.

* **Etapa `$sort`:** Ordena de forma descendente (`-1`) los resultados en función de la cantidad total de libros por género.

---

## 2: Reporte de préstamos por socio con `$lookup` y `$unwind`

Combinamos colecciones relacionadas mediante operaciones de *join* lógico para unificar la información de préstamos, socios y libros.

```javascript
db.prestamos.aggregate([
  {
    $lookup: {
      from: "socios",
      localField: "socioId",
      foreignField: "_id",
      as: "socio"
    }
  },
  { $unwind: "$socio" },
  {
    $lookup: {
      from: "libros",
      localField: "libroId",
      foreignField: "_id",
      as: "libro"
    }
  },
  { $unwind: "$libro" },
  {
    $project: {
      _id: 0,
      nombreSocio: "$socio.nombre",
      tituloLibro: "$libro.titulo",
      fechaPrestamo: 1,
      devuelto: 1
    }
  }
]);

```
<img width="1079" height="630" alt="image" src="https://github.com/user-attachments/assets/ce580940-3d41-470e-85f8-4136dd3af9be" />


### Explicación

* **`$lookup` y `$unwind`:** Como `$lookup` siempre devuelve un array (aunque haya una única coincidencia), utilizamos `$unwind` inmediatamente después para desanidar el resultado y trabajar directamente con el objeto relacionado. Repetimos el proceso tanto para la colección `socios` como para `libros`.


* **`$project`:** Modifica la estructura de salida para mostrar etiquetas claras y ocultar identificadores internos innecesarios.



---

## 3: Ranking de socios más activos

Diseñamos un pipeline para identificar a los socios con mayor cantidad de préstamos registrados.

### Comandos ejecutados

```javascript
db.prestamos.aggregate([
  {
    $group: {
      _id: "$socioId",
      totalPrestamos: { $sum: 1 }
    }
  },
  {
    $sort: { totalPrestamos: -1 }
  },
  {
    $limit: 3
  },
  {
    $lookup: {
      from: "socios",
      localField: "_id",
      foreignField: "_id",
      as: "datosSocio"
    }
  },
  { $unwind: "$datosSocio" },
  {
    $project: {
      _id: 0,
      socio: "$datosSocio.nombre",
      totalPrestamos: 1
    }
  }
]);

```
<img width="1081" height="100" alt="image" src="https://github.com/user-attachments/assets/bcdcf983-a7aa-4d33-b1bb-fe4ca108ff08" />


### Explicación

Agrupamos los préstamos por identificador de socio contando las ocurrencias con `$sum`, ordenamos de mayor a menor (`$sort`), filtramos únicamente los primeros 3 registros (`$limit`) y finalmente realizamos un `$lookup` con la colección `socios` para recuperar el nombre legible del usuario.

---

## 4: Libros nunca prestados

Identificamos los ejemplares del catálogo que no registran ningún movimiento de préstamo histórico.

```javascript
db.libros.aggregate([
  {
    $lookup: {
      from: "prestamos",
      localField: "_id",
      foreignField: "libroId",
      as: "historialPrestamos"
    }
  },
  {
    $match: {
      historialPrestamos: { $size: 0 }
    }
  },
  {
    $project: {
      _id: 1,
      titulo: 1,
      autor: 1,
      genero: 1
    }
  }
]);

```

<img width="1088" height="369" alt="image" src="https://github.com/user-attachments/assets/86c19f21-0a79-46f9-9514-33eab7bd60fb" />


### Justificación de la estrategia

Utilizamos `$lookup` para cruzar cada libro con la colección `prestamos`. Mediante la etapa `$match` combinada con el operador `$size: 0`, filtramos aquellos documentos cuyo array de historial resultante esté vacío, garantizando que seleccionamos estrictamente los libros que jamás fueron prestados.

---

## 5: Búsqueda de texto libre

Implementamos un índice de texto para realizar consultas de contenido flexible sobre los campos de la colección `libros`.

### Comandos ejecutados

```javascript
// 1. Creación del índice de texto
db.libros.createIndex({ titulo: "text", autor: "text" });

// 2. Búsqueda por autor específico
db.libros.find({ $text: {$search: "Orwell" } });
```
<img width="1096" height="291" alt="image" src="https://github.com/user-attachments/assets/d97f8ef3-ef7a-452a-b220-d517d26fca66" />


```javascript
// 3. Búsqueda por una palabra clave del título
db.libros.find({ $text: {$search: "Soledad" } });

// 4. Búsqueda combinada de términos múltiples
db.libros.find({ $text: {$search: "García Márquez Novela" } });
```
<img width="1101" height="461" alt="image" src="https://github.com/user-attachments/assets/cbc348db-9096-41f6-a5f2-d9fd7cb7439e" />


### Explicación

El índice de texto optimiza la búsqueda por palabras clave sin requerir coincidencias exactas ni expresiones regulares complejas, aplicando un análisis léxico automático (reconocimiento de términos, derivaciones y relevancia).

---

## 6: Transacción de préstamo multi-documento

Implementamos una operación atómica que involucra actualizaciones concurrentes en distintas colecciones.

### Comandos ejecutados

```javascript
const session = db.getMongo().startSession();
session.startTransaction();

try {
  const libros = session.getDatabase("biblioteca").libros;
  const prestamos = session.getDatabase("biblioteca").prestamos;

  // 1. Decrementar la disponibilidad del libro
  libros.updateOne(
    { _id: "L-0005", ejemplaresDisponibles: { $gt: 0 } },     {$inc: { ejemplaresDisponibles: -1 } }
  );

  // 2. Registrar el documento de préstamo
  prestamos.insertOne({
    _id: "PR-0015",
    socioId: "S-001",
    libroId: "L-0005",
    fechaPrestamo: "2026-05-20",
    fechaDevolucion: null,
    devuelto: false
  });

  session.commitTransaction();
  print("Transacción confirmada exitosamente.");
} catch (error) {
  session.abortTransaction();
  print("Transacción revertida por error: " + error);
} finally {
  session.endSession();
}

```

<img width="1099" height="219" alt="image" src="https://github.com/user-attachments/assets/b2aa45a9-ecea-4a9f-b996-99fec3807825" />


### Consideración técnica sobre réplicas (*Replica Set*)

Las transacciones multi-documento en MongoDB exigen que la instancia del servidor esté configurada como un conjunto de réplicas (*replica set*) o clúster *sharded*. En un entorno local de nodo único (*standalone*), la ejecución de transacciones arrojará una excepción a nivel de motor, siendo obligatorio documentar el comportamiento conceptual o habilitar un clúster de nodo único de prueba.

---

## 7: Caso integrador final (Reporte de negocio)

Diseñamos un pipeline analítico avanzado para responder una pregunta de negocio real de la biblioteca.

> **Pregunta de negocio:** *¿Cuáles son los 3 géneros literarios que concentran la mayor cantidad de ejemplares disponibles en el inventario actual para orientar futuras compras?*

```javascript
db.libros.aggregate([
  {
    $group: {
      _id: "$genero",
      stockTotal: { $sum: "$ejemplaresDisponibles" },
      titulosDisponibles: { $sum: 1 }     }   },   {$sort: { stockTotal: -1 }
  },
  {
    $limit: 3   },   {$project: {
      _id: 0,
      generoLiterario: "$_id",
      stockTotalEjemplares: "$stockTotal",
      cantidadTitulos: "$titulosDisponibles"
    }
  }
]);

```
<img width="1092" height="326" alt="image" src="https://github.com/user-attachments/assets/db327f46-2ce8-4683-9c81-b7d0cdaa285d" />


### Interpretación de resultados

El reporte procesa de manera automatizada todo el catálogo agrupando por categoría, sumando el stock físico y contabilizando la diversidad de títulos. Permite a la administración identificar de un vistazo qué géneros poseen mayor cobertura de ejemplares físicos y cuáles requieren refuerzo de adquisición, cerrando con éxito el ciclo de gestión de bases de datos avanzadas.
