const clienteRepository = require("../repositories/ClienteRepository");
const sesionRepository = require("../repositories/SesionRepository");
const Cliente = require("../models/Cliente");

class ClienteService {
  async crearCliente({ id_cliente, nombre, telefono, correo, usuario_creacion = "SISTEMA" }) {
    if (
      !nombre ||
      !nombre.trim() ||
      !telefono ||
      !String(telefono).trim() ||
      !correo ||
      !correo.trim()
    ) {
      throw new Error("Nombre, teléfono y correo del cliente son obligatorios.");
    }

    if (id_cliente) {
      const existeId = await clienteRepository.findById(id_cliente);
      if (existeId) {
        throw new Error("El ID de cliente ya está registrado.");
      }
    }

    const payload = {
      nombre: nombre.trim(),
      telefono: String(telefono).trim(),
      correo: correo.trim(),
      eliminado: false,
      usuario_creacion,
    };
    if (id_cliente) payload.id_cliente = Number(id_cliente);

    return await clienteRepository.create(payload);
  }

  async listar() {
    return await clienteRepository.findAll();
  }

  async actualizarCliente(id_cliente, { nombre, telefono, correo }, usuarioModificador = "ADMIN") {
    const cliente = await clienteRepository.findById(id_cliente);
    if (!cliente) {
      throw new Error("Cliente no encontrado.");
    }

    const datosActualizar = {};
    if (nombre !== undefined) {
      if (!nombre.trim()) throw new Error("El nombre no puede ser vacío.");
      datosActualizar.nombre = nombre.trim();
    }
    if (telefono !== undefined) {
      if (!String(telefono).trim()) throw new Error("El teléfono no puede ser vacío.");
      datosActualizar.telefono = String(telefono).trim();
    }
    if (correo !== undefined) {
      if (!correo.trim()) throw new Error("El correo no puede ser vacío.");
      datosActualizar.correo = correo.trim();
    }

    cliente.actualizarDatos(datosActualizar, usuarioModificador);

    await clienteRepository.update(id_cliente, {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      correo: cliente.correo,
      usuario_actualizacion: usuarioModificador,
    });

    return cliente;
  }

  async eliminarCliente(id_cliente, usuarioModificador = "ADMIN") {
    const cliente = await clienteRepository.findById(id_cliente);
    if (!cliente) {
      throw new Error("Cliente no encontrado.");
    }
    await clienteRepository.softDelete(id_cliente, usuarioModificador);
    return true;
  }

  async obtenerEstadoCuenta(id_cliente) {
    const cliente = await clienteRepository.findById(id_cliente);
    if (!cliente) {
      throw new Error("Cliente no encontrado.");
    }

    const sesiones = await sesionRepository.findAllByClienteId(id_cliente);

    let totalContratado = 0;
    let totalAnticipos = 0;
    let totalAbonosFactura = 0;
    const movimientos = [];

    for (const s of sesiones) {
      totalContratado += Number(s.valor || 0);

      if (Number(s.anticipo) > 0) {
        totalAnticipos += Number(s.anticipo);
        movimientos.push({
          fecha: s.fecha,
          concepto: `Anticipo sesión #${s.id_sesion} (${s.tatuaje?.diseno || "Tatuaje"})`,
          tipo: "ANTICIPO",
          monto: Number(s.anticipo),
        });
      }

      for (const f of s.facturas || []) {
        if (f.estado !== "eliminada" && Number(f.monto_pagado) > 0) {
          totalAbonosFactura += Number(f.monto_pagado);
          movimientos.push({
            fecha: f.fecha_pago ? String(f.fecha_pago).split("T")[0] : f.fecha_emision,
            concepto: `Pago / Abono Factura #${f.id_factura}`,
            tipo: "PAGO_FACTURA",
            monto: Number(f.monto_pagado),
          });
        }
      }
    }

    const totalPagado = totalAnticipos + totalAbonosFactura;
    const saldoPendiente = Math.max(0, totalContratado - totalPagado);

    return {
      cliente: {
        id_cliente: cliente.id_cliente,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        correo: cliente.correo,
      },
      total_contratado: totalContratado,
      total_anticipos: totalAnticipos,
      total_abonos: totalAbonosFactura,
      total_pagado: totalPagado,
      saldo_pendiente: saldoPendiente,
      esta_al_dia: saldoPendiente === 0,
      movimientos: movimientos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)),
    };
  }
}

module.exports = new ClienteService();
