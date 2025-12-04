import { 
  Controller, 
  Post, 
  Put, 
  Body, 
  Param, 
  UseInterceptors, 
  UploadedFile, 
  UseGuards,
  Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MainService } from './main.service';
import { AuthGuard } from '../guards/auth.guard';

// DTOs (Data Transfer Objects)
class EntityDto {
  entity: string;
}

class FileTypeDto {
  filetype: string;
}

class GetEntitiesDto {
  filter?: any;
  options?: any;
}

class CreateEntitiesDto {
  news: any;
}

class UpdateEntitiesDto {
  updateds: any;
}

class LoginDto {
  filter: any;
}

// DTO para aprobar afiliación
class ApproveAffiliationDto {
  affiliationRequestId: string;  // ID de MongoDB de la solicitud
  names: string;
  last_names: string;
  email: string;
  phone?: string;
  company_id: number;
  password?: string;
  modules?: any;
}

// DTO para establecer usuario principal
class SetPrimaryUserDto {
  userId: number;
  companyId: number;
}

@Controller()
export class MainController {
  constructor(private readonly mainService: MainService) {}

  @Post(':entity/by')
  @UseGuards(AuthGuard)
  async getEntitiesBy(
    @Param() params: EntityDto,
    @Body() body: GetEntitiesDto,
    @Req() req: Request
  ) {
    return this.mainService.getEntitiesBy(params.entity, body, req.method);
  }

  @Post(':entity/create')
  @UseGuards(AuthGuard)
  async createEntities(
    @Param() params: EntityDto,
    @Body() body: CreateEntitiesDto,
    @Req() req: Request
  ) {
    return this.mainService.createEntities(params.entity, body.news, req.method);
  }

  @Put(':entity/update')
  @UseGuards(AuthGuard)
  async updateEntities(
    @Param() params: EntityDto,
    @Body() body: UpdateEntitiesDto,
    @Req() req: Request
  ) {
    return this.mainService.updateEntities(params.entity, body.updateds, req.method);
  }

  @Post(':entity/delete')
  @UseGuards(AuthGuard)
  async deleteEntities(
    @Param() params: EntityDto,
    @Body() body: CreateEntitiesDto,
    @Req() req: Request
  ) {
    // Nota: Estás usando createEntities para delete, quizás quieras cambiar esto
    return this.mainService.createEntities(params.entity, body.news, req.method);
  }

  // Endpoint especial para crear usuario desde aprobación de afiliación
  @Post('affiliation/approve')
  @UseGuards(AuthGuard)
  async approveAffiliation(@Body() body: ApproveAffiliationDto) {
    return this.mainService.approveAffiliation(body);
  }

  // Endpoint especial para establecer usuario principal
  @Post('users/set-primary')
  @UseGuards(AuthGuard)
  async setUserAsPrimary(@Body() body: SetPrimaryUserDto) {
    return this.mainService.setUserAsPrimary(body.userId, body.companyId);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    console.log(body);
    return this.mainService.login(body.filter);
  }
}