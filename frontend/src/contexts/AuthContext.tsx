import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType, StudentRegisterRequest, TeacherRegisterRequest } from '@/types/auth';
import { apiService } from '@/services/api';
import { mapBackendUserToFrontend } from '@/utils/userMapper';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing JWT on mount and fetch current user
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      console.log('Initializing auth with token:', token ? 'exists' : 'not found');
      
      if (token) {
        try {
          const response = await apiService.getCurrentUser();
          console.log('getCurrentUser response:', response);
          
          if (response.success && response.data) {
            console.log('Response data structure:', response.data);
            
            // Handle different response structures
            let backendUser;
            if (response.data.user) {
              // Backend returns { user: userData, authMethod: 'jwt'|'session' }
              backendUser = response.data.user;
            } else if ('_id' in response.data) {
              // Backend returns user data directly
              backendUser = response.data as any;
            } else {
              console.error('Unexpected response structure:', response.data);
              localStorage.removeItem('auth_token');
              setLoading(false);
              return;
            }
            
            const userData = mapBackendUserToFrontend(backendUser);
            setUser(userData);
            console.log('User authenticated on refresh:', userData);
          } else {
            console.log('Auth response not successful:', response);
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'teacher'): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiService.login({ email, password, role });
      
      if (response.success && response.data) {
        const userData = mapBackendUserToFrontend(response.data.user);
        
        setUser(userData);
        console.log('User logged in:', userData);
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${userData.role}`,
          className: "bg-success text-success-foreground",
        });
        
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: response.error || "Invalid credentials or role mismatch",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login error",
        description: "Something went wrong. Please try again.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
      setUser(null);
      console.log('User logged out');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      localStorage.removeItem('auth_token');
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    }
  };

  const register = async (userData: StudentRegisterRequest | TeacherRegisterRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiService.register(userData);
      
      if (response.success && response.data) {
        const mappedUser = mapBackendUserToFrontend(response.data.user);
        setUser(mappedUser);
        console.log('User registered:', mappedUser);
        
        toast({
          title: "Registration Successful!",
          description: `Welcome to EduTrack! You can now start as a ${userData.role}.`,
          className: "bg-success text-success-foreground",
        });
        
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: response.error || "Registration failed. Please try again.",
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration error",
        description: "Something went wrong. Please try again.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};