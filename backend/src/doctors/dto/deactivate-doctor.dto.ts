import { IsInt } from 'class-validator';

export class DeactivateDoctorDto {
  @IsInt()
  id: number;
}