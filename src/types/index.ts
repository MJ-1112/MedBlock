export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
  createdAt: string;
}

export interface Patient extends User {
  role: 'patient';
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  allergies: string[];
  emergencyContact: string;
  doctorId?: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  licenseNumber: string;
  hospital: string;
  patients: string[];
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  type: 'prescription' | 'test_report' | 'diagnosis' | 'emergency_access';
  title: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  blockchainHash: string;
  timestamp: string;
  isEmergencyAccess?: boolean;
  emergencyAccessExpiry?: string;
}

export interface BlockchainTransaction {
  id: string;
  hash: string;
  previousHash: string;
  timestamp: string;
  data: MedicalRecord;
  nonce: number;
}

export interface EmergencyAccess {
  id: string;
  patientId: string;
  doctorId: string;
  accessLevel: 'full' | 'basic';
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}