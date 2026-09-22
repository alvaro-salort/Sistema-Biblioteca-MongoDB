## 1. Conexión mediante MongoDB Compass

Establecemos la conexión con nuestro clúster de MongoDB Atlas utilizando la GUI oficial de MongoDB:

- **Connection String:** `mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/`

Una vez conectados, navegamos al panel principal **Databases**, donde verificamos la existencia de la base de datos `badavanzada` creada en la práctica anterior.

<img width="760" height="317" alt="image" src="https://github.com/user-attachments/assets/6efc1213-913f-444a-98f6-b33a9e4883e9" />
<img width="297" height="197" alt="image" src="https://github.com/user-attachments/assets/2d987b00-0719-473e-81ee-3f904671c051" />

---

## 2. Creación gráfica de colecciones

Dentro de la base de datos `badavanzada`, creamos la colección `productos` mediante el asistente visual de Compass, sin necesidad de insertar documentos previos para materializar la estructura.

<img width="1006" height="479" alt="image" src="https://github.com/user-attachments/assets/60d5ad6e-3113-4ab8-85f2-d4b8eeae8ce6" />

---

## 3. Importación masiva de datos (JSON)

Diseñamos el catálogo inicial en `productos.json` con 8 ítems diversificados por categoría, precio y stock. 
Importamos el lote utilizando la herramienta nativa **Add Data > Import JSON or CSV file** de Compass.
<img width="995" height="408" alt="image" src="https://github.com/user-attachments/assets/2c475b5f-d706-489f-bfa7-528a760d286b" />
<img width="1021" height="438" alt="image" src="https://github.com/user-attachments/assets/014e09ec-9c89-4124-ad0f-12537636c387" />

---

## 4. Operaciones CRUD mediante Editor Visual

A través de los controles directos de Compass:
1. **Create:** Insertamos el producto `"PROD-009"` vía *Insert Document*.
   
<img width="1002" height="130" alt="image" src="https://github.com/user-attachments/assets/0171c2ef-a43a-4aec-a731-70675fc1fb88" />
<img width="616" height="432" alt="image" src="https://github.com/user-attachments/assets/c2c99ccb-b1e7-40ed-b868-ecc381a20acc" />

3. **Update:** Editamos el campo `precio` del registro `"PROD-002"` a `29.99`.
   
<img width="986" height="149" alt="image" src="https://github.com/user-attachments/assets/607427f4-7909-464e-acb3-8dac387de6b1" />
<img width="987" height="181" alt="image" src="https://github.com/user-attachments/assets/3e1b9c38-b474-404a-a371-10b50fd58237" />

4. **Delete:** Eliminamos el producto obsoleto `"PROD-006"` con la acción de borrado en línea.

<img width="1022" height="183" alt="image" src="https://github.com/user-attachments/assets/d05fc016-5e22-4d4f-b4c1-ce30628cd6e4" />
<img width="982" height="178" alt="image" src="https://github.com/user-attachments/assets/dc53fe17-4955-4ded-9373-dd5695600469" />

---

## 5. Consultas con el Query Bar

Replicamos las capacidades de `find()` utilizando los campos estructurados del Query Bar:

- **a) Filtro ($gt):** `Filter: { "precio": { "$gt": 100 } }`
- **b) Ordenamiento descendente:** `Sort: { "precio": -1 }`
- **c) Proyección selectiva:** `Project: { "nombre": 1, "precio": 1, "_id": 0 }`

<img width="984" height="241" alt="image" src="https://github.com/user-attachments/assets/7ad74f33-997a-42a6-ad81-5d69afbb5a6f" />
<img width="989" height="484" alt="image" src="https://github.com/user-attachments/assets/3d5723bd-9559-42d6-a872-073045888155" />

---

## 6. Análisis de Esquema con Schema Analyzer

La herramienta Schema muestrea los documentos de la colección y genera un perfil estadístico de cada campo.

<img width="1010" height="572" alt="image" src="https://github.com/user-attachments/assets/8091fa0f-410c-4430-befe-1a75d624c055" />
<img width="1010" height="366" alt="image" src="https://github.com/user-attachments/assets/dabd9d4b-488a-467e-8ebf-1bf02cf467c7" />

### Utilidad para el Administrador
Permite auditar la salud del modelo de datos:
* **Consistencia de tipos:** Identifica rápidamente anomalías polimórficas (por ejemplo, si un precio fue ingresado como `String` en lugar de `Double`/`Int32`).
* **Frecuencia de claves:** Revela si existen campos opcionales o faltantes en parte de la colección.
* **Distribución:** Facilita la toma de decisiones al visualizar rangos numéricos y cardinalidad antes de aplicar índices.

---

## 7. Optimización con Índices y Explain Plan

Comparamos el plan de ejecución para la búsqueda `{ "nombre": "Notebook Pro 15" }`:

| Métrica | Antes del Índice | Después del Índice (`nombre_1`) |
| :--- | :--- | :--- |
| **Etapa de ejecución** | `COLLSCAN` (Escaneo de colección completa) | `IXSCAN` (Búsqueda por B-Tree) |
| **Documentos examinados** | Todos los registros de la colección | 1 solo documento |

<img width="1007" height="69" alt="image" src="https://github.com/user-attachments/assets/92344f41-f44f-486d-a859-925cc71bab6f" />
<img width="724" height="308" alt="image" src="https://github.com/user-attachments/assets/15e4557b-c8f2-45ca-99b1-b1c1bcc40bd5" />

<img width="1015" height="432" alt="image" src="https://github.com/user-attachments/assets/cde76bd1-b881-4366-bed6-08e2091906f1" />
<img width="988" height="82" alt="image" src="https://github.com/user-attachments/assets/5b3df1d4-bca7-437d-a883-3633da454196" />

<img width="801" height="502" alt="image" src="https://github.com/user-attachments/assets/4d7236ae-3bff-4fc2-840c-ba207b29e4ec" />


### Conclusión
El índice evita un barrido secuencial en disco, permitiendo que el motor apunte directamente a la posición del registro buscado mediante el árbol de índice.
