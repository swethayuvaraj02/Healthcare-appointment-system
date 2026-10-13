import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  patientId: number;

  @IsInt()
  doctorId: number;

  @IsDateString()
  appointmentAt: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  reason?: string;
}
