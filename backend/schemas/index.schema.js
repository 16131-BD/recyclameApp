const models = {
};

const getModel = (modelName) => {
  const model = models[modelName];
  if (!model) {
    throw new Error(`Model ${modelName} no encontrado`);
  }
  return model;
}

module.exports = {
  getModel
}