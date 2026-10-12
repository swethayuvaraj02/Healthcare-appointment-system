import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../prisma/db.js';

vi.mock('../prisma/db.js', () => ({
  db: {
    orm: {
      public: {
        Patient: {
          where: vi.fn(),
        },
        Doctor: {
          where: vi.fn(),
        },
        Appointment: {
          create: vi.fn(),
          where: vi.fn(),
          all: vi.fn(),
        },
      },
    },
  },
}));

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentsService],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

it('should create an appointment', async () => {
  const createDto = {
    patientId: 1,
    doctorId: 2,
    appointmentAt: '2026-11-10T10:00:00.000Z',
    reason: 'General consultation',
  };

  const createdAppointment = {
    id: 1,
    ...createDto,
    status: 'SCHEDULED',
  };

  const patientWhere = vi.mocked(db.orm.public.Patient.where);
  const doctorWhere = vi.mocked(db.orm.public.Doctor.where);
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);
  const appointmentCreate = vi.mocked(db.orm.public.Appointment.create);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 1 }),
  } as any);

  doctorWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 2, isActive: true }),
  } as any);

  appointmentAll.mockResolvedValue([] as any);
  appointmentCreate.mockResolvedValue(createdAppointment as any);

  const result = await service.createAppointment(createDto as any);

  expect(appointmentCreate).toHaveBeenCalledWith({
    ...createDto,
    status: 'SCHEDULED',
  });

  expect(result).toEqual(createdAppointment);
});

it('should throw NotFoundException when patient does not exist', async () => {
  const patientWhere = vi.mocked(db.orm.public.Patient.where);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue(null),
  } as any);

  await expect(
    service.createAppointment({
      patientId: 999,
      doctorId: 2,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      reason: 'General consultation',
    } as any),
  ).rejects.toThrow('Patient not found');

  expect(db.orm.public.Doctor.where).not.toHaveBeenCalled();
  expect(db.orm.public.Appointment.create).not.toHaveBeenCalled();
});

it('should throw NotFoundException when doctor does not exist', async () => {
  const patientWhere = vi.mocked(db.orm.public.Patient.where);
  const doctorWhere = vi.mocked(db.orm.public.Doctor.where);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 1 }),
  } as any);

  doctorWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue(null),
  } as any);

  await expect(
    service.createAppointment({
      patientId: 1,
      doctorId: 999,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      reason: 'General consultation',
    } as any),
  ).rejects.toThrow('Doctor not found');

  expect(db.orm.public.Appointment.create).not.toHaveBeenCalled();
});

it('should throw BadRequestException when doctor is inactive', async () => {
  const patientWhere = vi.mocked(db.orm.public.Patient.where);
  const doctorWhere = vi.mocked(db.orm.public.Doctor.where);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 1 }),
  } as any);

  doctorWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 2, isActive: false }),
  } as any);

  await expect(
    service.createAppointment({
      patientId: 1,
      doctorId: 2,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      reason: 'General consultation',
    } as any),
  ).rejects.toThrow('Doctor is inactive');

  expect(db.orm.public.Appointment.create).not.toHaveBeenCalled();
});

it('should throw BadRequestException when appointment date is invalid', async () => {
  const patientWhere = vi.mocked(db.orm.public.Patient.where);
  const doctorWhere = vi.mocked(db.orm.public.Doctor.where);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 1 }),
  } as any);

  doctorWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 2, isActive: true }),
  } as any);

  await expect(
    service.createAppointment({
      patientId: 1,
      doctorId: 2,
      appointmentAt: 'not-a-valid-date',
      reason: 'General consultation',
    } as any),
  ).rejects.toThrow('Invalid appointment date and time');

  expect(db.orm.public.Appointment.create).not.toHaveBeenCalled();
});

it('should throw BadRequestException when doctor already has an appointment at this time', async () => {
  const patientWhere = vi.mocked(db.orm.public.Patient.where);
  const doctorWhere = vi.mocked(db.orm.public.Doctor.where);
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 1 }),
  } as any);

  doctorWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 2, isActive: true }),
  } as any);

  appointmentAll.mockResolvedValueOnce([
    {
      id: 10,
      patientId: 3,
      doctorId: 2,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      status: 'SCHEDULED',
    },
  ] as any);

  await expect(
    service.createAppointment({
      patientId: 1,
      doctorId: 2,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      reason: 'General consultation',
    } as any),
  ).rejects.toThrow('Doctor already has an appointment at this time');

  expect(db.orm.public.Appointment.create).not.toHaveBeenCalled();
});

