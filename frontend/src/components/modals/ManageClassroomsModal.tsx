import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Share, Settings, Loader2, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Classroom {
  _id: string;
  name: string;
  subject: string;
  description?: string;
  studentCount: number;
  inviteCode: string;
  isActive: boolean;
  createdAt: string;
}

interface ManageClassroomsModalProps {
  children: React.ReactNode;
}

const ManageClassroomsModal: React.FC<ManageClassroomsModalProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClassroom, setNewClassroom] = useState({
    name: '',
    subject: '',
    description: '',
    grade: ''
  });
  const { toast } = useToast();

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const response = await apiService.getClassrooms();
      if (response.success) {
        setClassrooms(response.data || []);
      } else {
        toast({
          title: "Failed to load classrooms",
          description: response.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Failed to load classrooms. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClassroom.name.trim() || !newClassroom.subject.trim() || !newClassroom.grade.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in the classroom name, subject, and grade",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const response = await apiService.createClassroom(newClassroom);
      if (response.success) {
        toast({
          title: "Classroom created successfully",
          description: `${newClassroom.name} has been created and is ready for students`,
        });
        
        setNewClassroom({ name: '', subject: '', description: '', grade: '' });
        setShowCreateForm(false);
        fetchClassrooms(); // Refresh the list
      } else {
        toast({
          title: "Failed to create classroom",
          description: response.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Failed to create classroom. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleShareClassroom = async (classroomId: string) => {
    try {
      const response = await apiService.generateInviteCode(classroomId);
      if (response.success && response.data?.inviteCode) {
        await navigator.clipboard.writeText(response.data.inviteCode);
        toast({
          title: "Invite code copied!",
          description: "The classroom invite code has been copied to your clipboard",
        });
      } else {
        toast({
          title: "Failed to generate invite code",
          description: response.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to copy invite code",
        description: "Please try again or copy the code manually",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchClassrooms();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-secondary" />
            Manage Classrooms
          </DialogTitle>
          <DialogDescription>
            View and manage your classrooms, create new ones, and share invite codes with students.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Classroom Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Classrooms</h3>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Classroom
            </Button>
          </div>

          {/* Create Classroom Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Create New Classroom</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateClassroom} className="space-y-3">
                  <div>
                    <Input
                      placeholder="Classroom name (e.g., Mathematics Grade 10)"
                      value={newClassroom.name}
                      onChange={(e) => setNewClassroom(prev => ({ ...prev, name: e.target.value }))}
                      disabled={creating}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Subject (e.g., Mathematics, Physics)"
                      value={newClassroom.subject}
                      onChange={(e) => setNewClassroom(prev => ({ ...prev, subject: e.target.value }))}
                      disabled={creating}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Grade (e.g., Grade 10, Class 12, Year 1)"
                      value={newClassroom.grade}
                      onChange={(e) => setNewClassroom(prev => ({ ...prev, grade: e.target.value }))}
                      disabled={creating}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Description (optional)"
                      value={newClassroom.description}
                      onChange={(e) => setNewClassroom(prev => ({ ...prev, description: e.target.value }))}
                      disabled={creating}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={creating || !newClassroom.name.trim() || !newClassroom.subject.trim() || !newClassroom.grade.trim()}
                      className="bg-gradient-secondary"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Classroom'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Classrooms List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading classrooms...</span>
              </div>
            </div>
          ) : classrooms.length > 0 ? (
            <div className="space-y-3">
              {classrooms.map((classroom) => (
                <Card key={classroom._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{classroom.name}</h4>
                          <Badge variant={classroom.isActive ? "default" : "secondary"}>
                            {classroom.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{classroom.subject}</p>
                        {classroom.description && (
                          <p className="text-sm text-muted-foreground mb-2">{classroom.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {classroom.studentCount} students
                          </span>
                          <span className="text-muted-foreground">
                            Created {new Date(classroom.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShareClassroom(classroom._id)}
                        >
                          <Share className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Navigate to classroom management page
                            window.location.href = `/classrooms/${classroom._id}/manage`;
                          }}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No classrooms yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first classroom to start teaching and managing students.
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Classroom
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageClassroomsModal;
