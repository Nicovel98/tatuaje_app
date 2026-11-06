const tarifaRepository = require("../repositories/TarifaRepository");
const Tarifa = require("../models/Tarifa");

class TarifaService {
  async crearTarifa({ id_tarifa, tipo_trabajo, valor_hora, tatuador_nombre = null, usuario_creacion = "SISTEMA" }) {
    if (!tipo_trabajo || !tipo_trabajo.trim()) {
      throw new Error("El tipo de trabajo es obligatorio.");
    }

    const valorNum = Number(valor_hora);
    if (valor_hora === undefined || valor_hora === null || isNaN(valorNum) || valorNum <= 0) {
      throw new Error("El valor por hora debe ser un número mayor a cero.");
    }

    const tipoNormalizado = tipo_trabajo.trim();
    const existe = await tarifaRepository.findByTipo(tipoNormalizado);
    if (existe) {
      throw new Error(`Ya existe una tarifa registrada para el tipo de trabajo '${tipoNormalizado}'.`);
    }

    if (id_tarifa) {
      const existeId = await tarifaRepository.findById(id_tarifa);
      if (existeId) {
        throw new Error("El código de tarifa ya existe.");
      }
    }

    const payload = {
      tipo_trabajo: tipoNormalizado,
      valor_hora: valorNum,
      tatuador_nombre: tatuador_nombre ? tatuador_nombre.trim() : null,
      eliminado: false,
      usuario_creacion,
    };
    if (id_tarifa) payload.id_tarifa = Number(id_tarifa);

    return await tarifaRepository.create(payload);
  }

  async listar() {
    return await tarifaRepository.findAll();
  }

  async obtenerPorId(id_tarifa) {
    const tarifa = await tarifaRepository.findById(id_tarifa);
    if (!tarifa) {
      throw new Error("Tarifa no encontrada.");
    }
    return tarifa;
  }

  async obtenerSiguienteId() {
    return await tarifaRepository.getNextId();
  }

  async actualizarTarifa(id_tarifa, { tipo_trabajo, valor_hora, tatuador_nombre }, usuarioModificador = "ADMIN") {
    const tarifa = await tarifaRepository.findById(id_tarifa);
    if (!tarifa) {
      throw new Error("Tarifa no encontrada.");
    }

    const payload = {
      usuario_actualizacion: usuarioModificador,
    };

    if (tipo_trabajo !== undefined) {
      if (!tipo_trabajo.trim()) throw new Error("El tipo de trabajo no puede ser vacío.");
      payload.tipo_trabajo = tipo_trabajo.trim();
    }

    if (valor_hora !== undefined) {
      const val = Number(valor_hora);
      if (isNaN(val) || val <= 0) throw new Error("El valor por hora debe ser un número mayor a cero.");
      payload.valor_hora = val;
    }

    if (tatuador_nombre !== undefined) {
      payload.tatuador_nombre = tatuador_nombre ? tatuador_nombre.trim() : null;
    }

    return await tarifaRepository.update(id_tarifa, payload);
  }

  async eliminarTarifa(id_tarifa, usuarioModificador = "ADMIN") {
    const tarifa = await tarifaRepository.findById(id_tarifa);
    if (!tarifa) {
      throw new Error("Tarifa no encontrada.");
    }
    await tarifaRepository.softDelete(id_tarifa, usuarioModificador);
    return true;
  }
}

module.exports = new TarifaService();
