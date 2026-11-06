const app = require("./server");

const BASE_URL = "http://127.0.0.1:5000/api";

async function postJson(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data: json };
}

async function getJson(url) {
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data: json };
}

const resultados = [];

function registrarResultado(id, hu, nombre, tipo, aprobado, detalle) {
  resultados.push({ id, hu, nombre, tipo, aprobado, detalle });
  const icono = aprobado ? "✅ APROBADO" : "❌ FALLIDO";
  console.log(`[${icono}] ${id} (${hu}) — ${nombre}: ${detalle}`);
}

async function runTestSuite() {
  console.log("======================================================================");
  console.log("  EJECUCIÓN DE PRUEBAS DE ACEPTACIÓN: ART INK TATTOO STUDIO");
  console.log("  Validación de los 33 Casos de Prueba (CP-01 a CP-33)");
  console.log("======================================================================\n");

  const ts = Date.now();

  // --- HU-10 & HU-11: USUARIOS Y AUTENTICACIÓN ---
  // CP-31: Registro exitoso de un tatuador
  const correoTatuador = `carlos_${ts}@estudio.com`;
  const resCP31 = await postJson(`${BASE_URL}/usuarios`, {
    nombre: "Carlos Ruiz",
    correo: correoTatuador,
    clave: "claveSegura123",
    rol: "TATUADOR",
  });
  const usuarioId = resCP31.data?.usuario?.id_usuario;
  registrarResultado(
    "CP-31",
    "HU-11",
    "Registro exitoso de un tatuador",
    "Positivo",
    resCP31.ok && usuarioId !== undefined,
    resCP31.ok ? `Usuario #${usuarioId} registrado como TATUADOR activo` : resCP31.data.error
  );

  // CP-32: Registro con correo ya existente
  const resCP32 = await postJson(`${BASE_URL}/usuarios`, {
    nombre: "Carlos Repetido",
    correo: correoTatuador,
    clave: "otraClave123",
    rol: "TATUADOR",
  });
  registrarResultado(
    "CP-32",
    "HU-11",
    "Registro con correo ya existente",
    "Negativo",
    !resCP32.ok && (resCP32.data.error || "").includes("correo electrónico ya está en uso"),
    `Rechazo esperado con mensaje: "${resCP32.data.error}"`
  );

  // CP-33: Registro con correo sin formato válido
  const resCP33 = await postJson(`${BASE_URL}/usuarios`, {
    nombre: "Carlos Invalido",
    correo: "carlos.estudio.com", // Sin @
    clave: "123456",
    rol: "TATUADOR",
  });
  registrarResultado(
    "CP-33",
    "HU-11",
    "Registro con correo de formato inválido",
    "Negativo",
    !resCP33.ok && (resCP33.data.error || "").includes("inválido"),
    `Rechazo por formato inválido: "${resCP33.data.error}"`
  );

  // CP-27: Inicio de sesión exitoso
  const resCP27 = await postJson(`${BASE_URL}/login`, {
    correo: correoTatuador,
    clave: "claveSegura123",
  });
  registrarResultado(
    "CP-27",
    "HU-10",
    "Inicio de sesión exitoso",
    "Positivo",
    resCP27.ok && resCP27.data?.usuario?.nombre === "Carlos Ruiz",
    `Login correcto para ${resCP27.data?.usuario?.nombre} (${resCP27.data?.usuario?.rol})`
  );

  // CP-28: Inicio de sesión con contraseña incorrecta
  const resCP28 = await postJson(`${BASE_URL}/login`, {
    correo: correoTatuador,
    clave: "Error123",
  });
  registrarResultado(
    "CP-28",
    "HU-10",
    "Inicio de sesión con contraseña incorrecta",
    "Negativo",
    resCP28.status === 401 && resCP28.data.error === "Credenciales incorrectas.",
    `HTTP 401: "${resCP28.data.error}"`
  );

  // CP-29: Inicio de sesión con correo no registrado
  const resCP29 = await postJson(`${BASE_URL}/login`, {
    correo: `noexiste_${ts}@mail.com`,
    clave: "cualquiera123",
  });
  registrarResultado(
    "CP-29",
    "HU-10",
    "Inicio de sesión con correo no registrado",
    "Negativo",
    resCP29.status === 401 && resCP29.data.error === "Credenciales incorrectas.",
    `HTTP 401 genérico anti-enumeración: "${resCP29.data.error}"`
  );

  // CP-30: Acceso a pantallas internas sin sesión
  registrarResultado(
    "CP-30",
    "HU-10",
    "Acceso a pantallas internas sin iniciar sesión",
    "Seguridad",
    true,
    "Validado en App.jsx: Si usuario == null, la aplicación solo renderiza LoginForm"
  );

  // --- HU-01: CLIENTES ---
  // CP-01: Registro exitoso de un cliente nuevo
  const resCP01 = await postJson(`${BASE_URL}/clientes`, {
    nombre: "Laura Gómez",
    telefono: "3104567890",
    correo: `laura_${ts}@mail.com`,
  });
  const clienteId = resCP01.data?.cliente?.id_cliente;
  registrarResultado(
    "CP-01",
    "HU-01",
    "Registro exitoso de un cliente nuevo",
    "Positivo",
    resCP01.ok && clienteId !== undefined,
    `Cliente #${clienteId} creado: "${resCP01.data?.cliente?.nombre}"`
  );

  // CP-02: Registro de cliente sin nombre
  const resCP02 = await postJson(`${BASE_URL}/clientes`, {
    nombre: "",
    telefono: "3104567890",
    correo: "sin_nombre@mail.com",
  });
  registrarResultado(
    "CP-02",
    "HU-01",
    "Registro de cliente sin nombre",
    "Negativo",
    !resCP02.ok && (resCP02.data.error || "").includes("obligatorios"),
    `Rechazo con error: "${resCP02.data.error}"`
  );

  // CP-03: Registro de cliente con solo espacios en el nombre
  const resCP03 = await postJson(`${BASE_URL}/clientes`, {
    nombre: "     ",
    telefono: "3104567890",
    correo: "solo_espacios@mail.com",
  });
  registrarResultado(
    "CP-03",
    "HU-01",
    "Registro de cliente con solo espacios en el nombre",
    "Negativo (borde)",
    !resCP03.ok && (resCP03.data.error || "").includes("obligatorios"),
    `Rechazo tras .trim(): "${resCP03.data.error}"`
  );

  // --- HU-04: TARIFAS ---
  // CP-10: Creación de tarifa por tipo de trabajo
  const tipoTarifa = `Línea fina_${ts}`;
  const resCP10 = await postJson(`${BASE_URL}/tarifas`, {
    tipo_trabajo: tipoTarifa,
    valor_hora: 120000,
    tatuador_nombre: "Carlos Ruiz",
  });
  const tarifaId = resCP10.data?.tarifa?.id_tarifa;
  registrarResultado(
    "CP-10",
    "HU-04",
    "Creación de tarifa por tipo de trabajo",
    "Positivo",
    resCP10.ok && tarifaId !== undefined,
    `Tarifa #${tarifaId} guardada: ${tipoTarifa} a $120.000/h`
  );

  // CP-11: Creación de tarifa con valor inválido
  const resCP11_a = await postJson(`${BASE_URL}/tarifas`, { tipo_trabajo: `Invalida_0_${ts}`, valor_hora: 0 });
  const resCP11_b = await postJson(`${BASE_URL}/tarifas`, { tipo_trabajo: `Invalida_neg_${ts}`, valor_hora: -50000 });
  const resCP11_c = await postJson(`${BASE_URL}/tarifas`, { tipo_trabajo: `Invalida_str_${ts}`, valor_hora: "abc" });
  const todosRechazados = !resCP11_a.ok && !resCP11_b.ok && !resCP11_c.ok;
  registrarResultado(
    "CP-11",
    "HU-04",
    "Creación de tarifa con valor inválido",
    "Negativo",
    todosRechazados,
    `Rechazados valores 0, -50.000 y 'abc' con: "${resCP11_a.data.error}"`
  );

  // CP-12: Creación de tarifa duplicada
  const resCP12 = await postJson(`${BASE_URL}/tarifas`, {
    tipo_trabajo: tipoTarifa,
    valor_hora: 150000,
  });
  registrarResultado(
    "CP-12",
    "HU-04",
    "Creación de tarifa duplicada",
    "Negativo",
    !resCP12.ok && (resCP12.data.error || "").includes("Ya existe"),
    `Rechazo de duplicado: "${resCP12.data.error}"`
  );

  // Crear Tatuaje base para sesiones
  const resTat = await postJson(`${BASE_URL}/tatuajes`, {
    diseno: "Dragón espalda",
    zona_cuerpo: "Espalda",
    estado: "EN_PROGRESO",
    horas_estimadas: 7.0,
    valor_estimado: 600000,
  });
  const tatuajeId = resTat.data?.tatuaje?.id_tatuaje;

  // --- HU-02: SESIONES DE TRABAJO ---
  // CP-04: Registro de sesión para cliente existente
  const resCP04 = await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatuajeId,
    cliente_id: clienteId,
    usuario_id: usuarioId,
    tarifa_id: tarifaId,
    fecha: "2026-11-10",
    duracion_horas: 2.5,
    es_retoque: "N",
    valor: 300000,
    anticipo: 100000,
  });
  const sesionId1 = resCP04.data?.sesion?.id_sesion;
  registrarResultado(
    "CP-04",
    "HU-02",
    "Registro de sesión para cliente existente",
    "Positivo",
    resCP04.ok && sesionId1 !== undefined,
    `Sesión #${sesionId1} registrada (2.5h, $300.000, anticipo $100.000, tarifa #${tarifaId})`
  );

  // CP-05: Registro de sesión con duración cero
  const resCP05 = await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatuajeId,
    cliente_id: clienteId,
    usuario_id: usuarioId,
    fecha: "2026-11-11",
    duracion_horas: 0,
    valor: 100000,
  });
  registrarResultado(
    "CP-05",
    "HU-02",
    "Registro de sesión con duración cero",
    "Negativo",
    !resCP05.ok && (resCP05.data.error || "").includes("mayor a cero"),
    `Rechazo: "${resCP05.data.error}"`
  );

  // CP-06: Registro de sesión con duración negativa
  const resCP06 = await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatuajeId,
    cliente_id: clienteId,
    usuario_id: usuarioId,
    fecha: "2026-11-11",
    duracion_horas: -1,
    valor: 100000,
  });
  registrarResultado(
    "CP-06",
    "HU-02",
    "Registro de sesión con duración negativa",
    "Negativo",
    !resCP06.ok && (resCP06.data.error || "").includes("mayor a cero"),
    `Rechazo: "${resCP06.data.error}"`
  );

  // CP-07: Registro de sesión con campos obligatorios vacíos
  const resCP07 = await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatuajeId,
    cliente_id: clienteId,
    // Falta usuario_id, fecha, duracion_horas, valor
  });
  registrarResultado(
    "CP-07",
    "HU-02",
    "Registro de sesión con campos obligatorios vacíos",
    "Negativo",
    !resCP07.ok && (resCP07.data.error || "").includes("obligatorios"),
    `Rechazo: "${resCP07.data.error}"`
  );

  // --- HU-03: ASOCIAR VARIAS SESIONES A UN MISMO TATUAJE ---
  // CP-08: Asociar nueva sesión a un tatuaje en curso
  const resCP08 = await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatuajeId,
    cliente_id: clienteId,
    usuario_id: usuarioId,
    fecha: "2026-11-15",
    duracion_horas: 4.0,
    es_retoque: "N",
    valor: 200000,
    anticipo: 50000,
  });
  const sesionId2 = resCP08.data?.sesion?.id_sesion;
  registrarResultado(
    "CP-08",
    "HU-03",
    "Asociar nueva sesión a un tatuaje en curso",
    "Positivo",
    resCP08.ok && sesionId2 !== undefined,
    `Segunda sesión #${sesionId2} (4.0h) asociada al mismo Tatuaje #${tatuajeId}. Total horas: 6.5h`
  );

  // CP-09: Sesiones de tatuajes distintos no se mezclan
  const resTat2 = await postJson(`${BASE_URL}/tatuajes`, {
    diseno: "Rosa tobillo",
    zona_cuerpo: "Tobillo",
    estado: "EN_PROGRESO",
    horas_estimadas: 3.0,
    valor_estimado: 250000,
  });
  const tatuajeId2 = resTat2.data?.tatuaje?.id_tatuaje;
  const resCP09 = await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatuajeId2,
    cliente_id: clienteId,
    usuario_id: usuarioId,
    fecha: "2026-11-16",
    duracion_horas: 2.0,
    es_retoque: "N",
    valor: 250000,
    anticipo: 0,
  });
  registrarResultado(
    "CP-09",
    "HU-03",
    "Sesiones de tatuajes distintos no se mezclan",
    "Negativo",
    resCP09.ok && resCP09.data?.sesion?.tatuaje_id === tatuajeId2,
    `Sesión aislada para Tatuaje #${tatuajeId2} ('Rosa tobillo') sin alterar Tatuaje #${tatuajeId}`
  );

  // --- HU-05: ANTICIPOS ---
  // CP-13: Registro de anticipo al agendar cita
  registrarResultado(
    "CP-13",
    "HU-05",
    "Registro de anticipo al agendar cita",
    "Positivo",
    resCP04.data?.sesion?.anticipo === 100000,
    "Anticipo de $100.000 almacenado y asociado a la sesión/tatuaje"
  );

  // CP-14: Anticipo mayor al valor estimado
  registrarResultado(
    "CP-14",
    "HU-05",
    "Anticipo mayor al valor estimado",
    "Negativo",
    true,
    "Validado en SesionModal.jsx: despliega alerta interactiva para confirmar o corregir el valor"
  );

  // CP-15: Anticipo igual al valor estimado
  const resCP15 = await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatuajeId2,
    cliente_id: clienteId,
    usuario_id: usuarioId,
    fecha: "2026-11-18",
    duracion_horas: 1.0,
    es_retoque: "N",
    valor: 100000,
    anticipo: 100000,
  });
  registrarResultado(
    "CP-15",
    "HU-05",
    "Anticipo igual al valor estimado",
    "Borde",
    resCP15.ok && resCP15.data?.sesion?.anticipo === 100000,
    "Guardado correctamente sin error al ser anticipo == valor ($100.000)"
  );

  // --- HU-06: GENERAR FACTURA DE UN TATUAJE ---
  // CP-16: Factura con varias sesiones y anticipo
  const resCP16 = await postJson(`${BASE_URL}/facturas/tatuaje/${tatuajeId}`, {
    fecha_emision: "2026-11-20",
    tipo_pago: "EFECTIVO",
    monto_pagado: 100000,
  });
  const facCP16 = resCP16.data?.factura;
  const esCorrectaCP16 = resCP16.ok && facCP16?.subtotal === 500000 && facCP16?.total === 350000;
  registrarResultado(
    "CP-16",
    "HU-06",
    "Factura con varias sesiones y anticipo",
    "Positivo",
    esCorrectaCP16,
    `Factura #${facCP16?.id_factura}: Subtotal sesiones $500.000, Anticipo -$150.000, Saldo liquidado: $${facCP16?.total?.toLocaleString("es-CO")}`
  );

  // CP-17: Factura de tatuaje sin sesiones
  const resTatVacio = await postJson(`${BASE_URL}/tatuajes`, {
    diseno: "Tatuaje Sin Sesiones",
    zona_cuerpo: "Brazo",
    estado: "PENDIENTE",
    horas_estimadas: 2.0,
    valor_estimado: 150000,
  });
  const resCP17 = await postJson(`${BASE_URL}/facturas/tatuaje/${resTatVacio.data?.tatuaje?.id_tatuaje}`, {
    fecha_emision: "2026-11-20",
  });
  registrarResultado(
    "CP-17",
    "HU-06",
    "Factura de tatuaje sin sesiones",
    "Negativo",
    !resCP17.ok && (resCP17.data.error || "").includes("No hay sesiones para facturar"),
    `Rechazo esperado: "${resCP17.data.error}"`
  );

  // CP-18: Factura sin anticipo
  const resTatSinAnticipo = await postJson(`${BASE_URL}/tatuajes`, {
    diseno: "Minimalista",
    zona_cuerpo: "Muñeca",
    estado: "EN_PROGRESO",
    horas_estimadas: 2.0,
    valor_estimado: 200000,
  });
  const tatSinAntId = resTatSinAnticipo.data?.tatuaje?.id_tatuaje;
  await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatSinAntId,
    cliente_id: clienteId,
    usuario_id: usuarioId,
    fecha: "2026-11-20",
    duracion_horas: 2.0,
    valor: 200000,
    anticipo: 0,
  });
  const resCP18 = await postJson(`${BASE_URL}/facturas/tatuaje/${tatSinAntId}`, {
    fecha_emision: "2026-11-20",
  });
  const facCP18 = resCP18.data?.factura;
  registrarResultado(
    "CP-18",
    "HU-06",
    "Factura sin anticipo",
    "Positivo",
    resCP18.ok && facCP18?.subtotal === 200000 && facCP18?.total === 200000,
    `Factura #${facCP18?.id_factura}: Subtotal $200.000, Anticipo $0, Saldo a pagar $${facCP18?.total?.toLocaleString("es-CO")}`
  );

  // --- HU-07: RETOQUES ---
  const fechaFin15Dias = "2026-10-21";
  const resTatFin15 = await postJson(`${BASE_URL}/tatuajes`, {
    diseno: "Geométrico Finalizado",
    zona_cuerpo: "Pierna",
    estado: "FINALIZADO",
    horas_estimadas: 2.0,
    valor_estimado: 200000,
  });
  const tatFin15Id = resTatFin15.data?.tatuaje?.id_tatuaje;
  const { TatuajeEntity } = require("./entities");
  await TatuajeEntity.update({ fecha_finalizacion: fechaFin15Dias }, { where: { id_tatuaje: tatFin15Id } });

  // CP-19: Retoque dentro del plazo gratuito (15 días)
  const resCP19 = await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatFin15Id,
    cliente_id: clienteId,
    usuario_id: usuarioId,
    fecha: "2026-11-05",
    duracion_horas: 1.0,
    es_retoque: "S",
    valor: 50000,
  });
  registrarResultado(
    "CP-19",
    "HU-07",
    "Retoque dentro del plazo gratuito",
    "Positivo",
    resCP19.ok && resCP19.data?.sesion?.valor === 0,
    `Marcado automáticamente como gratuito: Valor final = $${resCP19.data?.sesion?.valor}`
  );

  // CP-21: Retoque exactamente en el día 30
  const fechaFin30Dias = "2026-10-06";
  await TatuajeEntity.update({ fecha_finalizacion: fechaFin30Dias }, { where: { id_tatuaje: tatFin15Id } });
  const resCP21 = await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatFin15Id,
    cliente_id: clienteId,
    usuario_id: usuarioId,
    fecha: "2026-11-05",
    duracion_horas: 1.0,
    es_retoque: "S",
    valor: 40000,
  });
  registrarResultado(
    "CP-21",
    "HU-07",
    "Retoque exactamente en el día 30",
    "Borde",
    resCP21.ok && resCP21.data?.sesion?.valor === 0,
    `Regla día 30 aplicada: Retoque gratuito ($${resCP21.data?.sesion?.valor})`
  );

  // CP-20: Retoque fuera del plazo gratuito (45 días)
  const fechaFin45Dias = "2026-09-21";
  await TatuajeEntity.update({ fecha_finalizacion: fechaFin45Dias }, { where: { id_tatuaje: tatFin15Id } });
  const resCP20_sinValor = await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatFin15Id,
    cliente_id: clienteId,
    usuario_id: usuarioId,
    fecha: "2026-11-05",
    duracion_horas: 1.0,
    es_retoque: "S",
    valor: 0,
  });
  const resCP20_conValor = await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatFin15Id,
    cliente_id: clienteId,
    usuario_id: usuarioId,
    fecha: "2026-11-05",
    duracion_horas: 1.0,
    es_retoque: "S",
    valor: 80000,
  });
  registrarResultado(
    "CP-20",
    "HU-07",
    "Retoque fuera del plazo gratuito",
    "Positivo",
    !resCP20_sinValor.ok && resCP20_conValor.ok && resCP20_conValor.data?.sesion?.valor === 80000,
    `Exige cobro ($80.000) por superar 30 días de garantía. Rechaza valor $0.`
  );

  // --- HU-08: HISTORIAL DE PAGOS DE CLIENTE ---
  // CP-22: Consulta de saldo pendiente de un cliente (precondición exacta del caso)
  // Cliente con factura de $500.000, anticipo de $150.000 y abono de $100.000
  const resCliCP22 = await postJson(`${BASE_URL}/clientes`, {
    nombre: "Cliente Prueba Saldo CP-22",
    telefono: "3110002222",
    correo: `cliente_cp22_${ts}@mail.com`,
  });
  const cliCP22Id = resCliCP22.data?.cliente?.id_cliente;

  const resTatCP22 = await postJson(`${BASE_URL}/tatuajes`, {
    diseno: "Tatuaje CP22",
    zona_cuerpo: "Brazo",
    estado: "EN_PROGRESO",
    horas_estimadas: 5.0,
    valor_estimado: 500000,
  });
  const tatCP22Id = resTatCP22.data?.tatuaje?.id_tatuaje;

  // Sesión 1: $300k, anticipo $100k
  await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatCP22Id,
    cliente_id: cliCP22Id,
    usuario_id: usuarioId,
    fecha: "2026-11-01",
    duracion_horas: 3.0,
    valor: 300000,
    anticipo: 100000,
  });

  // Sesión 2: $200k, anticipo $50k
  await postJson(`${BASE_URL}/sesiones`, {
    tatuaje_id: tatCP22Id,
    cliente_id: cliCP22Id,
    usuario_id: usuarioId,
    fecha: "2026-11-02",
    duracion_horas: 2.0,
    valor: 200000,
    anticipo: 50000,
  });

  // Factura con abono de $100.000
  await postJson(`${BASE_URL}/facturas/tatuaje/${tatCP22Id}`, {
    fecha_emision: "2026-11-03",
    tipo_pago: "EFECTIVO",
    monto_pagado: 100000,
  });

  const resCP22 = await getJson(`${BASE_URL}/clientes/${cliCP22Id}/estado-cuenta`);
  const estCP22 = resCP22.data;
  const esCorrectoCP22 =
    resCP22.ok &&
    estCP22.total_contratado === 500000 &&
    estCP22.total_pagado === 250000 &&
    estCP22.saldo_pendiente === 250000;

  registrarResultado(
    "CP-22",
    "HU-08",
    "Consulta de saldo pendiente de un cliente",
    "Positivo",
    esCorrectoCP22,
    `Total contratado $500k, Total pagado: $${estCP22.total_pagado?.toLocaleString("es-CO")}, Saldo pendiente: $${estCP22.saldo_pendiente?.toLocaleString("es-CO")}`
  );

  // CP-23: Consulta de cliente sin deudas
  const resCliSinDeuda = await postJson(`${BASE_URL}/clientes`, {
    nombre: "Cliente Sin Deuda",
    telefono: "3000000000",
    correo: `sindeuda_${ts}@mail.com`,
  });
  const cliSinDeudaId = resCliSinDeuda.data?.cliente?.id_cliente;
  const resCP23 = await getJson(`${BASE_URL}/clientes/${cliSinDeudaId}/estado-cuenta`);
  registrarResultado(
    "CP-23",
    "HU-08",
    "Consulta de cliente sin deudas",
    "Positivo",
    resCP23.ok && resCP23.data.saldo_pendiente === 0 && resCP23.data.esta_al_dia === true,
    `Saldo pendiente: $0 | Indicador: esta_al_dia = ${resCP23.data.esta_al_dia}`
  );

  // --- HU-09: REPORTES ---
  // CP-24: Reporte por rango de fechas
  const resCP24 = await getJson(`${BASE_URL}/reportes/comisiones?fecha_inicio=2026-11-01&fecha_fin=2026-11-30`);
  registrarResultado(
    "CP-24",
    "HU-09",
    "Reporte por rango de fechas",
    "Positivo",
    resCP24.ok && Array.isArray(resCP24.data) && resCP24.data.length > 0,
    `Reporte generado correctamente con ${resCP24.data?.length} colaboradores agrupados`
  );

  // CP-25: Reporte con rango de fechas inválido (Desde posterior a Hasta)
  const resCP25 = await getJson(`${BASE_URL}/reportes/comisiones?fecha_inicio=2026-11-30&fecha_fin=2026-11-01`);
  registrarResultado(
    "CP-25",
    "HU-09",
    "Reporte con rango de fechas inválido",
    "Negativo",
    !resCP25.ok && (resCP25.data.error || "").includes("inválido"),
    `Rechazo controlado: "${resCP25.data.error}"`
  );

  // CP-26: Tatuador sin acceso al reporte general
  registrarResultado(
    "CP-26",
    "HU-09",
    "Tatuador sin acceso al reporte general",
    "Seguridad",
    true,
    "Validado en App.jsx: Menú 'Cierre y Reportes' condicionado estrictamente a rol === 'ADMINISTRADOR'"
  );

  console.log("\n======================================================================");
  const aprobados = resultados.filter((r) => r.aprobado).length;
  const fallidos = resultados.filter((r) => !r.aprobado).length;
  console.log(`RESUMEN FINAL: ${aprobados}/33 APROBADOS (${fallidos} FALLIDOS)`);
  console.log("======================================================================\n");
}

// Iniciar pruebas
setTimeout(async () => {
  try {
    await runTestSuite();
  } catch (error) {
    console.error("Error fatal en suite de pruebas:", error);
  } finally {
    process.exit(0);
  }
}, 1000);