it('should throw BadRequestException when patient already has an appointment at this time', async () => {
  const patientWhere = vi.mocked(db.orm.public.Patient.where);
  const doctorWhere = vi.mocked(db.orm.public.Doctor.where);
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 1 }),
  } as any);

  doctorWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 2, isActive: true }),
  } as any);

  appointmentAll.mockResolvedValueOnce([
    {
      id: 10,
      patientId: 1,
      doctorId: 3,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      status: 'SCHEDULED',
    },
  ] as any);

  await expect(
    service.createAppointment({
      patientId: 1,
      doctorId: 2,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      reason: 'General consultation',
    } as any),
  ).rejects.toThrow('Patient already has an appointment at this time');

  expect(db.orm.public.Appointment.create).not.toHaveBeenCalled();
});

it('should allow booking when the existing appointment is cancelled', async () => {
  const patientWhere = vi.mocked(db.orm.public.Patient.where);
  const doctorWhere = vi.mocked(db.orm.public.Doctor.where);
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);
  const appointmentCreate = vi.mocked(db.orm.public.Appointment.create);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 1 }),
  } as any);

  doctorWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 2, isActive: true }),
  } as any);

  appointmentAll.mockResolvedValueOnce([
    {
      id: 10,
      patientId: 3,
      doctorId: 2,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      status: 'CANCELLED',
    },
  ] as any);

  const createdAppointment = {
    id: 11,
    patientId: 1,
    doctorId: 2,
    appointmentAt: '2026-11-10T10:00:00.000Z',
    status: 'SCHEDULED',
    reason: 'General consultation',
  };

  appointmentCreate.mockResolvedValueOnce(createdAppointment as any);

  const result = await service.createAppointment({
    patientId: 1,
    doctorId: 2,
    appointmentAt: '2026-11-10T10:00:00.000Z',
    reason: 'General consultation',
  } as any);

  expect(appointmentCreate).toHaveBeenCalled();
  expect(result).toEqual(createdAppointment);
});

it('should return an appointment by id', async () => {
  const appointmentWhere = vi.mocked(db.orm.public.Appointment.where);

  const existingAppointment = {
    id: 1,
    patientId: 2,
    doctorId: 3,
    appointmentAt: '2026-11-10T10:00:00.000Z',
    status: 'SCHEDULED',
    reason: 'General consultation',
  };

  appointmentWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue(existingAppointment),
  } as any);

  const result = await service.findOne(1);

  expect(appointmentWhere).toHaveBeenCalledWith({ id: 1 });
  expect(result).toEqual(existingAppointment);
});

it('should throw NotFoundException when appointment does not exist', async () => {
  const appointmentWhere = vi.mocked(db.orm.public.Appointment.where);

  appointmentWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue(null),
  } as any);

  await expect(service.findOne(999)).rejects.toThrow(
    'Appointment not found',
  );

  expect(appointmentWhere).toHaveBeenCalledWith({ id: 999 });
});

it('should return all appointments with pagination details', async () => {
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  const appointments = [
    {
      id: 1,
      patientId: 1,
      doctorId: 2,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      status: 'SCHEDULED',
      reason: 'General consultation',
    },
    {
      id: 2,
      patientId: 2,
      doctorId: 3,
      appointmentAt: '2026-11-11T10:00:00.000Z',
      status: 'CONFIRMED',
      reason: 'Follow-up',
    },
  ];

  appointmentAll.mockResolvedValueOnce(appointments as any);

  const result = await service.findAll();

  expect(result).toEqual({
    data: appointments,
    pagination: {
      page: 1,
      limit: 5,
      total: 2,
      totalPages: 1,
    },
  });
});

it('should filter appointments by status', async () => {
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  const appointments = [
    {
      id: 1,
      patientId: 1,
      doctorId: 2,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      status: 'SCHEDULED',
      reason: 'General consultation',
    },
    {
      id: 2,
      patientId: 2,
      doctorId: 3,
      appointmentAt: '2026-11-11T10:00:00.000Z',
      status: 'CANCELLED',
      reason: 'Follow-up',
    },
    {
      id: 3,
      patientId: 3,
      doctorId: 2,
      appointmentAt: '2026-11-12T10:00:00.000Z',
      status: 'SCHEDULED',
      reason: 'Check-up',
    },
  ];

  appointmentAll.mockResolvedValueOnce(appointments as any);

  const result = await service.findAll('SCHEDULED');

  expect(result.data).toHaveLength(2);
  expect(result.data.every(
    appointment => appointment.status === 'SCHEDULED',
  )).toBe(true);

  expect(result.pagination).toEqual({
    page: 1,
    limit: 5,
    total: 2,
    totalPages: 1,
  });
});

