import { User } from '@/types/auth';
import { AuthResponse } from '@/services/api';

export const mapBackendUserToFrontend = (backendUser: AuthResponse['user']): User => {
  console.log('Mapping backend user:', backendUser);
  
  if (!backendUser) {
    console.error('Backend user is null or undefined');
    throw new Error('Backend user data is missing');
  }

  const mappedUser = {
    id: backendUser._id || '',
    username: backendUser.username || '',
    email: backendUser.email || '',
    name: backendUser.name || '',
    role: backendUser.role || 'student',
    avatar: backendUser.avatar,
    joinedAt: backendUser.createdAt || backendUser.updatedAt || new Date().toISOString(),
    // Student-specific fields
    studentId: backendUser.studentId,
    grade: backendUser.grade,
    rollNumber: backendUser.rollNumber,
    dateOfBirth: backendUser.dateOfBirth,
    guardian: backendUser.guardian,
    // Teacher-specific fields
    department: backendUser.department,
    qualification: backendUser.qualification,
    experience: backendUser.experience,
    specialization: backendUser.specialization,
    // Common fields
    phone: backendUser.phone,
    address: backendUser.address,
    stats: backendUser.stats,
    badges: backendUser.badges,
    isActive: backendUser.isActive,
    isVerified: backendUser.isVerified,
    preferences: backendUser.preferences
  };

  console.log('Mapped user:', mappedUser);
  return mappedUser;
};
