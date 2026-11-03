const sesionRepository = require("../repositories/SesionRepository");
const clienteRepository = require("../repositories/ClienteRepository");
const tatuajeRepository = require("../repositories/TatuajeRepository");
const usuarioRepository = require("../repositories/UsuarioRepository");
const Sesion = require("../models/Sesion");

class SesionService {
  async crearSesion({
    id_sesion,
    tatuaje_id,
    cliente_id,
    usuario_id,
    fecha,
    duracion_horas,
    es_retoque = "N",
    valor,
    ultima_sesion = false,
    usuario_creacion = "SISTEMA",
  }) {
    if (!tatuaje_id || !cliente_id || !usuario_id || !fecha || !duracion_horas || valor === undefined) {
      throw new Error("Todos los campos obligatorios de la sesión deben ser completados.");
    }

    if (Number(duracion_horas) <= 0) {
      throw new Error("La duración de la sesión debe ser mayor a cero.");
    }

    if (id_sesion) {
      const existeSesion = await sesionRepository.findById(id_sesion);
      if (existeSesion) {
        throw new Error("El ID de sesión ya existe.");
      }
    }

    // 2. Validar que el cliente exista y que NO tenga ya una sesión asignada (Relación 1 a 1 estricta)
    const cliente = await clienteRepository.findById(cliente_id);
    if (!cliente) {
      throw new Error("El cliente seleccionado no existe.");
    }

    const sesionClienteExistente = await sesionRepository.findByClienteId(cliente_id);
    if (sesionClienteExistente) {
      throw new Error("El cliente ya tiene una sesión registrada. La relación cliente-sesión es de 1 a 1.");
    }

    // 3. Validar que el tatuaje exista
    const tatuaje = await tatuajeRepository.findById(tatuaje_id);
    if (!tatuaje) {
      throw new Error("El tatuaje seleccionado no existe.");
    }

    // 4. Validar que el usuario/tatuador exista
    const usuario = await usuarioRepository.findById(usuario_id);
    if (!usuario) {
      throw new Error("El tatuador asignado no existe.");
    }

    const payload = {
      tatuaje_id: Number(tatuaje_id),
      cliente_id: Number(cliente_id),
      usuario_id: Number(usuario_id),
      fecha,
      duracion_horas: Number(duracion_horas),
      es_retoque,
      valor: Number(valor),
      eliminado: false,
      usuario_creacion,
    };
    if (id_sesion) payload.id_sesion = Number(id_sesion);

    const guardada = await sesionRepository.create(payload);

    // Si se marcó como última sesión, actualizamos el estado del tatuaje a FINALIZADO
    if (ultima_sesion) {
      await tatuajeRepository.update(tatuaje_id, {
        estado: "FINALIZADO",
        fecha_finalizacion: fecha,
        usuario_actualizacion: usuario_creacion,
      });
    } else if (tatuaje.estado === "PENDIENTE") {
      await tatuajeRepository.update(tatuaje_id, {
        estado: "EN_PROGRESO",
        usuario_actualizacion: usuario_creacion,
      });
    }

    return guardada;
  }

  async actualizarSesion(id_sesion, datos, usuarioModificador = "ADMIN") {
    const sesion = await sesionRepository.findById(id_sesion);
    if (!sesion) {
      throw new Error("Sesión no encontrada.");
    }

    if (datos.cliente_id !== undefined && Number(datos.cliente_id) !== Number(sesion.cliente_id)) {
      const cliente = await clienteRepository.findById(datos.cliente_id);
      if (!cliente) {
        throw new Error("El cliente seleccionado no existe.");
      }
      const sesionClienteExistente = await sesionRepository.findByClienteId(datos.cliente_id);
      if (sesionClienteExistente && Number(sesionClienteExistente.id_sesion) !== Number(id_sesion)) {
        throw new Error("El cliente ya tiene una sesión registrada. La relación cliente-sesión es de 1 a 1.");
      }
    }

    if (datos.tatuaje_id !== undefined) {
      const tatuaje = await tatuajeRepository.findById(datos.tatuaje_id);
      if (!tatuaje) {
        throw new Error("El tatuaje seleccionado no existe.");
      }
    }

    if (datos.usuario_id !== undefined) {
      const usuario = await usuarioRepository.findById(datos.usuario_id);
      if (!usuario) {
        throw new Error("El tatuador asignado no existe.");
      }
    }

    if (datos.duracion_horas !== undefined && Number(datos.duracion_horas) <= 0) {
      throw new Error("La duración de la sesión debe ser mayor a cero.");
    }

    const payload = {
      usuario_actualizacion: usuarioModificador,
    };
    if (datos.tatuaje_id !== undefined) payload.tatuaje_id = Number(datos.tatuaje_id);
    if (datos.cliente_id !== undefined) payload.cliente_id = Number(datos.cliente_id);
    if (datos.usuario_id !== undefined) payload.usuario_id = Number(datos.usuario_id);
    if (datos.fecha !== undefined) payload.fecha = datos.fecha;
    if (datos.duracion_horas !== undefined) payload.duracion_horas = Number(datos.duracion_horas);
    if (datos.es_retoque !== undefined) payload.es_retoque = datos.es_retoque;
    if (datos.valor !== undefined) payload.valor = Number(datos.valor);

    const actualizada = await sesionRepository.update(id_sesion, payload);

    if (datos.ultima_sesion && payload.tatuaje_id) {
      await tatuajeRepository.update(payload.tatuaje_id, {
        estado: "FINALIZADO",
        fecha_finalizacion: payload.fecha || new Date().toISOString().split("T")[0],
        usuario_actualizacion: usuarioModificador,
      });
    }

    return actualizada;
  }

  async listarConDetalles() {
    return await sesionRepository.findWithDetails();
  }

  async listarPendientesDeFactura() {
    return await sesionRepository.findPendientesDeFactura();
  }

  async eliminarSesion(id_sesion, usuarioModificador = "ADMIN") {
    const sesion = await sesionRepository.findById(id_sesion);
    if (!sesion) {
      throw new Error("Sesión no encontrada.");
    }
    await sesionRepository.softDelete(id_sesion, usuarioModificador);
    return true;
  }
}

module.exports = new SesionService();
