import { PartialType } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

import { CreatePatientDto } from './create-patient.dto.js';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsInt()
  id: number;
}