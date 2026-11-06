const sesionRepository = require("../repositories/SesionRepository");
const clienteRepository = require("../repositories/ClienteRepository");
const tatuajeRepository = require("../repositories/TatuajeRepository");
const usuarioRepository = require("../repositories/UsuarioRepository");
const tarifaRepository = require("../repositories/TarifaRepository");
const Sesion = require("../models/Sesion");

class SesionService {
  async crearSesion({
    id_sesion,
    tatuaje_id,
    cliente_id,
    usuario_id,
    tarifa_id,
    fecha,
    duracion_horas,
    es_retoque = "N",
    valor,
    anticipo = 0.0,
    ultima_sesion = false,
    usuario_creacion = "SISTEMA",
  }) {
    if (
      !tatuaje_id ||
      !cliente_id ||
      !usuario_id ||
      !fecha ||
      duracion_horas === undefined ||
      duracion_horas === null ||
      duracion_horas === "" ||
      valor === undefined
    ) {
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

    // 1. Validar que el cliente exista
    const cliente = await clienteRepository.findById(cliente_id);
    if (!cliente) {
      throw new Error("El cliente seleccionado no existe.");
    }

    // 2. Validar que el tatuaje exista
    const tatuaje = await tatuajeRepository.findById(tatuaje_id);
    if (!tatuaje) {
      throw new Error("El tatuaje seleccionado no existe.");
    }

    // 3. Validar que el usuario/tatuador exista
    const usuario = await usuarioRepository.findById(usuario_id);
    if (!usuario) {
      throw new Error("El tatuador asignado no existe.");
    }

    // 4. Validar tarifa si se envió
    if (tarifa_id) {
      const tarifa = await tarifaRepository.findById(tarifa_id);
      if (!tarifa) {
        throw new Error("La tarifa seleccionada no existe.");
      }
    }

    let finalValor = Number(valor);
    let finalAnticipo = Number(anticipo || 0);

    // Regla de Negocio HU-07: Retoques
    // CP-19: Retoque dentro de 30 días -> Gratuito ($0)
    // CP-20: Retoque fuera de 30 días -> Con cobro (valor > 0)
    // CP-21: Retoque exactamente día 30 -> Gratuito ($0)
    if (es_retoque === "S") {
      if (tatuaje.fecha_finalizacion) {
        const fRetoque = new Date(fecha);
        const fFin = new Date(tatuaje.fecha_finalizacion);
        const diffMs = fRetoque.getTime() - fFin.getTime();
        const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (dias <= 30) {
          finalValor = 0.0;
          finalAnticipo = 0.0;
        } else {
          if (finalValor <= 0) {
            throw new Error("El retoque se registra fuera del plazo gratuito de 30 días; debe ingresar un valor a cobrar.");
          }
        }
      }
    }

    if (finalAnticipo < 0) {
      throw new Error("El anticipo no puede ser negativo.");
    }

    if (finalAnticipo > finalValor) {
      throw new Error("El anticipo no puede superar el valor total de la sesión.");
    }

    const payload = {
      tatuaje_id: Number(tatuaje_id),
      cliente_id: Number(cliente_id),
      usuario_id: Number(usuario_id),
      tarifa_id: tarifa_id ? Number(tarifa_id) : null,
      fecha,
      duracion_horas: Number(duracion_horas),
      es_retoque,
      valor: finalValor,
      anticipo: finalAnticipo,
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

    const nuevoValor = datos.valor !== undefined ? Number(datos.valor) : Number(sesion.valor);
    const nuevoAnticipo = datos.anticipo !== undefined ? Number(datos.anticipo) : Number(sesion.anticipo);

    if (nuevoAnticipo < 0) {
      throw new Error("El anticipo no puede ser negativo.");
    }
    if (nuevoAnticipo > nuevoValor) {
      throw new Error("El anticipo no puede superar el valor total de la sesión.");
    }

    const payload = {
      usuario_actualizacion: usuarioModificador,
    };
    if (datos.tatuaje_id !== undefined) payload.tatuaje_id = Number(datos.tatuaje_id);
    if (datos.cliente_id !== undefined) payload.cliente_id = Number(datos.cliente_id);
    if (datos.usuario_id !== undefined) payload.usuario_id = Number(datos.usuario_id);
    if (datos.tarifa_id !== undefined) payload.tarifa_id = datos.tarifa_id ? Number(datos.tarifa_id) : null;
    if (datos.fecha !== undefined) payload.fecha = datos.fecha;
    if (datos.duracion_horas !== undefined) payload.duracion_horas = Number(datos.duracion_horas);
    if (datos.es_retoque !== undefined) payload.es_retoque = datos.es_retoque;
    if (datos.valor !== undefined) payload.valor = nuevoValor;
    if (datos.anticipo !== undefined) payload.anticipo = nuevoAnticipo;

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
