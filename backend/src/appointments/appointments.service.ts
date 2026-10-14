import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../prisma/db.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';

type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

@Injectable()
export class AppointmentsService {
  async createAppointment(dto: CreateAppointmentDto) {
    const patient = await db.orm.public.Patient
      .where({ id: dto.patientId })
      .first();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const doctor = await db.orm.public.Doctor
      .where({ id: dto.doctorId })
      .first();

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!doctor.isActive) {
      throw new BadRequestException('Doctor is inactive');
    }

    const appointmentAt = new Date(dto.appointmentAt);

    if (Number.isNaN(appointmentAt.getTime())) {
      throw new BadRequestException('Invalid appointment date and time');
    }

    const existingAppointments =
      await db.orm.public.Appointment.all();

    const doctorConflict = existingAppointments.some(
      (appointment) =>
        appointment.doctorId === dto.doctorId &&
        new Date(appointment.appointmentAt).getTime() ===
          appointmentAt.getTime() &&
        appointment.status !== 'CANCELLED',
    );

    if (doctorConflict) {
      throw new BadRequestException(
        'Doctor already has an appointment at this time',
      );
    }

    const patientConflict = existingAppointments.some(
      (appointment) =>
        appointment.patientId === dto.patientId &&
        new Date(appointment.appointmentAt).getTime() ===
          appointmentAt.getTime() &&
        appointment.status !== 'CANCELLED',
    );

    if (patientConflict) {
      throw new BadRequestException(
        'Patient already has an appointment at this time',
      );
    }

    const appointmentStatus: AppointmentStatus = 'SCHEDULED';

    return db.orm.public.Appointment.create({
      patientId: dto.patientId,
      doctorId: dto.doctorId,
      appointmentAt: dto.appointmentAt,
      status: appointmentStatus,
      reason: dto.reason,
    });
  }

  async findOne(id: number) {
    const appointment = await db.orm.public.Appointment
      .where({ id })
      .first();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async findAll(
  status?: string,
  doctorId?: number,
  patientId?: number,
  page = 1,
  limit = 10,
) {
  const appointments = await db.orm.public.Appointment.all();

  let filteredAppointments = appointments.filter((appointment) => {
    if (status && appointment.status !== status) {
      return false;
    }

    if (doctorId && appointment.doctorId !== doctorId) {
      return false;
    }

    if (patientId && appointment.patientId !== patientId) {
      return false;
    }

    return true;
  });

  filteredAppointments = filteredAppointments.sort(
  (a, b) =>
    new Date(b.createdAt).getTime() -
    new Date(a.createdAt).getTime(),
);

  const total = filteredAppointments.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;

  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + limit,
  );

  return {
    data: paginatedAppointments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

  async updateAppointment(dto: UpdateAppointmentDto) {
    const appointment = await db.orm.public.Appointment
      .where({ id: dto.id })
      .first();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

   if (
  appointment.status === 'COMPLETED' ||
  appointment.status === 'CANCELLED' ||
  appointment.status === 'NO_SHOW'
) {
      throw new BadRequestException(
        'Completed or cancelled appointments cannot be edited',
      );
    }

    const patientId = dto.patientId ?? appointment.patientId;
    const doctorId = dto.doctorId ?? appointment.doctorId;
    const appointmentAt =
      dto.appointmentAt ?? appointment.appointmentAt;

      const status = dto.status ?? appointment.status;

const allowedStatuses = [
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

if (!allowedStatuses.includes(status)) {
  throw new BadRequestException('Invalid appointment status');
}

const allowedTransitions: Record<string, string[]> = {
  SCHEDULED: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

if (!allowedTransitions[appointment.status]?.includes(status)) {
  throw new BadRequestException(
    `Cannot change appointment status from ${appointment.status} to ${status}`,
  );
}

    const patient = await db.orm.public.Patient
      .where({ id: patientId })
      .first();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const doctor = await db.orm.public.Doctor
      .where({ id: doctorId })
      .first();

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!doctor.isActive && doctorId !== appointment.doctorId) {
      throw new BadRequestException('Doctor is inactive');
    }

    const parsedAppointmentAt = new Date(appointmentAt);

    if (Number.isNaN(parsedAppointmentAt.getTime())) {
      throw new BadRequestException(
        'Invalid appointment date and time',
      );
    }

    const existingAppointments =
      await db.orm.public.Appointment.all();

    const doctorConflict = existingAppointments.some(
      (existing) =>
        existing.id !== dto.id &&
        existing.doctorId === doctorId &&
        new Date(existing.appointmentAt).getTime() ===
          parsedAppointmentAt.getTime() &&
        existing.status !== 'CANCELLED',
    );

    if (doctorConflict) {
      throw new BadRequestException(
        'Doctor already has an appointment at this time',
      );
    }

    const patientConflict = existingAppointments.some(
      (existing) =>
        existing.id !== dto.id &&
        existing.patientId === patientId &&
        new Date(existing.appointmentAt).getTime() ===
          parsedAppointmentAt.getTime() &&
        existing.status !== 'CANCELLED',
    );

    if (patientConflict) {
      throw new BadRequestException(
        'Patient already has an appointment at this time',
      );
    }

    return db.orm.public.Appointment
      .where({ id: dto.id })
      .update({
  patientId,
  doctorId,
  appointmentAt: parsedAppointmentAt.toISOString(),
  status,
  reason: dto.reason ?? appointment.reason,
});
  }
  
  async markCompleted(id: number) {
    const appointment = await db.orm.public.Appointment
      .where({ id })
      .first();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status !== 'SCHEDULED') {
      throw new BadRequestException(
        'Only scheduled appointments can be marked as completed',
      );
    }

    return db.orm.public.Appointment
      .where({ id })
      .update({
        status: 'COMPLETED',
      });
  }
}


  