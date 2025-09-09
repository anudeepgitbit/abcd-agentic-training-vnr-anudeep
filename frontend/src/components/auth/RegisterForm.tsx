import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, User, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StudentRegisterRequest, TeacherRegisterRequest } from '@/types/auth';

interface RegisterFormProps {
  onBackToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLogin }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuth();
  const { toast } = useToast();

  const [studentForm, setStudentForm] = useState<Partial<StudentRegisterRequest>>({
    role: 'student',
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    grade: '',
    rollNumber: '',
    dateOfBirth: '',
    phone: '',
    guardian: {
      name: '',
      phone: '',
      email: '',
      relationship: 'parent'
    }
  });

  const [teacherForm, setTeacherForm] = useState<Partial<TeacherRegisterRequest>>({
    role: 'teacher',
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    qualification: '',
    experience: 0,
    specialization: [],
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const validateStudentForm = (form: Partial<StudentRegisterRequest>): string | null => {
    if (!form.username || !form.name || !form.email || !form.password || !form.confirmPassword) {
      return 'Please fill in all required fields';
    }

    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match';
    }

    if (form.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return 'Please enter a valid email address';
    }

    if (!form.studentId || !form.grade) {
      return 'Student ID and Grade are required for students';
    }

    return null;
  };

  const validateTeacherForm = (form: Partial<TeacherRegisterRequest>): string | null => {
    if (!form.username || !form.name || !form.email || !form.password || !form.confirmPassword) {
      return 'Please fill in all required fields';
    }

    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match';
    }

    if (form.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return 'Please enter a valid email address';
    }

    if (!form.department || !form.qualification) {
      return 'Department and Qualification are required for teachers';
    }

    return null;
  };

  const handleRegister = async () => {
    if (activeTab === 'student') {
      const validationError = validateStudentForm(studentForm);
      if (validationError) {
        toast({
          variant: "destructive",
          title: "Registration Error",
          description: validationError,
        });
        return;
      }
      if (register) {
        const success = await register(studentForm as StudentRegisterRequest);
        if (success) {
          toast({
            title: "Registration Successful!",
            description: "Welcome to EduTrack! You can now start your learning journey.",
            className: "bg-success text-success-foreground",
          });
        }
      }
    } else {
      const validationError = validateTeacherForm(teacherForm);
      if (validationError) {
        toast({
          variant: "destructive",
          title: "Registration Error",
          description: validationError,
        });
        return;
      }
      if (register) {
        const success = await register(teacherForm as TeacherRegisterRequest);
        if (success) {
          toast({
            title: "Registration Successful!",
            description: "Welcome to EduTrack! You can now start teaching.",
            className: "bg-success text-success-foreground",
          });
        }
      }
    }
  };

  const updateStudentForm = (field: string, value: any) => {
    if (field.startsWith('guardian.')) {
      const guardianField = field.split('.')[1];
      setStudentForm(prev => ({
        ...prev,
        guardian: {
          ...prev.guardian,
          [guardianField]: value
        }
      }));
    } else {
      setStudentForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const updateTeacherForm = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setTeacherForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setTeacherForm(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Card className="shadow-elevated border-0 backdrop-blur-sm bg-white/95">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create Your Account</CardTitle>
        <CardDescription>Join EduTrack and start your learning journey</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'student' | 'teacher')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Student
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Teacher
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Full Name *</Label>
                <Input
                  id="student-name"
                  value={studentForm.name}
                  onChange={(e) => updateStudentForm('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-username">Username *</Label>
                <Input
                  id="student-username"
                  value={studentForm.username}
                  onChange={(e) => updateStudentForm('username', e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-email">Email *</Label>
              <Input
                id="student-email"
                type="email"
                value={studentForm.email}
                onChange={(e) => updateStudentForm('email', e.target.value)}
                placeholder="student@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-password">Password *</Label>
                <div className="relative">
                  <Input
                    id="student-password"
                    type={showPassword ? "text" : "password"}
                    value={studentForm.password}
                    onChange={(e) => updateStudentForm('password', e.target.value)}
                    placeholder="Enter password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-confirm-password">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="student-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={studentForm.confirmPassword}
                    onChange={(e) => updateStudentForm('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID *</Label>
                <Input
                  id="student-id"
                  value={studentForm.studentId}
                  onChange={(e) => updateStudentForm('studentId', e.target.value)}
                  placeholder="STU001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-grade">Grade *</Label>
                <Select value={studentForm.grade} onValueChange={(value) => updateStudentForm('grade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={`${i + 1}`}>Grade {i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-roll">Roll Number</Label>
                <Input
                  id="student-roll"
                  value={studentForm.rollNumber}
                  onChange={(e) => updateStudentForm('rollNumber', e.target.value)}
                  placeholder="001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-dob">Date of Birth</Label>
                <Input
                  id="student-dob"
                  type="date"
                  value={studentForm.dateOfBirth}
                  onChange={(e) => updateStudentForm('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-phone">Phone Number</Label>
                <Input
                  id="student-phone"
                  value={studentForm.phone}
                  onChange={(e) => updateStudentForm('phone', e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-sm">Guardian Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardian-name">Guardian Name</Label>
                  <Input
                    id="guardian-name"
                    value={studentForm.guardian?.name}
                    onChange={(e) => updateStudentForm('guardian.name', e.target.value)}
                    placeholder="Guardian's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian-phone">Guardian Phone</Label>
                  <Input
                    id="guardian-phone"
                    value={studentForm.guardian?.phone}
                    onChange={(e) => updateStudentForm('guardian.phone', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardian-email">Guardian Email</Label>
                  <Input
                    id="guardian-email"
                    type="email"
                    value={studentForm.guardian?.email}
                    onChange={(e) => updateStudentForm('guardian.email', e.target.value)}
                    placeholder="guardian@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian-relationship">Relationship</Label>
                  <Select 
                    value={studentForm.guardian?.relationship} 
                    onValueChange={(value) => updateStudentForm('guardian.relationship', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="relative">Relative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-gradient-primary hover:bg-primary-dark"
            >
              {loading ? 'Creating Account...' : 'Create Student Account'}
            </Button>
          </TabsContent>

          <TabsContent value="teacher" className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-username">Username *</Label>
                <Input
                  id="teacher-username"
                  value={teacherForm.username}
                  onChange={(e) => updateTeacherForm('username', e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-name">Full Name *</Label>
                <Input
                  id="teacher-name"
                  value={teacherForm.name}
                  onChange={(e) => updateTeacherForm('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-email">Email *</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  value={teacherForm.email}
                  onChange={(e) => updateTeacherForm('email', e.target.value)}
                  placeholder="teacher@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-password">Password *</Label>
                <div className="relative">
                  <Input
                    id="teacher-password"
                    type={showPassword ? "text" : "password"}
                    value={teacherForm.password}
                    onChange={(e) => updateTeacherForm('password', e.target.value)}
                    placeholder="Enter password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-confirm-password">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="teacher-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={teacherForm.confirmPassword}
                    onChange={(e) => updateTeacherForm('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-department">Department *</Label>
                <Select value={teacherForm.department} onValueChange={(value) => updateTeacherForm('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="geography">Geography</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="computer_science">Computer Science</SelectItem>
                    <SelectItem value="art">Art</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="physical_education">Physical Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-qualification">Qualification *</Label>
                <Select value={teacherForm.qualification} onValueChange={(value) => updateTeacherForm('qualification', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-experience">Years of Experience</Label>
                <Input
                  id="teacher-experience"
                  type="number"
                  min="0"
                  max="50"
                  value={teacherForm.experience}
                  onChange={(e) => updateTeacherForm('experience', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-phone">Phone Number</Label>
                <Input
                  id="teacher-phone"
                  value={teacherForm.phone}
                  onChange={(e) => updateTeacherForm('phone', e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher-address">Address</Label>
              <Input
                id="teacher-address"
                value={teacherForm.address?.street || ''}
                onChange={(e) => updateTeacherForm('address.street', e.target.value)}
                placeholder="Enter your address"
              />
            </div>

            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-gradient-secondary hover:bg-secondary"
            >
              {loading ? 'Creating Account...' : 'Create Teacher Account'}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={onBackToLogin}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Already have an account? Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
