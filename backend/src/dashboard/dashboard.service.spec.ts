import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../prisma/db.js';

vi.mock('../prisma/db.js', () => ({
  db: {
    orm: {
      public: {
        Patient: { all: vi.fn() },
        Doctor: { all: vi.fn() },
        Appointment: { all: vi.fn() },
      },
    },
  },
}));

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return dashboard totals and appointment status counts', async () => {
  const patientAll = vi.mocked(db.orm.public.Patient.all);
  const doctorAll = vi.mocked(db.orm.public.Doctor.all);
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  patientAll.mockResolvedValueOnce([
    { id: 1, name: 'Patient One' },
    { id: 2, name: 'Patient Two' },
  ] as any);

  doctorAll.mockResolvedValueOnce([
    { id: 1, specialization: 'Cardiology' },
  ] as any);

  appointmentAll.mockResolvedValueOnce([
    { id: 1, status: 'SCHEDULED', appointmentAt: '2026-11-10T10:00:00.000Z' },
    { id: 2, status: 'CONFIRMED', appointmentAt: '2026-11-11T10:00:00.000Z' },
    { id: 3, status: 'COMPLETED', appointmentAt: '2026-11-12T10:00:00.000Z' },
    { id: 4, status: 'CANCELLED', appointmentAt: '2026-11-13T10:00:00.000Z' },
    { id: 5, status: 'NO_SHOW', appointmentAt: '2026-11-14T10:00:00.000Z' },
    { id: 6, status: 'SCHEDULED', appointmentAt: '2026-11-15T10:00:00.000Z' },
  ] as any);

  const result = await service.getDashboardStats();

  expect(result.totalPatients).toBe(2);
  expect(result.totalDoctors).toBe(1);
  expect(result.totalAppointments).toBe(6);

  expect(result.appointmentStatusCounts).toEqual({
    SCHEDULED: 2,
    CONFIRMED: 1,
    COMPLETED: 1,
    CANCELLED: 1,
    NO_SHOW: 1,
  });
});

it('should return upcoming appointments with patient and doctor details', async () => {
  const patientAll = vi.mocked(db.orm.public.Patient.all);
  const doctorAll = vi.mocked(db.orm.public.Doctor.all);
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  patientAll.mockResolvedValueOnce([
    { id: 1, name: 'Patient One' },
    { id: 2, name: 'Patient Two' },
  ] as any);

  doctorAll.mockResolvedValueOnce([
    { id: 1, specialization: 'Cardiology' },
    { id: 2, specialization: 'Dermatology' },
  ] as any);

  const futureDate = (daysFromNow: number) =>
    new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString();

  appointmentAll.mockResolvedValueOnce([
    {
      id: 1,
      patientId: 1,
      doctorId: 1,
      appointmentAt: futureDate(3),
      status: 'SCHEDULED',
      reason: 'Check-up',
    },
    {
      id: 2,
      patientId: 2,
      doctorId: 2,
      appointmentAt: futureDate(1),
      status: 'CONFIRMED',
      reason: 'Skin consultation',
    },
  ] as any);

  const result = await service.getDashboardStats();

  expect(result.upcomingAppointments).toHaveLength(2);

  expect(result.upcomingAppointments.map((appointment) => appointment.id))
    .toEqual([2, 1]);

  expect(result.upcomingAppointments[0]).toEqual({
    id: 2,
    patientName: 'Patient Two',
    doctorSpecialization: 'Dermatology',
    appointmentAt: expect.any(String),
    status: 'CONFIRMED',
    reason: 'Skin consultation',
  });
});

