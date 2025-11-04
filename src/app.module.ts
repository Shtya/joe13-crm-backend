import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { authConfig, AuthConfig } from './config/auth.config';
import { AuthService } from './auth/auth.service';
import { PasswordService } from './password/password.service';
import { AuthModule } from './auth/auth.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ClientModule } from './client/client.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [ typeOrmConfig,authConfig] }),
    TypeOrmModule.forRoot(typeOrmConfig()),
    UserModule,
    AuthModule,
    ClientModule,
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
  controllers: [AppController],
  providers: [AppService, AuthService, PasswordService,JwtService,],
})
export class AppModule {}
