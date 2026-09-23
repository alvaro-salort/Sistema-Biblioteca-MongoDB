Este módulo da inicio al proyecto integrador de la cursada, implementando la creación de la base de datos `biblioteca`, la colección `libros` y el ciclo CRUD completo (Create, Read, Update, Delete) utilizando operaciones elementales.

---

## 1: Creación de la base de datos y la colección

Seleccionamos o creamos la base de datos `biblioteca` e insertamos el primer ejemplar utilizando el método `insertOne()`.

```javascript
use biblioteca;

db.libros.insertOne({
  _id: "L-0001",
  titulo: "Cien años de soledad",
  autor: "Gabriel García Márquez",
  anioPublicacion: 1967,
  genero: "Novela",
  ejemplaresDisponibles: 3,
  prestado: false
});

// Verificación de creación implícita en el servidor
show dbs
show collections

```
<img width="1100" height="407" alt="image" src="https://github.com/user-attachments/assets/022d6c84-420b-400d-8d77-a38683598f21" />


MongoDB utiliza creación perezosa (*lazy creation*): la base de datos y la colección no se materializan físicamente en disco hasta que se ejecuta la primera operación de escritura.

---

## 2: Alta masiva del catálogo inicial

Completamos el catálogo ejecutando una única inserción en lote mediante `insertMany()`, incorporando variedad de géneros, años de publicación y disponibilidad.

```javascript
db.libros.insertMany([
  { _id: "L-0002", titulo: "1984", autor: "George Orwell", anioPublicacion: 1949, genero: "Novela", ejemplaresDisponibles: 5, prestado: false },
  { _id: "L-0003", titulo: "El túnel", autor: "Ernesto Sabato", anioPublicacion: 1948, genero: "Novela", ejemplaresDisponibles: 0, prestado: true },
  { _id: "L-0004", titulo: "Fahrenheit 451", autor: "Ray Bradbury", anioPublicacion: 1953, genero: "Novela", ejemplaresDisponibles: 2, prestado: false },
  { _id: "L-0005", titulo: "Dune", autor: "Frank Herbert", anioPublicacion: 1965, genero: "Ciencia Ficción", ejemplaresDisponibles: 4, prestado: false },
  { _id: "L-0006", titulo: "Fundación", autor: "Isaac Asimov", anioPublicacion: 1951, genero: "Ciencia Ficción", ejemplaresDisponibles: 0, prestado: true },
  { _id: "L-0007", titulo: "Neuromante", autor: "William Gibson", anioPublicacion: 1984, genero: "Ciencia Ficción", ejemplaresDisponibles: 1, prestado: true },
  { _id: "L-0008", titulo: "Sapiens", autor: "Yuval Noah Harari", anioPublicacion: 2011, genero: "Historia", ejemplaresDisponibles: 6, prestado: false },
  { _id: "L-0009", titulo: "Armas, gérmenes y acero", autor: "Jared Diamond", anioPublicacion: 1997, genero: "Historia", ejemplaresDisponibles: 2, prestado: false },
  { _id: "L-0010", titulo: "SPQR", autor: "Mary Beard", anioPublicacion: 2015, genero: "Historia", ejemplaresDisponibles: 3, prestado: false },
  { _id: "L-0011", titulo: "El laberinto de la soledad", autor: "Octavio Paz", anioPublicacion: 1950, genero: "Ensayo", ejemplaresDisponibles: 2, prestado: false },
  { _id: "L-0012", titulo: "La rebelión de las masas", autor: "José Ortega y Gasset", anioPublicacion: 1930, genero: "Ensayo", ejemplaresDisponibles: 0, prestado: true },
  { _id: "L-0013", titulo: "Una habitación propia", autor: "Virginia Woolf", anioPublicacion: 1929, genero: "Ensayo", ejemplaresDisponibles: 4, prestado: false },
  { _id: "L-0014", titulo: "La llamada de Cthulhu", autor: "H.P. Lovecraft", anioPublicacion: 1928, genero: "Terror", ejemplaresDisponibles: 3, prestado: false },
  { _id: "L-0015", titulo: "El Hobbit", autor: "J.R.R. Tolkien", anioPublicacion: 1937, genero: "Fantasía", ejemplaresDisponibles: 5, prestado: false }
]);

// Verificación del volumen total de documentos
db.libros.countDocuments();

```

<img width="1086" height="40" alt="image" src="https://github.com/user-attachments/assets/f1b56e34-a2b4-4895-adbc-f05c93edac92" />

---

Utilizamos filtros de igualdad simple y operadores de comparación básicos para responder consultas específicas sobre el catálogo.



