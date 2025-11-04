import { Controller, Post } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User, Role } from '../user/user-entity';

@Controller('seed')
export class SeedController {
  constructor(private dataSource: DataSource) {}

  @Post()
  async runSeed() {
    const userRepo = this.dataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepo.findOne({
      where: { email: 'admin@example.com' },
    });

    if (existingAdmin) {
      return { message: '⚠️ Admin user already exists.' };
    }

    // Create the admin user
    const admin = userRepo.create({
      firstName: 'admin',
      lastName: 'admin',
      email: 'admin@example.com',
      password:
        '$2b$10$ePfpF847a0BU3yZ.m9aZdePNxgn8b..mkNYttSkeVenq0yD7rCdcG', 
      role: Role.ADMIN,
    });

    await userRepo.save(admin);

    return { message: '🌱 Seeding complete! Admin user created.' };
  }
}
