import {
  IsString,
  IsOptional,
  IsArray,
  ArrayUnique,
  IsEmail,
  IsDateString,
  Length,
  Matches,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClientDto {
  @IsString()
  @Length(2, 100)
  clientName: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  commercialName?: string;

  @IsOptional()
  @IsString()
  salesperson?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsDate({ message: 'joinedDate must be a valid Date' })
  @Type(() => Date)
  joinedDate?: Date;

  @IsOptional()
  @IsDate({ message: 'leavingDate must be a valid Date' })
  @Type(() => Date)
  leavingDate?: Date;

  @IsOptional()
  @IsString()
  reasonIfLeft?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  // ✅ Nested clientdata validation
  @IsOptional()
  @ValidateNested()
  @Type(() => ClientDataDto)
  clientdata?: ClientDataDto[];
}

// 👇 Define the nested object type for clientdata
export class ClientDataDto {
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'Phone number must be valid (7–15 digits, optional + at start)',
  })
  phone: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  designation: string;

  @IsString()
  contactPerson: string;
}
