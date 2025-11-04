import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
  Query,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ClientService } from './client.service';
import { CreateClientDto } from './create-client.dto';
import { PagninationParams } from 'src/common/pagnination.params';
import { PagninationResponse } from 'src/common/pagniniation.response';
import { Client } from './client.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { Role } from 'src/user/user-entity';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientService) {}
  @Roles(Role.ADMIN)
  @Get('units')
  async getAllUnits(): Promise<string[]> {
    return this.clientsService.getAllUnits();
  }

  // @Post('upload')
  // @Roles(Role.ADMIN)

  // @UseInterceptors(

  //   FileInterceptor('file', {
  //     storage: multer.diskStorage({
  //       destination: './uploads',
  //       filename: (req, file, cb) => {
  //         const uniqueSuffix =
  //           Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         cb(null, `${uniqueSuffix}-${file.originalname}`);
  //       },
  //     }),
  //     fileFilter: (req, file, cb) => {
  //       const allowed = [
  //         'application/vnd.ms-excel',
  //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //         'text/csv',
  //         'application/vnd.oasis.opendocument.spreadsheet',
  //       ];
  //       if (allowed.includes(file.mimetype)) cb(null, true);
  //       else cb(new BadRequestException('Only Excel, CSV, or ODS files are allowed!'), false);
  //     },
  //   }),
  // )
  // async uploadExcel(@UploadedFile() file: Express.Multer.File) {
  //   if (!file) throw new BadRequestException('No file uploaded');
  //   return this.clientsService.importExcel(file);
  // }

  @Post('upload')
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),  
      limits: { fileSize: 10 * 1024 * 1024 }, 
      fileFilter: (req, file, cb) => {
        const allowed = [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
          'application/vnd.oasis.opendocument.spreadsheet',
        ];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else
          cb(
            new BadRequestException(
              'Only Excel, CSV, or ODS files are allowed!',
            ),
            false,
          );
      },
    }),
  )
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    // لاحظ: هنعدّي الـ buffer بدل المسار
    return this.clientsService.importExcel(file);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Post()
  async createClient(@Body() dto: CreateClientDto, @Req() req: Request) {
    const userId = (req as any).user?.id;

    return this.clientsService.create(dto, userId);
  }

  @Roles(Role.USER)
  @Get('foruser')
  async getAllClientsForUser(
    @Query(new ValidationPipe({ transform: true }))
    pagnination: PagninationParams,
    @Req() req: Request,
  ): Promise<PagninationResponse<Client>> {
    const userId = (req as any).user?.id;
    const [items, total] = await this.clientsService.findAllForUser(
      pagnination,
      userId,
    );
    return {
      data: items,
      meta: {
        total,
        page: pagnination.page,
        limit: pagnination.limit,
      },
    };
  }

  @Roles(Role.ADMIN)
  @Get()
  async getAllClients(
    @Query(new ValidationPipe({ transform: true }))
    pagnination: PagninationParams,
  ): Promise<PagninationResponse<Client>> {
    const [items, total] = await this.clientsService.findAll(pagnination);
    return {
      data: items,
      meta: {
        total,
        page: pagnination.page,
        limit: pagnination.limit,
      },
    };
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  async getClient(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  async updateClient(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateClientDto>,
  ) {
    return this.clientsService.update(id, dto);
  }
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteClient(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.remove(id);
  }
}
