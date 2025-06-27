import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  Upload, 
  User, 
  AlertTriangle,
  Activity,
  Shield
} from 'lucide-react';
import { User as UserType } from '../../types';

interface SidebarProps {
  user: UserType;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const patientMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/patient/dashboard' },
    { id: 'profile', label: 'My Profile', icon: User, path: '/patient/profile' },
    { id: 'records', label: 'Medical Records', icon: FileText, path: '/patient/records' },
    { id: 'upload', label: 'Upload Documents', icon: Upload, path: '/patient/upload' },
  ];

  const doctorMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/doctor/dashboard' },
    { id: 'profile', label: 'My Profile', icon: User, path: '/doctor/profile' },
    { id: 'patients', label: 'My Patients', icon: Users, path: '/doctor/patients' },
    { id: 'emergency', label: 'SOS Emergency', icon: AlertTriangle, path: '/doctor/emergency' },
  ];

  const menuItems = user.role === 'patient' ? patientMenuItems : doctorMenuItems;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-white w-64 min-h-screen shadow-lg border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Activity className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-gray-900">MedBlock</span>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Blockchain Status</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">Network Active</span>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};