it('should exclude past, cancelled, completed, and no-show appointments from upcoming appointments', async () => {
  const patientAll = vi.mocked(db.orm.public.Patient.all);
  const doctorAll = vi.mocked(db.orm.public.Doctor.all);
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  patientAll.mockResolvedValueOnce([
    { id: 1, name: 'Patient One' },
  ] as any);

  doctorAll.mockResolvedValueOnce([
    { id: 1, specialization: 'Cardiology' },
  ] as any);

  const futureDate = (daysFromNow: number) =>
    new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString();

  const pastDate = new Date(
    Date.now() - 24 * 60 * 60 * 1000,
  ).toISOString();

  appointmentAll.mockResolvedValueOnce([
    {
      id: 1,
      patientId: 1,
      doctorId: 1,
      appointmentAt: pastDate,
      status: 'SCHEDULED',
      reason: 'Past appointment',
    },
    {
      id: 2,
      patientId: 1,
      doctorId: 1,
      appointmentAt: futureDate(1),
      status: 'CANCELLED',
      reason: 'Cancelled appointment',
    },
    {
      id: 3,
      patientId: 1,
      doctorId: 1,
      appointmentAt: futureDate(2),
      status: 'COMPLETED',
      reason: 'Completed appointment',
    },
    {
      id: 4,
      patientId: 1,
      doctorId: 1,
      appointmentAt: futureDate(3),
      status: 'NO_SHOW',
      reason: 'Missed appointment',
    },
    {
      id: 5,
      patientId: 1,
      doctorId: 1,
      appointmentAt: futureDate(4),
      status: 'CONFIRMED',
      reason: 'Upcoming appointment',
    },
  ] as any);

  const result = await service.getDashboardStats();

  expect(result.upcomingAppointments.map((appointment) => appointment.id))
    .toEqual([5]);
});

it('should return a maximum of five upcoming appointments', async () => {
  const patientAll = vi.mocked(db.orm.public.Patient.all);
  const doctorAll = vi.mocked(db.orm.public.Doctor.all);
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  patientAll.mockResolvedValueOnce([
    { id: 1, name: 'Patient One' },
  ] as any);

  doctorAll.mockResolvedValueOnce([
    { id: 1, specialization: 'Cardiology' },
  ] as any);

  const appointments = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    patientId: 1,
    doctorId: 1,
    appointmentAt: new Date(
      Date.now() + (index + 1) * 60 * 60 * 1000,
    ).toISOString(),
    status: 'SCHEDULED',
    reason: `Appointment ${index + 1}`,
  }));

  appointmentAll.mockResolvedValueOnce(appointments as any);

  const result = await service.getDashboardStats();

  expect(result.upcomingAppointments).toHaveLength(5);

  expect(
    result.upcomingAppointments.map((appointment) => appointment.id),
  ).toEqual([1, 2, 3, 4, 5]);
});

it('should use fallback values when patient or doctor details are missing', async () => {
  const patientAll = vi.mocked(db.orm.public.Patient.all);
  const doctorAll = vi.mocked(db.orm.public.Doctor.all);
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  patientAll.mockResolvedValueOnce([] as any);
  doctorAll.mockResolvedValueOnce([] as any);

  appointmentAll.mockResolvedValueOnce([
    {
      id: 1,
      patientId: 999,
      doctorId: 999,
      appointmentAt: new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString(),
      status: 'SCHEDULED',
      reason: 'General checkup',
    },
  ] as any);

  const result = await service.getDashboardStats();

  expect(result.upcomingAppointments).toHaveLength(1);
  expect(result.upcomingAppointments[0]).toMatchObject({
    id: 1,
    patientName: 'Unknown Patient',
    doctorSpecialization: 'Unknown Specialization',
  });
});

it('should return zero totals and empty results when no data exists', async () => {
  const patientAll = vi.mocked(db.orm.public.Patient.all);
  const doctorAll = vi.mocked(db.orm.public.Doctor.all);
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  patientAll.mockResolvedValueOnce([] as any);
  doctorAll.mockResolvedValueOnce([] as any);
  appointmentAll.mockResolvedValueOnce([] as any);

  const result = await service.getDashboardStats();

  expect(result).toEqual({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    appointmentStatusCounts: {
      SCHEDULED: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      NO_SHOW: 0,
    },
    upcomingAppointments: [],
  });
});
});