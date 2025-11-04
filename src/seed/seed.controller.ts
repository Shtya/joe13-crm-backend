import { Controller, Post } from '@nestjs/common';
import { AppDataSource } from '../data-source';
import { Role, User } from '../user/user-entity';

@Controller('seed')
export class SeedController {
  @Post()
  async runSeed() {
    const dataSource = await AppDataSource.initialize();

    try {
      const userRepo = dataSource.getRepository(User);

      const existingAdmin = await userRepo.findOne({
        where: { email: 'admin@example.com' },
      });

      if (existingAdmin) {
        return { message: 'Admin user already exists. No changes made.' };
      }

      const admin = userRepo.create({
        firstName: 'admin',
        lastName: 'admin',
        email: 'admin@example.com',
        // pre-hashed password: "admin123" or whatever you used
        password: '$2b$10$ePfpF847a0BU3yZ.m9aZdePNxgn8b..mkNYttSkeVenq0yD7rCdcG',
        role: Role.ADMIN,
      });

      await userRepo.save(admin);

      return { message: '🌱 Seeding complete! Admin user created.' };
    } catch (error) {
      console.error('❌ Seed error:', error);
      return { error: 'Seeding failed', details: error.message };
    } finally {
      await dataSource.destroy();
    }
  }
}
