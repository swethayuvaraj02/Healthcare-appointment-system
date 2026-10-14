import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../prisma/db.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';

type DeactivatePatientDto = {
  id: number;
};

@Injectable()
export class PatientsService {
  async createPatient(createPatientDto: CreatePatientDto) {
    const patient = await db.orm.public.Patient.create({
      name: createPatientDto.name,
      dateOfBirth: createPatientDto.dateOfBirth,
      gender: createPatientDto.gender,
      phone: createPatientDto.phone,
      email: createPatientDto.email,
      address: createPatientDto.address,
      emergencyContact: createPatientDto.emergencyContact,
    });

    return patient;
  }

  async updatePatient(updatePatientDto: UpdatePatientDto) {
    const patient = await db.orm.public.Patient
  .where({ id: updatePatientDto.id })
  .first();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return db.orm.public.Patient.where({ id: patient.id }).update({
  name: updatePatientDto.name,
  dateOfBirth: updatePatientDto.dateOfBirth,
  gender: updatePatientDto.gender,
  phone: updatePatientDto.phone,
  email: updatePatientDto.email,
  address: updatePatientDto.address,
  emergencyContact: updatePatientDto.emergencyContact,
});

  }

  async deactivatePatient(deactivatePatientDto: DeactivatePatientDto) {
    const patient = await db.orm.public.Patient.where({ id: deactivatePatientDto.id }).first();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return db.orm.public.Patient.where({ id: patient.id }).update({
      isActive: false,
    });
  }

  async activatePatient(id: number) {
  const patient = await db.orm.public.Patient
    .where({ id })
    .first();

  if (!patient) {
    throw new NotFoundException('Patient not found');
  }

  return db.orm.public.Patient
    .where({ id })
    .update({ isActive: true });
}

  async findOne(id: number) {
    const patient = await db.orm.public.Patient.where({ id }).first();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async findAll(search?: string, page = 1, limit = 10) {
  const patients = await db.orm.public.Patient.all();

  let filteredPatients = patients;

  if (search) {
    const normalizedSearch = search.toLowerCase();

    filteredPatients = patients.filter((patient) => {
      const name = patient.name?.toLowerCase() ?? '';
      const email = patient.email?.toLowerCase() ?? '';
      const phone = patient.phone?.toLowerCase() ?? '';

      return (
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        phone.includes(normalizedSearch)
      );
    });
  }

  filteredPatients = filteredPatients.sort((a, b) => a.id - b.id);

  const total = filteredPatients.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;

  const paginatedPatients = filteredPatients.slice(
    startIndex,
    startIndex + limit,
  );

  return {
    data: paginatedPatients,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
}
