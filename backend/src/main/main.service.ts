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
          
          // Si es usuario secundario, cargar permisos desde MongoDB (user_permissions)
          const isSecondary = user.user_type_abbr === 'SEC' || user.user_type === 32 || Number(user.user_type) === 32;
          if (isSecondary && user.id) {
            try {
              // Buscar permisos en la colección user_permissions
              const userId = Number(user.id);
              const userPerms = await this.DatabaseUtil.ListEntityMongo(
                'user_permissions',
                { user_id: userId },
                {}
              );
              console.log('Looking for permissions with user_id:', userId, 'Found:', userPerms?.length || 0);
              if (userPerms && userPerms.length > 0) {
                user.permissions = {
                  modules: userPerms[0].modules || {},
                  restrictions: userPerms[0].restrictions || {}
                };
                console.log('Loaded permissions for secondary user:', user.permissions);
              } else {
                // Si no hay permisos definidos, asignar permisos mínimos por defecto
                user.permissions = {
                  modules: {
                    dashboard: true,
                    companies: false,
                    users: false,
                    residues: true,
                    plants: true,
                    operations: true,
                    affiliation_requests: false,
                    company_requests: false,
                    settings: false
                  },
                  restrictions: {
                    can_approve_affiliations: false,
                    can_manage_permissions: false
                  }
                };
              }
            } catch (permError) {
              console.error('Error loading permissions:', permError);
            }
          }
          
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

  // Aprobar solicitud de afiliación y crear usuario en PostgreSQL
  async approveAffiliation(data: {
    affiliationRequestId: string;
    names: string;
    last_names: string;
    email: string;
    phone?: string;
    company_id: number;
    password?: string;
    modules?: any;
  }) {
    try {
      // 1. Crear usuario en PostgreSQL
      const newUserResult = await this.DatabaseUtil.createUserFromAffiliation({
        names: data.names,
        last_names: data.last_names,
        email: data.email,
        phone: data.phone,
        company_id: data.company_id,
        password: data.password || 'temp1234'
      });

      console.log('User created:', newUserResult);

      // 2. Actualizar la solicitud de afiliación en MongoDB como aprobada
      const updateData = {
        _id: data.affiliationRequestId,
        status: 'approved',
        approved_at: new Date().toISOString(),
        assigned_permissions: data.modules
      };

      await this.DatabaseUtil.AlterEntityMongo('affiliation_requests', updateData);

      // 3. Crear entrada en authorized_operations con los permisos
      if (newUserResult.data) {
        // Generar código único para la operación autorizada
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const authCode = `PERM-${timestamp}-${random}`;
        
        const authOpData = {
          code: authCode,
          user_id: Number(newUserResult.data.user_id) || 0,
          user_name: `${data.names} ${data.last_names}`,
          user_email: data.email,
          user_code: newUserResult.data.user_code,
          company_id: Number(data.company_id),
          user_type: 32, // SEC = Secundario
          user_type_name: 'Secundario',
          is_primary: false,
          modules: data.modules || {
            dashboard: true,
            companies: false,
            users: false,
            residues: true,
            plants: true,
            operations: true,
            affiliation_requests: false,
            company_requests: false,
            settings: false
          },
          permissions: [],
          restrictions: {
            own_company_only: true,
            own_records_only: false,
            can_approve_affiliations: false,
            can_manage_permissions: false
          },
          status: true
        };

        await this.DatabaseUtil.NewEntityMongo('authorized_operations', authOpData);
      }

      return {
        success: true,
        data: {
          user: {
            id: newUserResult.data.user_id,
            code: newUserResult.data.user_code,
            email: newUserResult.data.user_email
          },
          message: 'Usuario creado y afiliación aprobada exitosamente'
        }
      };
    } catch (error) {
      console.error('Error approving affiliation:', error);
      throw new HttpException(
        error.message || 'Error al aprobar afiliación',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Establecer usuario como principal de empresa
  async setUserAsPrimary(userId: number, companyId: number) {
    try {
      const result = await this.DatabaseUtil.setUserAsPrimary(userId, companyId);
      return {
        success: true,
        data: result,
        message: 'Usuario establecido como principal exitosamente'
      };
    } catch (error) {
      console.error('Error setting primary user:', error);
      throw new HttpException(
        error.message || 'Error al establecer usuario principal',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}