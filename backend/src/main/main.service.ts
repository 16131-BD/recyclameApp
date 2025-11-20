import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { getDataSource } from './utils/data-source.util';
import { 
  ListEntityPostgres, 
  NewEntityPostgres, 
  AlterEntityPostgres,
  ListEntityMongo,
  NewEntityMongo,
  AlterEntityMongo
} from './utils/database.util';

@Injectable()
export class MainService {
  async getEntitiesBy(entity: string, body: any, method: string) {
    try {
      const dataSource = getDataSource(method, `${entity}/by`);
      
      if (!dataSource) {
        throw new HttpException('Endpoint no encontrado', HttpStatus.NOT_FOUND);
      }

      let entities;
      
      if (dataSource.type === 'postgres') {
        entities = await ListEntityPostgres(dataSource.identifier, body.filter || {});
      } else if (dataSource.type === 'mongo') {
        const { filter = {}, options = {} } = body;
        entities = await ListEntityMongo(dataSource.identifier, filter, options);
      }

      if (entities && entities.error) {
        throw new HttpException(entities.message, HttpStatus.BAD_REQUEST);
      }

      return { success: true, data: entities };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createEntities(entity: string, data: any, method: string) {
    try {
      if (!data) {
        throw new HttpException('No se proporciona información para insertar', HttpStatus.BAD_REQUEST);
      }

      const dataSource = getDataSource(method, `${entity}/create`);
      
      if (!dataSource) {
        throw new HttpException('Endpoint no encontrado', HttpStatus.NOT_FOUND);
      }

      let entities;
      
      if (dataSource.type === 'postgres') {
        entities = await NewEntityPostgres(dataSource.identifier, data);
      } else if (dataSource.type === 'mongo') {
        entities = await NewEntityMongo(dataSource.identifier, data);
      }

      if (entities && entities.error) {
        throw new HttpException(entities.message, HttpStatus.BAD_REQUEST);
      }

      return { success: true, data: entities };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateEntities(entity: string, data: any, method: string) {
    try {
      if (!data) {
        throw new HttpException('No se proporciona información para actualizar', HttpStatus.BAD_REQUEST);
      }

      const dataSource = getDataSource(method, `${entity}/update`);
      
      if (!dataSource) {
        throw new HttpException('Endpoint no encontrado', HttpStatus.NOT_FOUND);
      }

      let entities;
      
      if (dataSource.type === 'postgres') {
        entities = await AlterEntityPostgres(dataSource.identifier, data);
      } else if (dataSource.type === 'mongo') {
        entities = await AlterEntityMongo(dataSource.identifier, data);
      }

      if (entities && entities.error) {
        throw new HttpException(entities.message, HttpStatus.BAD_REQUEST);
      }

      return { success: true, data: entities };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // async uploadFile(file: Express.Multer.File) {
  //   if (!file) {
  //     throw new HttpException('No se proporcionó archivo', HttpStatus.BAD_REQUEST);
  //   }

  //   return {
  //     success: true,
  //     data: {
  //       filename: file.filename,
  //       originalname: file.originalname,
  //       size: file.size,
  //       mimetype: file.mimetype,
  //       path: file.path,
  //     }
  //   };
  // }

  async login(filter: any) {
    try {
      const result = await ListEntityPostgres('fx_sel_people', filter || {});
      
      if (result.length) {
        const user = result[0];
        // Aquí deberías implementar tu lógica de token
        const token = this.generateToken(user);
        user.token = token;
        return { success: true, data: user };
      } else {
        return { success: true, data: result };
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Error en el login',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private generateToken(user: any): string {
    // Implementa tu lógica de generación de token aquí
    // Esto es un ejemplo básico
    return `token-${user.id}-${Date.now()}`;
  }
}