import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { DeepPartial, Repository } from 'typeorm';
  import { Client } from './client.entity';
  import { ClientDataDto, CreateClientDto } from './create-client.dto';
  import { parseExcelToClients } from '../common/utils/excel-parser';
  import { validate } from 'class-validator';
  import { plainToInstance } from 'class-transformer';
  import * as path from 'path';
  import * as fs from 'fs';
  import * as XLSX from 'xlsx';
import { PagninationParams } from 'src/common/pagnination.params';
import { User } from 'src/user/user-entity';
import { UserService } from 'src/user/user.service';
  
  @Injectable()

  export class ClientService {
    constructor(
      @InjectRepository(Client)
      private readonly clientRepository: Repository<Client>,
      private readonly userService:UserService
    ) { 
        
    }
    private normalizeDates(dto: Partial<CreateClientDto>) {
      if (dto.joinedDate instanceof Date) {
      } else if (typeof dto.joinedDate === 'string' && dto.joinedDate !== '') {
        dto.joinedDate = new Date(dto.joinedDate);
      } else {
        dto.joinedDate = undefined;
      }
    
      if (dto.leavingDate instanceof Date) {
      } else if (typeof dto.leavingDate === 'string' && dto.leavingDate !== '') {
        dto.leavingDate = new Date(dto.leavingDate);
      } else {
        dto.leavingDate = undefined;
      }
    }
    private normalizeUnit(dto: Partial<CreateClientDto>) {
      if (dto.unit) {
        dto.unit = dto.unit.trim().toLowerCase();
      }
    }
    
    async create(createClientDto: CreateClientDto,userId): Promise<Client> {
      const user = await this.userService.findOne(userId)
      if(!user){
        throw NotFoundException
      }
      
      if (!createClientDto || Object.keys(createClientDto).length === 0) {
        throw new BadRequestException('Client data is required');
      }
      if (user.role !== 'admin' && !createClientDto.unit && user.units) {
        createClientDto.unit = user.units;
      }
      this.normalizeDates(createClientDto);
      this.normalizeUnit(createClientDto);

      const instance = plainToInstance(CreateClientDto, createClientDto);
      const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: false });
    
      if (errors.length > 0) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
      }
    
      const client = this.clientRepository.create(createClientDto);
      return this.clientRepository.save(client);
    }
    
      
      async findAll(pagnination: PagninationParams): Promise<[Client[], number]> {
        const limit = pagnination.limit;
        const page = pagnination.page;
        const offset = (page - 1) * limit;
      
        const query =  this.clientRepository.createQueryBuilder('client');
      
        if (pagnination.search) {
          query.andWhere('client.clientName ILIKE :search', { search: `%${pagnination.search}%` });
        }
      
        if (pagnination.unit) {
          query.andWhere('client.unit = :unit', { unit: pagnination.unit });
        }
      
        if (pagnination.sort) {
          const order =  pagnination.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
          query.orderBy(`client.${pagnination.sort}`, order);
        }
      
        query.skip(offset).take(limit);
      
        const [items, total] = await query.getManyAndCount();
        return [items, total];
      }
      
      

    async findOne(id: number): Promise<Client> {
      const client = await this.clientRepository.findOne({ where: { id } });
      if (!client) throw new NotFoundException(`Client with ID ${id} not found`);
      return client;
    }
  

    async update(id: number, updateClientDto: Partial<CreateClientDto>): Promise<Client> {
      const client = await this.findOne(id);
    
      const merged = Object.assign(client, updateClientDto);
    
      this.normalizeDates(updateClientDto);
      this.normalizeUnit(updateClientDto);

      const instance = plainToInstance(CreateClientDto, merged);
      const errors = await validate(instance);
    
      if (errors.length > 0) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
      }
    
      return this.clientRepository.save(client);
    }

    async remove(id: number): Promise<{ message: string }> {
      const client = await this.findOne(id);
      await this.clientRepository.remove(client);
      return { message: `Client with ID ${id} deleted successfully` };
    }
    async importExcel(file: Express.Multer.File) {
      if (!file) throw new BadRequestException('No file uploaded');
    
      const ext = path.extname(file.originalname).toLowerCase();
      const allowed = ['.xlsx', '.xls', '.csv', '.ods', '.tsv'];
      if (!allowed.includes(ext)) {
        throw new BadRequestException(
          'Invalid file type. Only Excel, CSV, or ODS files are allowed',
        );
      }
    
      const filePath = path.resolve(file.path);
    
      let dtos: any[];
      try {
        dtos = parseExcelToClients(filePath); 
      } catch (error) {
        fs.unlinkSync(filePath);
        throw new BadRequestException(`Error parsing file: ${error.message}`);
      }
    
      const savedClients: Client[] = [];
      const invalidRows: any[] = [];
    
      for (const [index, dto] of dtos.entries()) {
        if (dto.unit) {
          dto.unit = dto.unit.trim().toLowerCase();
        }
    
        const instance = plainToInstance(CreateClientDto, dto);
        const errors = await validate(instance);
    
        if (errors.length > 0) {
          invalidRows.push({
            row: index + 2,
            errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
          });
          continue;
        }
    
        const contacts: any[] = [];
    
        const phones = dto.phones || [];
        const emails = dto.emails || [];
        const designations = dto.designation || [];
        const contactPersons = dto.contactPersons || [];
    
        const maxLen = Math.max(
          phones.length,
          emails.length,
          designations.length,
          contactPersons.length,
        );
    
        for (let i = 0; i < maxLen; i++) {
          const contact = {
            phone: phones[i] || '',
            email: emails[i] || '',
            designation: designations[i] || '',
            contactPerson: contactPersons[i] || '',
          };
    
          const hasData =
            contact.phone || contact.email || contact.designation || contact.contactPerson;
          if (hasData) contacts.push(contact);
        }
    
    
      
        const existingClient = await this.clientRepository.findOne({
          where: {
            clientName: dto.clientName,
            commercialName: dto.commercialName,
          },
        });
    
        if (existingClient) {
          invalidRows.push({
            row: index + 2,
            errors: [
              `Client "${dto.clientName}" with commercial name "${dto.commercialName}" already exists`,
            ],
          });
          continue;
        }
    
   
        const client = this.clientRepository.create({
          ...dto,
          clientdata: contacts.length > 0 ? contacts : null,
        } as Partial<Client>);
    
        const saved = await this.clientRepository.save(client);
        savedClients.push(saved);
      }
    
      fs.unlinkSync(filePath);
    
      return {
        imported: savedClients.length,
        invalid: invalidRows.length,
        errors: invalidRows,
        savedClients,
      };
    }
    
    
    
    
    

    async findAllForUser(
      pagnination: PagninationParams,
      id: string,
    ): Promise<[Client[], number]> {
      const user = await this.userService.findOne(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const limit = pagnination.limit;
      const page = pagnination.page;
      const offset = (page - 1) * limit;
    
      const query = this.clientRepository.createQueryBuilder('client');
    
      if (pagnination.search) {
        query.andWhere('client.clientName ILIKE :search', { search: `%${pagnination.search}%` });
      }
    
      if (pagnination.sort) {
        const order = pagnination.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        query.orderBy(`client.${pagnination.sort}`, order);
      }
    
      const normalizedUnit = user.units?.trim().toLowerCase();


      query.andWhere('LOWER(TRIM(client.unit)) = :unit', { unit: normalizedUnit });
      
    
      query.skip(offset).take(limit);
    
      const [items, total] = await query.getManyAndCount();
      return [items, total];
    }
    async getAllUnits(): Promise<string[]> {
      const units = await this.clientRepository
      .createQueryBuilder('client')
      .select('DISTINCT client.unit', 'unit')
      .where('client.unit IS NOT NULL')
      .getRawMany();
  
    // getRawMany returns [{ unit: 'Unit1' }, { unit: 'Unit2' }]
    return units.map(u => u.unit);
    }
    
  }
  

  