const prisma = require('./database');
const ApiResponse = require('./models');
const { getModel } = require('./schemas/index.schema');

let functions = {
  'postgres': {
    'POST': {
      'types/by': 'fx_sel_types_full',
      'types/create': 'fx_ins_types_full',
      'companies/by': 'fx_sel_companies',
      'companies/create': 'fx_ins_companies',
      'users/by': 'fx_sel_users',
      'users/create': 'fx_ins_users',
      'plants/by': 'fx_sel_plants',
      'plants/create': 'fx_ins_plants',
      'residues/by': 'fx_sel_residues',
      'residues/create': 'fx_ins_residues',
      'operations_detail/by': 'fx_sel_operations_detail',
      'operations_detail/create': 'fx_ins_operations_detail'
    },
    'PUT': {
      'types/update': 'fx_upd_types_full',
      'companies/update': 'fx_upd_companies',
      'users/update': 'fx_upd_users',
      'plants/update': 'fx_upd_plants',
      'residues/update': 'fx_upd_residues',
      'operations_detail/update': 'fx_upd_operations_detail',
    }
  },
  'mongo': {
    'POST': {
    },
    'PUT': {
    }
  }
}


// ===== METODOS GENERICOS ===== //
ListEntityPostgres = (fnName, filter) => new Promise(async (resolve, rejected) => {
  try {
    console.log(`SELECT * FROM public.${fnName}('${JSON.stringify(filter)}'::jsonb)`);
    let result = await prisma.$queryRawUnsafe(`SELECT * FROM public.${fnName}('${JSON.stringify(filter)}'::jsonb)`);
    resolve(result);
  } catch (error) {
    rejected({ error: true, message: `Hubo un error: ${error}` });
  }
});

NewEntityPostgres = (fnName, data) => new Promise(async (resolve, rejected) => {
  try {
    let result = await prisma.$queryRawUnsafe(`SELECT * FROM public.${fnName}('${JSON.stringify(data)}'::jsonb)`);
    if (result[0] && Object.values(result[0])[0]) {
      resolve(result);
    } else {
      rejected({ error: true, message: `No se pudo registrar: ${JSON.stringify(result)}` });
    }
  } catch (error) {
    rejected({ error: true, message: `Hubo un error: ${error}` });
  }
});

AlterEntityPostgres = (fnName, data) => new Promise(async (resolve, rejected) => {
  try {
    let result = await prisma.$queryRawUnsafe(`SELECT * FROM public.${fnName}('${JSON.stringify(data)}'::jsonb)`);
    if (result[0] && Object.values(result[0])[0]) {
      resolve({ message: "Proceso realizado correctamente" });
    } else {
      rejected({ error: true, message: `No se pudo actualizar: ${JSON.stringify(result)}` });
    }
  } catch (error) {
    rejected({ error: true, message: `Hubo un error: ${error}` });
  }
});

ListEntityMongo = (modelName, filter, options = {}) => new Promise(async (resolve, rejected) => {
  try {
        
    const Model = getModel(modelName);
    
    // Construir query con opciones avanzadas
    let query = Model.find(filter);
    
    // Opciones de paginación
    if (options.page && options.limit) {
      const skip = (options.page - 1) * options.limit;
      query = query.skip(skip).limit(parseInt(options.limit));
    }
    
    // Ordenamiento
    if (options.sort) {
      query = query.sort(options.sort);
    } else {
      // Ordenamiento por defecto por fecha de creación
      query = query.sort({ createdAt: -1 });
    }
    
    // Seleccionar campos específicos
    if (options.select) {
      query = query.select(options.select);
    }
    
    // Poblar referencias
    if (options.populate) {
      query = query.populate(options.populate);
    }
    
    const result = await query.exec();
    
    // Si se solicita conteo total para paginación
    if (options.page && options.limit) {
      const total = await Model.countDocuments(filter);
      resolve({
        data: result,
        pagination: {
          page: parseInt(options.page),
          limit: parseInt(options.limit),
          total,
          pages: Math.ceil(total / options.limit)
        }
      });
    } else {
      resolve(result);
    }
  } catch (error) {
    rejected({ error: true, message: `Hubo un error: ${error}` });
  }
});

NewEntityMongo = (modelName, data) => new Promise(async (resolve, rejected) => {
  try {
    console.log(data);
    const Model = getModel(modelName);
    
    if (Array.isArray(data)) {
      // Insertar muchos
      result = await Model.insertMany(data, { ordered: false }); // ordered:false -> no parar al primer error
    } else {
      // Insertar uno
      result = await new Model(data).save();
      result = [result];        // homogeneizar salida
    }
    
    resolve(result); // Mantener formato consistente con PostgreSQL
  } catch (error) {
    console.log(error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      rejected({ error: true, message: `Errores de validación: ${validationErrors.join(', ')}` });
    } else if (error.code === 11000) {
      rejected({ error: true, message: `Error: Valor duplicado en campo único` });
    } else {
      rejected({ error: true, message: `Hubo un error: ${error}` });
    }
  }
});

