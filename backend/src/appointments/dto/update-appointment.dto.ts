
import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto.js';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export class UpdateAppointmentDto extends PartialType(
  CreateAppointmentDto,
) {
  @IsInt()
  id: number;

  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
