import api from './api';

const API_URL = '/appointments';

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentAt: string;
  status: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AppointmentListResponse {
  data: Appointment[];
  pagination: AppointmentPagination;
}

export const getAppointments = async (
  status?: string,
  doctorId?: number,
  patientId?: number,
  page = 1,
  limit = 5,
): Promise<AppointmentListResponse> => {
  const response = await api.get(API_URL, {
    params: {
      ...(status ? { status } : {}),
      ...(doctorId ? { doctorId } : {}),
      ...(patientId ? { patientId } : {}),
      page,
      limit,
    },
  });

  return response.data;
};

export const getAppointment = async (
  id: number,
): Promise<Appointment> => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const createAppointment = async (
  patientId: number,
  doctorId: number,
  appointmentAt: string,
  status: string,
  reason: string,
): Promise<Appointment> => {
  const response = await api.post(`${API_URL}/create`, {
    patientId,
    doctorId,
    appointmentAt,
    status,
    reason,
  });

  return response.data;
};

export const updateAppointment = async (
  id: number,
  patientId: number,
  doctorId: number,
  appointmentAt: string,
  status: string,
  reason: string,
): Promise<Appointment> => {
  const response = await api.post(`${API_URL}/update`, {
    id,
    patientId,
    doctorId,
    appointmentAt,
    status,
    reason,
  });

  return response.data;
};
