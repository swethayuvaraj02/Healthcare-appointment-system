import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
  ) {}

  @Roles('ADMIN', 'DOCTOR', 'STAFF')
  @Post('create')
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(dto);
  }

  @Roles('ADMIN', 'DOCTOR', 'STAFF')
  @Post('update')
  update(@Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.updateAppointment(dto);
  }

  @Get()
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'doctorId', required: false })
  @ApiQuery({ name: 'patientId', required: false })
findAll(
  @Query('status') status?: string,
  @Query('doctorId') doctorId?: string,
  @Query('patientId') patientId?: string,
  @Query('page') page = '1',
  @Query('limit') limit = '10',
) {
  return this.appointmentsService.findAll(
    status,
    doctorId ? Number(doctorId) : undefined,
    patientId ? Number(patientId) : undefined,
    Number(page),
    Number(limit),
  );
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(Number(id));
  }

  @Roles('ADMIN', 'DOCTOR', 'STAFF')
  @Post(':id/complete')
  markCompleted(@Param('id') id: string) {
    return this.appointmentsService.markCompleted(Number(id));
  }

}