
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../prisma/db.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';
import { DeactivateDoctorDto } from './dto/deactivate-doctor.dto.js';

@Injectable()
export class DoctorsService {
  async createDoctor(createDoctorDto: CreateDoctorDto) {
    const existingDoctor = await db.orm.public.Doctor
      .where({ email: createDoctorDto.email })
      .first();

    if (existingDoctor) {
      throw new ConflictException(
        'A doctor with this email already exists',
      );
    }

    return db.orm.public.Doctor.create({
      name: createDoctorDto.name,
      email: createDoctorDto.email,
      specialization: createDoctorDto.specialization,
      availability: createDoctorDto.availability,
    });
  }

  async updateDoctor(updateDoctorDto: UpdateDoctorDto) {
    const doctor = await db.orm.public.Doctor
      .where({ id: updateDoctorDto.id })
      .first();

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (updateDoctorDto.email && updateDoctorDto.email !== doctor.email) {
      const existingDoctor = await db.orm.public.Doctor
        .where({ email: updateDoctorDto.email })
        .first();

      if (existingDoctor) {
        throw new ConflictException(
          'A doctor with this email already exists',
        );
      }
    }

    const { id, ...updates } = updateDoctorDto;

    return db.orm.public.Doctor
      .where({ id })
      .update(updates);
  }

  async deactivateDoctor(deactivateDoctorDto: DeactivateDoctorDto) {
    const doctor = await db.orm.public.Doctor
      .where({ id: deactivateDoctorDto.id })
      .first();

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return db.orm.public.Doctor
      .where({ id: doctor.id })
      .update({ isActive: false });
  }


  async activateDoctor(id: number) {
  const doctor = await db.orm.public.Doctor
    .where({ id })
    .first();

  if (!doctor) {
    throw new NotFoundException('Doctor not found');
  }

  return db.orm.public.Doctor
    .where({ id })
    .update({ isActive: true });
}

  async findOne(id: number) {
    const doctor = await db.orm.public.Doctor
      .where({ id })
      .first();

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async findAll(search?: string, page = 1, limit = 10) {
    const doctors = await db.orm.public.Doctor.all();

    let filteredDoctors = doctors;

    if (search) {
      const normalizedSearch = search.toLowerCase();

      filteredDoctors = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(normalizedSearch) ||
        doctor.email.toLowerCase().includes(normalizedSearch) ||
        doctor.specialization.toLowerCase().includes(normalizedSearch),
      );
    }

    filteredDoctors = filteredDoctors.sort((a, b) => a.id - b.id);

    const total = filteredDoctors.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;

    return {
      data: filteredDoctors.slice(startIndex, startIndex + limit),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}