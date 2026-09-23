
#  Bases de Datos Avanzadas: Ejercicios de MongoDB
Repositorio que documenta la cursada de **Bases de Datos Avanzadas**, abarcando desde los fundamentos del motor NoSQL, operaciones de alta, gestión de esquemas, hasta consultas complejas, índices, agregaciones y transacciones multi-documento en MongoDB.

---
## 📂 Estructura del Repositorio
El proyecto se encuentra dividido en módulos secuenciales correspondientes a cada trabajo práctico:

| Carpeta | Descripción del Módulo | Herramientas Principales |
| :--- | :--- | :--- |
| **[TP3-MongoShell](./TP3-MongoShell)** | Conexión inicial al cluster de Atlas, comandos básicos y pruebas de shell interactivo. | `mongosh`, MongoDB Atlas |
| **[TP4-Compass](./TP4-Compass)** | Navegación gráfica, creación de colecciones, importación de JSON y planes de ejecución (*Explain*). | MongoDB Compass |
| **[TP5-Atlas](./TP5-Atlas)** | Operaciones de alta avanzadas (`insertOne`, `insertMany`), manejo de `_id`, errores `E11000`, *write concern* y validación mediante `$jsonSchema`. | `mongosh`, `mongoimport` |
| **[TP6-CRUD-Basico](./TP6-CRUD-Basico)** | Inicio del sistema de biblioteca: creación de base de datos, catálogo de libros y operaciones elementales CRUD. | `mongosh`, Modelado referenciado |
| **[TP7-CRUD-Intermedio](./TP7-CRUD-Intermedio)** | Ampliación del sistema con socios y préstamos, operadores lógicos (`$and`, `$or`, `$in`), arrays, *upsert* y paginación. | Índices compuestos, `explain()` |
| **[TP8-CRUD-Avanzado](./TP8-CRUD-Avanzado)** | Cierre de la secuencia: Aggregation Framework (`$group`, `$lookup`, `$unwind`), índices de texto y transacciones multi-documento atómicas. | Pipelines de agregación, transacciones |

---
## Tecnologías y Entorno de Trabajo
* **Motor de Base de Datos:** MongoDB Community / MongoDB Atlas (Clúster en la nube).
* **Interfaces de Consulta:** `mongosh` (MongoDB Shell) y MongoDB Compass.
* **Utilidades Externas:** `mongoimport` para ingesta masiva de datos estructurados.
