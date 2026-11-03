const tatuajeRepository = require("../repositories/TatuajeRepository");
const Tatuaje = require("../models/Tatuaje");

class TatuajeService {
  async crearTatuaje({
    id_tatuaje,
    diseno,
    zona_cuerpo,
    estado = "PENDIENTE",
    horas_estimadas = 1.0,
    valor_estimado,
    anticipo = 0.0,
    usuario_creacion = "SISTEMA",
  }) {
    if (!diseno || !zona_cuerpo || valor_estimado === undefined) {
      throw new Error("Debe ingresar diseño, zona del cuerpo y valor estimado.");
    }

    if (Number(anticipo) > Number(valor_estimado)) {
      throw new Error("El anticipo no puede ser superior al valor total estimado.");
    }

    if (id_tatuaje) {
      const existeId = await tatuajeRepository.findById(id_tatuaje);
      if (existeId) {
        throw new Error("El ID de tatuaje ya existe.");
      }
    }

    const payload = {
      diseno,
      zona_cuerpo,
      estado,
      horas_estimadas: Number(horas_estimadas),
      valor_estimado: Number(valor_estimado),
      anticipo: Number(anticipo),
      fecha_finalizacion: estado === "FINALIZADO" ? new Date().toISOString().split("T")[0] : null,
      eliminado: false,
      usuario_creacion,
    };
    if (id_tatuaje) payload.id_tatuaje = Number(id_tatuaje);

    return await tatuajeRepository.create(payload);
  }

  async listar() {
    return await tatuajeRepository.findAll();
  }

  async actualizarTatuaje(id_tatuaje, datos, usuarioModificador = "ADMIN") {
    const tatuaje = await tatuajeRepository.findById(id_tatuaje);
    if (!tatuaje) {
      throw new Error("Tatuaje no encontrado.");
    }

    if (datos.valor_estimado !== undefined && datos.anticipo !== undefined) {
      if (Number(datos.anticipo) > Number(datos.valor_estimado)) {
        throw new Error("El anticipo no puede ser superior al valor total estimado.");
      }
    }

    const payload = {
      usuario_actualizacion: usuarioModificador,
    };
    if (datos.diseno !== undefined) payload.diseno = datos.diseno;
    if (datos.zona_cuerpo !== undefined) payload.zona_cuerpo = datos.zona_cuerpo;
    if (datos.horas_estimadas !== undefined) payload.horas_estimadas = Number(datos.horas_estimadas);
    if (datos.valor_estimado !== undefined) payload.valor_estimado = Number(datos.valor_estimado);
    if (datos.anticipo !== undefined) payload.anticipo = Number(datos.anticipo);
    if (datos.estado !== undefined) {
      payload.estado = datos.estado;
      if (datos.estado === "FINALIZADO") {
        payload.fecha_finalizacion = new Date().toISOString().split("T")[0];
      }
    }

    return await tatuajeRepository.update(id_tatuaje, payload);
  }

  async actualizarEstado(id_tatuaje, nuevoEstado, usuarioModificador = "ADMIN") {
    const tatuaje = await tatuajeRepository.findById(id_tatuaje);
    if (!tatuaje) {
      throw new Error("Tatuaje no encontrado.");
    }

    tatuaje.cambiarEstado(nuevoEstado, usuarioModificador);

    await tatuajeRepository.update(id_tatuaje, {
      estado: tatuaje.estado,
      fecha_finalizacion: tatuaje.fecha_finalizacion,
      usuario_actualizacion: usuarioModificador,
    });

    return tatuaje;
  }

  async eliminarTatuaje(id_tatuaje, usuarioModificador = "ADMIN") {
    const tatuaje = await tatuajeRepository.findById(id_tatuaje);
    if (!tatuaje) {
      throw new Error("Tatuaje no encontrado.");
    }
    await tatuajeRepository.softDelete(id_tatuaje, usuarioModificador);
    return true;
  }
}

module.exports = new TatuajeService();
