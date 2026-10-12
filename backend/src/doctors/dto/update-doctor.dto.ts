import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateDoctorDto {
  @IsInt()
  id: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsOptional()
  availability?: string;
}