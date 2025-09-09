import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { 
  Users, 
  ArrowLeft, 
  Settings, 
  UserPlus, 
  Copy, 
  BookOpen, 
  ClipboardList, 
  Calendar, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Download,
  TrendingUp,
  Award,
  MessageSquare,
  Loader2,
  Search,
  Filter,
  UserMinus
} from 'lucide-react';

const ManageClassroom: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [classroom, setClassroom] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);

  // Fetch classroom data
  useEffect(() => {
    const fetchClassroomData = async () => {
      if (!classroomId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const [classroomResponse, studentsResponse, assignmentsResponse, materialsResponse, analyticsResponse] = await Promise.all([
          apiService.getClassroomById(classroomId),
          apiService.getClassroomStudents(classroomId),
          apiService.getClassroomAssignments(classroomId),
          apiService.getClassroomMaterials(classroomId),
          apiService.getClassroomAnalytics(classroomId)
        ]);

        if (classroomResponse.success) {
          setClassroom(classroomResponse.data);
        } else {
          setError('Classroom not found');
        }
        
        if (studentsResponse.success) {
          setStudents(studentsResponse.data || []);
        }
        
        if (assignmentsResponse.success) {
          setAssignments(assignmentsResponse.data || []);
        }
        
        if (materialsResponse.success) {
          setMaterials(materialsResponse.data || []);
        }
        
        if (analyticsResponse.success) {
          setAnalytics(analyticsResponse.data || {});
        }
      } catch (error) {
        setError('Failed to load classroom data');
        toast({
          title: "Network error",
          description: "Failed to load classroom data. Please check your connection.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClassroomData();
  }, [classroomId, toast]);

  const handleCopyInviteCode = async () => {
    if (!classroom?.inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(classroom.inviteCode);
      toast({
        title: "Invite code copied",
        description: `Code ${classroom.inviteCode} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy invite code",
        variant: "destructive"
      });
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    setRemoving(studentId);
    try {
      const response = await apiService.removeStudentFromClassroom(classroomId!, studentId);
      if (response.success) {
        setStudents(prev => prev.filter(student => student._id !== studentId));
        toast({
          title: "Student removed",
          description: "Student has been removed from the classroom",
        });
      } else {
        toast({
          title: "Failed to remove student",
          description: response.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Failed to remove student. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setRemoving(null);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading classroom...</p>
        </div>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error || 'Classroom not found'}</p>
          <Button onClick={() => navigate('/classrooms')}>Back to Classrooms</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/classrooms')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{classroom.name}</h1>
          <p className="text-muted-foreground">{classroom.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {classroom.inviteCode}
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleCopyInviteCode}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary/10">
                <ClipboardList className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignments.length}</p>
                <p className="text-xs text-muted-foreground">Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/10">
                <BookOpen className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{materials.length}</p>
                <p className="text-xs text-muted-foreground">Materials</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/10">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.averageScore || 0}%</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.recentActivity?.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                ) : (
                  analytics.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.avatar} />
                        <AvatarFallback>
                          {activity.studentName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.studentName}</p>
                        <p className="text-xs text-muted-foreground">{activity.action}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Performance Analytics */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Assignment Completion Rate</span>
                    <span className="text-sm font-medium">{analytics.completionRate || 0}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${analytics.completionRate || 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Score</span>
                    <span className="text-sm font-medium">{analytics.averageScore || 0}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full" 
                      style={{ width: `${analytics.averageScore || 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Material Engagement</span>
                    <span className="text-sm font-medium">{analytics.materialEngagement || 0}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full" 
                      style={{ width: `${analytics.materialEngagement || 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search students..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Students
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredStudents.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No students found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'No students match your search.' : 'Invite students to join this classroom.'}
                  </p>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Students
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredStudents.map((student) => (
                <Card key={student._id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>
                          {student.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        {student.studentId && (
                          <p className="text-xs text-muted-foreground">ID: {student.studentId}</p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {student.stats?.averageScore || 0}% avg
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student.stats?.completedAssignments || 0} completed
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveStudent(student._id)}
                        disabled={removing === student._id}
                      >
                        {removing === student._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Classroom Assignments</h3>
            <Button>
              <ClipboardList className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </div>

          <div className="grid gap-4">
            {assignments.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first assignment for this classroom.</p>
                  <Button>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              assignments.map((assignment) => (
                <Card key={assignment._id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{assignment.title}</h4>
                        <p className="text-sm text-muted-foreground">{assignment.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">{assignment.subject}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {assignment.points} points
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {assignment.submissionCount || 0}/{students.length} submitted
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg: {assignment.averageScore || 0}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Learning Materials</h3>
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Upload Material
            </Button>
          </div>

          <div className="grid gap-4">
            {materials.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No materials uploaded</h3>
                  <p className="text-muted-foreground mb-4">Upload learning materials for your students.</p>
                  <Button>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Upload Material
                  </Button>
                </CardContent>
              </Card>
            ) : (
              materials.map((material) => (
                <Card key={material._id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{material.title}</h4>
                          <p className="text-sm text-muted-foreground">{material.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {material.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {material.downloadCount || 0} downloads
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageClassroom;
