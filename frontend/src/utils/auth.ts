import { User, JWT } from '@/types/auth';

const JWT_KEY = 'edu_platform_jwt';

// Mock user database
const MOCK_USERS: { [email: string]: User & { password: string } } = {
  'teacher@example.com': {
    id: '1',
    email: 'teacher@example.com',
    password: 'teacher123',
    name: 'Sarah Johnson',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    joinedAt: '2024-01-15',
    stats: {
      totalAssignments: 15,
      completedAssignments: 15,
      averageScore: 0,
      streak: 0,
      badges: ['creator', 'mentor'],
    }
  },
  'student@example.com': {
    id: '2',
    email: 'student@example.com',
    password: 'student123',
    name: 'Alex Chen',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    joinedAt: '2024-02-01',
    stats: {
      totalAssignments: 12,
      completedAssignments: 10,
      averageScore: 87,
      streak: 5,
      badges: ['consistent', 'achiever'],
      rank: 3,
    }
  }
};

export const generateMockJWT = (user: User): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  
  // In a real app, this would be properly signed
  return btoa(JSON.stringify(payload));
};

export const saveJWT = (jwt: JWT): void => {
  localStorage.setItem(JWT_KEY, JSON.stringify(jwt));
};

export const getJWT = (): JWT | null => {
  try {
    const stored = localStorage.getItem(JWT_KEY);
    if (!stored) return null;
    
    const jwt: JWT = JSON.parse(stored);
    
    // Check if token is expired
    if (Date.now() > jwt.expiresAt) {
      clearJWT();
      return null;
    }
    
    return jwt;
  } catch {
    return null;
  }
};

export const clearJWT = (): void => {
  localStorage.removeItem(JWT_KEY);
};

export const mockLogin = async (email: string, password: string, role: 'student' | 'teacher'): Promise<User | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = MOCK_USERS[email];
  if (!user || user.password !== password || user.role !== role) {
    return null;
  }
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const validateJWT = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token));
    
    if (Date.now() > payload.exp) {
      return null;
    }
    
    // Find user by ID
    const user = Object.values(MOCK_USERS).find(u => u.id === payload.userId);
    if (!user) return null;
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch {
    return null;
  }
};