import { IsEnum, IsInt } from 'class-validator';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export class UpdateStatusDto {
  @IsInt()
  id: number;

  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}