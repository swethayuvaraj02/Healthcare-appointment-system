import { Injectable } from '@nestjs/common';
import { db } from '../prisma/db.js';

@Injectable()
export class DashboardService {
  async getDashboardStats() {
    const patients = await db.orm.public.Patient.all();
    const doctors = await db.orm.public.Doctor.all();
    const appointments = await db.orm.public.Appointment.all();

    const appointmentStatusCounts = {
      SCHEDULED: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      NO_SHOW: 0,
    };

    for (const appointment of appointments) {
      appointmentStatusCounts[appointment.status]++;
    }

    const now = new Date();

    const upcomingAppointments = appointments
      .filter(
        (appointment) =>
          new Date(appointment.appointmentAt).getTime() >= now.getTime() &&
          appointment.status !== 'CANCELLED' &&
          appointment.status !== 'COMPLETED' &&
          appointment.status !== 'NO_SHOW',
      )
      .sort(
        (a, b) =>
          new Date(a.appointmentAt).getTime() -
          new Date(b.appointmentAt).getTime(),
      )
      .slice(0, 5)
      .map((appointment) => {
        const patient = patients.find(
          (item) => item.id === appointment.patientId,
        );

        const doctor = doctors.find(
          (item) => item.id === appointment.doctorId,
        );

        return {
          id: appointment.id,
          patientName: patient?.name ?? 'Unknown Patient',
          doctorSpecialization:
            doctor?.specialization ?? 'Unknown Specialization',
          appointmentAt: appointment.appointmentAt,
          status: appointment.status,
          reason: appointment.reason,
        };
      });

    return {
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      appointmentStatusCounts,
      upcomingAppointments,
    };
  }
}