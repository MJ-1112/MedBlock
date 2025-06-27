import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/Auth/LoginForm';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { PatientDashboard } from './components/Patient/PatientDashboard';
import { UploadDocuments } from './components/Patient/UploadDocuments';
import { DoctorDashboard } from './components/Doctor/DoctorDashboard';
import { EmergencyAccess } from './components/Doctor/EmergencyAccess';
import { getCurrentUser } from './utils/auth';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'patient' | 'doctor' }> = ({ 
  children, 
  requiredRole 
}) => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to={`/${currentUser.role}/dashboard`} replace />;
  }
  
  return <>{children}</>;
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={currentUser} />
      <div className="flex">
        <Sidebar user={currentUser} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const currentUser = getCurrentUser();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        
        {/* Patient Routes */}
        <Route path="/patient/dashboard" element={
          <ProtectedRoute requiredRole="patient">
            <DashboardLayout>
              <PatientDashboard patient={currentUser as any} />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/patient/profile" element={
          <ProtectedRoute requiredRole="patient">
            <DashboardLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Profile</h2>
                <p className="text-gray-600">Profile management coming soon...</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/patient/records" element={
          <ProtectedRoute requiredRole="patient">
            <DashboardLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical Records</h2>
                <p className="text-gray-600">Medical records view coming soon...</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/patient/upload" element={
          <ProtectedRoute requiredRole="patient">
            <DashboardLayout>
              <UploadDocuments />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute requiredRole="doctor">
            <DashboardLayout>
              <DoctorDashboard doctor={currentUser as any} />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/doctor/profile" element={
          <ProtectedRoute requiredRole="doctor">
            <DashboardLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor Profile</h2>
                <p className="text-gray-600">Profile management coming soon...</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/doctor/patients" element={
          <ProtectedRoute requiredRole="doctor">
            <DashboardLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">My Patients</h2>
                <p className="text-gray-600">Patient management coming soon...</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/doctor/emergency" element={
          <ProtectedRoute requiredRole="doctor">
            <DashboardLayout>
              <EmergencyAccess />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;