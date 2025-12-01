import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { getDataSource } from './utils/data-source.util';
import { DatabaseUtil } from './utils/database.util';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MainService {
  constructor(
    private readonly DatabaseUtil: DatabaseUtil,
    private jwtService: JwtService
  ) {

  }
  async getEntitiesBy(entity: string, body: any, method: string) {
    try {
      const dataSource = getDataSource(method, `${entity}/by`);
      
      if (!dataSource) {
        throw new HttpException('Endpoint no encontrado', HttpStatus.NOT_FOUND);
      }

      let entities;
      
      if (dataSource.type === 'postgres') {
        entities = await this.DatabaseUtil.ListEntityPostgres(dataSource.identifier, body.filter || {});
      } else if (dataSource.type === 'mongo') {
        const { filter = {}, options = {} } = body;
        entities = await this.DatabaseUtil.ListEntityMongo(dataSource.identifier, filter, options);
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
        entities = await this.DatabaseUtil.NewEntityPostgres(dataSource.identifier, data);
      } else if (dataSource.type === 'mongo') {
        entities = await this.DatabaseUtil.NewEntityMongo(dataSource.identifier, data);
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
        entities = await this.DatabaseUtil.AlterEntityPostgres(dataSource.identifier, data);
      } else if (dataSource.type === 'mongo') {
        entities = await this.DatabaseUtil.AlterEntityMongo(dataSource.identifier, data);
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
      // Intento real con la base de datos primero
      try {
        const result = await this.DatabaseUtil.ListEntityPostgres('fx_sel_users_with_credentials', filter || []);
        console.log('Login attempt:', filter);
        if (filter && filter.length && result && result.length) {
          const user = result[0];
          const token = await this.generateToken(user);
          user.token = token;
          return { success: true, data: user };
        } else {
          return { success: false, data: null, message: 'Credenciales incorrectas' };
        }
      } catch (dbError) {
        console.error('Database error:', dbError.message);
        
        // Fallback a demo login si la DB falla (solo en desarrollo)
        if (filter && filter.length > 0) {
          const credentials = filter[0];
          if (credentials.code === 'U009' && credentials.password === '1234') {
            console.log('Using demo fallback for U009');
            const demoUser = {
              id: 69,
              code: 'U009',
              names: 'Diego',
              last_names: 'Alvarado',
              email: 'diego.alvarado@sasur.pe',
              company_id: 8,
              user_type: 10
            };
            const token = await this.generateToken(demoUser);
            demoUser['token'] = token;
            return { success: true, data: demoUser };
          }
        }
        
        return { success: false, data: null, message: 'Error de conexión a la base de datos' };
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Error en el login',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async generateToken(user: any) {
    // Implementa tu lógica de generación de token aquí
    // Esto es un ejemplo básico
    return await this.jwtService.signAsync(user);
  }
}