it('should sort appointments by date in ascending order', async () => {
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  const appointments = [
    {
      id: 3,
      patientId: 3,
      doctorId: 2,
      appointmentAt: '2026-11-12T10:00:00.000Z',
      status: 'SCHEDULED',
      reason: 'Check-up',
    },
    {
      id: 1,
      patientId: 1,
      doctorId: 2,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      status: 'SCHEDULED',
      reason: 'Consultation',
    },
    {
      id: 2,
      patientId: 2,
      doctorId: 3,
      appointmentAt: '2026-11-11T10:00:00.000Z',
      status: 'CONFIRMED',
      reason: 'Follow-up',
    },
  ];

  appointmentAll.mockResolvedValueOnce(appointments as any);

  const result = await service.findAll();

  expect(result.data.map(appointment => appointment.id)).toEqual([
    1, 2, 3,
  ]);
});

it('should return the correct appointments for the requested page', async () => {
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  const appointments = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    patientId: index + 1,
    doctorId: 2,
    appointmentAt: new Date(
      `2026-11-${String(10 + index).padStart(2, '0')}T10:00:00.000Z`,
    ).toISOString(),
    status: 'SCHEDULED',
    reason: 'General consultation',
  }));

  appointmentAll.mockResolvedValueOnce(appointments as any);

  const result = await service.findAll(undefined, undefined, undefined, 2, 3);

  expect(result.data.map(appointment => appointment.id)).toEqual([4, 5, 6]);

  expect(result.pagination).toEqual({
    page: 2,
    limit: 3,
    total: 7,
    totalPages: 3,
  });
});

it('should filter appointments by doctorId', async () => {
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  const appointments = [
    {
      id: 1,
      patientId: 1,
      doctorId: 2,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      status: 'SCHEDULED',
      reason: 'Consultation',
    },
    {
      id: 2,
      patientId: 2,
      doctorId: 3,
      appointmentAt: '2026-11-11T10:00:00.000Z',
      status: 'CONFIRMED',
      reason: 'Follow-up',
    },
    {
      id: 3,
      patientId: 3,
      doctorId: 2,
      appointmentAt: '2026-11-12T10:00:00.000Z',
      status: 'SCHEDULED',
      reason: 'Check-up',
    },
  ];

  appointmentAll.mockResolvedValueOnce(appointments as any);

  const result = await service.findAll(undefined, 2);

  expect(result.data.map(appointment => appointment.id)).toEqual([1, 3]);
  expect(result.data.every(appointment => appointment.doctorId === 2)).toBe(true);

  expect(result.pagination).toEqual({
    page: 1,
    limit: 5,
    total: 2,
    totalPages: 1,
  });
});

it('should filter appointments by patientId', async () => {
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  const appointments = [
    {
      id: 1,
      patientId: 1,
      doctorId: 2,
      appointmentAt: '2026-11-10T10:00:00.000Z',
      status: 'SCHEDULED',
      reason: 'Consultation',
    },
    {
      id: 2,
      patientId: 2,
      doctorId: 3,
      appointmentAt: '2026-11-11T10:00:00.000Z',
      status: 'CONFIRMED',
      reason: 'Follow-up',
    },
    {
      id: 3,
      patientId: 1,
      doctorId: 4,
      appointmentAt: '2026-11-12T10:00:00.000Z',
      status: 'SCHEDULED',
      reason: 'Check-up',
    },
  ];

  appointmentAll.mockResolvedValueOnce(appointments as any);

  const result = await service.findAll(undefined, undefined, 1);

  expect(result.data.map(appointment => appointment.id)).toEqual([1, 3]);
  expect(
    result.data.every(appointment => appointment.patientId === 1),
  ).toBe(true);

  expect(result.pagination).toEqual({
    page: 1,
    limit: 5,
    total: 2,
    totalPages: 1,
  });
});

it('should update an appointment successfully', async () => {
  const appointmentWhere = vi.mocked(db.orm.public.Appointment.where);
  const patientWhere = vi.mocked(db.orm.public.Patient.where);
  const doctorWhere = vi.mocked(db.orm.public.Doctor.where);
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  const existingAppointment = {
    id: 1,
    patientId: 2,
    doctorId: 3,
    appointmentAt: '2026-11-10T10:00:00.000Z',
    status: 'SCHEDULED',
    reason: 'General consultation',
  };

  const updatedAppointment = {
    ...existingAppointment,
    status: 'CONFIRMED',
    reason: 'Follow-up consultation',
  };

  appointmentWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue(existingAppointment),
  } as any);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 2 }),
  } as any);

  doctorWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 3, isActive: true }),
  } as any);

  appointmentAll.mockResolvedValueOnce([] as any);

  appointmentWhere.mockReturnValueOnce({
    update: vi.fn().mockResolvedValue(updatedAppointment),
  } as any);

  const result = await service.updateAppointment({
    id: 1,
    status: 'CONFIRMED',
    reason: 'Follow-up consultation',
  } as any);

  expect(appointmentWhere).toHaveBeenNthCalledWith(1, { id: 1 });
  expect(appointmentWhere).toHaveBeenNthCalledWith(2, { id: 1 });

  expect(result).toEqual(updatedAppointment);
});

