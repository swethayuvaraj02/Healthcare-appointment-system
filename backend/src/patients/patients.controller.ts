import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { DeactivatePatientDto } from './dto/deactivate-patient.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

@Roles('ADMIN', 'STAFF')

 @Post('create')
create(@Body() createPatientDto: CreatePatientDto) {
  return this.patientsService.createPatient(createPatientDto);
}

@Roles('ADMIN', 'STAFF')
   @Post('update')
update(@Body() updatePatientDto: UpdatePatientDto) {
  return this.patientsService.updatePatient(updatePatientDto);
}

@Roles('ADMIN', 'STAFF')
   @Post('deactivate')
  deactivate(@Body() deactivatePatientsDto: DeactivatePatientDto) {
    return this.patientsService.deactivatePatient(deactivatePatientsDto);
  }

  @Get()
findAll(
  @Query('search') search?: string,
  @Query('page') page = '1',
  @Query('limit') limit = '5',
) {
  return this.patientsService.findAll(
    search,
    Number(page),
    Number(limit),
  );
}

  @Get(':id')
findOne(@Param('id') id: string) {
  return this.patientsService.findOne(Number(id));
}
}