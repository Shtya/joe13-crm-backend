import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user-entity';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from './create-user-dto';
import { PasswordService } from 'src/password/password.service';
import { InjectRepository } from '@nestjs/typeorm';
import { PagninationParams } from 'src/common/pagnination.params';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  public async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {

    const hashPassword = await this.passwordService.hashPassword(createUserDto.password);
    const newUser = this.userRepository.create({ ...createUserDto, password: hashPassword });
    return await this.userRepository.save(newUser);
  }

  public async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id },select:{firstName:true,lastName:true,email:true,role:true,units:true,activate:true} });
    if (!user) throw new NotFoundException(`User with id "${id}" not found`);
    return user;
  }

  public async updateUser(id: string, data: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id);
    if (data.password) {
      data.password = await this.passwordService.hashPassword(data.password);
    }
    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  public async deleteUser(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }



  public async findAll(pagination: PagninationParams): Promise<[User[], number]> {
    const limit = pagination.limit;
    const page = pagination.page;
    const offset = (page - 1) * limit;
  
    const query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.units',
        'user.createAt',
        'user.activate'
      ]).where('user.role = :role', { role: 'user' });
      
  
    if (pagination.search) {
      query.andWhere('user.email ILIKE :search', { search: `%${pagination.search}%` });
    }
  
    if (pagination.units) {
      query.andWhere('user.units = :units', { units: pagination.units });
    }

if (pagination.activate !== undefined && pagination.activate !== 'all') {
  const activeValue = pagination.activate === 'true';
  query.andWhere('user.activate = :activate', { activate: activeValue });
}
    if (pagination.sort) {
      const order = pagination.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      query.orderBy(`user.${pagination.sort}`, order);
    }
  
    query.skip(offset).take(limit);
  
    const [items, total] = await query.getManyAndCount();
    return [items, total];
  }
  public async toggleUserActivation(id: string): Promise<{ 
    success: boolean; 
    message: string; 
    data: Partial<User>;
  }> {
    const user = await this.userRepository.findOne({ where: { id } });
  
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
  
    user.activate = !user.activate;
    await this.userRepository.update(id, { activate: user.activate });
  
    const action = user.activate ? 'activated' : 'deactivated';
    console.log(`User ${id} has been ${action}`);
    
    return {
      success: true,
      message: `User has been successfully ${action}.`,
      data: {
        id: user.id,
        email: user.email,
        activate: user.activate,
      },
    };
  }
}
  