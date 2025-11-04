// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user-entity';
import { authConfig } from 'src/config/auth.config';
import { AuthService } from '../auth/auth.service';
import { UserService } from 'src/user/user.service';
import { PasswordService } from 'src/password/password.service';
import {AuthController} from "./auth.controller"
import { JwtStrategy } from 'src/common/guards/jwt.strategy';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const authCfg = configService.get('auth');
        return {
          global: true,
          secret: authCfg.secret,
          signOptions: { expiresIn: authCfg.expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, PasswordService,JwtStrategy],
})
export class AuthModule {}
