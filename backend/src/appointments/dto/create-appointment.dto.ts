import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  patientId: number;

  @IsInt()
  doctorId: number;

  @IsDateString()
  appointmentAt: string;

  @IsIn([
    'SCHEDULED',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  reason?: string;
}