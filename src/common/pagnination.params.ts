import { Type } from "class-transformer";
import { IsOptional, Max, Min, IsNumber, IsString } from "class-validator";

export class PagninationParams {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1)
  @Max(10000)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string; 

  @IsOptional()
  @IsString()
  unit?: string; 
  @IsOptional()
  @IsString()
  units?: string; 
  @IsOptional()
  @IsString()
  sort?: string; 

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC'; 
  @IsOptional()
  @IsString()
  activate?:string
}
