// src/auth/auth.service.ts
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { UserService } from 'src/user/user.service';
  import { CreateUserDto } from 'src/user/create-user-dto';
  import { LoginDto } from './login-dto';
  import * as bcrypt from 'bcrypt';
  import { User } from 'src/user/user-entity';
  import { ConfigService } from '@nestjs/config';
  
  @Injectable()
  export class AuthService {
    constructor(
      
      private readonly userService: UserService,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
    ) {}
  
    private async generateTokens(user: User) {
      const authCfg = this.configService.get('auth');
  
      const payload = { sub: user.id, email: user.email, role: user.role };
  
      const accessToken = this.jwtService.sign(payload, {
        secret: authCfg.secret,
        expiresIn: authCfg.expiresIn,
      });
  
      const refreshToken = this.jwtService.sign(payload, {
        secret: authCfg.refreshSecret,
        expiresIn: authCfg.refreshExpiresIn,
      });
  
      return { accessToken, refreshToken };
    }
  
    async register(createUserDto: CreateUserDto) {
      const existingUser = await this.userService.findOneByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      if (createUserDto.units) {
        createUserDto.units = createUserDto.units.trim().toLowerCase();
      }
      const user = await this.userService.createUser(createUserDto);
      const token = await this.generateTokens(user)
      return {token,user:{firstName:createUserDto.email,email:createUserDto.email,units:createUserDto.units }};
    }
  
    async login(loginDto: LoginDto) {
      const user = await this.userService.findOneByEmail(loginDto.email);
      if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if(!user.activate){
        throw new ForbiddenException('Your account is not activated yet.');
      }
      const token = await this.generateTokens(user)
      return {token,user:{firstName:user.email,email:user.email,role:user.role,units:user.units}};
    }
  
    async refresh(refreshToken: string) {
      const authCfg = this.configService.get('auth');
  
      try {
        const payload = this.jwtService.verify(refreshToken, {
          secret: authCfg.refreshSecret,
        });
  
        const user = await this.userService.findOne(payload.sub);
        if(user)
        return this.generateTokens(user);
    else return new NotFoundException()
      } catch (e) {
        throw new UnauthorizedException('Invalid refresh token');
      }
    }
  
    async logout() {
      
      return { message: 'Logout successful' };
    }
  }
  