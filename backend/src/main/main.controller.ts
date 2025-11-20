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

  // @Post('upload-file/:filetype')
  // @UseGuards(AuthGuard)
  // @UseInterceptors(FileInterceptor('file', {
  //   storage: diskStorage({
  //     destination: './files',
  //     filename: (req, file, cb) => {
  //       const fileType = (req.params as FileTypeDto).filetype;
  //       const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
  //       cb(null, `${fileType}-${Date.now()}-${randomName}${extname(file.originalname)}`);
  //     },
  //   }),
  // }))
  // async uploadFile(
  //   @Param() params: FileTypeDto,
  //   @UploadedFile() file: Express.Multer.File
  // ) {
  //   return this.mainService.uploadFile(file);
  // }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.mainService.login(body.filter);
  }
}