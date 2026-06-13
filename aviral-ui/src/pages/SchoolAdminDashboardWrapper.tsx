import React, { useState, useEffect } from 'react';
import SchoolAdminDashboard from '../components/SchoolAdminDashboard';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchStudents, createStudent, updateStudent, deleteStudent,
  fetchTeachers, createTeacher, updateTeacher, deleteTeacher,
  fetchNotices, createNotice, deleteNotice,
  fetchSchools
} from '../api';
import { Student, Teacher, Notice, School } from '../types';
import { LogOut } from 'lucide-react';

export default function SchoolAdminDashboardWrapper() {
  const { user, logout } = useAuth();
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all required data in parallel
      const [allSchools, allStudents, allTeachers, allNotices] = await Promise.all([
        fetchSchools(),
        fetchStudents(),
        fetchTeachers(),
        fetchNotices()
      ]);

      // The backend filters based on the JWT's schoolId for students, teachers, notices, 
      // but for safety/UI completeness, we set them all here.
      setStudents(allStudents || []);
      setTeachers(allTeachers || []);
      setNotices(allNotices || []);

      // Find the specific school object for the UI context
      if (allSchools) {
         const school = allSchools.find((s: School) => s.id === user?.schoolId);
         if (school) setCurrentSchool(school);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load school data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Handlers ---
  const handleAddStudent = async (student: Omit<Student, 'id' | 'attendance' | 'grades' | 'fees'>) => {
    await createStudent({ ...student, schoolId: user?.schoolId });
    await loadData();
  };

  const handleUpdateStudent = async (id: string, updates: Partial<Student>) => {
    await updateStudent(id, updates);
    await loadData();
  };

  const handleDeleteStudent = async (id: string) => {
    await deleteStudent(id);
    await loadData();
  };

  const handleAddTeacher = async (teacher: Omit<Teacher, 'id' | 'attendance'>) => {
    await createTeacher({ ...teacher, schoolId: user?.schoolId });
    await loadData();
  };

  const handleUpdateTeacher = async (id: string, updates: Partial<Teacher>) => {
    await updateTeacher(id, updates);
    await loadData();
  };

  const handleDeleteTeacher = async (id: string) => {
    await deleteTeacher(id);
    await loadData();
  };

  const handleAddNotice = async (notice: Omit<Notice, 'id'>) => {
    await createNotice({ ...notice, schoolId: user?.schoolId });
    await loadData();
  };

  const handleDeleteNotice = async (id: string) => {
    await deleteNotice(id);
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Provide a fallback if school isn't found
  const mockSchoolFallback: School = currentSchool || {
    id: user?.schoolId || 'unknown',
    name: 'School Not Found',
    schoolCode: 'ERR',
    city: '',
    state: '',
    primaryColor: 'indigo',
    activeFeatures: {
      feeManagement: true,
      attendanceTracking: true,
      homeworkLMS: true,
      examGrading: true,
      transportTracking: false,
      smsNotifications: false
    }
  } as any;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
       {/* Global Top Nav for App framing */}
       <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-50 relative shadow-sm">
         <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full bg-${mockSchoolFallback.primaryColor}-100 flex items-center justify-center text-${mockSchoolFallback.primaryColor}-700 font-bold`}>
               {mockSchoolFallback.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-gray-900 leading-tight">{mockSchoolFallback.name}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">School Admin Portal</div>
            </div>
         </div>
         <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
               <div className="text-sm font-medium text-gray-900">{user?.username}</div>
               <div className="text-xs text-gray-500">Code: {mockSchoolFallback.schoolCode}</div>
             </div>
             <button 
               onClick={logout}
               className="flex items-center space-x-1 text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
             >
               <LogOut className="w-4 h-4" />
               <span className="text-sm font-medium">Logout</span>
             </button>
         </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {error && (
            <div className="p-4 bg-red-100 text-red-700 text-center border-b border-red-200">
               {error}
            </div>
        )}
        <SchoolAdminDashboard 
          schoolId={mockSchoolFallback.id}
          schools={[mockSchoolFallback]}
          students={students}
          teachers={teachers}
          notices={notices}
          onAddStudent={handleAddStudent as any}
          onDeleteStudent={handleDeleteStudent}
          onAddTeacher={handleAddTeacher as any}
          onDeleteTeacher={handleDeleteTeacher}
          onAddNotice={handleAddNotice as any}
          onDeleteNotice={handleDeleteNotice}
        />
      </main>
    </div>
  );
}
