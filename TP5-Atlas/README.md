
# Operaciones de Alta Avanzadas en MongoDB

Este módulo documenta el dominio de las operaciones de inserción avanzadas, gestión de identificadores, control de errores de unicidad, consistencia de escrituras y validación estricta de esquemas.

---

## 1: Manejo del campo `_id` (Automático vs. Manual)

En MongoDB, todo documento posee obligatoriamente un campo `_id` que actúa como clave primaria única dentro de su colección. Dependiendo del diseño, podemos delegar su creación o definirlo explícitamente.

### 
```javascript
// 1. Inserción sin especificar _id (genera un ObjectId automático por el motor)
db.productos.insertOne({ nombre: "Mouse Inalámbrico", precio: 15000 });
```
<img width="1106" height="122" alt="image" src="https://github.com/user-attachments/assets/443e8340-e79c-435c-94fb-b5b8bae3b2c7" />


```javascript
// 2. Inserción especificando un _id manual (código o clave natural del negocio)
db.productos.insertOne({ _id: "PROD-100", nombre: "Teclado Mecánico", precio: 45000 });
```
<img width="1110" height="80" alt="image" src="https://github.com/user-attachments/assets/6398692f-d4b4-4a2d-acc0-087c52977cb0" />


```javascript
// 3. Consulta general de la colección para verificar ambos casos
db.productos.find();
```
<img width="1104" height="172" alt="image" src="https://github.com/user-attachments/assets/c69c6063-2eae-44d6-abd9-8ee7c42e5ff8" />


* **`ObjectId` automático:** Si se omite el campo `_id`, MongoDB genera automáticamente una estructura de 12 bytes de tipo `ObjectId`. Este tipo de dato codifica un *timestamp* interno, lo que hace que los identificadores sean cronológicamente ordenables.


* **`_id` manual:** Es completamente válido asignar un identificador propio (string, número o código alfanumérico), siempre y cuando se garantice su unicidad en la colección. Esto es sumamente útil cuando el dominio ya maneja claves naturales (SKUs, códigos de barras, legajos).


---

## 2: Manejo de Errores y Clave Duplicada (`E11000`)

En MongoDB, el campo `_id` funciona como un índice único predeterminado. Al intentar registrar un documento utilizando un identificador que ya se encuentra ocupado, el servidor rechaza la escritura de manera inmediata.

###

```javascript
db.productos.insertOne({ _id: "PROD-200", nombre: "Monitor LED" });
```
<img width="1110" height="50" alt="image" src="https://github.com/user-attachments/assets/5d69e2a8-b763-4952-917f-c26c9c18cafc" />

```javascript
db.productos.insertOne({ _id: "PROD-200", nombre: "Monitor Duplicado" }); // Falla
```
<img width="1092" height="63" alt="image" src="https://github.com/user-attachments/assets/ae06989f-0830-43db-b22e-e4c9ec28f4a1" />


El motor genera una excepción crítica conocida como **E11000 duplicate key error**. Este mensaje de diagnóstico aporta información clave para la depuración: especifica el espacio de nombres (colección afectada) y detalla qué valor de índice único provocó la colisión.

---

## 3: Inserción en Lote (`ordered: true` vs. `ordered: false`)

Cuando realizamos cargas masivas mediante `insertMany()`, el comportamiento ante un error de duplicidad difiere sustancialmente según la configuración de orden.

### Comandos ejecutados

```javascript
db.lote_test.drop();
db.lote_test.insertOne({ _id: "P-01", nombre: "Artículo Inicial" });
```
<img width="1102" height="106" alt="image" src="https://github.com/user-attachments/assets/8e4b89d8-4688-422c-84bd-bd6ce35a7be0" />

```javascript
// Lote masivo tolerante a fallos
db.lote_test.insertMany([
  { _id: "P-02", nombre: "Artículo B" },
  { _id: "P-01", nombre: "Duplicado que fallará" },
  { _id: "P-03", nombre: "Artículo C" }
], { ordered: false });
```
<img width="1096" height="516" alt="image" src="https://github.com/user-attachments/assets/c0583b0d-e062-4339-a72c-b6a45e15143f" />

```javascript
db.lote_test.find();
```
<img width="1104" height="125" alt="image" src="https://github.com/user-attachments/assets/1926a850-4ce6-4502-98f4-4a3ee5a33d51" />


* **Comportamiento por defecto (`ordered: true`):** El motor procesa los documentos en estricto orden secuencial. Ante el primer fallo, la operación se aborta de inmediato y los documentos restantes quedan sin procesar.


* **Modo tolerante (`ordered: false`):** MongoDB intenta insertar todos los documentos posibles de forma independiente, reportando las excepciones al finalizar el proceso sin detener el flujo de los registros válidos restantes.



---

##  4: Validación de Esquema con JSON Schema

Implementamos un validador estructurado en el motor de la base de datos utilizando `$jsonSchema`.


```javascript
db.createCollection("productos_validados", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "precio", "categoria"],
      properties: {
        nombre: { bsonType: "string", minLength: 2 },
        precio: { bsonType: ["int", "double", "decimal"], minimum: 0 },
        categoria: { enum: ["Tecnología", "Hogar", "Ropa"] }
      }
    }
  },
  validationAction: "error"
});

```
<img width="1096" height="294" alt="image" src="https://github.com/user-attachments/assets/1579cb17-d8ec-47a5-b58e-c3f2fa62b9d2" />


* **Tipos de datos BSON:** A diferencia del JSON Schema tradicional, se utiliza `bsonType` para auditar tipos específicos a nivel de motor.


* **Acción ante fallos:** Con `validationAction: "error"`, cualquier documento que vulnere las reglas definidas es rechazado de inmediato por el servidor.



---

## 5: Carga Masiva Externa (`mongoimport`)

Utilizamos la utilidad de línea de comandos `mongoimport` para transferir un set masivo de documentos estructurados en formato JSON hacia el clúster en la nube.

### Comando utilizado

```bash
mongoimport --uri "mongodb+srv://..." --collection carga_masiva --file datos_productos.json --jsonArray

```

Verificamos el éxito de la operación consultando el total de registros integrados:

```javascript
db.carga_masiva.countDocuments(); // Retorna 5

```
<img width="1073" height="38" alt="image" src="https://github.com/user-attachments/assets/357b01e7-8e72-40f0-8eef-90161837c501" />
