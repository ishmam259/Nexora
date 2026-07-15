import { api } from './client';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface MedicineResponseDto {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  requiresPrescription: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequestDto {
  doctorName: string;
  department: string;
  appointmentTime: string;
  amount: number;
  symptoms?: string;
}

export interface AppointmentResponseDto {
  id: number;
  customerId: string;
  doctorName: string;
  department: string;
  appointmentTime: string;
  status: AppointmentStatus;
  amount: number;
  symptoms: string;
  prescriptionDetails: string;
  createdAt: string;
  updatedAt: string;
}

export const MEDICAL_DEPARTMENTS = [
  'General Medicine',
  'Dentistry',
  'Dermatology',
  'Gynecology',
  'Psychiatry',
  'Orthopedics',
];

const DEPARTMENT_FEES: Record<string, number> = {
  'General Medicine': 300,
  Dentistry: 500,
  Dermatology: 450,
  Gynecology: 450,
  Psychiatry: 600,
  Orthopedics: 500,
};

/** Client-side estimate shown to the user before checkout; the source of truth is the server. */
export function estimateAppointmentFee(department: string) {
  return DEPARTMENT_FEES[department] ?? 300;
}

export function getMedicines(search?: string) {
  return api.get<MedicineResponseDto[]>('/api/medical/medicines', { search });
}

export function getMedicine(id: number) {
  return api.get<MedicineResponseDto>(`/api/medical/medicines/${id}`);
}

export function createAppointment(dto: AppointmentRequestDto) {
  return api.post<AppointmentResponseDto>('/api/medical/appointments', dto);
}

export function getMyAppointments() {
  return api.get<AppointmentResponseDto[]>('/api/medical/appointments/customer');
}
