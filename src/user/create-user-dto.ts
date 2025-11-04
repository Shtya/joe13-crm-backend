import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator"

export class CreateUserDto{
    @IsNotEmpty()
     firstName:string
     @IsNotEmpty()
     lastName:string
     @IsNotEmpty()
     @MinLength(6)
     password:string
     @IsEmail()
     email:string
     @IsNotEmpty()
     @IsString()
    units?:string


 
 }