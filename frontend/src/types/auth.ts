export interface User {
  id: string;
  username?: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  avatar?: string;
  joinedAt: string;
  
  // Student-specific fields
  studentId?: string;
  grade?: string;
  rollNumber?: string;
  dateOfBirth?: string;
  guardian?: {
    name?: string;
    email?: string;
    phone?: string;
    relationship?: string;
  };
  
  // Teacher-specific fields
  department?: string;
  qualification?: string;
  experience?: number;
  specialization?: string[];
  
  // Common fields
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  
  // Statistics and achievements
  stats?: {
    totalAssignments?: number;
    completedAssignments?: number;
    pendingAssignments?: number;
    averageScore?: number;
    streak?: number;
    longestStreak?: number;
    badges?: string[];
    rank?: number;
    totalPoints?: number;
    level?: number;
    totalClassrooms?: number;
    totalStudents?: number;
    totalMaterials?: number;
    averageClassPerformance?: number;
  };
  
  badges?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  preferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    reminderNotifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
    studyReminders?: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'teacher') => Promise<boolean>;
  register?: (userData: StudentRegisterRequest | TeacherRegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface LoginForm {
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

export interface JWT {
  token: string;
  expiresAt: number;
  user: User;
}

export interface StudentRegisterRequest {
  role: 'student';
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentId: string;
  grade: string;
  rollNumber?: string;
  dateOfBirth?: string;
  phone?: string;
  guardian?: {
    name?: string;
    phone?: string;
    email?: string;
    relationship?: string;
  };
}

export interface TeacherRegisterRequest {
  role: 'teacher';
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  qualification: string;
  experience?: number;
  specialization?: string[];
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}