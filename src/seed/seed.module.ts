import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedController } from './seed.controller';
import { User } from '../user/user-entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], 

  controllers: [SeedController],
})
export class SeedModule {}
