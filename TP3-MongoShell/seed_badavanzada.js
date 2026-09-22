// 1. Limpieza inicial para garantizar idempotencia
db.estudiantes.drop();

// 2. Carga masiva del catálogo de estudiantes
db.estudiantes.insertMany([
  {
    legajo: "L-2044",
    nombre: "Sofía Herrera",
    edad: 22,
    activo: true,
    materiasCursadas: ["Bases de Datos I", "Programación II"],
    tutor: null
  },
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
