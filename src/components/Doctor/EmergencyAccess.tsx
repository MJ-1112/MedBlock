import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Clock, 
  FileText, 
  User,
  Shield,
  CheckCircle,
  Timer
} from 'lucide-react';
import { Patient, MedicalRecord, EmergencyAccess as EmergencyAccessType } from '../../types';
import { getAllPatients, getCurrentUser } from '../../utils/auth';
import { healthcareBlockchain } from '../../utils/blockchain';

export const EmergencyAccess: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [accessLevel, setAccessLevel] = useState<'basic' | 'full'>('basic');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [accessDuration, setAccessDuration] = useState(60); // minutes
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);
  const [currentAccess, setCurrentAccess] = useState<EmergencyAccessType | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);

  const currentUser = getCurrentUser();
  const patients = getAllPatients();
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    // Get existing records for this patient
    const records = healthcareBlockchain.getRecordsByPatient(patient.id);
    setPatientRecords(records);
  };

  const handleGrantAccess = async () => {
    if (!selectedPatient || !emergencyReason.trim() || !currentUser) return;

    setIsGrantingAccess(true);

    try {
      // Simulate emergency access grant
      await new Promise(resolve => setTimeout(resolve, 1500));

      const now = new Date();
      const expiresAt = new Date(now.getTime() + accessDuration * 60000);

      const emergencyAccess: EmergencyAccessType = {
        id: `emergency-${Date.now()}`,
        patientId: selectedPatient.id,
        doctorId: currentUser.id,
        accessLevel,
        expiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString(),
        isActive: true
      };

      // Create emergency access record in blockchain
      const emergencyRecord: MedicalRecord = {
        id: `emergency-record-${Date.now()}`,
        patientId: selectedPatient.id,
        doctorId: currentUser.id,
        type: 'emergency_access',
        title: 'Emergency Access Granted',
        description: `Emergency access granted: ${emergencyReason}`,
        blockchainHash: '',
        timestamp: now.toISOString(),
        isEmergencyAccess: true,
        emergencyAccessExpiry: expiresAt.toISOString()
      };

      healthcareBlockchain.addRecord(emergencyRecord);
      setCurrentAccess(emergencyAccess);

    } catch (error) {
      console.error('Failed to grant emergency access:', error);
    } finally {
      setIsGrantingAccess(false);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (currentAccess && selectedPatient) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-900">Emergency Access Active</h2>
              <p className="text-red-700">
                Temporary access granted for {selectedPatient.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Timer className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-gray-900">Time Remaining</span>
              </div>
              <div className="text-lg font-bold text-red-600">
                {formatTimeRemaining(currentAccess.expiresAt)}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Access Level</span>
              </div>
              <div className="text-lg font-bold text-blue-600 capitalize">
                {currentAccess.accessLevel}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Status</span>
              </div>
              <div className="text-lg font-bold text-green-600">Active</div>
            </div>
          </div>

          <button
            onClick={() => setCurrentAccess(null)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            End Emergency Session
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
            <User className="h-5 w-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 block mb-1">Full Name</span>
                <span className="text-gray-900 font-semibold">{selectedPatient.name}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 block mb-1">Blood Type</span>
                <span className="text-gray-900 font-semibold">{selectedPatient.bloodType}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 block mb-1">Emergency Contact</span>
                <span className="text-gray-900 font-semibold">{selectedPatient.emergencyContact}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 block mb-1">Date of Birth</span>
                <span className="text-gray-900 font-semibold">
                  {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 block mb-1">Gender</span>
                <span className="text-gray-900 font-semibold">{selectedPatient.gender}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 block mb-2">Known Allergies</span>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.allergies.map((allergy, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {patientRecords.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Medical Records</h3>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-3">
              {patientRecords.map((record) => (
                <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{record.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      record.type === 'prescription' ? 'bg-blue-100 text-blue-700' :
                      record.type === 'test_report' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {record.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(record.timestamp).toLocaleString()}</span>
                    <span>Hash: {record.blockchainHash.substring(0, 8)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold text-red-900">SOS Emergency Access</h1>
            <p className="text-red-700">
              Request temporary blockchain access to patient records in emergency situations
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>
              Emergency access is logged and monitored. Use only in genuine medical emergencies.
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Patient</h3>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search by patient name or ID..."
          />
        </div>

        {searchTerm && (
          <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handlePatientSelect(patient)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  selectedPatient?.id === patient.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-500">ID: {patient.id} • {patient.bloodType}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-wrap gap-1 justify-end">
                      {patient.allergies.slice(0, 2).map((allergy, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedPatient && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Selected Patient</h4>
              <p className="text-blue-800">{selectedPatient.name} ({selectedPatient.id})</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Level *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAccessLevel('basic')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    accessLevel === 'basic'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">Basic Access</div>
                  <div className="text-xs text-gray-500 mt-1">
                    View basic info and recent records
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAccessLevel('full')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    accessLevel === 'full'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">Full Access</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Complete medical history access
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Access Duration (minutes) *
              </label>
              <select
                id="duration"
                value={accessDuration}
                onChange={(e) => setAccessDuration(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Reason *
              </label>
              <textarea
                id="reason"
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the emergency situation requiring access..."
                required
              />
            </div>

            <button
              onClick={handleGrantAccess}
              disabled={isGrantingAccess || !emergencyReason.trim()}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGrantingAccess ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  <span>Granting Emergency Access...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  <span>Grant Emergency Access</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};