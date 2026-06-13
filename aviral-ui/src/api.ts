const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Runtime toggle via Vite env: set VITE_DISABLE_AUTH_HEADERS=false to restore JWT headers.
const DISABLE_AUTH_HEADERS = import.meta.env.VITE_DISABLE_AUTH_HEADERS !== 'false';

// --- Token Management ---
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (token: string, refreshToken?: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getAuthHeaders = () => {
  if (DISABLE_AUTH_HEADERS) {
    return {};
  }

  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// --- Generic Helpers ---
const fetchJson = async (url: string, options?: RequestInit) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options?.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error?.error?.message || `HTTP error! status: ${response.status}`;

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401) {
      clearTokens();
      // Use the backend's error message if available, otherwise default to generic
      throw new Error(error?.error?.message ? errorMessage : 'Unauthorized - please login again');
    }

    throw new Error(errorMessage);
  }
  const data = await response.json();
  // Extract data from ApiResponse format
  return data?.data !== undefined ? data.data : data;
};

const postData = (url: string, data: any) => fetchJson(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

const putData = (url: string, data: any) => fetchJson(url, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

const deleteData = (url: string) => fetchJson(url, {
  method: 'DELETE'
});

// --- Authentication ---
export const login = async (username: string, password: string, schoolId?: string) => {
  const payload: any = { username, password };
  if (schoolId) {
    payload.schoolId = schoolId;
  }

  const response = await fetchJson(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (response?.token) {
    setTokens(response.token, response.refreshToken);
  }
  return response;
};

export const logout = () => {
  clearTokens();
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    });

    if (!response.ok) {
      clearTokens();
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    if (data?.data?.token) {
      setTokens(data.data.token, data.data.refreshToken);
      return data.data;
    }
    throw new Error('Invalid refresh response');
  } catch (error) {
    clearTokens();
    throw error;
  }
};

export const validateToken = async () => {
  try {
    const token = getToken();
    if (!token) return false;

    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    return data?.data === true;
  } catch {
    return false;
  }
};

// --- Schools ---
export const fetchSchools = () => fetchJson(`${API_BASE_URL}/schools`);
export const createSchool = (school: any) => postData(`${API_BASE_URL}/schools`, school);
export const updateSchool = (id: string, updates: any) => putData(`${API_BASE_URL}/schools/${id}`, updates);
export const deleteSchool = (id: string) => deleteData(`${API_BASE_URL}/schools/${id}`);

// --- Students ---
export const fetchStudents = () => fetchJson(`${API_BASE_URL}/students`);
export const createStudent = (student: any) => postData(`${API_BASE_URL}/students`, student);
export const updateStudent = (id: string, updates: any) => putData(`${API_BASE_URL}/students/${id}`, updates);
export const deleteStudent = (id: string) => deleteData(`${API_BASE_URL}/students/${id}`);

// --- Teachers ---
export const fetchTeachers = () => fetchJson(`${API_BASE_URL}/teachers`);
export const createTeacher = (teacher: any) => postData(`${API_BASE_URL}/teachers`, teacher);
export const updateTeacher = (id: string, updates: any) => putData(`${API_BASE_URL}/teachers/${id}`, updates);
export const deleteTeacher = (id: string) => deleteData(`${API_BASE_URL}/teachers/${id}`);

// --- Notices ---
export const fetchNotices = () => fetchJson(`${API_BASE_URL}/notices`);
export const createNotice = (notice: any) => postData(`${API_BASE_URL}/notices`, notice);
export const updateNotice = (id: string, updates: any) => putData(`${API_BASE_URL}/notices/${id}`, updates);
export const deleteNotice = (id: string) => deleteData(`${API_BASE_URL}/notices/${id}`);

// --- Expenses ---
export const fetchExpenses = () => fetchJson(`${API_BASE_URL}/expenses`);
export const createExpense = (expense: any) => postData(`${API_BASE_URL}/expenses`, expense);
export const updateExpense = (id: string, updates: any) => putData(`${API_BASE_URL}/expenses/${id}`, updates);
export const deleteExpense = (id: string) => deleteData(`${API_BASE_URL}/expenses/${id}`);

// --- Leave Applications ---
export const fetchLeaves = () => fetchJson(`${API_BASE_URL}/leaves`);
export const createLeave = (leave: any) => postData(`${API_BASE_URL}/leaves`, leave);
export const updateLeave = (id: string, updates: any) => putData(`${API_BASE_URL}/leaves/${id}`, updates);
export const approveLeave = (id: string) => putData(`${API_BASE_URL}/leaves/${id}/approve`, {});
export const rejectLeave = (id: string) => putData(`${API_BASE_URL}/leaves/${id}/reject`, {});
export const deleteLeave = (id: string) => deleteData(`${API_BASE_URL}/leaves/${id}`);

// --- Timetable ---
export const fetchTimetable = () => fetchJson(`${API_BASE_URL}/timetable`);
export const createTimetableSlot = (slot: any) => postData(`${API_BASE_URL}/timetable`, slot);
export const updateTimetableSlot = (id: string, updates: any) => putData(`${API_BASE_URL}/timetable/${id}`, updates);
export const deleteTimetableSlot = (id: string) => deleteData(`${API_BASE_URL}/timetable/${id}`);

// --- Grades ---
export const fetchGrades = () => fetchJson(`${API_BASE_URL}/grades`);
export const createGrade = (grade: any) => postData(`${API_BASE_URL}/grades`, grade);
export const updateGrade = (id: string, updates: any) => putData(`${API_BASE_URL}/grades/${id}`, updates);
export const deleteGrade = (id: string) => deleteData(`${API_BASE_URL}/grades/${id}`);

// --- Health Check ---
export const healthCheck = async () => {
  try {
    console.log('[API] Checking health at:', `${API_BASE_URL}/health`);
    const result = await fetchJson(`${API_BASE_URL}/health`);
    console.log('[API] Health check result:', result);
    return result?.status === 'OK';
  } catch (error) {
    console.warn('[API] Health check failed:', error);
    // Return true to allow API calls even if health check fails
    // This allows dev mode without credentials to still attempt API calls
    return true;
  }
};
