use envioya;

// 2. Creación de colecciones con validadores JSON Schema
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

db.createCollection("repartidores");
db.createCollection("sucursales");
db.createCollection("eventos_seguimiento");

// 3. Carga masiva de datos de prueba
db.clientes.insertMany([
  { _id: "CLI-001", nombre: "Logística Cuyo S.A.", email: "contacto@cuyo.com", tipoCliente: "Corporativo" },
  { _id: "CLI-002", nombre: "Ana Martínez", email: "ana.martinez@email.com", tipoCliente: "Particular" },
  { _id: "CLI-003", nombre: "Tech Mendoza SRL", email: "ventas@techmendoza.com", tipoCliente: "Corporativo" },
  { _id: "CLI-004", nombre: "Carlos Páez", email: "carlos.paez@email.com", tipoCliente: "Particular" },
  { _id: "CLI-005", nombre: "Distribuidora del Sol", email: "info@delsol.com", tipoCliente: "Corporativo" }
]);

db.sucursales.insertMany([
  { _id: "SUC-001", nombre: "Central Mendoza", ciudad: "Mendoza" },
  { _id: "SUC-002", nombre: "Sucursal San Martín", ciudad: "San Martín" },
  { _id: "SUC-003", nombre: "Sucursal Godoy Cruz", ciudad: "Godoy Cruz" },
  { _id: "SUC-004", nombre: "Sucursal Maipú", ciudad: "Maipú" },
  { _id: "SUC-005", nombre: "Sucursal San Rafael", ciudad: "San Rafael" }
]);

db.repartidores.insertMany([
  { _id: "REP-001", nombre: "Juan Pérez", vehiculo: "Camioneta Renault Kangoo", activo: true },
  { _id: "REP-002", nombre: "María Gómez", vehiculo: "Moto Honda 150", activo: true },
  { _id: "REP-003", nombre: "Lucas Silva", vehiculo: "Furgón Mercedes Sprinter", activo: true },
  { _id: "REP-004", nombre: "Laura Fernández", vehiculo: "Moto Yamaha 125", activo: true },
  { _id: "REP-005", nombre: "Roberto Diaz", vehiculo: "Camioneta Peugeot Partner", activo: false }
]);

db.envios.insertMany([
  {
    _id: "ENV-1001",
    codigoSeguimiento: "EY-2026-001",
    clienteId: "CLI-001",
    clienteResumen: { nombre: "Logística Cuyo S.A.", email: "contacto@cuyo.com" },
    repartidorId: "REP-001",
    repartidorResumen: { nombre: "Juan Pérez" },
    sucursalOrigenId: "SUC-001",
    estado: "En Reparto",
    costoTotal: 12500,
    paquetes: [
      { bulto: 1, pesoKg: 2.5, caracteristicas: [{ k: "fragilidad", v: "alta" }] }
    ],
    eventosRecientes: [
      { fecha: "2026-10-10 08:00", estado: "Despachado", ubicacion: "Sucursal Central Mendoza" },
      { fecha: "2026-10-10 10:30", estado: "En Reparto", ubicacion: "En camino a domicilio" }
    ]
  },
  {
    _id: "ENV-1002",
    codigoSeguimiento: "EY-2026-002",
    clienteId: "CLI-002",
    clienteResumen: { nombre: "Ana Martínez", email: "ana.martinez@email.com" },
    repartidorId: "REP-002",
    repartidorResumen: { nombre: "María Gómez" },
    sucursalOrigenId: "SUC-002",
    estado: "Entregado",
    costoTotal: 4500,
    paquetes: [{ bulto: 1, pesoKg: 0.8, caracteristicas: [] }],
    eventosRecientes: [{ fecha: "2026-10-11 14:00", estado: "Entregado", ubicacion: "Domicilio Destino" }]
  },
  {
    _id: "ENV-1003",
    codigoSeguimiento: "EY-2026-003",
    clienteId: "CLI-001",
    clienteResumen: { nombre: "Logística Cuyo S.A.", email: "contacto@cuyo.com" },
    repartidorId: "REP-001",
    repartidorResumen: { nombre: "Juan Pérez" },
    sucursalOrigenId: "SUC-001",
    estado: "Pendiente",
    costoTotal: 8900,
    paquetes: [{ bulto: 1, pesoKg: 5.0, caracteristicas: [] }],
    eventosRecientes: []
  },
  {
    _id: "ENV-1004",
    codigoSeguimiento: "EY-2026-004",
    clienteId: "CLI-003",
    clienteResumen: { nombre: "Tech Mendoza SRL", email: "ventas@techmendoza.com" },
    repartidorId: "REP-003",
    repartidorResumen: { nombre: "Lucas Silva" },
    sucursalOrigenId: "SUC-003",
    estado: "Entregado",
    costoTotal: 15000,
    paquetes: [{ bulto: 1, pesoKg: 12.0, caracteristicas: [{ k: "tipo", v: "Hardware" }] }],
    eventosRecientes: [{ fecha: "2026-10-09 11:00", estado: "Entregado", ubicacion: "Recepción Empresa" }]
  },
  {
    _id: "ENV-1005",
    codigoSeguimiento: "EY-2026-005",
    clienteId: "CLI-005",
    clienteResumen: { nombre: "Distribuidora del Sol", email: "info@delsol.com" },
    repartidorId: "REP-001",
    repartidorResumen: { nombre: "Juan Pérez" },
    sucursalOrigenId: "SUC-001",
    estado: "En Transito",
    costoTotal: 22000,
    paquetes: [{ bulto: 1, pesoKg: 18.5, caracteristicas: [] }],
    eventosRecientes: [{ fecha: "2026-10-12 09:00", estado: "En Transito", ubicacion: "Ruta 40" }]
  }
]);

db.eventos_seguimiento.insertMany([
  { envioId: "ENV-1001", evento: "Creación de etiqueta", fecha: "2026-10-09 18:00" },
  { envioId: "ENV-1001", evento: "Ingreso a sucursal", fecha: "2026-10-10 07:30" },
  { envioId: "ENV-1001", evento: "Salida a reparto", fecha: "2026-10-10 10:30" },
  { envioId: "ENV-1002", evento: "Ingreso a sucursal", fecha: "2026-10-11 08:00" },
  { envioId: "ENV-1002", evento: "Entrega efectuada", fecha: "2026-10-11 14:00" }
]);

// 4. Consultas Reales de Negocio

// Consulta 1: Listar envíos activos de un cliente corporativo
db.envios.find(
  { clienteId: "CLI-001", estado: { $ne: "Entregado" } },
  { codigoSeguimiento: 1, estado: 1, costoTotal: 1, "repartidorResumen.nombre": 1, _id: 0 }
);

// Consulta 2: Encontrar el repartidor con más envíos asignados
db.envios.aggregate([
  { $group: { _id: "$repartidorResumen.nombre", totalEnvios: { $sum: 1 } } },
  { $sort: { totalEnvios: -1 } },
  { $limit: 1 }
]);

// Consulta 3: Facturación acumulada por cliente corporativo
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

// Consulta 4: Tracking rápido (últimos eventos) usando el patrón Subset
db.envios.find(
  { codigoSeguimiento: "EY-2026-001" },
  { codigoSeguimiento: 1, estado: 1, eventosRecientes: 1, _id: 0 }
);

// Consulta 5: Envíos procesados por sucursal de origen
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
