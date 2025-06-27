import { User, Patient, Doctor } from '../types';

// Mock user database
const mockUsers: (Patient | Doctor)[] = [
  {
    id: 'patient-1',
    email: 'john.doe@patient.com',
    name: 'John Doe',
    role: 'patient',
    createdAt: '2024-01-15T10:00:00Z',
    dateOfBirth: '1985-06-15',
    gender: 'Male',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    emergencyContact: '+1-555-0123',
    doctorId: 'doctor-1'
  },
  {
    id: 'patient-2',
    email: 'jane.smith@patient.com',
    name: 'Jane Smith',
    role: 'patient',
    createdAt: '2024-01-20T14:30:00Z',
    dateOfBirth: '1990-03-22',
    gender: 'Female',
    bloodType: 'A-',
    allergies: ['Shellfish'],
    emergencyContact: '+1-555-0456'
  },
  {
    id: 'doctor-1',
    email: 'dr.wilson@hospital.com',
    name: 'Dr. Sarah Wilson',
    role: 'doctor',
    createdAt: '2024-01-10T08:00:00Z',
    specialization: 'Cardiology',
    licenseNumber: 'MD-12345',
    hospital: 'General Hospital',
    patients: ['patient-1']
  },
  {
    id: 'doctor-2',
    email: 'dr.johnson@hospital.com',
    name: 'Dr. Michael Johnson',
    role: 'doctor',
    createdAt: '2024-01-12T09:15:00Z',
    specialization: 'Internal Medicine',
    licenseNumber: 'MD-67890',
    hospital: 'City Medical Center',
    patients: []
  }
];

export const authenticateUser = (email: string, password: string): User | null => {
  // Simple authentication simulation
  const user = mockUsers.find(u => u.email === email);
  if (user && password === 'password123') {
    return user;
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem('currentUser');
};

export const getPatientById = (patientId: string): Patient | null => {
  const patient = mockUsers.find(u => u.id === patientId && u.role === 'patient') as Patient;
  return patient || null;
};

export const getDoctorById = (doctorId: string): Doctor | null => {
  const doctor = mockUsers.find(u => u.id === doctorId && u.role === 'doctor') as Doctor;
  return doctor || null;
};

export const getAllPatients = (): Patient[] => {
  return mockUsers.filter(u => u.role === 'patient') as Patient[];
};

export const getDoctorPatients = (doctorId: string): Patient[] => {
  const doctor = getDoctorById(doctorId);
  if (!doctor) return [];
  
  return mockUsers.filter(u => 
    u.role === 'patient' && doctor.patients.includes(u.id)
  ) as Patient[];
};