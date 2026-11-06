const clienteService = require("../services/cliente.service");
const ClienteResponseDto = require("../dtos/cliente/cliente-response.dto");

class ClienteController {
  async crear(req, res) {
    try {
      const { id_cliente, nombre, telefono, correo, usuario_creacion } = req.body;
      const cliente = await clienteService.crearCliente({
        id_cliente,
        nombre,
        telefono,
        correo,
        usuario_creacion,
      });

      return res.status(201).json({
        mensaje: "Cliente registrado con éxito",
        cliente: ClienteResponseDto.fromModel(cliente),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listar(req, res) {
    try {
      const clientes = await clienteService.listar();
      return res.json(ClienteResponseDto.fromModelList(clientes));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, telefono, correo, usuario_modificador } = req.body;
      const cliente = await clienteService.actualizarCliente(id, { nombre, telefono, correo }, usuario_modificador);

      return res.json({
        mensaje: "Cliente actualizado con éxito",
        cliente: ClienteResponseDto.fromModel(cliente),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const { usuario_modificador } = req.body;
      await clienteService.eliminarCliente(id, usuario_modificador);
      return res.json({ mensaje: "Cliente eliminado con éxito (soft delete)" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async estadoCuenta(req, res) {
    try {
      const { id } = req.params;
      const estado = await clienteService.obtenerEstadoCuenta(id);
      return res.json(estado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ClienteController();
