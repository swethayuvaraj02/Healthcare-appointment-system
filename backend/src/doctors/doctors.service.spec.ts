import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DoctorsService } from './doctors.service.js';

const { mockDoctor } = vi.hoisted(() => ({
  mockDoctor: {
    create: vi.fn(),
    where: vi.fn(),
    all: vi.fn(),
  },
}));

vi.mock('../prisma/db.js', () => ({
  db: {
    orm: {
      public: {
        Doctor: mockDoctor,
      },
    },
  },
}));

describe('DoctorsService', () => {
  let service: DoctorsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDoctor.where.mockReturnValue({
      first: vi.fn(),
      update: vi.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [DoctorsService],
    }).compile();

    service = module.get<DoctorsService>(DoctorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDoctor', () => {
    const createDto = {
      name: 'Dr. Test',
      email: 'doctor@example.com',
      specialization: 'Cardiology',
      availability: 'Mon-Fri, 10AM-4PM',
    };

    it('should create a doctor without requiring a user account', async () => {
      mockDoctor.where.mockReturnValueOnce({
        first: vi.fn().mockResolvedValue(null),
      });
      const createdDoctor = {
        id: 1,
        ...createDto,
        isActive: true,
      };
      mockDoctor.create.mockResolvedValue(createdDoctor);

      await expect(service.createDoctor(createDto)).resolves.toEqual(
        createdDoctor,
      );

      expect(mockDoctor.create).toHaveBeenCalledWith(createDto);
    });

    it('should reject a duplicate doctor email', async () => {
      mockDoctor.where.mockReturnValueOnce({
        first: vi.fn().mockResolvedValue({ id: 1, email: createDto.email }),
      });

      await expect(service.createDoctor(createDto)).rejects.toThrow(
        'A doctor with this email already exists',
      );
      expect(mockDoctor.create).not.toHaveBeenCalled();
    });
  });

  describe('updateDoctor', () => {
    it('should update an existing doctor', async () => {
      const existingDoctor = {
        id: 1,
        name: 'Dr. John',
        email: 'john@example.com',
        specialization: 'Cardiology',
        availability: 'Mon-Fri',
      };
      const updatedDoctor = {
        ...existingDoctor,
        specialization: 'Neurology',
        availability: 'Mon-Sat',
      };

      mockDoctor.where
        .mockReturnValueOnce({
          first: vi.fn().mockResolvedValue(existingDoctor),
        })
        .mockReturnValueOnce({
          update: vi.fn().mockResolvedValue(updatedDoctor),
        });

      const result = await service.updateDoctor({
        id: 1,
        specialization: 'Neurology',
        availability: 'Mon-Sat',
      });

      expect(result).toEqual(updatedDoctor);
    });

    it('should reject a duplicate email when updating', async () => {
      mockDoctor.where
        .mockReturnValueOnce({
          first: vi.fn().mockResolvedValue({
            id: 1,
            name: 'Dr. John',
            email: 'john@example.com',
          }),
        })
        .mockReturnValueOnce({
          first: vi.fn().mockResolvedValue({
            id: 2,
            email: 'jane@example.com',
          }),
        });

      await expect(
        service.updateDoctor({ id: 1, email: 'jane@example.com' }),
      ).rejects.toThrow('A doctor with this email already exists');
    });

    it('should throw NotFoundException when updating a nonexistent doctor', async () => {
      mockDoctor.where.mockReturnValueOnce({
        first: vi.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateDoctor({ id: 999, name: 'Unknown' }),
      ).rejects.toThrow('Doctor not found');
    });
  });

  describe('deactivateDoctor', () => {
    it('should deactivate an existing doctor', async () => {
      const doctor = { id: 1, name: 'Dr. John', isActive: true };
      const deactivatedDoctor = { ...doctor, isActive: false };

      mockDoctor.where
        .mockReturnValueOnce({
          first: vi.fn().mockResolvedValue(doctor),
        })
        .mockReturnValueOnce({
          update: vi.fn().mockResolvedValue(deactivatedDoctor),
        });

      await expect(service.deactivateDoctor({ id: 1 })).resolves.toEqual(
        deactivatedDoctor,
      );
    });
  });

  describe('findOne', () => {
    it('should return an existing doctor with their own details', async () => {
      const doctor = {
        id: 1,
        name: 'Dr. John',
        email: 'john@example.com',
        specialization: 'Cardiology',
        availability: 'Mon-Fri',
        isActive: true,
      };

      mockDoctor.where.mockReturnValueOnce({
        first: vi.fn().mockResolvedValue(doctor),
      });

      await expect(service.findOne(1)).resolves.toEqual(doctor);
    });

    it('should throw NotFoundException when finding a nonexistent doctor', async () => {
      mockDoctor.where.mockReturnValueOnce({
        first: vi.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(999)).rejects.toThrow('Doctor not found');
    });
  });
});
