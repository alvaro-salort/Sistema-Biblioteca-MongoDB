Este módulo continúa el desarrollo del sistema de gestión de biblioteca, incorporando dos nuevas colecciones (`socios` y `prestamos`) bajo un modelo referenciado. Profundiza en operadores lógicos, manipulación avanzada de arrays, actualizaciones condicionales (*upsert*), paginación y optimización mediante índices.

---

## 1: Creación de las colecciones relacionadas (`socios` y `prestamos`)

Ampliamos el modelo relacional incorporando la colección de socios y la colección de préstamos, vinculadas mediante identificadores (`_id`) de forma referenciada.

```javascript
// 1. Alta masiva de socios (al menos 6 documentos)
db.socios.insertMany([
  { _id: "S-001", nombre: "Martin Pereyra", email: "martin.pereyra@correo.com", librosFavoritos: ["L-0001", "L-0007"], activo: true },
  { _id: "S-002", nombre: "Lucía Fernández", email: "lucia.fernandez@correo.com", librosFavoritos: ["L-0002"], activo: true },
  { _id: "S-003", nombre: "Carlos Gómez", email: "carlos.gomez@correo.com", librosFavoritos: ["L-0005", "L-0008"], activo: true },
  { _id: "S-004", nombre: "Ana Torres", email: "ana.torres@correo.com", librosFavoritos: [], activo: false },
  { _id: "S-005", nombre: "Diego Ruarte", email: "diego.ruarte@correo.com", librosFavoritos: ["L-0003"], activo: true },
  { _id: "S-006", nombre: "Sofía Benítez", email: "sofia.benitez@correo.com", librosFavoritos: ["L-0004", "L-0010"], activo: true }
]);
```
<img width="1090" height="211" alt="image" src="https://github.com/user-attachments/assets/706e3d10-2b91-44a5-a571-ac6676c9c176" />

```javascript
// 2. Alta masiva de préstamos (combinando activos y devueltos)
db.prestamos.insertMany([
  { _id: "PR-0001", socioId: "S-001", libroId: "L-0001", fechaPrestamo: "2026-03-01", fechaDevolucion: null, devuelto: false },
  { _id: "PR-0002", socioId: "S-002", libroId: "L-0002", fechaPrestamo: "2026-03-05", fechaDevolucion: "2026-03-15", devuelto: true },
  { _id: "PR-0003", socioId: "S-003", libroId: "L-0005", fechaPrestamo: "2026-03-10", fechaDevolucion: null, devuelto: false },
  { _id: "PR-0004", socioId: "S-001", libroId: "L-0007", fechaPrestamo: "2026-03-12", fechaDevolucion: "2026-03-20", devuelto: true },
  { _id: "PR-0005", socioId: "S-005", libroId: "L-0003", fechaPrestamo: "2026-04-01", fechaDevolucion: null, devuelto: false },
  { _id: "PR-0006", socioId: "S-006", libroId: "L-0004", fechaPrestamo: "2026-04-02", fechaDevolucion: "2026-04-10", devuelto: true },
  { _id: "PR-0007", socioId: "S-002", libroId: "L-0008", fechaPrestamo: "2026-04-05", fechaDevolucion: null, devuelto: false },
  { _id: "PR-0008", socioId: "S-004", libroId: "L-0009", fechaPrestamo: "2026-04-06", fechaDevolucion: "2026-04-12", devuelto: true },
  { _id: "PR-0009", socioId: "S-003", libroId: "L-0010", fechaPrestamo: "2026-04-11", fechaDevolucion: null, devuelto: false },
  { _id: "PR-0010", socioId: "S-005", libroId: "L-0011", fechaPrestamo: "2026-04-15", fechaDevolucion: "2026-04-22", devuelto: true }
]);

```

<img width="1093" height="283" alt="image" src="https://github.com/user-attachments/assets/44499441-1718-490e-a10b-caa2bb4cd8eb" />

---

## 2: Consultas con operadores lógicos (`$and`, `$or`, `$in`)

Implementamos filtros avanzados combinando condiciones lógicas sobre la colección de libros.


```javascript
// (a) Libros del género "Novela" publicados después de 1990 utilizando $and
db.libros.find({
  $and: [
    { genero: "Novela" },
    { anioPublicacion: { $gt: 1990 } }
  ]
});
```
<img width="1099" height="329" alt="image" src="https://github.com/user-attachments/assets/c0cea103-a904-47aa-828f-4a3be91a2037" />


```javascript
// (b) Libros cuyo género sea "Novela" o "Poesía" utilizando $or
db.libros.find({
  $or: [
    { genero: "Novela" },
    { genero: "Poesía" }
  ]
});
```
<img width="1090" height="591" alt="image" src="https://github.com/user-attachments/assets/8054e037-770d-4c8a-a5f6-6e0f1ad41250" />


```javascript
// (c) El mismo resultado anterior utilizando $in
db.libros.find({
  genero: { $in: ["Novela", "Poesía"] }
});

```

<img width="1090" height="649" alt="image" src="https://github.com/user-attachments/assets/7ab701f6-2a1e-459c-b957-2bbb44027a33" />


### ¿Cuándo usar `$or` o `$in`?

* Conviene utilizar **`$in`** cuando estamos evaluando múltiples valores posibles sobre un **mismo campo**, ya que la sintaxis es más limpia, legible y optimizable por el motor de MongoDB.
* Conviene utilizar **`$or`** cuando necesitamos evaluar condiciones totalmente distintas sobre **campos diferentes** (por ejemplo: buscar libros del género Novela O que tengan más de 5 ejemplares).

---

## 3: Préstamos activos con `$exists`

Consultamos registros utilizando operadores de existencia sobre campos opcionales o nulos.


