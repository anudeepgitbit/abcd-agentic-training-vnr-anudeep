import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import RegisterForm from './RegisterForm';

const LoginPage: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [studentForm, setStudentForm] = useState({ email: 'student@example.com', password: 'student123' });
  const [teacherForm, setTeacherForm] = useState({ email: 'teacher@example.com', password: 'teacher123' });
  const { login, loading, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (role: 'student' | 'teacher') => {
    const form = role === 'student' ? studentForm : teacherForm;
    await login(form.email, form.password, role);
  };

  if (showRegister) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">EduTrack</h1>
            <p className="text-white/80">Join our learning community</p>
          </div>
          <RegisterForm onBackToLogin={() => setShowRegister(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">EduTrack</h1>
          <p className="text-white/80">Your gateway to learning excellence</p>
        </div>

        <Card className="shadow-elevated border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>Choose your role to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Teacher
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="student@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input
                    id="student-password"
                    type="password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    placeholder="Enter your password"
                  />
                </div>
                <Button
                  onClick={() => handleLogin('student')}
                  disabled={loading}
                  className="w-full bg-gradient-primary hover:bg-primary-dark"
                >
                  {loading ? 'Signing in...' : 'Sign in as Student'}
                </Button>
              </TabsContent>

              <TabsContent value="teacher" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    placeholder="teacher@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Password</Label>
                  <Input
                    id="teacher-password"
                    type="password"
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                    placeholder="Enter your password"
                  />
                </div>
                <Button
                  onClick={() => handleLogin('teacher')}
                  disabled={loading}
                  className="w-full bg-gradient-secondary hover:bg-secondary"
                >
                  {loading ? 'Signing in...' : 'Sign in as Teacher'}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setShowRegister(true)}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Don't have an account? Sign up
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Demo Credentials:</p>
              <p>Student: student@example.com / student123</p>
              <p>Teacher: teacher@example.com / teacher123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;