import React, { useState, useEffect } from 'react';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import { useAuth } from '../contexts/AuthContext';
import { fetchSchools, createSchool, updateSchool } from '../api';
import { School } from '../types';
import { LogOut } from 'lucide-react';

export default function SuperAdminDashboardWrapper() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout, user } = useAuth();

  const loadSchools = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSchools();
      setSchools(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load schools');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const handleAddSchool = async (schoolData: any) => {
    try {
      await createSchool(schoolData);
      await loadSchools(); // Refresh the list
    } catch (err: any) {
      throw err; // Let the inner component handle displaying the specific error if needed
    }
  };

  const handleUpdateSchoolFeatures = async (schoolId: string, features: any) => {
    try {
      await updateSchool(schoolId, { activeFeatures: features });
      await loadSchools();
    } catch (err: any) {
      console.error('Failed to update features', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Global Top Nav for App framing */}
      <nav className="bg-indigo-600 text-white shadow-md px-6 py-4 flex justify-between items-center">
         <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">Aviral Vidhya</span>
            <span className="bg-indigo-800 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider">Super Admin</span>
         </div>
         <div className="flex items-center space-x-4">
             <span className="text-sm opacity-90">{user?.username}</span>
             <button 
               onClick={logout}
               className="flex items-center space-x-1 hover:bg-indigo-700 px-3 py-2 rounded transition-colors"
             >
               <LogOut className="w-4 h-4" />
               <span>Logout</span>
             </button>
         </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        {error && (
            <div className="p-4 bg-red-100 text-red-700 text-center border-b border-red-200">
               {error}
            </div>
        )}
        <SuperAdminDashboard 
          schools={schools}
          onAddSchool={handleAddSchool}
          onUpdateSchoolFeatures={handleUpdateSchoolFeatures}
          isFirebaseActive={true} // Bypassing the old config check
        />
      </main>
    </div>
  );
}
