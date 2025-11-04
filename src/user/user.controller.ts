import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    ParseUUIDPipe,
    UseGuards,
    HttpCode,
    HttpStatus,
    Query,
    ValidationPipe,
    Patch,
  } from '@nestjs/common';
  import { UserService } from './user.service';
  import { CreateUserDto } from './create-user-dto';
  import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
  import { RolesGuard } from 'src/common/guards/roles.guard';
  import { Roles } from 'src/common/decorators/roles.decorators';
  import { Role, User } from './user-entity';
import { PagninationParams } from 'src/common/pagnination.params';
import { PagninationResponse } from 'src/common/pagniniation.response';
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Controller('users')
  export class UserController {
    constructor(private readonly userService: UserService) {}
  
    @Post()
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() createUserDto: CreateUserDto) {
      return this.userService.createUser(createUserDto);
    }
  
    @Get(':id')
    @Roles(Role.ADMIN)
    async getUser(@Param('id', new ParseUUIDPipe()) id: string) {
      return this.userService.findOne(id);
    }
  
    @Put(':id')
    @Roles(Role.ADMIN)
    async updateUser(
      @Param('id', new ParseUUIDPipe()) id: string,
      @Body() updateData: Partial<CreateUserDto>,
    ) {
      return this.userService.updateUser(id, updateData);
    }
  
    @Delete(':id')
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
      return this.userService.deleteUser(id);
    }
  
    @Get()
    @Roles(Role.ADMIN)
    async getAllClients(
          @Query(new ValidationPipe({ transform: true })) pagnination: PagninationParams
        ): Promise<PagninationResponse<User>> {
          const [items, total] = await this.userService.findAll(pagnination);
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
    @Patch(':id/toggle-activation')
    async toggleActivation(@Param('id') id: string) {
      return this.userService.toggleUserActivation(id);
    }
  }
  