AlterEntityMongo = (modelName, data) => new Promise(async (resolve, rejected) => {
  try {
    console.log(data);
    const Model = getModel(modelName);
    
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return reject({ error: true, message: 'Array vacío' });
      }

      const ops = data.map(item => {
        const { _id, id, ...update } = item;
        const documentId = _id || id;
        if (!documentId) {
          throw new Error('Cada elemento del array debe tener _id o id');
        }
        return {
          updateOne: {
            filter: { _id: documentId },
            update: { $set: update },
            upsert: false
          }
        };
      });

      const bulkRes = await Model.bulkWrite(ops, { ordered: false });

      // Volver a traer los documentos actualizados
      const ids = data.map(item => item._id || item.id);
      const updatedDocs = await Model.find({ _id: { $in: ids } });

      resolve({
        message: 'Proceso realizado correctamente',
        data: updatedDocs
      });
    } else {
      const { _id, id, ...updateData } = data;
      const documentId = _id || id;
      
      if (!documentId) {
        rejected({ error: true, message: `ID es requerido para actualizar` });
        return;
      }
      
      const result = await Model.findByIdAndUpdate(
        documentId,
        updateData,
        { 
          new: true, // Retorna el documento actualizado
          runValidators: true // Ejecuta validaciones del schema
        }
      );
      
      if (result) {
        resolve({ message: "Proceso realizado correctamente", data: result });
      } else {
        rejected({ error: true, message: `Documento no encontrado` });
      }
      
    }

  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      rejected({ error: true, message: `Errores de validación: ${validationErrors.join(', ')}` });
    } else {
      rejected({ error: true, message: `Hubo un error: ${error}` });
    }
  }
});

const getDataSource = (method, url) => {
  if (functions.postgres[method] && functions.postgres[method][url]) {
    return { type: 'postgres', identifier: functions.postgres[method][url] };
  }
  if (functions.mongo[method] && functions.mongo[method][url]) {
    return { type: 'mongo', identifier: functions.mongo[method][url] };
  }
  return null;
};

// Controladores

getEntitiesBy = async (req, res) => {
  try {
    let partUrl = req.url.substring(1);
    let functions = getDataSource(req.method, partUrl);
    
    if (!functions) {
      return res.status(404).json(ApiResponse.errorResponse("Endpoint no encontrado"));
    }
    
    let entities;
    
    if (functions.type === 'postgres') {
      entities = await ListEntityPostgres(functions.identifier, req.body.filter || {});
    } else if (functions.type === 'mongo') {
      // Extraer opciones adicionales del cuerpo de la petición
      const { filter = {}, options = {} } = req.body;
      entities = await ListEntityMongo(functions.identifier, filter, options);
    }
    
    if (entities && entities.error) {
      return res.status(200).json(ApiResponse.errorResponse(entities.message));
    }
    
    res.status(200).json(ApiResponse.successResponse(entities));
  } catch (error) {
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<error>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(error);
    res.status(200).json(ApiResponse.errorResponse(error.toString()));
  }
}

createEntities = async (req, res) => {
  try {
    if (!req.body.news) {
      return res.status(400).json(ApiResponse.errorResponse("No se proporciona información para insertar"));
    }
    
    let partUrl = req.url.substring(1);
    let functions = getDataSource(req.method, partUrl);
    
    if (!functions) {
      return res.status(404).json(ApiResponse.errorResponse("Endpoint no encontrado"));
    }
    
    let entities;
    
    if (functions.type === 'postgres') {
      entities = await NewEntityPostgres(functions.identifier, req.body.news);
    } else if (functions.type === 'mongo') {
      entities = await NewEntityMongo(functions.identifier, req.body.news);
    }
    
    if (entities && entities.error) {
      return res.status(200).json(ApiResponse.errorResponse(entities.message));
    }
    
    res.status(201).json(ApiResponse.successResponse(entities));
  } catch (error) {
    res.status(200).json(ApiResponse.errorResponse(error.toString()));
  }
}

updateEntities = async (req, res) => {
  try {
    if (!req.body.updateds) {
      return res.status(400).json(ApiResponse.errorResponse("No se proporciona información para actualizar"));
    }
    
    let partUrl = req.url.substring(1);
    let functions = getDataSource(req.method, partUrl);
    
    if (!functions) {
      return res.status(404).json(ApiResponse.errorResponse("Endpoint no encontrado"));
    }
    
    let entities;
    
    if (functions.type === 'postgres') {
      entities = await AlterEntityPostgres(functions.identifier, req.body.updateds);
    } else if (functions.type === 'mongo') {
      entities = await AlterEntityMongo(functions.identifier, req.body.updateds);
    }
    
    if (entities && entities.error) {
      return res.status(200).json(ApiResponse.errorResponse(entities.message));
    }
    
    res.status(200).json(ApiResponse.successResponse(entities));
  } catch (error) {
    console.log(error);
    res.status(200).json(ApiResponse.errorResponse(error.toString()));
  }
}

module.exports = {
  getEntitiesBy,
  createEntities,
  updateEntities
}