import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller.js';
import { PatientsService } from './patients.service.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, RolesGuard]
})
export class PatientsModule {}
