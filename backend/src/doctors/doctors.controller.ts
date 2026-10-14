import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';
import { DeactivateDoctorDto } from './dto/deactivate-doctor.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Roles('ADMIN', 'STAFF')
  @Post('create')
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.createDoctor(createDoctorDto);
  }

  @Roles('ADMIN', 'STAFF')
  @Post('update')
update(@Body() updateDoctorDto: UpdateDoctorDto) {
  return this.doctorsService.updateDoctor(updateDoctorDto);
}

@Roles('ADMIN', 'STAFF')
@Post('deactivate')
deactivate(@Body() deactivateDoctorDto: DeactivateDoctorDto) {
  return this.doctorsService.deactivateDoctor(deactivateDoctorDto);
}

@Roles('ADMIN', 'STAFF')
@Post(':id/activate')
activate(@Param('id') id: string) {
  return this.doctorsService.activateDoctor(Number(id));
}

@Get(':id')
findOne(@Param('id') id: string) {
  return this.doctorsService.findOne(Number(id));
}

@Get()
findAll(
  @Query('search') search?: string,
  @Query('page') page = '1',
  @Query('limit') limit = '10',
) {
  return this.doctorsService.findAll(
    search,
    Number(page),
    Number(limit),
  );
}
}