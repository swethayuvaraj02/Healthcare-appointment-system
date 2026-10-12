import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../prisma/db.js';

vi.mock('../prisma/db.js', () => ({
  db: {
    orm: {
      public: {
        Patient: {
  create: vi.fn(),
  where: vi.fn(),
  all: vi.fn(),
},
      },
    },
  },
}));

describe('PatientsService', () => {
  let service: PatientsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientsService],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

 it('should be defined', () => {
  expect(service).toBeDefined();
});

it('should create a patient', async () => {
  const patient = {
    id: 1,
    name: 'John Doe',
    dateOfBirth: '1995-05-10',
    gender: 'Male',
    phone: '9876543210',
    email: 'john@example.com',
    address: 'Chennai',
    emergencyContact: '9876543211',
  };

  vi.mocked(db.orm.public.Patient.create).mockResolvedValue(
    patient as any,
  );

  const result = await service.createPatient(patient as any);

  expect(result).toEqual(patient);
  expect(db.orm.public.Patient.create).toHaveBeenCalledWith({
    name: patient.name,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    phone: patient.phone,
    email: patient.email,
    address: patient.address,
    emergencyContact: patient.emergencyContact,
  });
});

it('should update an existing patient', async () => {
  const existingPatient = {
    id: 1,
    name: 'John Doe',
  };

  const updatedPatient = {
    id: 1,
    name: 'John Updated',
    dateOfBirth: '1995-05-10',
    gender: 'Male',
    phone: '9876543210',
    email: 'john@example.com',
    address: 'Chennai',
    emergencyContact: '9876543211',
  };

  const firstMock = vi.fn().mockResolvedValue(existingPatient);

  vi.mocked(db.orm.public.Patient.where).mockReturnValue({
    first: firstMock,
    update: vi.fn().mockResolvedValue(updatedPatient),
  } as any);

  const result = await service.updatePatient(updatedPatient as any);

  expect(result).toEqual(updatedPatient);
});

it('should throw an error when updating a non-existent patient', async () => {
  const firstMock = vi.fn().mockResolvedValue(null);

  vi.mocked(db.orm.public.Patient.where).mockReturnValue({
    first: firstMock,
  } as any);

  await expect(
    service.updatePatient({
      id: 999,
      name: 'Unknown',
    } as any),
  ).rejects.toThrow('Patient not found');
});

it('should deactivate an existing patient', async () => {
  const existingPatient = {
    id: 1,
    name: 'John Doe',
    isActive: true,
  };

  const deactivatedPatient = {
    id: 1,
    isActive: false,
  };

  const firstMock = vi.fn().mockResolvedValue(existingPatient);
  const updateMock = vi.fn().mockResolvedValue(deactivatedPatient);

  vi.mocked(db.orm.public.Patient.where).mockReturnValue({
    first: firstMock,
    update: updateMock,
  } as any);

  const result = await service.deactivatePatient({ id: 1 });

  expect(result).toEqual(deactivatedPatient);
  expect(updateMock).toHaveBeenCalledWith({
    isActive: false,
  });
});

it('should throw an error when deactivating a non-existent patient', async () => {
  const firstMock = vi.fn().mockResolvedValue(null);

  vi.mocked(db.orm.public.Patient.where).mockReturnValue({
    first: firstMock,
  } as any);

  await expect(
    service.deactivatePatient({ id: 999 }),
  ).rejects.toThrow('Patient not found');
});

it('should find a patient by id', async () => {
  const patient = {
    id: 1,
    name: 'John Doe',
  };

  const firstMock = vi.fn().mockResolvedValue(patient);

  vi.mocked(db.orm.public.Patient.where).mockReturnValue({
    first: firstMock,
  } as any);

  const result = await service.findOne(1);

  expect(result).toEqual(patient);
});

it('should throw an error when finding a non-existent patient', async () => {
  const firstMock = vi.fn().mockResolvedValue(null);

  vi.mocked(db.orm.public.Patient.where).mockReturnValue({
    first: firstMock,
  } as any);

  await expect(service.findOne(999)).rejects.toThrow('Patient not found');
});

it('should return all patients with pagination', async () => {
  const patients = [
    { id: 1, name: 'Alice', email: 'alice@example.com', phone: '9876543210' },
    { id: 2, name: 'Bob', email: 'bob@example.com', phone: '9876543211' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', phone: '9876543212' },
  ];

  vi.mocked(db.orm.public.Patient.all).mockResolvedValue(patients as any);

  const result = await service.findAll(undefined, 1, 2);

  expect(result.data).toHaveLength(2);
  expect(result.pagination).toEqual({
    page: 1,
    limit: 2,
    total: 3,
    totalPages: 2,
  });
});

it('should filter patients by search term', async () => {
  const patients = [
    { id: 1, name: 'Alice', email: 'alice@example.com', phone: '9876543210' },
    { id: 2, name: 'Bob', email: 'bob@example.com', phone: '9876543211' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', phone: '9876543212' },
  ];

  vi.mocked(db.orm.public.Patient.all).mockResolvedValue(patients as any);

  const result = await service.findAll('alice');

  expect(result.data).toHaveLength(1);
  expect(result.data[0].name).toBe('Alice');
  expect(result.pagination.total).toBe(1);
});

});
