import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { PrismaService } from 'src/database/prisma.service';

// Interfaces
export interface FilterOptions {
  page?: number;
  limit?: number;
  sort?: any;
  select?: any;
  populate?: any;
}

export interface DatabaseResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable()
export class DatabaseUtil {
  constructor(
    // Inyectar modelos de MongoDB si es necesario
    @Inject('AFFILIATION_MODEL') private Affiliation: Model<any>,
    @Inject('MOBILE_DEVICE_MODEL') private MobileDevice: Model<any>,
    @Inject('REQUEST_MODEL') private Request: Model<any>,
    
    private Prisma: PrismaService
  ) {}

  async ListEntityPostgres(fnName: string, filter: any): Promise<any> {
    try {
      console.log(`SELECT * FROM public.${fnName}('${JSON.stringify(filter)}'::jsonb)`);
      const result = await this.Prisma.$queryRawUnsafe(`SELECT * FROM public.${fnName}('${JSON.stringify(filter)}'::jsonb)`);
      return result;
    } catch (error) {
      throw new HttpException(`Hubo un error: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async NewEntityPostgres(fnName: string, data: any): Promise<any> {
    try {
      const result = await this.Prisma.$queryRawUnsafe(`SELECT * FROM public.${fnName}('${JSON.stringify(data)}'::jsonb)`);
      if (result[0] && Object.values(result[0])[0]) {
        return result;
      } else {
        throw new HttpException(`No se pudo registrar: ${JSON.stringify(result)}`, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException(`Hubo un error: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async AlterEntityPostgres(fnName: string, data: any): Promise<any> {
    try {
      const result = await this.Prisma.$queryRawUnsafe(`SELECT * FROM public.${fnName}('${JSON.stringify(data)}'::jsonb)`);
      if (result[0] && Object.values(result[0])[0]) {
        return { message: "Proceso realizado correctamente" };
      } else {
        throw new HttpException(`No se pudo actualizar: ${JSON.stringify(result)}`, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException(`Hubo un error: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async ListEntityMongo(modelName: string, filter: any, options: FilterOptions = {}): Promise<any> {
    try {
      const Model = this.getMongoModel(modelName);
      
      // Construir query con opciones avanzadas
      let query = Model.find(filter);
      
      // Opciones de paginación
      if (options.page && options.limit) {
        const skip = (options.page - 1) * options.limit;
        query = query.skip(skip).limit(parseInt(options.limit.toString()));
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
        return {
          data: result,
          pagination: {
            page: parseInt(options.page.toString()),
            limit: parseInt(options.limit.toString()),
            total,
            pages: Math.ceil(total / options.limit)
          }
        };
      } else {
        return result;
      }
    } catch (error) {
      throw new HttpException(`Hubo un error: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async NewEntityMongo(modelName: string, data: any): Promise<any> {
    try {
      console.log(data);
      const Model = this.getMongoModel(modelName);
      let result;
      
      if (Array.isArray(data)) {
        // Insertar muchos
        result = await Model.insertMany(data, { ordered: false });
      } else {
        // Insertar uno
        result = await new Model(data).save();
        result = [result]; // homogeneizar salida
      }
      
      return result;
    } catch (error: any) {
      console.log(error);
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message);
        throw new HttpException(`Errores de validación: ${validationErrors.join(', ')}`, HttpStatus.BAD_REQUEST);
      } else if (error.code === 11000) {
        throw new HttpException(`Error: Valor duplicado en campo único`, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(`Hubo un error: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async AlterEntityMongo(modelName: string, data: any): Promise<any> {
    try {
      console.log(data);
      const Model = this.getMongoModel(modelName);
      
      if (Array.isArray(data)) {
        if (data.length === 0) {
          throw new HttpException('Array vacío', HttpStatus.BAD_REQUEST);
        }

        const ops = data.map((item: any) => {
          const { _id, id, ...update } = item;
          const documentId = _id || id;
          if (!documentId) {
            throw new HttpException('Cada elemento del array debe tener _id o id', HttpStatus.BAD_REQUEST);
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
        const ids = data.map((item: any) => item._id || item.id);
        const updatedDocs = await Model.find({ _id: { $in: ids } });

        return {
          message: 'Proceso realizado correctamente',
          data: updatedDocs
        };
      } else {
        const { _id, id, ...updateData } = data;
        const documentId = _id || id;
        
        if (!documentId) {
          throw new HttpException('ID es requerido para actualizar', HttpStatus.BAD_REQUEST);
        }
        
        const result = await Model.findByIdAndUpdate(
          documentId,
          updateData,
          { 
            new: true,
            runValidators: true
          }
        );
        
        if (result) {
          return { message: "Proceso realizado correctamente", data: result };
        } else {
          throw new HttpException('Documento no encontrado', HttpStatus.NOT_FOUND);
        }
      }
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message);
        throw new HttpException(`Errores de validación: ${validationErrors.join(', ')}`, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(`Hubo un error: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Método auxiliar para obtener modelos de MongoDB
  private getMongoModel(modelName: string): Model<any> {
    const modelMap: { [key: string]: Model<any> } = {
      'affiliations': this.Affiliation,
      'mobile_devices': this.MobileDevice,
      'requests': this.Request,
      // ... agregar más modelos según sea necesario
    };

    const model = modelMap[modelName];
    if (!model) {
      throw new HttpException(`Modelo ${modelName} no encontrado`, HttpStatus.NOT_FOUND);
    }

    return model;
  }
}