```javascript
// (a) Libros que pertenecen al género "Novela"
db.libros.find({ genero: "Novela" });

```
<img width="1097" height="410" alt="image" src="https://github.com/user-attachments/assets/4d1653aa-bda6-4172-873a-0c6ac8d7ffb2" />


```javascript
// (b) Libros publicados después del año 2000 (usando el operador $gt)
db.libros.find({ anioPublicacion: { $gt: 2000 } });

```
<img width="1090" height="404" alt="image" src="https://github.com/user-attachments/assets/1405de9f-3f12-443b-8c15-af86c7641095" />


```javascript
// (c) Libros con 0 ejemplares disponibles (usando $lte)
db.libros.find({ ejemplaresDisponibles: { $lte: 0 } });

```
<img width="1101" height="438" alt="image" src="https://github.com/user-attachments/assets/1f1add73-feea-4229-9823-5c5ca77c7e86" />


```javascript
// (d) Búsqueda puntual del libro con _id "L-0001" usando findOne()
db.libros.findOne({ _id: "L-0001" });

```
<img width="1102" height="195" alt="image" src="https://github.com/user-attachments/assets/4bffa72d-924d-478f-a4ed-15bd91549fdb" />


---

## 4: Actualización de un único documento (`updateOne`)

Simulamos el préstamo de un ejemplar utilizando el operador `$set` para modificar únicamente los campos requeridos sin alterar el resto de la estructura.

### Comandos ejecutados

```javascript
// Actualizamos el stock y el estado de préstamo de un libro específico
db.libros.updateOne(
  { _id: "L-0002" },
  { $set: { ejemplaresDisponibles: 4, prestado: true } }
);

// Verificación del cambio
db.libros.findOne({ _id: "L-0002" });

```
<img width="1093" height="446" alt="image" src="https://github.com/user-attachments/assets/7fe51e55-d5f1-470b-8ea0-8b7617e82049" />


Si se omite el operador `$set`, MongoDB interpreta que se desea reemplazar el documento completo por el objeto plano provisto, lo que provocaría la pérdida de todos los campos omitidos en la actualización.

---

## 5: Actualización de varios documentos (`updateMany`)

Modificamos de forma masiva múltiples registros que cumplan con una condición común.

### Comandos ejecutados

```javascript
// Marcamos como no prestados y agregamos la bandera de reposición a los libros sin stock
db.libros.updateMany(
  { ejemplaresDisponibles: { $lte: 0 } },
  { 
    $set: { prestado: false, inReposicion: true } 
  }
);

```
<img width="1097" height="256" alt="image" src="https://github.com/user-attachments/assets/ed2518b1-8f33-4094-b092-807b89378e09" />


Se utilizó `updateMany()` y no `updateOne()` porque la regla de negocio afecta de manera global a todos aquellos ejemplares que posean un stock igual o menor a cero, requiriendo una actualización masiva en simultáneo.

---

## 6: Eliminación de documentos (`deleteOne` y `deleteMany`)

Aplicamos bajas de registros garantizando buenas prácticas de verificación previa.

```javascript
// 1. Eliminación unitaria de un libro por su _id
db.libros.deleteOne({ _id: "L-0015" });

// 2. Buena práctica: simulación previa con find() antes de un borrado masivo
db.libros.find({ genero: "Ensayo" });

// 3. Depuración masiva eliminando toda la categoría de "Ensayo"
db.libros.deleteMany({ genero: "Ensayo" });

```
<img width="1098" height="322" alt="image" src="https://github.com/user-attachments/assets/4fea0828-a9fb-44b1-84a7-97143ab5be66" />
<img width="1108" height="87" alt="image" src="https://github.com/user-attachments/assets/2d6314a9-e257-4758-8873-770d13282217" />


Ejecutar primero la condición de borrado como una consulta `find()` permite auditar con precisión qué documentos exactos se verán afectados, previniendo pérdidas irreversibles de datos en entornos reales, ya que los comandos `deleteMany()` no disponen de un mecanismo nativo de marcha atrás (*rollback*) fuera de transacciones.

---

## 7: Informe final del catálogo

Consolidamos el estado final de la colección a través de distintas métricas de lectura.

```javascript
// 1. Cantidad total de libros en el catálogo restante
db.libros.countDocuments();

// 2. Cantidad de libros actualmente marcados como prestados
db.libros.countDocuments({ prestado: true });

// 3. Cantidad de libros que se encuentran en reposición
db.libros.countDocuments({ inReposicion: true });

```
<img width="1101" height="158" alt="image" src="https://github.com/user-attachments/assets/02d3409d-2d5b-4cd8-8b41-1983c2486df8" />

