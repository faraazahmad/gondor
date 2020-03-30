import Models from 'Models';

export default class BaseModelService {
  constructor(instance = null) {
    this._instance = instance;
  }

  get exists() {
    return !!this._instance;
  }

  async toObject() {
    let data = this._instance;
    if (typeof data?.toJSON === 'function') data = data.toJSON();
    if (typeof this._export === 'function') data = await this._export(data);

    return data;
  }
}

export const saveInstance = (target, property, descriptor) => {
  const next = descriptor.value;
  descriptor.value = async function() {
    this._instance = await next.apply(this, arguments);

    return this._instance;
  };
  return descriptor;
};

export const requireInstance = (target, property, descriptor) => {
  const next = descriptor.value;
  descriptor.value = function() {
    if (!this._instance)
      throw new Error('Model instance is required for this method call.');
    return next.apply(this, arguments);
  };
  return descriptor;
};

export const withTransaction = (target, property, descriptor) => {
  const next = descriptor.value;
  descriptor.value = function() {
    return Models.sequelize.transaction(t => next.call(this, t, ...arguments));
  };
  return descriptor;
};
