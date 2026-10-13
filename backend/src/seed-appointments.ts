import { db } from './prisma/db.js';

const appointments = [
  {
    patientEmail: 'priya.sharma@example.com',
    doctorEmail: 'jane.smith@example.com',
    appointmentAt: '2026-10-06T10:00:00+05:30',
    status: 'CONFIRMED',
    reason: 'Routine cardiac consultation',
  },
  {
    patientEmail: 'rahul.menon@example.com',
    doctorEmail: 'michael.joseph@example.com',
    appointmentAt: '2026-10-06T11:00:00+05:30',
    status: 'SCHEDULED',
    reason: 'Skin consultation',
  },
  {
    patientEmail: 'ananya.krishnan@example.com',
    doctorEmail: 'sneha.rao@example.com',
    appointmentAt: '2026-10-06T12:00:00+05:30',
    status: 'COMPLETED',
    reason: 'Child health checkup',
  },
  {
    patientEmail: 'vikram.raj@example.com',
    doctorEmail: 'arvind.kumar@example.com',
    appointmentAt: '2026-10-07T10:30:00+05:30',
    status: 'CONFIRMED',
    reason: 'Knee pain assessment',
  },
  {
    patientEmail: 'meera.nair@example.com',
    doctorEmail: 'neha.kapoor@example.com',
    appointmentAt: '2026-10-07T14:00:00+05:30',
    status: 'SCHEDULED',
    reason: 'Neurological consultation',
  },
  {
    patientEmail: 'karthik.s@example.com',
    doctorEmail: 'jane.smith@example.com',
    appointmentAt: '2026-10-08T09:30:00+05:30',
    status: 'COMPLETED',
    reason: 'Follow-up consultation',
  },
  {
    patientEmail: 'divya.ramesh@example.com',
    doctorEmail: 'michael.joseph@example.com',
    appointmentAt: '2026-10-08T11:30:00+05:30',
    status: 'CANCELLED',
    reason: 'Dermatology follow-up',
  },
  {
    patientEmail: 'sanjay.kumar@example.com',
    doctorEmail: 'sneha.rao@example.com',
    appointmentAt: '2026-10-08T15:00:00+05:30',
    status: 'SCHEDULED',
    reason: 'Pediatric consultation',
  },
  {
    patientEmail: 'lakshmi.devi@example.com',
    doctorEmail: 'arvind.kumar@example.com',
    appointmentAt: '2026-10-09T10:00:00+05:30',
    status: 'CONFIRMED',
    reason: 'Back pain consultation',
  },
  {
    patientEmail: 'arjun.prakash@example.com',
    doctorEmail: 'neha.kapoor@example.com',
    appointmentAt: '2026-10-09T13:00:00+05:30',
    status: 'NO_SHOW',
    reason: 'Migraine consultation',
  },
  {
    patientEmail: 'nisha.thomas@example.com',
    doctorEmail: 'jane.smith@example.com',
    appointmentAt: '2026-10-10T09:00:00+05:30',
    status: 'SCHEDULED',
    reason: 'Cardiac follow-up',
  },
  {
    patientEmail: 'rohan.iyer@example.com',
    doctorEmail: 'michael.joseph@example.com',
    appointmentAt: '2026-10-10T11:00:00+05:30',
    status: 'COMPLETED',
    reason: 'Skin allergy consultation',
  },
  {
    patientEmail: 'priya.sharma@example.com',
    doctorEmail: 'sneha.rao@example.com',
    appointmentAt: '2026-10-11T10:30:00+05:30',
    status: 'CONFIRMED',
    reason: 'Child vaccination consultation',
  },
  {
    patientEmail: 'rahul.menon@example.com',
    doctorEmail: 'arvind.kumar@example.com',
    appointmentAt: '2026-10-11T14:30:00+05:30',
    status: 'SCHEDULED',
    reason: 'Joint pain assessment',
  },
  {
    patientEmail: 'ananya.krishnan@example.com',
    doctorEmail: 'neha.kapoor@example.com',
    appointmentAt: '2026-10-12T09:30:00+05:30',
    status: 'COMPLETED',
    reason: 'Neurology follow-up',
  },
  {
    patientEmail: 'vikram.raj@example.com',
    doctorEmail: 'michael.joseph@example.com',
    appointmentAt: '2026-10-12T11:30:00+05:30',
    status: 'SCHEDULED',
    reason: 'General dermatology consultation',
  },
  {
    patientEmail: 'meera.nair@example.com',
    doctorEmail: 'sneha.rao@example.com',
    appointmentAt: '2026-10-13T10:00:00+05:30',
    status: 'CONFIRMED',
    reason: 'Pediatric health review',
  },
  {
    patientEmail: 'karthik.s@example.com',
    doctorEmail: 'arvind.kumar@example.com',
    appointmentAt: '2026-10-13T13:30:00+05:30',
    status: 'CANCELLED',
    reason: 'Orthopedic follow-up',
  },
  {
    patientEmail: 'divya.ramesh@example.com',
    doctorEmail: 'neha.kapoor@example.com',
    appointmentAt: '2026-10-14T15:00:00+05:30',
    status: 'SCHEDULED',
    reason: 'Neurological assessment',
  },
] as const;

async function seedAppointments() {
  const patients = await db.orm.public.Patient.all();
  const doctors = await db.orm.public.Doctor.all();
  const existingAppointments = await db.orm.public.Appointment.all();

  let created = 0;
  let skipped = 0;

  for (const appointment of appointments) {
    const patient = patients.find(
      (item) => item.email === appointment.patientEmail,
    );

    const doctor = doctors.find(
      (item) => item.email === appointment.doctorEmail,
    );

    if (!patient || !doctor) {
      console.log(
        `Skipped: patient=${appointment.patientEmail}, doctor=${appointment.doctorEmail} — record not found.`,
      );
      skipped++;
      continue;
    }

    const appointmentTime = new Date(appointment.appointmentAt).getTime();

    const alreadyExists = existingAppointments.some(
      (existing) =>
        existing.patientId === patient.id &&
        existing.doctorId === doctor.id &&
        new Date(existing.appointmentAt).getTime() === appointmentTime,
    );

    if (alreadyExists) {
      skipped++;
      continue;
    }

    const createdAppointment = await db.orm.public.Appointment.create({
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentAt: appointment.appointmentAt,
      status: appointment.status,
      reason: appointment.reason,
    });

    existingAppointments.push(createdAppointment);
    created++;

  }

  console.log(`Created ${created} sample appointments.`);
  console.log(`Skipped ${skipped} existing or unmatched appointments.`);
}

await seedAppointments();
