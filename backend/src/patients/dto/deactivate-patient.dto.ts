import { IsInt } from 'class-validator';

export class DeactivatePatientDto {
  @IsInt()
  id: number;
}