```javascript
// Variante 1: Utilizando el operador $exists para buscar documentos donde fechaDevolucion no esté presente o sea ausente
db.prestamos.find({ fechaDevolucion: { $exists: false } });

// Variante 2: Filtrando de manera equivalente comparando contra null (préstamos activos)
db.prestamos.find({ fechaDevolucion: null });

```

<img width="1092" height="589" alt="image" src="https://github.com/user-attachments/assets/368df471-c1ba-47fb-8b55-68167782398f" />


### Validación

Ambas variantes devuelven el mismo conjunto de resultados lógicos cuando los documentos incompletos almacenan explícitamente el valor `null` o carecen del campo, aunque `$exists` evalúa estrictamente la presencia estructural de la clave en el documento BSON.

---

## 4: Actualización de arrays (`$addToSet`, `$pull`, `$inc`)

Manipulamos colecciones anidadas y campos numéricos incrementales de forma atómica.

```javascript
// (a) Agregar un libro favorito mediante $addToSet (evita duplicados si ya existía)
db.socios.updateOne(
  { _id: "S-001" },
  { $addToSet: { librosFavoritos: "L-0012" } }
);
```
<img width="1103" height="211" alt="image" src="https://github.com/user-attachments/assets/c8349281-b180-49d0-8e78-abf909fe2ef0" />


```javascript
// Repetimos la operación para comprobar que no se duplica el elemento
db.socios.updateOne(
  { _id: "S-001" },
  { $addToSet: { librosFavoritos: "L-0012" } }
);
```
<img width="1109" height="212" alt="image" src="https://github.com/user-attachments/assets/058e5362-6a48-4acd-b30a-d5e850ad7780" />


```javascript
// (b) Quitar un libro favorito utilizando $pull
db.socios.updateOne(
  { _id: "S-001" },
  { $pull: { librosFavoritos: "L-0007" } }
);
```
<img width="1105" height="216" alt="image" src="https://github.com/user-attachments/assets/7807acd3-b27b-4136-bd12-b28f1f26b3a2" />


```javascript
// (c) Incrementar en 1 el contador de préstamos históricos usando $inc (lo crea si no existe)
db.socios.updateOne(
  { _id: "S-001" },
  { $inc: { cantidadPrestamosHistoricos: 1 } }
);

```
<img width="1105" height="212" alt="image" src="https://github.com/user-attachments/assets/27c64ec9-8bc6-4b0b-8286-43dab07dd32e" />


---

## 5: Upsert (Crear o actualizar en una sola operación)

Implementamos una inserción condicional automatizada mediante la opción `upsert: true`.

```javascript
// Registro de un nuevo préstamo combinando socioId y libroId
db.prestamos.updateOne(
  { socioId: "S-006", libroId: "L-0005" },
  { 
    $set: { fechaPrestamo: "2026-05-01", devuelto: false },
    $setOnInsert: { _id: "PR-0011", fechaDevolucion: null }
  },
  { upsert: true }
);

```

<img width="1091" height="404" alt="image" src="https://github.com/user-attachments/assets/deed0c25-885e-489c-bae8-9474a06b4457" />


### Explicación:

* **Primera ejecución:** Como no existe ningún documento que cumpla con el filtro exacto (`socioId` y `libroId`), MongoDB interpreta la orden `upsert: true`, combina el filtro con los datos de actualización y **crea un documento nuevo**.

* **Segunda ejecución:** Al encontrar un documento preexistente que coincide con el filtro, el motor omite los datos de inserción y se limita exclusivamente a **actualizar** los campos provistos en `$set`.

---

## 6: Proyección, orden y paginación

Controlamos la forma de la salida de datos combinando restricciones de campos, ordenamientos y saltos de cursor.

```javascript
// Simulación de paginación de a 3 elementos (Página 1: skip(0))
db.libros.find(
  { genero: "Novela" },
  { titulo: 1, autor: 1, _id: 0 }
)
.sort({ titulo: 1 })
.limit(3)
.skip(0);

// Simulación de paginación (Página 2: skip(3))
db.libros.find(
  { genero: "Novela" },
  { titulo: 1, autor: 1, _id: 0 }
)
.sort({ titulo: 1 })
.limit(3)
.skip(3);

```
<img width="1095" height="78" alt="image" src="https://github.com/user-attachments/assets/8b7148c0-f3e8-4694-93a9-7b485e6adeca" />


---

## 7: Índices y su efecto en el rendimiento (`explain`)

Creamos estructuras auxiliares de indexación compuesta y evaluamos su impacto operativo mediante el plan de ejecución.


```javascript
// 1. Análisis antes de crear el índice (ejecutando explain con executionStats)
db.prestamos.find({ socioId: "S-001", devuelto: false }).explain("executionStats");

// 2. Creación del índice compuesto
db.prestamos.createIndex({ socioId: 1, devuelto: -1 });

// 3. Análisis posterior con explain para verificar la mejora
db.prestamos.find({ socioId: "S-001", devuelto: false }).explain("executionStats");

```
<img width="1069" height="114" alt="image" src="https://github.com/user-attachments/assets/cf81649f-6977-4d2d-a5ae-32936fea1160" />


### Análisis del Plan de Ejecución

* **Antes del índice:** La consulta genera un barrido completo de la colección de tipo **`COLLSCAN`** (*Collection Scan*), inspeccionando documento por documento en disco. El parámetro `totalDocsExamined` arroja un valor igual al total de registros de la colección.
* **Después del índice:** El motor optimiza la consulta utilizando un escaneo de índice de tipo **`IXSCAN`** (*Index Scan*). Gracias al índice compuesto, el valor de `totalDocsExamined` se reduce drásticamente al mínimo necesario, mejorando de forma notable el rendimiento de lectura.



```

```
