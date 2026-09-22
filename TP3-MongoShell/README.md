## 1. Conexión a MongoDB Atlas

Para conectarnos a nuestro clúster en la nube utilizamos `mongosh` con la cadena de conexión provista por MongoDB Atlas:

```bash
mongosh "mongodb+srv://<cluster-url>/" --apiVersion 1 --username <usuario>
```
<img width="964" height="87" alt="image" src="https://github.com/user-attachments/assets/f7920053-9f73-4cec-b592-e24a588452a6" />

Al autenticarnos correctamente, el shell nos muestra la versión del servidor, la versión de mongosh y nos sitúa en el prompt interactivo.

---

### Paso 2: Creación implícita de una base de datos (Ejercicio 2)

Corre estos 3 comandos en tu terminal interactiva de mongosh:

```javascript
use badavanzada
db
show dbs
```

<img width="586" height="161" alt="image" src="https://github.com/user-attachments/assets/1b156992-ca96-425a-9bce-f2ac4e7d7953" />

¿Por qué no aparece en show dbs?
En MongoDB, las bases de datos y colecciones se crean de forma implícita y perezosa (lazy creation). MongoDB no reserva espacio ni crea físicamente los archivos en disco hasta que se inserta el primer documento. Mientras la base de datos esté vacía, solo existe en la memoria de la sesión activa de mongosh.


---

## 3. Primera inserción con `insertOne()`

Insertamos nuestro primer documento en la colección `estudiantes`:

```javascript
db.estudiantes.insertOne({
  legajo: "L-2044",
  nombre: "Sofía Herrera",
  edad: 22,
  activo: true,
  materiasCursadas: ["Bases de Datos I", "Programación II"],
  tutor: null
});
```
<img width="718" height="225" alt="image" src="https://github.com/user-attachments/assets/f7c6cc15-14a1-439c-9c7d-66e8ddc98ff8" />

Al ejecutar nuevamente:

```JavaScript
show dbs
show collections
```
Comprobamos que MongoDB materializó la base de datos badavanzada y la colección estudiantes inmediatamente después de la primera escritura física.

<img width="649" height="138" alt="image" src="https://github.com/user-attachments/assets/cd15a321-083f-4c13-aa4b-3af17d56edc5" />

---

## 4. Inserción masiva con `insertMany()`

Insertamos un lote de 6 estudiantes adicionales con atributos diversos:

```javascript
db.estudiantes.insertMany([
  {
    legajo: "L-2045",
    nombre: "Lucas Benítez",
    edad: 20,
    activo: true,
    materiasCursadas: ["Bases de Datos I", "Álgebra"],
    tutor: "Prof. Gómez"
  },
  {
    legajo: "L-2046",
    nombre: "Mariana Costa",
    edad: 25,
    activo: false,
    materiasCursadas: ["Sistemas Operativos"],
    tutor: null
  },
  {
    legajo: "L-2047",
    nombre: "Joaquín Díaz",
    edad: 21,
    activo: true,
    materiasCursadas: ["Bases de Datos I", "Redes"],
    tutor: null
  },
  {
    legajo: "L-2048",
    nombre: "Camila Morales",
    edad: 23,
    activo: true,
    materiasCursadas: ["Programación II", "Algoritmos"],
    tutor: "Prof. Gómez"
  },
  {
    legajo: "L-2049",
    nombre: "Facundo Romero",
    edad: 28,
    activo: false,
    materiasCursadas: ["Bases de Datos I", "Ingeniería de Software"],
    tutor: null
  },
  {
    legajo: "L-2050",
    nombre: "Valeria Ruiz",
    edad: 22,
    activo: true,
    materiasCursadas: ["Bases de Datos II", "Inteligencia Artificial"],
    tutor: "Dra. Bianchi"
  }
]);
```
Y luego verifica la cantidad total:

```JavaScript
db.estudiantes.countDocuments(); // Retorna 7
```
<img width="738" height="248" alt="image" src="https://github.com/user-attachments/assets/f4024482-03d3-40ec-9f10-046bb1e1fdfa" />

---
## 5. Consultas de lectura básicas

Exploramos la colección utilizando diferentes variantes de lectura:

### a) Consultar todos los documentos
```javascript
db.estudiantes.find()
```
Retorna un cursor con todos los documentos almacenados en la colección estudiantes.

b) Filtrar por igualdad simple
```JavaScript
db.estudiantes.find({ activo: true })
```
Filtra y devuelve únicamente los documentos donde el campo booleano activo es verdadero.

c) Búsqueda puntual con findOne()
```JavaScript
db.estudiantes.findOne({ legajo: "L-2044" })
```
A diferencia de find(), que devuelve un cursor iterable, findOne() retorna directamente el primer documento que cumpla la condición como un objeto JSON (o null si no existe).

<img width="909" height="192" alt="image" src="https://github.com/user-attachments/assets/238f62d8-6c44-455f-9e03-8cff91e8820c" />

## 6. Estadísticas y monitoreo con `db.stats()`

Ejecutamos el comando de diagnóstico administrativo:

```javascript
db.stats()
```

<img width="591" height="352" alt="image" src="https://github.com/user-attachments/assets/8e846fcd-ab20-49e8-99f9-6edb90cd3058" />

La salida de db.stats() provee información crítica de rendimiento y capacidad:

collections y objects: Informa la cantidad de colecciones y el número total de documentos, permitiendo monitorear el crecimiento del volumen de datos.

dataSize y storageSize: Indican el tamaño real de los datos sin procesar frente al espacio físico que ocupan en disco (incluyendo la compresión del motor WiredTiger). La diferencia entre ambos permite identificar fragmentación o calcular tasas de compresión.

indexes e indexSize: Refleja la cantidad de índices creados y la memoria RAM que consumen. Un DBA supervisa esta métrica para garantizar que los índices más utilizados quepan en memoria y no degraden el rendimiento.



