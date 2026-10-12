import { db } from './prisma/db.js';

const appointments = [
  {
    patientIndex: 0,
    doctorIndex: 0,
    appointmentAt: '2026-10-06T10:00:00+05:30',
    status: 'CONFIRMED',
    reason: 'Routine cardiac consultation',
  },
  {
    patientIndex: 1,
    doctorIndex: 1,
    appointmentAt: '2026-10-06T11:00:00+05:30',
    status: 'SCHEDULED',
    reason: 'Skin consultation',
  },
  {
    patientIndex: 2,
    doctorIndex: 2,
    appointmentAt: '2026-10-06T12:00:00+05:30',
    status: 'COMPLETED',
    reason: 'Child health checkup',
  },
  {
    patientIndex: 3,
    doctorIndex: 3,
    appointmentAt: '2026-10-07T10:30:00+05:30',
    status: 'CONFIRMED',
    reason: 'Knee pain assessment',
  },
  {
    patientIndex: 4,
    doctorIndex: 4,
    appointmentAt: '2026-10-07T14:00:00+05:30',
    status: 'SCHEDULED',
    reason: 'Neurological consultation',
  },
  {
    patientIndex: 5,
    doctorIndex: 0,
    appointmentAt: '2026-10-08T09:30:00+05:30',
    status: 'COMPLETED',
    reason: 'Follow-up consultation',
  },
  {
    patientIndex: 6,
    doctorIndex: 1,
    appointmentAt: '2026-10-08T11:30:00+05:30',
    status: 'CANCELLED',
    reason: 'Dermatology follow-up',
  },
  {
    patientIndex: 7,
    doctorIndex: 2,
    appointmentAt: '2026-10-08T15:00:00+05:30',
    status: 'SCHEDULED',
    reason: 'Pediatric consultation',
  },
  {
    patientIndex: 8,
    doctorIndex: 3,
    appointmentAt: '2026-10-09T10:00:00+05:30',
    status: 'CONFIRMED',
    reason: 'Back pain consultation',
  },
  {
    patientIndex: 9,
    doctorIndex: 4,
    appointmentAt: '2026-10-09T13:00:00+05:30',
    status: 'NO_SHOW',
    reason: 'Migraine consultation',
  },
  {
    patientIndex: 10,
    doctorIndex: 0,
    appointmentAt: '2026-10-10T09:00:00+05:30',
    status: 'SCHEDULED',
    reason: 'Cardiac follow-up',
  },
  {
    patientIndex: 11,
    doctorIndex: 1,
    appointmentAt: '2026-10-10T11:00:00+05:30',
    status: 'COMPLETED',
    reason: 'Skin allergy consultation',
  },
  {
    patientIndex: 0,
    doctorIndex: 2,
    appointmentAt: '2026-10-11T10:30:00+05:30',
    status: 'CONFIRMED',
    reason: 'Child vaccination consultation',
  },
  {
    patientIndex: 1,
    doctorIndex: 3,
    appointmentAt: '2026-10-11T14:30:00+05:30',
    status: 'SCHEDULED',
    reason: 'Joint pain assessment',
  },
  {
    patientIndex: 2,
    doctorIndex: 4,
    appointmentAt: '2026-10-12T09:30:00+05:30',
    status: 'COMPLETED',
    reason: 'Neurology follow-up',
  },
  {
    patientIndex: 3,
    doctorIndex: 1,
    appointmentAt: '2026-10-12T11:30:00+05:30',
    status: 'SCHEDULED',
    reason: 'General dermatology consultation',
  },
  {
    patientIndex: 4,
    doctorIndex: 2,
    appointmentAt: '2026-10-13T10:00:00+05:30',
    status: 'CONFIRMED',
    reason: 'Pediatric health review',
  },
  {
    patientIndex: 5,
    doctorIndex: 3,
    appointmentAt: '2026-10-13T13:30:00+05:30',
    status: 'CANCELLED',
    reason: 'Orthopedic follow-up',
  },
  {
    patientIndex: 6,
    doctorIndex: 4,
    appointmentAt: '2026-10-14T15:00:00+05:30',
    status: 'SCHEDULED',
    reason: 'Neurological assessment',
  },
];

async function seedAppointments() {
  const patients = await db.orm.public.Patient.all();
  const doctors = await db.orm.public.Doctor.all();
  const existingAppointments = await db.orm.public.Appointment.all();

  let created = 0;
  let skipped = 0;

  for (const appointment of appointments) {
    const patient = patients[appointment.patientIndex];
    const doctor = doctors[appointment.doctorIndex];

    if (!patient || !doctor) {
      console.log(
        `Skipping appointment: patientIndex=${appointment.patientIndex}, doctorIndex=${appointment.doctorIndex}`,
      );
      continue;
    }

    const alreadyExists = existingAppointments.some(
      (existing) =>
        existing.patientId === patient.id &&
        existing.doctorId === doctor.id &&
        new Date(existing.appointmentAt).getTime() ===
          new Date(appointment.appointmentAt).getTime(),
    );

    if (alreadyExists) {
      skipped++;
      continue;
    }

    await db.orm.public.Appointment.create({
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentAt: appointment.appointmentAt,
      status: appointment.status as
        | 'SCHEDULED'
        | 'CONFIRMED'
        | 'COMPLETED'
        | 'CANCELLED'
        | 'NO_SHOW',
      reason: appointment.reason,
    });

    created++;
  }

  console.log(`Created ${created} sample appointments.`);
  console.log(`Skipped ${skipped} existing appointments.`);
}

await seedAppointments();