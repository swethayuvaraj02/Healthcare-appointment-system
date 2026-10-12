import api from './api';

const API_URL = 'http://localhost:3000/api/v1/dashboard';

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  appointmentStatusCounts: {
    SCHEDULED: number;
    CONFIRMED: number;
    COMPLETED: number;
    CANCELLED: number;
    NO_SHOW: number;
  };
  upcomingAppointments: {
    id: number;
    patientName: string;
    doctorSpecialization: string;
    appointmentAt: string;
    status: string;
    reason?: string;
  }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get(API_URL);
  return response.data;
};