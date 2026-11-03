const clienteRepository = require("../repositories/ClienteRepository");
const Cliente = require("../models/Cliente");

class ClienteService {
  async crearCliente({ id_cliente, nombre, telefono, correo, usuario_creacion = "SISTEMA" }) {
    if (!nombre || !telefono || !correo) {
      throw new Error("Nombre, teléfono y correo del cliente son obligatorios.");
    }

    if (id_cliente) {
      const existeId = await clienteRepository.findById(id_cliente);
      if (existeId) {
        throw new Error("El ID de cliente ya está registrado.");
      }
    }

    const payload = {
      nombre,
      telefono,
      correo,
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

    cliente.actualizarDatos({ nombre, telefono, correo }, usuarioModificador);

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
}

module.exports = new ClienteService();
