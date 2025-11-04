import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { ClientsController } from './client.controller';
import { Client } from './client.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { authConfig } from 'src/config/auth.config';

@Module({
  imports: [TypeOrmModule.forFeature([Client]),
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
      UserModule,],
  controllers: [ClientsController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