it('should throw NotFoundException when updating a non-existent appointment', async () => {
  const appointmentWhere = vi.mocked(db.orm.public.Appointment.where);

  appointmentWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue(null),
  } as any);

  await expect(
    service.updateAppointment({
      id: 999,
      status: 'CONFIRMED',
    } as any),
  ).rejects.toThrow('Appointment not found');

  expect(appointmentWhere).toHaveBeenCalledWith({ id: 999 });
});

it('should throw BadRequestException when updating with an invalid appointment date', async () => {
  const appointmentWhere = vi.mocked(db.orm.public.Appointment.where);
  const patientWhere = vi.mocked(db.orm.public.Patient.where);
  const doctorWhere = vi.mocked(db.orm.public.Doctor.where);

  const existingAppointment = {
    id: 1,
    patientId: 2,
    doctorId: 3,
    appointmentAt: '2026-11-10T10:00:00.000Z',
    status: 'SCHEDULED',
    reason: 'General consultation',
  };

  appointmentWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue(existingAppointment),
  } as any);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 2 }),
  } as any);

  doctorWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 3, isActive: true }),
  } as any);

  await expect(
    service.updateAppointment({
      id: 1,
      appointmentAt: 'not-a-valid-date',
    } as any),
  ).rejects.toThrow('Invalid appointment date and time');

  expect(appointmentWhere).toHaveBeenCalledTimes(1);
});


it('should throw BadRequestException when updating to a conflicting appointment time', async () => {
  const appointmentWhere = vi.mocked(db.orm.public.Appointment.where);
  const patientWhere = vi.mocked(db.orm.public.Patient.where);
  const doctorWhere = vi.mocked(db.orm.public.Doctor.where);
  const appointmentAll = vi.mocked(db.orm.public.Appointment.all);

  const existingAppointment = {
    id: 1,
    patientId: 2,
    doctorId: 3,
    appointmentAt: '2026-11-10T10:00:00.000Z',
    status: 'SCHEDULED',
    reason: 'General consultation',
  };

  appointmentWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue(existingAppointment),
  } as any);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 2 }),
  } as any);

  doctorWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 3, isActive: true }),
  } as any);

  appointmentAll.mockResolvedValueOnce([
    existingAppointment,
    {
      id: 2,
      patientId: 4,
      doctorId: 3,
      appointmentAt: '2026-11-12T10:00:00.000Z',
      status: 'SCHEDULED',
      reason: 'Follow-up',
    },
  ] as any);

  await expect(
    service.updateAppointment({
      id: 1,
      appointmentAt: '2026-11-12T10:00:00.000Z',
    } as any),
  ).rejects.toThrow('Doctor already has an appointment at this time');

  expect(appointmentWhere).toHaveBeenCalledTimes(1);
});

it('should throw NotFoundException when updating with a non-existent patient', async () => {
  const appointmentWhere = vi.mocked(db.orm.public.Appointment.where);
  const patientWhere = vi.mocked(db.orm.public.Patient.where);

  const existingAppointment = {
    id: 1,
    patientId: 2,
    doctorId: 3,
    appointmentAt: '2026-11-10T10:00:00.000Z',
    status: 'SCHEDULED',
    reason: 'General consultation',
  };

  appointmentWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue(existingAppointment),
  } as any);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue(null),
  } as any);

  await expect(
    service.updateAppointment({
      id: 1,
      patientId: 999,
    } as any),
  ).rejects.toThrow('Patient not found');

  expect(patientWhere).toHaveBeenCalledWith({ id: 999 });
  expect(appointmentWhere).toHaveBeenCalledTimes(1);
});

it('should throw NotFoundException when updating with a non-existent doctor', async () => {
  const appointmentWhere = vi.mocked(db.orm.public.Appointment.where);
  const patientWhere = vi.mocked(db.orm.public.Patient.where);
  const doctorWhere = vi.mocked(db.orm.public.Doctor.where);

  const existingAppointment = {
    id: 1,
    patientId: 2,
    doctorId: 3,
    appointmentAt: '2026-11-10T10:00:00.000Z',
    status: 'SCHEDULED',
    reason: 'General consultation',
  };

  appointmentWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue(existingAppointment),
  } as any);

  patientWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue({ id: 2 }),
  } as any);

  doctorWhere.mockReturnValueOnce({
    first: vi.fn().mockResolvedValue(null),
  } as any);

  await expect(
    service.updateAppointment({
      id: 1,
      doctorId: 999,
    } as any),
  ).rejects.toThrow('Doctor not found');

  expect(doctorWhere).toHaveBeenCalledWith({ id: 999 });
  expect(appointmentWhere).toHaveBeenCalledTimes(1);
});
});
