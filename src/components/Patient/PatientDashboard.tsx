import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Calendar, 
  Activity,
  Shield,
  Clock,
  Heart
} from 'lucide-react';
import { Patient, MedicalRecord } from '../../types';
import { healthcareBlockchain } from '../../utils/blockchain';

interface PatientDashboardProps {
  patient: Patient;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient }) => {
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const [blockchainInfo, setBlockchainInfo] = useState<any>(null);

  useEffect(() => {
    const records = healthcareBlockchain.getRecordsByPatient(patient.id);
    setRecentRecords(records.slice(-5)); // Get last 5 records
    setBlockchainInfo(healthcareBlockchain.getChainInfo());
  }, [patient.id]);

  const stats = [
    {
      label: 'Total Records',
      value: recentRecords.length,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      label: 'Last Upload',
      value: recentRecords.length > 0 ? 'Today' : 'None',
      icon: Upload,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      label: 'Next Appointment',
      value: 'Feb 15',
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      label: 'Health Score',
      value: '92%',
      icon: Heart,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {patient.name}</h1>
            <p className="text-blue-100">Your medical records are securely stored on the blockchain</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Blockchain Secured</span>
            </div>
            <div className="text-xs text-blue-200">
              Block Height: {blockchainInfo?.length || 0}
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
            <h3 className="text-lg font-semibold text-gray-900">Recent Medical Records</h3>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          
          {recentRecords.length > 0 ? (
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      record.type === 'prescription' ? 'bg-blue-100 text-blue-600' :
                      record.type === 'test_report' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{record.title}</p>
                      <p className="text-sm text-gray-500 capitalize">{record.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No medical records yet</p>
              <p className="text-sm text-gray-400">Upload your first document to get started</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Health Overview</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Blood Type</span>
              <span className="text-sm text-gray-900 font-semibold">{patient.bloodType}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Gender</span>
              <span className="text-sm text-gray-900">{patient.gender}</span>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 block mb-2">Allergies</span>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, index) => (
                  <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Emergency Contact</span>
              <span className="text-sm text-gray-900">{patient.emergencyContact}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Blockchain Status</h3>
          <Shield className="h-5 w-5 text-green-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{blockchainInfo?.length || 0}</div>
            <div className="text-sm text-gray-600">Total Blocks</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {blockchainInfo?.isValid ? 'Valid' : 'Invalid'}
            </div>
            <div className="text-sm text-gray-600">Chain Status</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900">Active</span>
            </div>
            <div className="text-sm text-gray-600">Network Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};