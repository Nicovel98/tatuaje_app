class BaseRepository {
  constructor(entity, modelClass, idFieldName) {
    this.entity = entity;
    this.modelClass = modelClass;
    this.idFieldName = idFieldName;
  }

  toModel(entityInstance) {
    if (!entityInstance) return null;
    return new this.modelClass(entityInstance.toJSON());
  }

  toModelList(entityList) {
    return entityList.map((item) => this.toModel(item));
  }

  async findById(id) {
    const item = await this.entity.findOne({
      where: { [this.idFieldName]: id, eliminado: false },
    });
    return this.toModel(item);
  }

  async findAll(whereClause = {}) {
    const items = await this.entity.findAll({
      where: { ...whereClause, eliminado: false },
    });
    return this.toModelList(items);
  }

  async create(data) {
    const created = await this.entity.create(data);
    return this.toModel(created);
  }

  async update(id, data) {
    await this.entity.update(data, {
      where: { [this.idFieldName]: id },
    });
    return this.findById(id);
  }

  async softDelete(id, usuarioModificador) {
    await this.entity.update(
      { eliminado: true, usuario_actualizacion: usuarioModificador },
      { where: { [this.idFieldName]: id } }
    );
    return true;
  }
}

module.exports = BaseRepository;
