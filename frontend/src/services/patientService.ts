import api from './api';

const API_URL = '/patients';

export interface Patient {
  id: number;
  name: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact: string;
  isActive: boolean;
}

export interface PatientPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PatientListResponse {
  data: Patient[];
  pagination: PatientPagination;
}

export const getPatients = async (
  search?: string,
  page = 1,
  limit = 5,
): Promise<PatientListResponse> => {
  const response = await api.get(API_URL, {
    params: {
      ...(search ? { search } : {}),
      page,
      limit,
    },
  });

  return response.data;
};

export const createPatient = async (
  name: string,
  dateOfBirth: string,
  gender: string,
  phone: string,
  email: string,
  address: string,
  emergencyContact: string,
): Promise<Patient> => {
  const response = await api.post(`${API_URL}/create`, {
    name,
    dateOfBirth,
    gender,
    phone,
    email,
    address,
    emergencyContact,
  });

  return response.data;
};

export const updatePatient = async (
  id: number,
  name: string,
  dateOfBirth: string,
  gender: string,
  phone: string,
  email: string,
  address: string,
  emergencyContact: string,
): Promise<Patient> => {
  const response = await api.post(`${API_URL}/update`, {
    id,
    name,
    dateOfBirth,
    gender,
    phone,
    email,
    address,
    emergencyContact,
  });

  return response.data;
};

export const deactivatePatient = async (
  id: number,
): Promise<Patient> => {
  const response = await api.post(`${API_URL}/deactivate`, {
    id,
  });

  return response.data;
};
