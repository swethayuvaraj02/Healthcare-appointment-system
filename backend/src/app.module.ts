import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PatientsModule } from './patients/patients.module.js';
import { DoctorsModule } from './doctors/doctors.module.js';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
