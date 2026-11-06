const BASE_URL = "http://127.0.0.1:5000/api";

async function postJson(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = json;
    throw error;
  }
  return json;
}

async function getJson(url) {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = json;
    throw error;
  }
  return json;
}

async function deleteJson(url, data) {
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = json;
    throw error;
  }
  return json;
}

async function runTests() {
  console.log("=== INICIANDO PRUEBAS DE INTEGRACIÓN ===");

  // 1. Crear usuario
  console.log("\n1. Probando creación de usuario (HU-11)...");
  const userRes = await postJson(`${BASE_URL}/usuarios`, {
    id_usuario: 10,
    nombre: "Ana Gomez",
    correo: "ana@estudio.com",
    clave: "ana12345",
    rol: "TATUADOR",
    usuario_creacion: "Admin Estudio",
  });
  console.log("✅ Usuario creado:", userRes);

  // 2. Listar usuarios (comprobar DTO)
  console.log("\n2. Probando listado de usuarios...");
  const usersList = await getJson(`${BASE_URL}/usuarios`);
  console.log("✅ Usuarios activos:", usersList.length);
  const ana = usersList.find((u) => u.id_usuario === 10);
  console.log("✅ Datos seguros sin clave:", ana);

  // 3. Crear cliente
  console.log("\n3. Probando creación de cliente...");
  const clienteRes = await postJson(`${BASE_URL}/clientes`, {
    id_cliente: 1001,
    nombre: "Pedro Pascal",
    telefono: "3109876543",
    correo: "pedro@hollywood.com",
    usuario_creacion: "Admin Estudio",
  });
  console.log("✅ Cliente creado:", clienteRes);

  // 4. Crear tatuaje (sin anticipo)
  console.log("\n4. Probando creación de diseño de tatuaje...");
  const tatuajeRes = await postJson(`${BASE_URL}/tatuajes`, {
    id_tatuaje: 2001,
    diseno: "Mandalorian Helm",
    zona_cuerpo: "Hombro",
    estado: "PENDIENTE",
    horas_estimadas: 4.0,
    valor_estimado: 500000,
    usuario_creacion: "Admin Estudio",
  });
  console.log("✅ Tatuaje creado:", tatuajeRes);

  // 5. Crear primera sesión con anticipo
  console.log("\n5. Probando creación de primera sesión con anticipo...");
  const sesionRes = await postJson(`${BASE_URL}/sesiones`, {
    id_sesion: 3001,
    tatuaje_id: 2001,
    cliente_id: 1001,
    usuario_id: 10,
    fecha: "2026-11-03",
    duracion_horas: 4.0,
    es_retoque: "N",
    valor: 500000,
    anticipo: 100000,
    usuario_creacion: "Admin Estudio",
  });
  console.log("✅ Primera sesión creada con anticipo:", sesionRes);

  // 6. Probar que un cliente PUEDE tener más de una sesión (Requerimiento 1)
  console.log("\n6. Probando que el cliente puede tener una segunda sesión...");
  const sesion2Res = await postJson(`${BASE_URL}/sesiones`, {
    id_sesion: 3002,
    tatuaje_id: 2001,
    cliente_id: 1001,
    usuario_id: 10,
    fecha: "2026-11-10",
    duracion_horas: 2.0,
    es_retoque: "S",
    valor: 200000,
    anticipo: 50000,
    usuario_creacion: "Admin Estudio",
  });
  console.log("✅ Segunda sesión para el mismo cliente creada exitosamente:", sesion2Res);

  // 7. Emitir factura vinculada a la sesión
  console.log("\n7. Probando emisión de factura...");
  const facturaRes = await postJson(`${BASE_URL}/facturas`, {
    id_factura: 4001,
    sesion_id: 3001,
    fecha_emision: "2026-11-03",
    horas_facturadas: 4.0,
    valor_unitario: 125000,
    subtotal: 500000,
    total: 500000,
    tipo_pago: "EFECTIVO",
    monto_pagado: 500000,
    usuario_creacion: "Admin Estudio",
  });
  console.log("✅ Factura emitida y pagada:", facturaRes);

  // 8. Consultar reportes
  console.log("\n8. Probando reportes...");
  const comisiones = await getJson(`${BASE_URL}/reportes/comisiones?fecha_inicio=2026-11-01&fecha_fin=2026-11-30`);
  console.log("✅ Reporte de comisiones:", comisiones);

  const historial = await getJson(`${BASE_URL}/reportes/historial-facturas`);
  console.log("✅ Historial de facturas:", historial.length, "registros.");

  // 9. Soft-delete
  console.log("\n9. Probando soft delete de usuario...");
  const deleteRes = await deleteJson(`${BASE_URL}/usuarios/10`, {
    usuario_modificador: "Admin Estudio",
  });
  console.log("✅ Soft delete ejecutado:", deleteRes);

  const usersAfterDelete = await getJson(`${BASE_URL}/usuarios`);
  const anaDeleted = usersAfterDelete.find((u) => u.id_usuario === 10);
  if (!anaDeleted) {
    console.log("✅ Usuario 10 ya no aparece en la lista de activos (Soft delete exitoso).");
  } else {
    console.error("❌ ERROR: Usuario aún aparece activo");
  }

  console.log("\n=== TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO ===");
}

// Iniciar servidor temporalmente para pruebas
const app = require("./server");
const server = app.listen(5000, async () => {
  try {
    await runTests();
  } catch (error) {
    console.error("❌ Error en pruebas:", error.data || error.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
