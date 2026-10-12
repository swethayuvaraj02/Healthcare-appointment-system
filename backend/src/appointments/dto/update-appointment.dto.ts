import { PartialType } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto.js';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsInt()
  id: number;
}