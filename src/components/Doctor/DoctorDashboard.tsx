import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react';
import { Doctor, MedicalRecord, Patient } from '../../types';
import { healthcareBlockchain } from '../../utils/blockchain';
import { getDoctorPatients } from '../../utils/auth';

interface DoctorDashboardProps {
  doctor: Doctor;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctor }) => {
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [blockchainInfo, setBlockchainInfo] = useState<any>(null);

  useEffect(() => {
    const doctorPatients = getDoctorPatients(doctor.id);
    setPatients(doctorPatients);
    
    const records = healthcareBlockchain.getRecordsByDoctor(doctor.id);
    setRecentRecords(records.slice(-10));
    
    setBlockchainInfo(healthcareBlockchain.getChainInfo());
  }, [doctor.id]);

  const stats = [
    {
      label: 'Total Patients',
      value: patients.length,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      label: 'Records Today',
      value: recentRecords.filter(r => {
        const today = new Date().toDateString();
        return new Date(r.timestamp).toDateString() === today;
      }).length,
      icon: FileText,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      label: 'Appointments',
      value: '8',
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      label: 'Emergency Alerts',
      value: '2',
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome, {doctor.name}</h1>
            <p className="text-indigo-100 mb-1">{doctor.specialization} • {doctor.hospital}</p>
            <p className="text-indigo-200 text-sm">License: {doctor.licenseNumber}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Blockchain Access</span>
            </div>
            <div className="text-xs text-indigo-200">
              Network Status: Active
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Patient Activity</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          {recentRecords.length > 0 ? (
            <div className="space-y-3">
              {recentRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      record.type === 'prescription' ? 'bg-blue-100 text-blue-600' :
                      record.type === 'test_report' ? 'bg-green-100 text-green-600' :
                      record.type === 'emergency_access' ? 'bg-red-100 text-red-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {record.type === 'emergency_access' ? 
                        <AlertTriangle className="h-4 w-4" /> :
                        <FileText className="h-4 w-4" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{record.title}</p>
                      <p className="text-sm text-gray-500">Patient ID: {record.patientId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </p>
                    {record.isEmergencyAccess && (
                      <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full mt-1">
                        Emergency
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Patients</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          
          {patients.length > 0 ? (
            <div className="space-y-3">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">{patient.bloodType} • {patient.gender}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.slice(0, 2).map((allergy, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No patients assigned</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {[
              { time: '09:00', patient: 'John Doe', type: 'Consultation' },
              { time: '10:30', patient: 'Jane Smith', type: 'Follow-up' },
              { time: '14:00', patient: 'Mike Johnson', type: 'Check-up' },
              { time: '15:30', patient: 'Sarah Wilson', type: 'Review' }
            ].map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{appointment.time}</p>
                  <p className="text-sm text-gray-600">{appointment.patient}</p>
                </div>
                <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                  {appointment.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Blockchain Analytics</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{blockchainInfo?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Blocks</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{recentRecords.length}</div>
              <div className="text-sm text-gray-600">Your Records</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">Chain Integrity</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">Live</span>
              </div>
              <div className="text-sm text-gray-600">Network Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};