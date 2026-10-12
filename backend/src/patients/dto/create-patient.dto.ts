import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
@IsNotEmpty()
@Matches(/^[6-9]\d{9}$/, {
  message: 'Please enter a valid 10-digit phone number.',
})
phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty()
  emergencyContact: string;
}